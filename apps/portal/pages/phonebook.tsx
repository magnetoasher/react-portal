/** @format */

// #region Imports NPM
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useTheme } from '@material-ui/core/styles';
import { QueryResult } from 'react-apollo';
import { useQuery, useLazyQuery, useMutation } from '@apollo/react-hooks';
import Head from 'next/head';
import { Box, useMediaQuery } from '@material-ui/core';
import { Order, OrderDirection } from 'typeorm-graphql-pagination';
// #endregion
// #region Imports Local
import PhonebookControl from '../components/phonebook/control';
import PhonebookTable from '../components/phonebook/table';
import PhonebookProfile from '../components/phonebook/profile';
import PhonebookSettings from '../components/phonebook/settings';
import { ColumnNames } from '../components/phonebook/types';
import Modal from '../components/ui/modal';
import Loading from '../components/loading';
import Page from '../layouts/main';
import { I18nPage, includeDefaultNamespaces, nextI18next } from '../lib/i18n-client';
import useDebounce from '../lib/debounce';
import { PROFILES, SEARCH_SUGGESTIONS, USER_SETTINGS } from '../lib/queries';
import { ProfileContext } from '../lib/context';
import { Data, ProfileProps } from '../lib/types';
import snackbarUtils from '../lib/snackbar-utils';
// #endregion

const columnsXS: ColumnNames[] = ['thumbnailPhoto40', 'lastName'];
const columnsSM: ColumnNames[] = [...columnsXS, 'title', 'workPhone'];
const columnsMD: ColumnNames[] = [...columnsSM, 'company', 'department'];
const columnsLG: ColumnNames[] = [...columnsMD, 'mobile', 'email'];

const getGraphQLColumns = (columns: ColumnNames[]): string => {
  let result = columns.filter((col) => col !== 'disabled' && col !== 'notShowing').join(' ');

  if (columns.includes('lastName')) {
    result = result.replace('lastName', 'fullName');
  }

  if (columns.includes('manager')) {
    result = result.replace('manager', 'manager { id fullName }');
  }

  return result;
};

