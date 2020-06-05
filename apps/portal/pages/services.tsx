/** @format */

//#region Imports NPM
import React, { useState, useEffect, useMemo, useRef, useCallback, useContext, Component } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/react-hooks';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { MINIMAL_SUBJECT_LENGTH, MINIMAL_BODY_LENGTH } from '@lib/constants';
import { Data, DropzoneFile, ServicesTaskProps, ServicesCreatedProps, TkRoutes, UserSettings } from '@lib/types';
import snackbarUtils from '@lib/snackbar-utils';
import ServicesComponent from '@front/components/services';
import { MaterialUI } from '@front/layout';
import { ProfileContext } from '@lib/context';
import { USER_SETTINGS, TICKETS_ROUTES, TICKETS_TASK_NEW } from '@lib/queries';
import { TkWhere, TkRoute, TkTaskNew } from '@lib/types/tickets';
import { UserSettingsTaskFavoriteService, UserSettingsTaskFavorite } from '@lib/types/user.dto';
//#endregion

const ServicesPage: I18nPage = ({ t, pathname, query, ...rest }): React.ReactElement => {
  const router = useRouter();

  const [currentTab, setCurrentTab] = useState<number>(0);
  const [routes, setRoutes] = useState<TkRoute[]>([]);
  const [task, setTask] = useState<ServicesTaskProps>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [created, setCreated] = useState<ServicesCreatedProps>({});
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const me = useContext(ProfileContext);

  const favorites = me?.user?.settings?.task?.favorites || [];

  const [userSettings, { error: errorSettings }] = useMutation<UserSettings, { value: UserSettings }>(USER_SETTINGS);

  const { loading: loadingRoutes, data: dataRoutes, error: errorRoutes, refetch: refetchRoutes } = useQuery<
    Data<'TicketsRoutes', TkRoutes>,
    void
  >(TICKETS_ROUTES, {
    ssr: false,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const [createTask, { loading: loadingCreated, data: dataCreated, error: errorCreated }] = useMutation<
    Data<'TicketsTaskNew', TkTaskNew>
  >(TICKETS_TASK_NEW);

  const contentRef = useRef(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<Component<Record<string, any>, Record<string, any>, any>>(null);

  const handleService = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const service = task.route?.services?.find((srv) => srv?.code === event.target.value) || undefined;
      setTask({ ...task, service });
    },
    [task],
  );

  const handleResetTicket = useCallback((): void => {
    setTask({});
    setBody('');
    setFiles([]);
    setCurrentTab(0);
    setSubmitted(false);
    router.push(pathname || '/services', pathname);
  }, [router, pathname, setTask, setBody, setFiles, setCurrentTab, setSubmitted]);

  const handleCurrentTab = useCallback(
    (tab) => {
      if (tab === 0) {
        handleResetTicket();
      }
      setCurrentTab(tab);
    },
    [setCurrentTab, handleResetTicket],
  );

  const handleFavorites = useCallback(
    (data) => {
      userSettings({
        variables: {
          value: { task: { favorites: data } },
        },
      });
    },
    [userSettings],
  );

  const handleSubmit = (): void => {
    const { route, service } = task;

    if (subject.length < MINIMAL_SUBJECT_LENGTH) {
      snackbarUtils.show(t('services:errors.smallSubject'));
      subjectRef.current && subjectRef.current.focus();

      return;
    }

    const cleanedBody = body.trim();
    if (cleanedBody.length < MINIMAL_BODY_LENGTH) {
      snackbarUtils.show(t('services:errors.smallBody'));
      // bodyRef.current.focus();

      return;
    }

    const variables = {
      task: {
        where: service?.where,
        subject,
        body: cleanedBody,
        route: route?.code,
        service: service?.code,
      },
      attachments: files.map((file: DropzoneFile) => file.file),
    };

    createTask({
      variables,
    });

    setCreated({});
    setSubmitted(true);
  };

  useEffect(() => {
    if (query && Array.isArray(routes) && routes.length > 0) {
      const { where, route: routeCode, service: serviceCode } = query;
      if (where && routeCode) {
        const route = routes.find((element) => element.where === where && element.code === routeCode);
        if (route && Object.keys(route).length > 0) {
          const service =
            (serviceCode
              ? route.services?.find((s) => s.code === serviceCode)
              : route.services?.find((s) => s.name === 'Прочее')) || undefined;
          setTask({ route, service });
          setCurrentTab(1);
          return;
        }
        handleResetTicket();
      }
    }
  }, [routes, setTask, setCurrentTab, handleResetTicket, query]);

  useEffect(() => {
    if (!loadingRoutes && !errorRoutes && dataRoutes?.TicketsRoutes) {
      if (dataRoutes.TicketsRoutes.errors) {
        dataRoutes.TicketsRoutes.errors?.forEach((error) => snackbarUtils.error(error));
      }
      if (dataRoutes.TicketsRoutes.routes) {
        setRoutes(dataRoutes.TicketsRoutes.routes);
      }
    }
  }, [dataRoutes?.TicketsRoutes, errorRoutes, loadingRoutes]);

  useEffect(() => {
    setCreated((!loadingCreated && !errorCreated && dataCreated?.TicketsTaskNew) || {});
  }, [dataCreated?.TicketsTaskNew, errorCreated, loadingCreated]);

  // useEffect(() => {
  //   if (contentRef.current) {
  //     contentRef.current.updateHeight();
  //   }
  // }, [contentRef, files]);

  useEffect(() => {
    if (errorCreated) {
      snackbarUtils.error(errorCreated);
      setCreated({});
    }
    if (errorRoutes) {
      snackbarUtils.error(errorRoutes);
    }
  }, [errorCreated, errorRoutes]);

  const allFavorites = useMemo<UserSettingsTaskFavorite[]>(() => {
    if (Array.isArray(favorites) && favorites.length > 0) {
      return favorites.reduce((accumulator, fav) => {
        const route = routes.reduce((accumulator_, route) => {
          if (route.where === fav.where && route.code === fav.code) {
            const service = route.services?.find((service) => fav.service?.code === service.code);
            if (service) {
              return { ...accumulator_, route: { ...route, priority: fav.priority || 0 }, service: { ...service } };
            }
          }
          return accumulator_;
        }, {} as UserSettingsTaskFavorite);

        if (Object.keys(route).length > 0) {
          return [...accumulator, route];
        }

        return accumulator;
      }, [] as UserSettingsTaskFavorite[]);
    }

    return [];
  }, [routes, favorites]);

  return (
    <>
      <Head>
        <title>{task.route ? t('services:title.route', { route: task.route.name }) : t('services:title.title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <ServicesComponent
          contentRef={contentRef}
          serviceRef={serviceRef}
          bodyRef={bodyRef}
          subjectRef={subjectRef}
          currentTab={currentTab}
          refetchRoutes={refetchRoutes}
          task={task}
          created={created}
          errorCreated={errorCreated}
          routes={routes}
          favorites={allFavorites}
          subject={subject}
          setSubject={setSubject}
          body={body}
          setBody={setBody}
          files={files}
          setFiles={setFiles}
          submitted={submitted}
          loadingRoutes={loadingRoutes}
          loadingCreated={loadingCreated}
          handleCurrentTab={handleCurrentTab}
          handleService={handleService}
          handleSubmit={handleSubmit}
          handleResetTicket={handleResetTicket}
          handleFavorites={handleFavorites}
        />
      </MaterialUI>
    </>
  );
};

ServicesPage.getInitialProps = ({ pathname, query }) => ({
  pathname,
  query,
  namespacesRequired: includeDefaultNamespaces(['services']),
});

export default nextI18next.withTranslation('services')(ServicesPage);
