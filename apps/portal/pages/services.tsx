/** @format */

// #region Imports NPM
import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  FormControl,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import clsx from 'clsx';
// #endregion
// #region Imports Local
import Dropzone from '../components/dropzone';
import { DropzoneFile } from '../components/dropzone/types';
import { appBarHeight } from '../components/app-bar';
import Page from '../layouts/main';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../lib/i18n-client';
import BaseIcon from '../components/icon';
import Button from '../components/button';
import AppIcon1 from '../../../public/images/svg/itapps/app_1.svg';
import AppIcon2 from '../../../public/images/svg/itapps/app_2.svg';
import AppIcon3 from '../../../public/images/svg/itapps/app_3.svg';
import AppIcon4 from '../../../public/images/svg/itapps/app_4.svg';
import AppIcon5 from '../../../public/images/svg/itapps/app_5.svg';
import AppIcon6 from '../../../public/images/svg/itapps/app_6.svg';
import AppIcon7 from '../../../public/images/svg/itapps/app_7.svg';
import AppIcon8 from '../../../public/images/svg/itapps/app_8.svg';
import AppIcon9 from '../../../public/images/svg/itapps/app_9.svg';
import AppIcon10 from '../../../public/images/svg/itapps/app_10.svg';
import AppIcon11 from '../../../public/images/svg/itapps/app_11.svg';
import AppIcon12 from '../../../public/images/svg/itapps/app_12.svg';
import AppIcon13 from '../../../public/images/svg/itapps/app_13.svg';
import AppIcon14 from '../../../public/images/svg/itapps/app_14.svg';
import AppIcon15 from '../../../public/images/svg/itapps/app_15.svg';
import AppIcon16 from '../../../public/images/svg/itapps/app_16.svg';
import AppIcon17 from '../../../public/images/svg/itapps/app_17.svg';
import AppIcon18 from '../../../public/images/svg/itapps/app_18.svg';
import AppIcon19 from '../../../public/images/svg/itapps/app_19.svg';
import AppIcon20 from '../../../public/images/svg/itapps/app_20.svg';
import AppIcon21 from '../../../public/images/svg/itapps/app_21.svg';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      '& button': {
        padding: `${theme.spacing(2)}px ${theme.spacing(8)}px`,
      },
    },
    contentWrap: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
    },
    container1: {
      display: 'grid',
      gridGap: `${theme.spacing()}px ${theme.spacing(4)}px`,
      padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,

      [theme.breakpoints.up('sm')]: {
        padding: `${theme.spacing(4)}px ${theme.spacing(8)}px`,
        gridTemplateColumns: '1fr 1fr',
      },

      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr 1fr',
      },
    },
    container2: {
      'display': 'flex',
      'flexDirection': 'column',
      'justifyContent': 'center',
      'alignItems': 'center',
      '& > div': {
        marginBottom: theme.spacing(3),
      },
    },
    service: {
      'padding': theme.spacing(),
      'borderRadius': theme.spacing() / 2,
      'display': 'grid',
      'gridTemplateColumns': '60px 1fr',
      'gridGap': theme.spacing(),
      'justifyItems': 'flex-start',
      'alignItems': 'center',
      '&:not($formControl)': {
        cursor: 'pointer',
      },
      'color': '#484848',
      '&:hover:not($serviceIndex):not($formControl) h6': {
        color: '#000',
      },
    },
    serviceIndex: {
      '& h6': {
        color: '#000',
      },
    },
    formControl: {
      minWidth: '90%',
      [theme.breakpoints.up('md')]: {
        minWidth: '80%',
      },
      [theme.breakpoints.up('lg')]: {
        minWidth: '60%',
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
  }),
);

interface ServicesProps {
  id: number;
  icon: any;
  title: string;
  subtitle: string;
  categories: string[];
}

