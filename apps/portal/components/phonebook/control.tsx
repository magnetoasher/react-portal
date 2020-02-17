/** @format */

// #region Imports NPM
import React, { FC } from 'react';
import { fade, Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { Box, InputBase, IconButton, Popper, ClickAwayListener, MenuList, MenuItem, Paper } from '@material-ui/core';
import { Search as SearchIcon, Settings as SettingsIcon } from '@material-ui/icons';
// #endregion
// #region Imports Local
import { PhonebookControlProps } from './types';
import RefreshButton from '../ui/refreshButton';
import { useTranslation } from '../../lib/i18n-client';

// #endregion

const panelHeight = 48;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    panel: {
      height: panelHeight,
      backgroundColor: '#F7FBFA',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
    },
    search: {
      'backgroundColor': fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
    },
    searchIcon: {
      width: theme.spacing(7),
      height: '100%',
      pointerEvents: 'none',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 7),
    },
    suggestionsPopper: {
      zIndex: theme.zIndex.appBar,
      marginLeft: theme.spacing(7),
    },
  }),
);

const PhonebookControl: FC<PhonebookControlProps> = ({
  searchRef,
  search,
  suggestions,
  refetch,
  handleSearch,
  handleSugClose,
  handleSugKeyDown,
  handleSugClick,
  handleSettingsOpen,
}) => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const showedSuggestions = suggestions.length > 0;

  return (
    <Box display="flex" alignItems="center" className={classes.panel}>
      <Box flexGrow={1} position="relative" ml={0} mr={2} className={classes.search}>
        <Box
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          className={classes.searchIcon}
        >
          <SearchIcon />
        </Box>
        <InputBase
          ref={searchRef}
          placeholder={t('phonebook:search')}
          value={search}
          onChange={handleSearch}
          fullWidth
          autoFocus
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
        <Popper
          id="search-suggestions"
          placement="bottom-start"
          className={classes.suggestionsPopper}
          open={showedSuggestions}
          anchorEl={searchRef.current}
          disablePortal
        >
          <Paper>
            {showedSuggestions && (
              <ClickAwayListener onClickAway={handleSugClose}>
                <MenuList onKeyDown={handleSugKeyDown}>
                  {suggestions.map((item) => (
                    <MenuItem key={item} onClick={handleSugClick(item)}>
                      {item}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            )}
          </Paper>
        </Popper>
      </Box>
      <RefreshButton noAbsolute disableBackground onClick={() => refetch()} />
      <IconButton onClick={handleSettingsOpen}>
        <SettingsIcon />
      </IconButton>
    </Box>
  );
};

export default PhonebookControl;