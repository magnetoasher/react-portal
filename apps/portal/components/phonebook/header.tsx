/** @format */

// #region Imports NPM
import React, { Component, forwardRef } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { TableRow, TableCell, TableSortLabel } from '@material-ui/core';
// #endregion
// #region Imports Local
import Box from '../../lib/box-ref';
import { PhonebookHeaderContext } from '../../lib/context';
import { allColumns } from './settings';
import { useTranslation } from '../../lib/i18n-client';
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    row: {
      position: 'sticky',
      top: 0,
      width: 'auto',
      minWidth: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      justifyItems: 'stretch',
      alignContent: 'stretch',
      justifyContent: 'space-between',
      flexWrap: 'nowrap',
      borderBottom: '1px solid rgba(224, 224, 224, 1)',
      background: '#fff',
      zIndex: 2,
      boxShadow: theme.shadows[3],
    },
    cell: {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      border: 'none',
    },
  }),
);

const hiddenColumns = ['disabled', 'notShowing'];

export default forwardRef<Component, any>(function PhonebookHeader({ children, style, ...rest }, ref) {
  const classes = useStyles({});
  const { t } = useTranslation();

  return (
    <PhonebookHeaderContext.Consumer>
      {(context) => (
        <Box ref={ref} flexGrow={1} style={{ height: style.height }} {...rest}>
          <>
            {context && (
              <TableRow component="div" className={classes.row}>
                {allColumns
                  .filter(({ name }) => context.columns.includes(name) && !hiddenColumns.includes(name))
                  .map((col) => {
                    const { name, defaultStyle, largeStyle } = col;
                    const { largeWidth, handleRequestSort, orderBy, height } = context;

                    const cellStyle = { height, ...(largeWidth ? largeStyle : defaultStyle) };

                    if (name === 'thumbnailPhoto40') {
                      return <TableCell key={name} component="div" className={classes.cell} style={cellStyle} />;
                    }

                    return (
                      <TableCell
                        key={name}
                        component="div"
                        scope="col"
                        className={classes.cell}
                        style={cellStyle}
                        sortDirection={
                          orderBy.field !== name ? false : (orderBy.direction.toLowerCase() as 'asc' | 'desc')
                        }
                      >
                        <TableSortLabel
                          active={orderBy.field === name}
                          direction={orderBy.direction.toLowerCase() as 'desc' | 'asc'}
                          onClick={handleRequestSort(name)}
                        >
                          {t(`phonebook:fields.${name}`)}
                        </TableSortLabel>
                      </TableCell>
                    );
                  })}
              </TableRow>
            )}
            {children}
          </>
        </Box>
      )}
    </PhonebookHeaderContext.Consumer>
  );
});
