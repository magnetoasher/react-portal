/** @format */

// #region Imports NPM
import React, { FC, useRef, useCallback, useMemo } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Tabs, Tab, Box, FormControl, Select, MenuItem } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorderOutlined';
import SwipeableViews from 'react-swipeable-views';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import { useTranslation } from '@lib/i18n-client';
import { appBarHeight } from '@lib/constants';
import { ServicesWrapperProps } from '@lib/types';
import Button from '@front/components/ui/button';
import RefreshButton from '@front/components/ui/refresh-button';
import HR from '@public/images/svg/itapps/HR.svg';
import Loading from '@front/components/loading';
import JoditEditor from '@front/components/jodit';
import Dropzone from '@front/components/dropzone';
import ServicesSuccess from './success';
import ServicesElement from './element';
// #endregion

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

const MINIMAL_BODY_LENGTH = 10;

const ServicesComponent: FC<ServicesWrapperProps> = ({
  contentRef,
  serviceRef,
  bodyRef,
  currentTab,
  task,
  created,
  routes,
  favorites,
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
  const handleAddFavorite = useCallback(() => handleFavorites({ id: task.route.code, action: 'add' }), [
    handleFavorites,
    task,
  ]);

  const isFavorite = useMemo<boolean>(() => !!favorites.find(({ code }) => code === task.route?.code), [
    task,
    favorites,
  ]);
  const enableBody = useMemo<boolean>(
    () => Boolean(task.route?.code && task.service?.code && task.service?.code !== '0'),
    [task],
  );
  const notValid = useMemo<boolean>(() => !enableBody || body.length < MINIMAL_BODY_LENGTH, [enableBody, body]);

  // TODO: разобраться для чего категории
  const category = routes.length ? routes[0].categories : [];

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
              {favorites.length > 0 && (
                <>
                  <Box className={clsx(classes.blockTitle, classes.blockTitleWithIcon)}>
                    <Box className={classes.titleIcon}>
                      <StarBorderIcon />
                    </Box>
                    {t('services:headers.favorites')}
                  </Box>
                  <Box className={classes.blockContainer}>
                    {favorites.map((current) => (
                      <ServicesElement key={current.code} favorite setFavorite={handleFavorites} element={current} />
                    ))}
                  </Box>
                </>
              )}
              <Box className={classes.blockTitle}>{t('services:headers.list')}</Box>
              <Box className={classes.blockContainer}>
                {category.map((current) => (
                  <ServicesElement
                    key={current.code}
                    withLink
                    // base64
                    element={current}
                  />
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
              {/* TODO: добавить логику вывода ошибки */}
              {submitted ? (
                <Loading
                  activate={loadingCreated || !created}
                  full
                  type="circular"
                  color="secondary"
                  disableShrink
                  size={48}
                >
                  <ServicesSuccess data={created} />
                </Loading>
              ) : (
                <>
                  {task.route && (
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gridGap="8px" className={classes.formControl}>
                      <ServicesElement /* base64 */ element={task.route} active />
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
                      value={task.service?.code || '0'}
                      inputRef={serviceRef}
                      onChange={handleService}
                      classes={{
                        select: classes.select,
                      }}
                    >
                      <MenuItem value="0">{t('services:form.service')}</MenuItem>
                      {task.route?.services?.map((service) => (
                        <MenuItem key={service.code} value={service.code}>
                          {service.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl} variant="outlined">
                    <JoditEditor ref={bodyRef} value={body} onChange={setBody} disabled={!enableBody} />
                  </FormControl>
                  <FormControl className={classes.formControl} variant="outlined">
                    <Dropzone files={files} setFiles={setFiles} />
                  </FormControl>
                  <FormControl className={clsx(classes.formControl, classes.formAction)}>
                    <Button actionType="cancel" onClick={handleResetTicket}>
                      {t('common:cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={notValid}>
                      {t('common:accept')}
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
