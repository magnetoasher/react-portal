/** @format */
/* eslint import/no-default-export: 0 */

//#region Imports NPM
import React, { useContext, useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { QueryResult } from 'react-apollo';
import { useQuery, useMutation } from '@apollo/react-hooks';
import Box from '@material-ui/core/Box';
//#endregion
//#region Imports Local
import { TICKETS_TASKS, USER_SETTINGS } from '@lib/queries';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
// import useDebounce from '../../lib/debounce';
import { ProfileContext } from '@lib/context';
import { TASK_STATUSES } from '@lib/constants';
import snackbarUtils from '@lib/snackbar-utils';
import { Data, TkTask, TkTasks } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileInfoComponent from '@front/components/profile/info';
import ProfileTasksComponent from '@front/components/profile/tasks';
//#endregion

const ProfilePage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const profile = useContext(ProfileContext);
  // const search = useDebounce(_search, 300);

  const taskStatus = profile?.user?.settings?.task?.status;
  const [status, setStatus] = useState<string>(taskStatus || TASK_STATUSES[0]);
  const [search, setSearch] = useState<string>('');

  const [userSettings, { error: errorSettings }] = useMutation(USER_SETTINGS);

  const {
    loading: loadingTickets,
    data: dataTickets,
    error: errorTickets,
    refetch: refetchTickets,
  }: QueryResult<Data<'TicketsTasks', TkTasks[]>> = useQuery(TICKETS_TASKS, {
    ssr: false,
    variables: { status },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleStatus = (event: React.ChangeEvent<HTMLInputElement>): void => {
    userSettings({
      variables: {
        value: { task: { status: event.target.value === 'Все' ? '' : event.target.value } },
      },
    });
  };

  const tasks = useMemo<(TkTask | null)[]>(
    // eslint-disable-next-line no-confusing-arrow
    () =>
      dataTickets
        ? dataTickets.TicketsTasks.reduce((acc, tick) => {
            if (tick.error) {
              snackbarUtils.error(tick.error);
              return acc;
            }
            return tick.tasks ? [...acc, ...tick.tasks] : acc;
            // eslint-disable-next-line no-confusing-arrow
          }, [] as TkTask[]).filter((task) =>
            task ? task.code.includes(search) || task.subject.includes(search) : false,
          )
        : [],
    [search, dataTickets],
  );

  useEffect(() => {
    if (taskStatus) {
      setStatus(taskStatus);
    }
  }, [taskStatus]);

  useEffect(() => {
    if (errorTickets) {
      snackbarUtils.error(errorTickets);
    }
    if (errorSettings) {
      snackbarUtils.error(errorSettings);
    }
  }, [errorTickets, errorSettings]);

  return (
    <>
      <Head>
        <title>{t('profile:title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <Box display="flex" flexDirection="column" p={1}>
          <ProfileInfoComponent />
          <ProfileTasksComponent
            loading={loadingTickets}
            tasks={tasks}
            status={status}
            search={search}
            refetchTickets={refetchTickets}
            handleSearch={handleSearch}
            handleStatus={handleStatus}
          />
        </Box>
      </MaterialUI>
    </>
  );
};

ProfilePage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile']),
});

export default nextI18next.withTranslation('profile')(ProfilePage);