const services: ServicesProps[] = [
  {
    id: 0,
    icon: AppIcon1,
    title: '1C:Бухгалтерия',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  { id: 1, icon: AppIcon2, title: 'Рабочее место', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  {
    id: 2,
    icon: AppIcon3,
    title: 'Печать и сканирование',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  { id: 3, icon: AppIcon4, title: 'Телефония', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  {
    id: 4,
    icon: AppIcon5,
    title: 'Расходные материалы',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 5,
    icon: AppIcon6,
    title: 'Электронная почта',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 6,
    icon: AppIcon7,
    title: 'Справочные системы',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  { id: 7, icon: AppIcon8, title: 'Банк-Клиенты', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  {
    id: 8,
    icon: AppIcon9,
    title: '1C:Документооборот',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  { id: 9, icon: AppIcon10, title: '1C:Зарплата', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  {
    id: 10,
    icon: AppIcon11,
    title: 'Доступ к информационным ресурсам',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 11,
    icon: AppIcon12,
    title: 'Новое рабочее место',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  { id: 12, icon: AppIcon13, title: '1C:КСУП', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  { id: 13, icon: AppIcon14, title: 'Веб-сайты', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  { id: 14, icon: AppIcon15, title: 'Фотография', subtitle: 'текст', categories: ['Категория услуги (по умолчанию)'] },
  {
    id: 15,
    icon: AppIcon16,
    title: 'Дизайн и полиграфия',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 16,
    icon: AppIcon17,
    title: '1C:Автотранспорт',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 17,
    icon: AppIcon18,
    title: 'Брендирование',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 18,
    icon: AppIcon19,
    title: 'Создание макета',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 19,
    icon: AppIcon20,
    title: '1C:Консолидация',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
  {
    id: 20,
    icon: AppIcon21,
    title: 'Заказать услугу',
    subtitle: 'текст',
    categories: ['Категория услуги (по умолчанию)'],
  },
];

const Services: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [currentTab, setCurrentTab] = useState(0);
  const [serviceIndex, setServiceIndex] = useState<number>(-1);
  const [category, setCategory] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [files, setFiles] = useState<DropzoneFile[]>([]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number): void => {
    setCurrentTab(newValue);
  };

  const handleChangeTabIndex = (index: number): void => {
    setCurrentTab(index);
  };

  const handleCurrentService = (index: number) => (): void => {
    setServiceIndex(index);
    setCurrentTab(1);
  };

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
  };

  const handleCategory = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setCategory(+event.target.value);
  };

  const handleAccept = (): void => {};

  const handleClose = (): void => {
    setServiceIndex(-1);
    setCurrentTab(0);
    setTitle('');
    setText('');
    setFiles([]);
    setCategory(0);
  };

  const inputLabel = useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  const currentService = serviceIndex >= 0 ? services[serviceIndex] : false;

  useEffect(() => {
    if (inputLabel.current) {
      setLabelWidth(inputLabel.current!.offsetWidth);
    }
  }, [inputLabel, currentService]);

  const swipeableViews = useRef(null);

  useEffect(() => {
    if (swipeableViews && swipeableViews.current) {
      swipeableViews.current.updateHeight();
    }
  }, [swipeableViews, files]);

  const tabHeader = useRef(null);
  const containerHeight =
    tabHeader && tabHeader.current ? `calc(100vh - ${appBarHeight}px - ${tabHeader.current.clientHeight}px)` : '100%';

  return (
    <>
      <Head>
        <title>{t('services:title')}</title>
      </Head>
      <Page {...rest}>
        <div className={classes.root}>
          <Paper ref={tabHeader} square className={classes.header}>
            <Tabs value={currentTab} indicatorColor="primary" textColor="primary" onChange={handleTabChange}>
              <Tab label={t('services:tabs.tab1')} />
              <Tab disabled={!currentService} label={t('services:tabs.tab2')} />
            </Tabs>
          </Paper>
          <SwipeableViews
            ref={swipeableViews}
            animateHeight
            disabled={!currentService}
            index={currentTab}
            className={classes.contentWrap}
            containerStyle={{ flexGrow: 1 }}
            onChangeIndex={handleChangeTabIndex}
          >
            <div style={{ minHeight: containerHeight }} className={classes.container1}>
              {services.map((service) => (
                <Box
                  key={service.id}
                  onClick={handleCurrentService(service.id)}
                  className={clsx(classes.service, {
                    [classes.serviceIndex]: serviceIndex === service.id,
                  })}
                >
                  <div>
                    <BaseIcon src={service.icon} size={48} />
                  </div>
                  <div>
                    <Typography variant="subtitle1">{service.title}</Typography>
                  </div>
                </Box>
              ))}
            </div>
            <div style={{ minHeight: containerHeight }} className={classes.container2}>
              {currentService && (
                <Box className={clsx(classes.service, classes.formControl)}>
                  <div>
                    <BaseIcon src={currentService.icon} size={48} />
                  </div>
                  <div>
                    <Typography variant="subtitle1">{currentService.title}</Typography>
                  </div>
                </Box>
              )}
              {currentService && (
                <FormControl className={classes.formControl} variant="outlined">
                  <InputLabel ref={inputLabel}>{t('services:form.category')}</InputLabel>
                  <Select value={category} onChange={handleCategory} labelWidth={labelWidth}>
                    {currentService.categories.map((cur, index) => (
                      <MenuItem key={cur} value={index}>
                        {cur}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  value={title}
                  onChange={handleTitle}
                  type="text"
                  label={t('services:form.title')}
                  variant="outlined"
                />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <TextField
                  value={text}
                  onChange={handleText}
                  multiline
                  rows={10}
                  type="text"
                  label={t('services:form.text')}
                  variant="outlined"
                />
              </FormControl>
              <FormControl className={classes.formControl} variant="outlined">
                <Dropzone setFiles={setFiles} files={files} {...rest} />
              </FormControl>
              <FormControl className={clsx(classes.formControl, classes.formAction)}>
                <Button actionType="cancel" onClick={handleClose}>
                  {t('common:cancel')}
                </Button>
                <Button onClick={handleAccept}>{t('common:accept')}</Button>
              </FormControl>
            </div>
          </SwipeableViews>
        </div>
      </Page>
    </>
  );
};

Services.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['services']),
});

export default nextI18next.withTranslation('services')(Services);
