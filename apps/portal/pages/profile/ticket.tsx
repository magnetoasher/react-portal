/** @format */

// #region Imports NPM
import React, { useState } from 'react';
import Head from 'next/head';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  FormControl,
} from '@material-ui/core';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useQuery, useMutation } from '@apollo/react-hooks';
import clsx from 'clsx';
import { TFunction } from 'i18next';
// #endregion
// #region Imports Local
import { OldUser, OldTicket, OldFile } from '@app/portal/ticket/old-service/models/old-service.interface';
import Page from '../../layouts/main';
import dayjs from '../../lib/dayjs';
import clearHtml from '../../lib/clear-html';
import { Avatar } from '../../components/avatar';
import { Loading } from '../../components/loading';
import { includeDefaultNamespaces, nextI18next, I18nPage } from '../../lib/i18n-client';
import { OLD_TICKET_DESCRIPTION, OLD_TICKET_EDIT } from '../../lib/queries';
import { LARGE_RESOLUTION, TICKET_STATUSES, DATE_FORMAT } from '../../lib/constants';
import BaseIcon from '../../components/icon';
import Dropzone from '../../components/dropzone';
import Button from '../../components/button';
import { DropzoneFile } from '../../components/dropzone/types';
import Iframe from '../../components/iframe';
import { ComposeLink } from '../../components/compose-link';
import TicketIconNew from '../../public/images/svg/ticket/ticket_new.svg';
import TicketIconPause from '../../public/images/svg/ticket/ticket_pause.svg';
import TicketIconWorked from '../../public/images/svg/ticket/ticket_worked.svg';
import TicketIconComplete from '../../public/images/svg/ticket/ticket_complete.svg';
// #endregion

const getTicketStatusIcon = (status: string): any => {
  switch (status) {
    case TICKET_STATUSES[2]:
    case TICKET_STATUSES[3]:
      return TicketIconPause;
    case TICKET_STATUSES[4]:
      return TicketIconNew;
    case TICKET_STATUSES[1]:
      return TicketIconWorked;
    case TICKET_STATUSES[5]:
      return TicketIconComplete;
    default:
      return TicketIconPause;
  }
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    content: {
      display: 'grid',
      margin: '0 auto',
      gap: `${theme.spacing(4)}px ${theme.spacing(2)}px`,
      width: '100%',
      gridTemplateColumns: '1fr',
      [`@media (min-width:${LARGE_RESOLUTION}px)`]: {
        width: '80%',
      },
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
      },
    },
    fullRow: {
      [theme.breakpoints.up('md')]: {
        gridColumnStart: 1,
        gridColumnEnd: 3,
      },
    },
    rounded: {
      borderRadius: theme.spacing() / 2,
    },
    cardHeader: {
      boxShadow: theme.shadows[3],
    },
    lightHeader: {
      padding: theme.spacing(),
    },
    cardContent: {
      'padding': `0 ${theme.spacing(2)}px`,
      '&:first-child': {
        paddingTop: theme.spacing(2),
      },
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    },
    background: {
      background: fade(theme.palette.secondary.main, 0.15),
    },
    cardHeaderTitle: {
      textAlign: 'center',
    },
    notFound: {
      color: '#949494',
    },
    avatar: {
      height: 90,
      width: 90,
    },
    list: {
      '& > li': {
        display: 'grid',
        gap: `${theme.spacing()}px`,
        gridTemplateColumns: '1fr 2fr',
      },
    },
    statusBox: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: `${theme.spacing(2)}px`,
      [theme.breakpoints.up('md')]: {
        gridTemplateColumns: '1fr 1fr',
        gap: `${theme.spacing(8)}px`,
      },
    },
    statusContent: {
      'display': 'grid',
      'gridTemplateColumns': '1fr 3fr',
      'gap': `${theme.spacing(4)}px`,
      '&:last-child': {
        paddingBottom: theme.spacing(),
      },
    },
    formControl: {},
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

interface InfoCardProps {
  classes: any;
  header: string;
  profile: OldUser;
  t: TFunction;
}

