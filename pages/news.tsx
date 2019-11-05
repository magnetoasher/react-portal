/** @format */

// #region Imports NPM
import React from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import Iframe from '../components/iframe';
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

const News: I18nPage = (props): React.ReactElement => {
  const classes = useStyles({});
  const url = 'https://i-npz.ru/kngk/portal/portal_news/';

  return (
    <Page {...props}>
      <Iframe className={classes.root} url={url} sandbox="allow-scripts allow-same-origin" />
    </Page>
  );
};

News.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['news']),
  };
};

export default nextI18next.withTranslation('news')(News);