const PhonebookPage: I18nPage = ({ t, ...rest }): React.ReactElement => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const largeWidth = useMediaQuery('(min-width:1600px)');

  const profile = useContext(ProfileContext);

  const defaultColumns = profile?.user?.settings?.phonebook?.columns as ColumnNames[] | null;

  const [columns, setColumns] = useState<ColumnNames[]>(
    defaultColumns || (lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS),
  );
  const [profileId, setProfileId] = useState<string | false>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [suggestionsFiltered, setSuggestionsFiltered] = useState<string[]>([]);
  const [orderBy, setOrderBy] = useState<Order<ColumnNames>>({
    direction: OrderDirection.ASC,
    field: 'lastName',
  });

  const [_search, setSearch] = useState<string>('');
  const search = useDebounce(_search, 300);

  const searchRef = useRef<HTMLInputElement>(null);

  const isAdmin = Boolean(profile?.user?.isAdmin);

  const [userSettings, { error: errorSettings }] = useMutation(USER_SETTINGS);

  const [
    getSearchSuggestions,
    { loading: suggestionsLoading, data: suggestionsData, error: suggestionsError },
  ] = useLazyQuery(SEARCH_SUGGESTIONS, { ssr: false });

  // TODO: вставить сюда роутинг по id конкретного юзера

  const { loading, data, error, fetchMore, refetch }: QueryResult<Data<'profiles', ProfileProps>> = useQuery(
    PROFILES(getGraphQLColumns(columns)),
    {
      ssr: false,
      variables: {
        orderBy,
        first: 100,
        after: '',
        search: search.length > 3 ? search : '',
        disabled: columns.includes('disabled'),
        // TODO: для админов
        notShowing: isAdmin && columns.includes('notShowing'),
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  );

  useEffect(() => {
    if (error) {
      snackbarUtils.error(error);
    }
    if (suggestionsError) {
      snackbarUtils.error(suggestionsError);
    }
    if (errorSettings) {
      snackbarUtils.error(errorSettings);
    }
  }, [error, suggestionsError, errorSettings]);

  useEffect(() => {
    setColumns(lgUp ? columnsLG : mdUp ? columnsMD : smUp ? columnsSM : columnsXS);
  }, [lgUp, mdUp, smUp]);

  useEffect(() => {
    if (!suggestionsLoading) {
      if (suggestionsData && suggestionsData.searchSuggestions.length && _search.length >= 3) {
        const filtered = suggestionsData.searchSuggestions.reduce((result: string[], cur: any) => {
          if (result.length > 4) return result;

          const lower = _search.toLowerCase().trim();
          let showing = '';

          if (cur.fullName.toLowerCase().includes(lower)) {
            showing = cur.fullName;
          } else if (cur.department && cur.department.toLowerCase().includes(lower)) {
            showing = cur.department;
          } else if (cur.company && cur.company.toLowerCase().includes(lower)) {
            showing = cur.company;
          } else if (cur.title && cur.title.toLowerCase().includes(lower)) {
            showing = cur.title;
          }
          showing = showing.trim();

          if (result.includes(showing) || showing === '') return result;

          return [...result, showing];
        }, []);

        setSuggestionsFiltered(filtered.length === 1 && filtered[0] === _search ? [] : filtered);
      } else {
        setSuggestionsFiltered([]);
      }
    }
  }, [suggestionsLoading, suggestionsData, _search]);

  const fetchFunction = (): any =>
    fetchMore({
      query: PROFILES(getGraphQLColumns(columns)),
      variables: {
        orderBy,
        after: data.profiles.pageInfo.endCursor,
        first: 100,
        search: search.length > 3 ? search : '',
        disabled: columns.includes('disabled'),
        notShowing: isAdmin && columns.includes('notShowing'),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const { pageInfo, edges, totalCount } = fetchMoreResult.profiles;

        if (edges.length === 0) return prev;
        const clean: string[] = [];

        return {
          ...prev,
          profiles: {
            ...prev.profiles,
            totalCount,
            edges: [...prev.profiles.edges, ...edges].filter(
              (edge) => !clean.includes(edge.node.id) && clean.push(edge.node.id),
            ),
            pageInfo,
          },
        };
      },
    }).catch((err) => snackbarUtils.error(err));

  const handleColumns = (values: ColumnNames[]): void => {
    userSettings({
      variables: {
        value: { phonebook: { columns: values } },
      },
    });
    setColumns(values);
  };

  const handleSort = (column: ColumnNames) => (): void => {
    const isAsc = orderBy.field === column && orderBy.direction === OrderDirection.ASC;
    setOrderBy({
      direction: isAsc ? OrderDirection.DESC : OrderDirection.ASC,
      field: column,
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setSearch(value);

    if (value.length >= 3) {
      getSearchSuggestions({
        variables: {
          search: value,
        },
      });
    }
  };

  const handleProfileId = (id: string | undefined) => (): void => {
    setProfileId(id || false);
  };

  const handleProfileClose = (): void => {
    setProfileId(false);
  };

  const handleSettingsOpen = (): void => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = (): void => {
    setSettingsOpen(false);
  };

  const handleSugClose = (event: React.MouseEvent<EventTarget>): void => {
    if (searchRef.current && searchRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setSuggestionsFiltered([]);
  };

  const handleSugKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setSuggestionsFiltered([]);
    }
  };

  const handleSugClick = (value: string) => (): void => {
    setSearch(value);
  };

  return (
    <>
      <Head>
        <title>{t('phonebook:title')}</title>
      </Head>
      <Page {...rest}>
        <Box display="flex" flexDirection="column">
          <PhonebookControl
            searchRef={searchRef}
            search={_search}
            suggestions={suggestionsFiltered}
            refetch={refetch}
            handleSearch={handleSearch}
            handleSugClose={handleSugClose}
            handleSugKeyDown={handleSugKeyDown}
            handleSugClick={handleSugClick}
            handleSettingsOpen={handleSettingsOpen}
          />
          <PhonebookTable
            hasLoadMore={!loading}
            loadMoreItems={fetchFunction}
            columns={columns}
            orderBy={orderBy}
            handleSort={handleSort}
            largeWidth={largeWidth}
            data={data?.profiles}
            handleProfileId={handleProfileId}
          />
          <Loading activate={loading} noMargin type="linear" variant="indeterminate" />
        </Box>
      </Page>
      <Modal open={Boolean(profileId)} onClose={handleProfileClose}>
        <PhonebookProfile profileId={profileId} handleClose={handleProfileClose} handleSearch={setSearch} />
      </Modal>
      <Modal open={settingsOpen} onClose={handleSettingsClose}>
        <PhonebookSettings
          columns={columns}
          changeColumn={handleColumns}
          handleClose={handleSettingsClose}
          isAdmin={isAdmin}
        />
      </Modal>
    </>
  );
};

PhonebookPage.getInitialProps = () => ({
  namespacesRequired: includeDefaultNamespaces(['phonebook']),
});

export default nextI18next.withTranslation('phonebook')(PhonebookPage);
