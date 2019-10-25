/** @format */

// #region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Typography, Button, Card, CardContent } from '@material-ui/core';
// #endregion

// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 480,
      margin: `${theme.spacing(2)}px auto`,
    },
    card: {
      padding: theme.spacing(4),
    },
  }),
);

const App: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});

  return (
    <Page {...props}>
      <div className={classes.root}>
        <Card className={classes.card}>
          <CardContent>
            <Typography variant="body1">Данный модуль пока не доделан.</Typography>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
};

App.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['common']),
  };
};

export default nextI18next.withTranslation('common')(App);
