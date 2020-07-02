/** @format */

//#region Imports NPM
import React from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Typography } from '@material-ui/core';
import Head from 'next/head';
//#endregion
//#region Imports Local
import { MaterialUI } from '@front/layout';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { VerticalCenter } from '@front/components/vertical-center';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(5),
    },
  }),
);

const FAQPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});

  return (
    <>
      <Head>
        <title>{t('faq:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <VerticalCenter horizontal>
          <Paper className={classes.root}>
            <Typography>Извините, база знаний пока не готова.</Typography>
          </Paper>
        </VerticalCenter>
      </MaterialUI>
    </>
  );
};

FAQPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['faq']),
});

export default nextI18next.withTranslation('faq')(FAQPage);
