/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableHead,
  TableRow,
  Button,
  InputBase,
  IconButton,
  Modal,
  Avatar,
  // Backdrop,
  // Fade,
} from '@material-ui/core';
import { Search as SearchIcon, Settings as SettingsIcon } from '@material-ui/icons';
// #endregion
// #region Imports Local
import Page from '../layouts/main';
import { ProfileComponent } from '../components/profile';
import { ProfileContext } from '../lib/types';
import { appBarHeight } from '../components/app-bar';
import { includeDefaultNamespaces } from '../lib/i18n-client';
// import useDebounce from '../lib/debounce';
// #endregion

type Order = 'asc' | 'desc';
type ColumnNames = 'photo' | 'name' | 'company' | 'subdivision' | 'position' | 'work_phone' | 'inside_phone' | 'email';

const panelHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    panel: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#F7FBFA',
      height: panelHeight,
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    table: { height: `calc(100vh - ${appBarHeight}px - ${panelHeight}px)`, overflow: 'auto' },
    search: {
      'flexGrow': 1,
      'position': 'relative',
      'borderRadius': theme.shape.borderRadius,
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      'marginRight': theme.spacing(2),
      'marginLeft': 0,
      'width': '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('md')]: {
        width: 200,
      },
    },
    buttonExtended: {
      borderRadius: '87px',
      backgroundColor: '#DEECEC',
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
interface Column {
  id: ColumnNames;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  {
    id: 'photo',
    label: '',
    minWidth: 100,
  },
  {
    id: 'name',
    label: 'Ф.И.О.',
    minWidth: 100,
  },
  {
    id: 'company',
    label: 'Компания',
    minWidth: 100,
  },
  {
    id: 'subdivision',
    label: 'Подразделение',
    minWidth: 100,
  },
  {
    id: 'position',
    label: 'Должность',
    minWidth: 100,
  },
  {
    id: 'work_phone',
    label: 'Рабочий телефон',
    minWidth: 100,
  },
  {
    id: 'inside_phone',
    label: 'Внут. тел.',
    minWidth: 100,
  },
  {
    id: 'email',
    label: 'Электронная почта',
    minWidth: 100,
  },
];

interface BookProps {
  id: number;
  photo: string;
  name: string;
  company: string;
  subdivision: string;
  position: string;
  work_phone: string;
  inside_phone: string;
  email: string;
}

const createData = (): BookProps[] => {
  const arr = [];

  for (let i = 0; i < 100; i++) {
    arr.push({
      id: i,
      photo: 'И',
      name: `Иванов Иван Иванович`,
      company: `Компания ${i}`,
      subdivision: `Подразделение ${i}`,
      position: 'Должность',
      work_phone: '+7 918 1111111',
      inside_phone: `00${i < 10 ? 0 : ''}${i}`,
      email: 'webmaster@kngk-group.ru',
    });
  }

  return arr;
};

const PhoneBook = (): React.ReactElement => {
  const classes = useStyles({});
  // const user = useContext(UserContext);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<ColumnNames>('name');
  const [search, setSearch] = useState<string>('');
  const [bookData, setBookData] = useState<BookProps[]>([]);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: ColumnNames): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const createSortHandler = (property: ColumnNames) => (event: React.MouseEvent<unknown>) => {
    handleRequestSort(event, property);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleProfileOpen = (): void => {
    setProfileOpen(true);
  };

  const handleProfileClose = (): void => {
    setProfileOpen(false);
  };

  // const profileOpen = Boolean(profileEl);
  const profileId = profileOpen ? 'profile' : undefined;

  const getRows = (a: BookProps): React.ReactNode => (
    <TableRow hover key={a.id} onClick={handleProfileOpen}>
      <TableCell>
        <Avatar>{a.photo}</Avatar>
      </TableCell>
      <TableCell>{a.name}</TableCell>
      <TableCell>{a.company}</TableCell>
      <TableCell>{a.subdivision}</TableCell>
      <TableCell>{a.position}</TableCell>
      <TableCell>{a.work_phone}</TableCell>
      <TableCell>{a.inside_phone}</TableCell>
      <TableCell>{a.email}</TableCell>
    </TableRow>
  );

  // const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    setBookData(createData());
  }, []);

  // useEffect(() => {
  //   setBookData(
  //     bookData.filter((data) => {
  //       if (debouncedSearch.length <= 3) {
  //         return true;
  //       }
  //       const s = debouncedSearch.toLocaleLowerCase();
  //       const check = (c) => c.toLowerCase().includes(s);
  //       console.log(debouncedSearch.length);
  //       return check(data.name) || check(data.inside_phone);
  //     }),
  //   );
  // }, [bookData, debouncedSearch]);

  return (
    <>
      <Page>
        <div className={classes.root}>
          <div className={classes.panel}>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder="Быстрый поиск"
                value={search}
                onChange={handleSearch}
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            </div>
            {/* <Button variant="contained" className={classes.buttonExtended}>
              Расширенный поиск
              </Button> */}
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </div>
          <div id="phonebook-wrap" className={classes.table}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell />
                  {columns.slice(1).map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sortDirection={orderBy === column.id ? order : false}
                      style={{ minWidth: column.minWidth }}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={order}
                        onClick={createSortHandler(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {bookData
                  .sort((a, b) => {
                    const asc = order === 'asc' ? 1 : -1;

                    if (a[orderBy] > b[orderBy]) {
                      return asc * 1;
                    }

                    if (a[orderBy] < b[orderBy]) {
                      return asc * -1;
                    }

                    return 0;
                  })
                  .map((a) => getRows(a))}
              </TableBody>
            </Table>
          </div>
        </div>
      </Page>
      <Modal id={profileId} disableAutoFocus open={profileOpen} onClose={handleProfileClose} className={classes.modal}>
        <ProfileComponent handleClose={handleProfileClose} />
      </Modal>
    </>
  );
};

PhoneBook.getInitialProps = () => {
  return {
    namespacesRequired: includeDefaultNamespaces(['phonebook']),
  };
};

export default PhoneBook;
