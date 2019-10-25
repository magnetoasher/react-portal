/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import Iframe from '../components/iframe';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';

// #endregion

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'block',
      border: 'none',
      height: '100%',
      width: '100%',
    },
  }),
);

const Mail: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});
  const url = 'https://roundcube.i-npz.ru';

  return (
    <Page {...props}>
      <Iframe className={classes.root} url={url} sandbox="allow-scripts allow-same-origin" />
    </Page>
  );
};

Mail.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['mail']),
  };
};

export default nextI18next.withTranslation('mail')(Mail);