const InfoCard = ({ classes, header, profile, t }: InfoCardProps): React.ReactElement => (
  <Card className={clsx(classes.rounded, classes.background)}>
    <CardHeader
      disableTypography
      title={
        <Typography className={classes.cardHeaderTitle} variant="h6">
          {header}
        </Typography>
      }
    />
    <CardContent className={classes.cardContent}>
      {profile && (
        <Box display="flex">
          <Box mr={2}>
            <Avatar className={classes.avatar} base64={profile.avatar} alt="photo" />
          </Box>
          <Box flex={1}>
            <Paper>
              <List className={classes.list} disablePadding>
                <ListItem divider>
                  <ListItemText primary={t('phonebook:fields.lastName')} />
                  <ListItemText primary={profile.name} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary={t('phonebook:fields.company')} />
                  <ListItemText primary={profile.company} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary={t('phonebook:fields.department')} />
                  <ListItemText primary={profile.department} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary={t('phonebook:fields.title')} />
                  <ListItemText primary={profile.position} />
                </ListItem>
                <ListItem divider>
                  <ListItemText primary={t('phonebook:fields.telephone')} />
                  <ListItemText primary={profile.telephone} />
                </ListItem>
                <ListItem>
                  <ListItemText primary={t('phonebook:fields.email')} />
                  <ListItemText primary={<ComposeLink to={profile.email}>{profile.email}</ComposeLink>} />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Box>
      )}
    </CardContent>
  </Card>
);

