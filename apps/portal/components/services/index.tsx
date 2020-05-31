/** @format */

//#region Imports NPM
import React, { FC, useRef, useCallback, useMemo } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab, Box, FormControl, Select, MenuItem, TextField } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorderOutlined';
import SwipeableViews from 'react-swipeable-views';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { appBarHeight, MINIMAL_BODY_LENGTH } from '@lib/constants';
import { ServicesWrapperProps, ServicesFavoriteProps } from '@lib/types';
import Button from '@front/components/ui/button';
import RefreshButton from '@front/components/ui/refresh-button';
import Loading from '@front/components/loading';
import JoditEditor from '@front/components/jodit';
import Dropzone from '@front/components/dropzone';
import { UserSettingsTaskFavorite, UserSettingsTaskFavoriteService } from '@lib/types/user.dto';
import { TkService, TkRoute, TkRoutes } from '@lib/types/tickets';
import ServicesSuccess from './success';
import ServicesElement from './element';
import ServicesElementFavorites from './element.favorites';
import ServicesError from './error';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    header: {
      '& button': {
        padding: theme.spacing(2, 4),
      },
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    blockContainer: {
      display: 'grid',
      gap: `${theme.spacing()}px ${theme.spacing(4)}px`,
      padding: theme.spacing(2, 4),

      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4, 8),
        gridTemplateColumns: '1fr 1fr',
      },

      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    formControl: {
      marginBottom: theme.spacing(3),
      width: '90%',
      [theme.breakpoints.up('md')]: {
        width: '80%',
      },
      [theme.breakpoints.up('lg')]: {
        width: '60%',
      },
    },
    formAction: {
      'display': 'flex',
      'flexDirection': 'row',
      'justifyContent': 'flex-end',
      '& button:not(:last-child)': {
        marginRight: theme.spacing(),
      },
    },
    blockTitle: {
      'fontWeight': 500,
      'fontSize': '14px',
      'lineHeight': '21px',
      'background': '#F7FBFA',
      'boxShadow': '0px 4px 4px rgba(0, 0, 0, 0.25)',
      'borderRadius': theme.spacing(),
      'padding': theme.spacing(2, 4, 2, 9),

      '&:not(:first-child)': {
        marginTop: theme.spacing(2),
      },
    },
    blockTitleWithIcon: {
      padding: theme.spacing(2, 4),
      display: 'flex',
      alignItems: 'center',
    },
    titleIcon: {
      color: theme.palette.secondary.main,
      display: 'flex',
      marginRight: theme.spacing(2),
    },
    select: {
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
  }),
);

