/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import Router from 'next/router';
import { useApolloClient, useMutation } from '@apollo/react-hooks';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Popover, Box, Button, IconButton, Typography } from '@material-ui/core';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import PhoneIcon from '@material-ui/icons/Phone';
import PhoneInTalkIcon from '@material-ui/icons/PhoneInTalk';
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone';
import Skeleton from '@material-ui/lab/Skeleton';
// import Link from 'next/link';
import { WithTranslation } from 'next-i18next';
// #endregion
// #region Imports Local
import HeaderBg from '../../../public/images/jpeg/header_bg.jpg';
import PopoverBg from '../../../public/images/png/profile_popover_bg.png';
import LogoMin from '../../../public/images/png/logo_min.png';

import { nextI18next } from '../lib/i18n-client';
import { ProfileContext } from '../lib/context';
import { LOGOUT } from '../lib/queries';
import { removeStorage } from '../lib/session-storage';
import { Avatar } from './common/avatar';
import { SESSION, FIRST_PAGE } from '../lib/constants';

// #endregion

const avatarHeight = 48;
export const appBarHeight = 64;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      zIndex: theme.zIndex.drawer + 1,
      background: `url(${HeaderBg})`,
      backgroundSize: 'cover',
    },
    toolbar: {
      padding: `0 ${theme.spacing(2)}px`,
    },
    menuButton: {
      color: 'rgba(0, 0, 0, 0.54)',
    },
    logo: {
      'flexGrow': 1,
      '& > img': {
        height: appBarHeight,
      },
    },
    title: {
      flexGrow: 1,
    },
    avatar: {
      height: avatarHeight,
      width: avatarHeight,
    },
    profile: {
      padding: theme.spacing() / 2,
      background: `url(${PopoverBg})`,
      minWidth: '200px',
      minHeight: '150px',
      display: 'grid',
      gridTemplateColumns: `200px ${avatarHeight}px`,
      borderRadius: theme.spacing() / 2,
    },
    pointer: {
      cursor: 'pointer',
    },
    avatarWrap: {
      padding: theme.spacing() / 2,
    },
    profileName: {
      margin: theme.spacing(),
      fontSize: '16px',
    },
    commonBlock: {
      display: 'grid',
      gridColumn: '1 / 3',
      gridGap: theme.spacing(),
      padding: theme.spacing(),
    },
    phoneBlock: {
      display: 'grid',
      gridTemplateColumns: '1fr 6fr',
      gridGap: `${theme.spacing()}px 0`,
      alignItems: 'center',
    },
    buttonLogout: {
      // backgroundColor: blue[300],
    },
  }),
);

interface AppBarProps extends WithTranslation {
  handleDrawerOpen(): void;
}

const BaseAppBar = (props: AppBarProps): React.ReactElement => {
  const classes = useStyles({});
  const { handleDrawerOpen, t } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const client = useApolloClient();

  const [logout] = useMutation(LOGOUT, {
    onCompleted() {
      removeStorage(SESSION);
      client.resetStore();

      Router.push({ pathname: '/auth/login', query: { redirect: Router.pathname ? Router.pathname : FIRST_PAGE } });
    },
  });

  const handleLogout = (): void => {
    logout();
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = (): void => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <AppBar id="header" position="sticky" className={classes.root}>
      <Toolbar className={classes.toolbar}>
        <ProfileContext.Consumer>
          {(context) => (
            <>
              <IconButton
                edge="start"
                onClick={context.user && handleDrawerOpen}
                className={classes.menuButton}
                color="inherit"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
              <div className={classes.logo}>
                <img src={LogoMin} alt="logo" />
              </div>
              <Box id="profile-avatar" className={classes.avatarWrap} onClick={context.user && handlePopoverOpen}>
                {context.user ? (
                  <Avatar
                    className={clsx(classes.avatar, classes.pointer)}
                    profile={context.user.profile}
                    alt="photo"
                  />
                ) : (
                  <Skeleton className={classes.avatar} variant="circle" />
                )}
              </Box>
              {context.user && (
                <Popover
                  id="profile-popover"
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handlePopoverClose}
                  classes={{ paper: classes.profile }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  marginThreshold={0}
                  transitionDuration={0}
                  disableRestoreFocus
                >
                  <Typography className={classes.profileName}>
                    {context.user.profile.lastName} {context.user.profile.firstName} {context.user.profile.middleName}
                  </Typography>
                  <Avatar className={classes.avatar} profile={context.user.profile} alt="photo" />
                  <Box className={classes.commonBlock}>
                    <Box className={classes.phoneBlock}>
                      {context.user.profile.telephone && (
                        <>
                          <PhoneIcon />
                          <Typography>{context.user.profile.telephone}</Typography>
                        </>
                      )}
                      {context.user.profile.mobile && (
                        <>
                          <PhoneIphoneIcon />
                          <Typography>{context.user.profile.mobile}</Typography>
                        </>
                      )}
                      {context.user.profile.workPhone && (
                        <>
                          <PhoneInTalkIcon />
                          <Typography>{context.user.profile.workPhone}</Typography>
                        </>
                      )}
                    </Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      className={classes.buttonLogout}
                      onClick={handleLogout}
                    >
                      {t('common:signOut')}
                    </Button>
                  </Box>
                </Popover>
              )}
            </>
          )}
        </ProfileContext.Consumer>
      </Toolbar>
    </AppBar>
  );
};

export default nextI18next.withTranslation('common')(BaseAppBar);
