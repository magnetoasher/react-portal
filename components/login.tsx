/** @format */

// #region Imports NPM
import React, { useState, useRef, useEffect } from 'react';

import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import CircularProgress from '@material-ui/core/CircularProgress';

import { MutationFunction } from 'react-apollo';
import { ApolloError } from 'apollo-client';
// #endregion
// #region Imports Local
import { GQLError } from './gql-error';
import { Loading } from './loading';
import KngkInpzLogo from '../static/assets/svg/kngk-inpz.svg';
// #endregion

interface LoginProps {
  error?: ApolloError;
  loading: boolean;
  login: MutationFunction;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    '@global': {
      'html': {
        height: '100%',
        width: '100%',
      },
      'body': {
        height: '100%',
        width: '100%',
        backgroundImage: 'url("/assets/svg/background.svg")',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'bottom left',
      },
      'body > div': {
        height: '100%',
        width: '100%',
      },
    },
    'root': {
      height: '100%',
      margin: 'auto',
    },
    'logoContainer': {
      height: '11%',
      textAlign: 'center',
    },
    'logo': {
      marginTop: '10px',
      height: '100%',
    },
    'loginContainer': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      height: '89%',
      width: '100%',
    },
    'container': {
      width: 600,
      margin: `${theme.spacing(2)}px auto`,
    },
    'card': {
      padding: theme.spacing(4),
      backgroundColor: 'rgba(255,255,255,0.5)',
      color: '#2c4373',
      border: 'solid 3px #2c4373',
      borderRadius: 16,
      paddingLeft: 24,
    },
    'typoAuthorization': {
      color: '#2c4373',
      textAlign: 'left',
    },
    'labelForFormControl': {
      borderColor: 'rgba(44, 67, 115, 0.4)',
    },
    'labelForCheckbox': {
      borderColor: 'rgba(44, 67, 115, 0.4)',
      width: '100%',
    },
    'formControl': {
      minWidth: 320,
      margin: `${theme.spacing(1)}px 0`,
    },
    'submitButtonContainer': {
      textAlign: 'left',
    },
    'submitButton': {
      borderRadius: 24,
      marginTop: `${theme.spacing(1)}px`,
    },
    'submitButton:disabled': {
      color: '#2c4373',
      borderRadius: 24,
      marginTop: `${theme.spacing(1)}px`,
    },
    'submitButton:hover': {
      color: '#2c4373',
    },
  }),
);

export const LoginComponent = (props: LoginProps): React.ReactElement => {
  const { error, loading, login } = props;

  const classes = useStyles({});

  const [username, setUsername] = useState('');
  const [usernameLabelWidth, setUsernameLabelWidth] = useState(0);
  const [password, setPassword] = useState('');
  const [passwordLabelWidth, setPasswordLabelWidth] = useState(0);
  const [saveChecked, setSave] = useState(false);

  const usernameLabelRef = useRef<HTMLLabelElement | any>({});
  const passwordLabelRef = useRef<HTMLLabelElement | any>({});
  useEffect(() => setUsernameLabelWidth(usernameLabelRef.current.offsetWidth), []);
  useEffect(() => setPasswordLabelWidth(passwordLabelRef.current.offsetWidth), []);

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>): void => setUsername(e.target.value);
  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>): void => setPassword(e.target.value);
  const handleSaveChecked = (e: React.ChangeEvent<HTMLInputElement>): void => setSave(e.target.checked);

  return (
    <div className={classes.root}>
      <div className={classes.logoContainer}>
        <KngkInpzLogo className={classes.logo} />
      </div>
      <div className={classes.loginContainer}>
        <form
          onSubmit={async (e: any): Promise<void> => {
            e.preventDefault();
            login({
              variables: {
                username: e.target.username.value,
                password: e.target.password.value,
              },
            });
          }}
          className={classes.container}
          autoComplete="off"
          noValidate
        >
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.typoAuthorization} variant="h4">
                Авторизация
              </Typography>
              <br />
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <InputLabel
                  htmlFor="username"
                  className={classes.labelForFormControl}
                  ref={usernameLabelRef}
                  disabled={loading}
                >
                  Пользователь
                </InputLabel>
                <OutlinedInput
                  id="username"
                  name="username"
                  type="username"
                  value={username}
                  onChange={handleUsername}
                  labelWidth={usernameLabelWidth}
                  disabled={loading}
                />
              </FormControl>
              <br />
              <FormControl className={classes.formControl} fullWidth variant="outlined">
                <InputLabel
                  htmlFor="password"
                  className={classes.labelForFormControl}
                  ref={passwordLabelRef}
                  disabled={loading}
                >
                  Пароль
                </InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={handlePassword}
                  labelWidth={passwordLabelWidth}
                  disabled={loading}
                />
              </FormControl>
              <br />
              <FormControlLabel
                className={classes.labelForCheckbox}
                control={
                  <Checkbox
                    checked={saveChecked}
                    onChange={handleSaveChecked}
                    value="save"
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Запомнить меня на этом компьютере"
              />
              {loading && <Loading />}
              {error && <GQLError error={error} />}
              <br />
              <div className={classes.submitButtonContainer}>
                <Button
                  className={classes.submitButton}
                  type="submit"
                  variant="outlined"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  Вход
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};
