/** @format */

//#region Imports NPM
import React, { useState, useContext, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { DOCFLOW_TASKS, DOCFLOW_TASKS_SUB } from '@lib/queries';
import type { DocFlowTask, DocFlowTasksInput } from '@lib/types/docflow';
import { Data } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import DocFlowTasksComponent from '@front/components/docflow/tasks';
//#endregion

const DocFlowPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  const status = '';
  const find = '';

  const {
    loading: loadingDocFlowTasks,
    data: dataDocFlowTasks,
    error: errorDocFlowTasks,
    refetch: refetchDocFlowTasksInt,
    subscribeToMore: subscribeToMoreDocFlowTasks,
  } = useQuery<Data<'docFlowTasks', DocFlowTask[]>, { tasks: DocFlowTasksInput }>(DOCFLOW_TASKS, {
    ssr: true,
    fetchPolicy: 'cache-first',
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    // TODO: when a subscription used, a fully object is transmitted to client, old too. try to minimize this.
    subscribeToMoreDocFlowTasks({
      document: DOCFLOW_TASKS_SUB,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        const updateData = data?.docFlowTasks || [];

        return { docFlowTasks: updateData };
      },
    });
  }, [subscribeToMoreDocFlowTasks]);

  const refetchDocFlowTasks = async (
    variables?: Partial<{
      tasks: DocFlowTasksInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'docFlowTasks', DocFlowTask[]>>> =>
    refetchDocFlowTasksInt({ tasks: { ...variables?.tasks, cache: false } });

  const tasks = useMemo<DocFlowTask[]>(() => dataDocFlowTasks?.docFlowTasks ?? [], [dataDocFlowTasks]);

  useEffect(() => {
    if (errorDocFlowTasks) {
      snackbarUtils.error(errorDocFlowTasks);
    }
  }, [errorDocFlowTasks]);

  const handleRow = async (event: unknown, task: DocFlowTask): Promise<void> => {
    // eslint-disable-next-line no-debugger
    debugger;
  };

  return (
    <>
      <Head>
        <title>{t('docflow:title')}</title>
      </Head>
      <MaterialUI refetchComponent={refetchDocFlowTasks} {...rest}>
        <DocFlowTasksComponent
          loading={loadingDocFlowTasks}
          tasks={tasks}
          status={status}
          find={find}
          handleRow={handleRow}
          handleSearch={(event) => {
            event?.preventDefault();
          }}
          handleStatus={(event) => {
            event?.preventDefault();
          }}
        />
      </MaterialUI>
    </>
  );
};

DocFlowPage.getInitialProps = ({ query }) => {
  const { code, where } = query;

  return {
    query: { code, where },
    namespacesRequired: includeDefaultNamespaces(['docflow']),
  };
};

export default nextI18next.withTranslation('docflow')(DocFlowPage);