const ServicesComponent: FC<ServicesWrapperProps> = ({
  contentRef,
  serviceRef,
  subjectRef,
  // bodyRef,
  query,
  currentTab,
  errorCreated,
  task,
  created,
  routes,
  favorites,
  subject,
  setSubject,
  body,
  setBody,
  files,
  setFiles,
  submitted,
  loadingRoutes,
  loadingCreated,
  refetchRoutes,
  handleCurrentTab,
  handleService,
  handleSubmit,
  handleResetTicket,
  handleFavorites,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();
  const headerRef = useRef(null);

  const contentHeight = headerRef.current
    ? `calc(100vh - ${appBarHeight}px - ${headerRef.current.clientHeight}px)`
    : '100%';

  const handleChangeTab = useCallback((_, tab): void => handleCurrentTab(tab), [handleCurrentTab]);
  const updateFavorites = useCallback(
    ({ route: curRoute, action }: ServicesFavoriteProps) => {
      const {
        where,
        code,
        service: { where: srvWhere, code: srvCode },
      } = curRoute;

      let result = [];
      const favCur =
        Array.isArray(favorites) &&
        favorites
          .filter(
            (favorite) =>
              favorite.service?.where === srvWhere &&
              favorite.service?.code === srvCode &&
              favorite.code === code &&
              favorite.where === where,
          )
          .pop();

      const priority = favCur?.priority || favorites.length;

      switch (action) {
        case 'delete':
          result = favorites
            .filter((favorite) => favorite !== favCur)
            .sort((a, b) => a.priority - b.priority)
            .map((favorite, index) => ({
              where: favorite.where,
              code: favorite.code,
              service: { where: favorite.service.where, code: favorite.service.code },
              priority: index,
            }));
          break;

        case 'up':
        case 'down':
          result = favorites.reduce(
            (
              acc: UserSettingsTaskFavorite[],
              { code: curCode, where: curWhere, service: curService, priority: curPriority }: UserSettingsTaskFavorite,
            ) => {
              const newCurrent = { code: curCode, where: curWhere, service: curService, priority: curPriority };
              const sym = action === 'up' ? 1 : -1;

              if (curCode === code && curWhere === where) {
                newCurrent.priority -= sym;
              } else if (curPriority === priority - sym) {
                newCurrent.priority += sym;
              }

              return [...acc, newCurrent];
            },
            [],
          );
          break;

        case 'add':
        default:
          result = [
            ...favorites.map(
              (f) =>
                f && {
                  where: f?.where,
                  code: f?.code,
                  service: { where: f?.service?.where, code: f?.service?.code },
                  priority: f?.priority,
                },
            ),
            { code, where, service: { where: srvWhere, code: srvCode }, priority },
          ];
      }

      handleFavorites(result);
    },
    [favorites, handleFavorites],
  );
  const handleAddFavorite = useCallback(
    () =>
      task.route &&
      task.service &&
      updateFavorites({
        route: {
          code: task.route?.code,
          where: task.route?.where,
          service: { where: task.service?.where, code: task.service?.code },
        },
        action: 'add',
      }),
    [updateFavorites, task],
  );

  const allRoutes = useMemo<TkRoute[]>(() => {
    return typeof routes === 'object' && routes !== null && routes.length === 0
      ? []
      : routes.reduce((acc: TkRoute[], cur: TkRoutes) => [...acc, ...(cur.routes || [])], []);
  }, [routes]);

  // const allServices = useMemo<TkService[]>(() => {
  //   return typeof routes === 'object' && routes !== null && routes.length === 0
  //     ? []
  //     : routes.reduce(
  //         (acc: TkService[], cur: TkRoutes) => [...acc, ...(cur?.routes?.flatMap((r) => r.services) || [])],
  //         [],
  //       );
  // }, [routes]);

  const allFavorites = useMemo<UserSettingsTaskFavorite[]>(() => {
    return typeof favorites === 'object' && favorites !== null && favorites.length > 0
      ? allRoutes.reduce((acc, { where, code, services }) => {
          const rt = services.reduce((cum, service) => {
            const f = favorites
              .filter(
                ({ where: favWhere, code: favCode, service: fsrv }) =>
                  favWhere === where && favCode === code && service.code === fsrv.code,
              )
              .pop();

            if (f) {
              return [
                ...cum,
                {
                  ...f,
                  service: {
                    ...f.service,
                    name: service.name,
                    description: service.description,
                    avatar: service.avatar,
                  },
                },
              ];
            }

            return cum;
          }, [] as UserSettingsTaskFavoriteService[]);

          return [...acc, ...rt];
        }, [] as UserSettingsTaskFavorite[])
      : [];
  }, [allRoutes, favorites]);

  const isFavorite = useMemo<boolean>(
    () =>
      (task &&
        task.route &&
        task.service &&
        Array.isArray(allFavorites) &&
        !!allFavorites.find(
          ({ where, code, service: { code: srvCode } }) =>
            typeof query === 'object' &&
            code === task.route?.code &&
            where === task.route?.where &&
            srvCode === task.service?.code,
        )) ??
      true,
    [task, query, allFavorites],
  );

  const enableBody = useMemo<boolean>(
    () => Boolean(task.route?.code && task.service?.code && task.service.code === '0'),
    [task],
  );
  const notValid = !enableBody; // || body.trim().length < MINIMAL_BODY_LENGTH;

  const favService = useMemo<string>(
    () =>
      (typeof query === 'object' && query.service) ||
      task.service?.code ||
      task.route?.services?.filter((s) => s.name === 'Прочее')?.pop()?.code,
    [query, task],
  );

  return (
    <Box display="flex" flexDirection="column" position="relative">
      <Paper ref={headerRef} square className={classes.header}>
        <Tabs value={currentTab} indicatorColor="secondary" textColor="secondary" onChange={handleChangeTab}>
          <Tab label={t('services:tabs.tab1')} />
          <Tab disabled={!task.route} label={t('services:tabs.tab2')} />
        </Tabs>
      </Paper>
      <Loading activate={loadingRoutes} full type="circular" color="secondary" disableShrink size={48}>
        <>
          {!submitted && <RefreshButton onClick={refetchRoutes} />}
          <SwipeableViews
            ref={contentRef}
            animateHeight
            disabled={!task.route}
            index={currentTab}
            className={classes.body}
            containerStyle={{ flexGrow: 1 }}
            onSwitching={handleCurrentTab}
          >
            <Box py={1} px={0.5} style={{ minHeight: contentHeight }}>
              {allFavorites.length > 0 && (
                <>
                  <Box className={clsx(classes.blockTitle, classes.blockTitleWithIcon)}>
                    <Box className={classes.titleIcon}>
                      <StarBorderIcon />
                    </Box>
                    {t('services:headers.favorites')}
                  </Box>
                  <Box className={classes.blockContainer}>
                    {allFavorites.map((current) => (
                      <ServicesElementFavorites
                        key={`fav-${current.service.where}-${current.service.code}`}
                        base64
                        favorite
                        withLink
                        setFavorite={updateFavorites}
                        route={current}
                        isUp={current.priority > 0}
                        isDown={current.priority < allFavorites.length - 1}
                      />
                    ))}
                  </Box>
                </>
              )}
              <Box className={classes.blockTitle}>{t('services:headers.list')}</Box>
              <Box className={classes.blockContainer}>
                {allRoutes.map((current) => (
                  <ServicesElement key={`${current.where}-${current.code}`} base64 withLink route={current} />
                ))}
              </Box>
              {/* Евгений */}
              {/* TODO: если все еще актуально, доделать */}
              {/* <ServicesElement
                key="k0001"
                withLink
                url="http://srvsd-01.khgk.local/anketa833/"
                element={{
                  code: 'k0001',
                  name: 'Департамент по персоналу - Форма на подбор персонала',
                  avatar: HR,
                }}
              /> */}
            </Box>
            <Box
              style={{ minHeight: contentHeight }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={3}
            >
              {submitted ? (
                <Loading
                  activate={loadingCreated || !created}
                  full
                  type="circular"
                  color="secondary"
                  disableShrink
                  size={48}
                >
                  {!!errorCreated ? (
                    <ServicesError error={errorCreated} onClose={handleResetTicket} />
                  ) : (
                    <ServicesSuccess data={created} onClose={handleResetTicket} />
                  )}
                </Loading>
              ) : (
                <>
                  {task.route && (
                    <Box display="grid" gridTemplateColumns="1fr 300px" gridGap="8px" className={classes.formControl}>
                      <ServicesElement base64 route={task.route} active />
                      <Box display="flex" justifyContent="flex-end" alignItems="center">
                        {!isFavorite && (
                          <Button actionType="favorite" onClick={handleAddFavorite}>
                            {t('common:favorite')}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  )}
                  <FormControl className={classes.formControl} variant="outlined">
                    <Select
                      value={favService}
                      inputRef={serviceRef}
                      onChange={handleService}
                      classes={{
                        select: classes.select,
                      }}
                    >
                      {/* <MenuItem value="0">{t('services:form.service')}</MenuItem> */}
                      {task?.route?.services?.map((service) => (
                        <MenuItem key={service.code} value={service.code}>
                          {service.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl} variant="outlined">
                    <TextField
                      ref={subjectRef}
                      value={subject}
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                        setSubject(event.target.value);
                      }}
                      variant="outlined"
                      disabled={!enableBody}
                      label={t('services:form.subject')}
                    />
                  </FormControl>
                  <FormControl className={classes.formControl} variant="outlined">
                    {/* ref={bodyRef} */}
                    <JoditEditor value={body} onChange={setBody} disabled={!enableBody} />
                  </FormControl>
                  <FormControl className={classes.formControl} variant="outlined">
                    <Dropzone files={files} setFiles={setFiles} />
                  </FormControl>
                  <FormControl className={clsx(classes.formControl, classes.formAction)}>
                    <Button actionType="cancel" onClick={handleResetTicket}>
                      {t('common:cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={notValid}>
                      {t('common:send')}
                    </Button>
                  </FormControl>
                </>
              )}
            </Box>
          </SwipeableViews>
        </>
      </Loading>
    </Box>
  );
};

export default ServicesComponent;
