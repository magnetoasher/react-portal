/** @format */

//#region Imports NPM
import React from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
//#endregion

const useStyles = makeStyles((theme: Theme) => createStyles({}));

const NewsEditPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  return (
    <MaterialUI {...rest}>
      <Head>
        <title>{t('news:add:title')}</title>
      </Head>
    </MaterialUI>
  );
};

NewsEditPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['news']),
});

export default nextI18next.withTranslation('news')(NewsEditPage);
