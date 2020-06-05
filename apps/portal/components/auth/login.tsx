/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  TextField,
  Tooltip,
} from '@material-ui/core';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { LoginComponentProps } from '@lib/types';
import Loading from '@front/components/loading';
import Background from '@public/images/svg/background.svg';
import Logo from '@public/images/svg/logo.svg';
import { CardActions } from '@material-ui/core';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundSize: 'cover',
      backgroundImage: `url(${Background})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'bottom center',
      height: '100vh',
    },
    logo: {
      height: '11vh',
      margin: '10px auto',
      width: '100%',
    },
    rootCard: {
      width: 600,
      maxWidth: '95vw',
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    rootContent: {
      padding: 0,
    },
    card: {
      width: 600,
      maxWidth: '95vw',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(6),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      backgroundColor: '#F5FDFF',
      color: '#3C6AA3',
      border: 'solid 3px #3C6AA3',
      borderRadius: 16,
      // paddingLeft: 24,
    },
    title: {
      color: '#31312F',
      textAlign: 'left',
      marginBottom: theme.spacing(5),
    },
    formControl: {
      margin: theme.spacing(1, 0),

      [theme.breakpoints.up('sm')]: {
        minWidth: 320,
      },
    },
    textField: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
    },
    checkBox: {
      borderColor: 'rgba(44, 67, 115, 0.4)',
      color: '#31312F',
      width: '100%',
    },
    submit: {
      'borderRadius': 24,
      'width': 'fit-content',
      'marginTop': theme.spacing(),
      'color': '#fff',
      'backgroundColor': '#69BA55',
      'border': 'none',

      '&:hover, &:disabled': {
        color: '#2c4373',
      },

      '&:disabled': {
        borderRadius: 24,
        marginTop: theme.spacing(),
      },
    },
  }),
);

export const LoginComponent: FC<LoginComponentProps> = ({
  usernameRef,
  passwordRef,
  values,
  loading,
  handleValues,
  handleSubmit,
  handleKeyDown,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <Box className={classes.root}>
      <Box>
        <img src={Logo} alt="logo" className={classes.logo} />
      </Box>
      <Box display="flex" textAlign="center" justifyContent="center" alignItems="center" height="70vh">
        <Card className={classes.rootCard}>
          <CardContent className={classes.rootContent}>
            <Card className={classes.card}>
              <CardContent onKeyDown={handleKeyDown}>
                <Typography className={classes.title} variant="h4">
                  {t('common:authorization')}
                </Typography>
                <Tooltip title={t('login:tooltip') || ''} placement="top" leaveDelay={3000}>
                  <FormControl className={classes.formControl} fullWidth variant="outlined">
                    <TextField
                      inputRef={usernameRef}
                      name="username"
                      type="text"
                      autoFocus
                      value={values.username}
                      onChange={handleValues('username')}
                      disabled={loading}
                      label={t('login:username')}
                      variant="outlined"
                      className={classes.textField}
                    />
                  </FormControl>
                </Tooltip>
                <FormControl className={classes.formControl} fullWidth variant="outlined">
                  <TextField
                    inputRef={passwordRef}
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleValues('password')}
                    disabled={loading}
                    label={t('login:password')}
                    variant="outlined"
                    className={classes.textField}
                  />
                </FormControl>
                <FormControlLabel
                  className={classes.checkBox}
                  control={
                    <Checkbox
                      checked={values.save}
                      onChange={handleValues('save')}
                      value="save"
                      color="primary"
                      disabled={loading}
                    />
                  }
                  label={t('login:remember')}
                />
              </CardContent>
            </Card>
          </CardContent>
          <CardActions>
            <Loading activate={loading}>
              <FormControl style={{ width: '100%' }}>
                <Button
                  className={classes.submit}
                  type="submit"
                  variant="outlined"
                  // color="undefined"
                  size="large"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {t('login:signIn')}
                </Button>
              </FormControl>
            </Loading>
          </CardActions>
        </Card>
      </Box>
    </Box>
  );
};