const ProfileTicket: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  const classes = useStyles({});
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [comment, setComment] = useState<string>('');
  const router = useRouter();

  const query = { id: null, type: null, ...(router && router.query) };

  const { loading, data, error } = useQuery(OLD_TICKET_DESCRIPTION, {
    ssr: false,
    variables: {
      code: query.id,
      type: query.type,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [oldTicketEdit, { loading: loadingEdit, error: errorEdit }] = useMutation(OLD_TICKET_EDIT, {
    update(cache, { data: { OldTicketEdit } }) {
      cache.writeQuery({
        query: OLD_TICKET_DESCRIPTION,
        variables: {
          code: query.id,
          type: query.type,
        },
        data: { OldTicketDescription: OldTicketEdit },
      });
    },
  });

  const handleComment = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setComment(event.target.value);
  };

  const handleAccept = (): void => {
    const variables = {
      ticket: {
        code: query.id,
        type: query.type,
        comment,
      },
      attachments: files.map((file: DropzoneFile) => file.file),
    };

    oldTicketEdit({
      variables,
    });

    setFiles([]);
    setComment('');
  };

  const handleClose = (): void => {
    setComment('');
    setFiles([]);
  };

  const ticket: OldTicket | undefined = data && data.OldTicketDescription;

  return (
    <>
      <Head>
        <title>
          {`${t('profile:title')}: ${
            ticket
              ? t('profile:ticket.header', {
                  ticket: ticket.code,
                  date: dayjs(ticket.createdDate).format(DATE_FORMAT(i18n)),
                })
              : ''
          }`}
        </title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          <Box display="flex" flexGrow={1} flexDirection="column" px={4} py={2} overflow="auto">
            <Box display="flex">
              <Link href={{ pathname: '/profile' }} as="/profile" passHref>
                <IconButton>
                  <ArrowBackIcon />
                </IconButton>
              </Link>
            </Box>
            {!ticket ? (
              !__SERVER__ && loading ? (
                <Loading full type="circular" color="secondary" disableShrink size={48} />
              ) : (
                <Typography className={clsx(classes.cardHeaderTitle, classes.notFound)} variant="h4">
                  {t('profile:notFound')}
                </Typography>
              )
            ) : (
              <Box className={classes.content}>
                <Card className={classes.fullRow}>
                  <CardHeader
                    disableTypography
                    className={clsx(classes.cardHeader, classes.background)}
                    title={
                      <Typography className={classes.cardHeaderTitle} variant="h6">
                        {t('profile:ticket.header', {
                          ticket: ticket.code,
                          date: dayjs(ticket.createdDate).format(DATE_FORMAT(i18n)),
                        })}
                      </Typography>
                    }
                  />
                  <CardContent>{ticket.name}</CardContent>
                </Card>
                <InfoCard
                  classes={classes}
                  header={t('profile:tickets.headers.author')}
                  profile={ticket.initiatorUser}
                  t={t}
                />
                <InfoCard
                  classes={classes}
                  header={t('profile:tickets.headers.executor')}
                  profile={ticket.executorUser}
                  t={t}
                />
                <Card className={clsx(classes.fullRow, classes.rounded, classes.background)}>
                  <CardContent className={classes.cardContent}>
                    <Box className={classes.statusBox}>
                      <Card>
                        <CardHeader
                          className={classes.lightHeader}
                          disableTypography
                          title={
                            <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                              {t('profile:tickets.headers.service')}
                            </Typography>
                          }
                        />
                        <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                          <Box textAlign="center">
                            <BaseIcon base64 src={ticket.service && ticket.service.avatar} size={48} />
                          </Box>
                          <span>{ticket.service && ticket.service.name}</span>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader
                          className={classes.lightHeader}
                          disableTypography
                          title={
                            <Typography className={classes.cardHeaderTitle} variant="subtitle1">
                              {t('profile:tickets.headers.status')}
                            </Typography>
                          }
                        />
                        <CardContent className={clsx(classes.cardContent, classes.statusContent)}>
                          <Box textAlign="center">
                            <BaseIcon src={getTicketStatusIcon(ticket.status)} size={48} />
                          </Box>
                          <span>{ticket.status}</span>
                        </CardContent>
                      </Card>
                    </Box>
                  </CardContent>
                </Card>
                <Card className={classes.fullRow}>
                  <CardHeader
                    disableTypography
                    className={clsx(classes.cardHeader, classes.background)}
                    title={
                      <Typography className={classes.cardHeaderTitle} variant="h6">
                        {t('profile:tickets.headers.description')}
                      </Typography>
                    }
                  />
                  <CardContent dangerouslySetInnerHTML={{ __html: clearHtml(ticket.description) }} />
                </Card>
                {ticket.files.length > 0 && (
                  <Card className={classes.fullRow}>
                    <CardHeader
                      disableTypography
                      className={clsx(classes.cardHeader, classes.background)}
                      title={
                        <Typography className={classes.cardHeaderTitle} variant="h6">
                          {t('profile:tickets.headers.files')}
                        </Typography>
                      }
                    />
                    <CardContent>
                      <Box display="flex" flexDirection="column">
                        {ticket.files.map((file: OldFile) => (
                          <Typography variant="subtitle1" key={file.code}>
                            {`${file.name}.${file.ext}`}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                )}
                <Card className={classes.fullRow}>
                  <CardHeader
                    disableTypography
                    className={clsx(classes.cardHeader, classes.background)}
                    title={
                      <Typography className={classes.cardHeaderTitle} variant="h6">
                        {t('profile:tickets.headers.comments')}
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Iframe srcDoc={ticket.descriptionFull} />
                  </CardContent>
                </Card>
                {ticket.status !== 'Завершен' &&
                  (loadingEdit ? (
                    <Box className={classes.fullRow}>
                      <Loading full type="circular" color="secondary" disableShrink size={48} />
                    </Box>
                  ) : (
                    <>
                      <FormControl className={clsx(classes.fullRow, classes.formControl)} variant="outlined">
                        <TextField
                          value={comment}
                          onChange={handleComment}
                          multiline
                          rows={5}
                          type="text"
                          color="secondary"
                          label={t('profile:tickets.comment.add')}
                          variant="outlined"
                        />
                      </FormControl>
                      <FormControl className={clsx(classes.fullRow, classes.formControl)} variant="outlined">
                        <Dropzone color="secondary" setFiles={setFiles} files={files} {...rest} />
                      </FormControl>
                      <FormControl className={clsx(classes.fullRow, classes.formControl, classes.formAction)}>
                        <Button actionType="cancel" onClick={handleClose}>
                          {t('common:cancel')}
                        </Button>
                        <Button onClick={handleAccept}>{t('common:send')}</Button>
                      </FormControl>
                    </>
                  ))}
              </Box>
            )}
          </Box>
        </Box>
      </Page>
    </>
  );
};

ProfileTicket.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileTicket);
