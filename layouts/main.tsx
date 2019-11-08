/** @format */

// #region Imports NPM
import React, { useState, ReactNode, useEffect, useContext } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { Box, useMediaQuery } from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import { I18nPage, nextI18next } from '../lib/i18n-client';
import AppBar from '../components/app-bar';
import Drawer from '../components/drawer';
import { ProfileContext } from '../lib/context';
import { USER_SETTINGS } from '../lib/queries';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    },
    content: {
      'flex': 1,
      'display': 'flex',
      'overflow': 'hidden',

      '& > div': {
        width: '100%',
        flex: 1,
      },
    },
  }));

interface Main {
  children: ReactNode;
}

const MainTemplate: I18nPage<Main> = (props): React.ReactElement => {
  const classes = useStyles({});
  const theme = useTheme();
  const profile = useContext(ProfileContext);
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));

  // const defaultOpen = profile.user && profile.user.settings.drawer !== undefined
  //   ? profile.user.settings.drawer
  //   : lgUp;
  const [drawerOpen, setDrawerOpen] = useState<boolean>(!profile.isMobile && lgUp);

  const [userSettings] = useMutation(USER_SETTINGS);

  useEffect(() => {
    // TODO: продумать
    // (!profile.user || profile.user.settings.drawer === undefined) && setDrawerOpen(lgUp);
    setDrawerOpen(lgUp);
  }, [lgUp]);

  const handleDrawerOpen = (): void => {
    !profile.isMobile &&
      userSettings({
        variables: {
          value: { drawer: !drawerOpen },
        },
      });
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={classes.root}>
      <AppBar handleDrawerOpen={handleDrawerOpen} />
      <Box display="flex" flexGrow={1}>
        <Drawer open={drawerOpen} isMobile={profile.isMobile} handleOpen={handleDrawerOpen} {...props} />
        <div id="content" className={classes.content}>
          {props.children}
        </div>
      </Box>
    </div>
  );
};

export default nextI18next.withTranslation('common')(MainTemplate);
