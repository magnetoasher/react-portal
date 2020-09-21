/** @format */

//#region Imports NPM
import React, { useMemo, useEffect } from 'react';
import Head from 'next/head';
import { useQuery, ApolloQueryResult } from '@apollo/client';
//#endregion
//#region Imports Local
import type { TkTask, TkTasks, TkTasksInput, Data } from '@lib/types';
import { TkWhere } from '@lib/types';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { TICKETS_TASKS, TICKETS_TASKS_SUB } from '@lib/queries';
import snackbarUtils from '@lib/snackbar-utils';
import { MaterialUI } from '@front/layout';
import TasksComponent from '@front/components/tasks/tasks';
import TaskPage from '@front/pages/tasks/task';
//#endregion

const TasksPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  const status = '';
  const find = '';

  const {
    loading: loadingTasks,
    data: dataTasks,
    error: errorTasks,
    refetch: tasksRefetchInt,
    subscribeToMore: subscribeTicketsTasks,
  } = useQuery<Data<'ticketsTasks', TkTasks>, { tasks: TkTasksInput }>(TICKETS_TASKS, {
    ssr: true,
    variables: { tasks: { status, find } },
    fetchPolicy: 'cache-first',
    // notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    subscribeTicketsTasks({
      document: TICKETS_TASKS_SUB,
      updateQuery: (prev, { subscriptionData: { data } }) => {
        // eslint-disable-next-line no-debugger
        debugger;

        const updateData = data?.ticketsTasks || [];

        return { ticketsTasks: updateData };
      },
    });
  }, [subscribeTicketsTasks]);

  const tasksRefetch = (
    variables?: Partial<{
      tasks: TkTasksInput;
    }>,
  ): Promise<ApolloQueryResult<Data<'ticketsTasks', TkTasks>>> => tasksRefetchInt({ tasks: { ...variables?.tasks, cache: false } });

  const tasks = useMemo<TkTask[]>(() => {
    if (dataTasks?.ticketsTasks) {
      if (dataTasks.ticketsTasks.errors) {
        dataTasks.ticketsTasks.errors?.forEach((error) => snackbarUtils.error(error));
      }
      if (dataTasks.ticketsTasks.tasks) {
        return dataTasks.ticketsTasks.tasks;
      }
    }
    return [];
  }, [dataTasks]);

  useEffect(() => {
    if (errorTasks) {
      snackbarUtils.error(errorTasks);
    }
  }, [errorTasks]);

  return (
    <>
      <Head>
        <title>{t('tasks:title')}</title>
      </Head>
      <MaterialUI refetchComponent={tasksRefetch} {...rest}>
        <TasksComponent
          loading={loadingTasks}
          tasks={tasks}
          status={status}
          find={find}
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

TasksPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['tasks']),
});

export default nextI18next.withTranslation('tasks')(TasksPage);
