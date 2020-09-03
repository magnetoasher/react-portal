/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import filesize from 'filesize';
import { useDrag } from 'react-dnd';
import { TableRow, TableCell } from '@material-ui/core';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
//#endregion
//#region Imports Local
import dateFormat from '@lib/date-format';
import { useTranslation } from '@lib/i18n-client';
import { FilesTableRowProps } from '@lib/types';
import { FilesListType } from './files-list-type';
//#endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fileIcon: {
      color: theme.palette.secondary.main,
      verticalAlign: 'middle',
    },
    alignRight: {
      textAlign: 'right',
      paddingRight: '10px',
    },
    checkbox: {
      width: '44px',
      maxWidth: '44px',
      minWidth: '44px',
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
);

export const FileTableRow: FC<FilesTableRowProps> = ({ header, current, index, handleCheckbox, handleRow }) => {
  const classes = useStyles({});
  const { t, i18n } = useTranslation();

  const [, dragRef] = useDrag({
    item: { type: current.type },
  });

  return (
    <TableRow ref={dragRef} hover tabIndex={-1}>
      <TableCell className={classes.checkbox}>
        <Checkbox checked={current.checked} onChange={handleCheckbox(index)} inputProps={{ 'aria-label': 'primary checkbox' }} />
      </TableCell>
      <TableCell width={10} onClick={(event) => handleRow(event, current)}>
        <FilesListType current={current} className={classes.fileIcon} />
      </TableCell>
      <TableCell onClick={(event) => handleRow(event, current)}>{current.name}</TableCell>
      <TableCell onClick={(event) => handleRow(event, current)}>{current.type === 'FOLDER' ? t('files:folder') : current.mime}</TableCell>
      {/* <TableCell>
        {current.creationDate ? format(current.creationDate, 'DD.MM.YYYY HH:MM') : ''}
      </TableCell>*/}
      <TableCell onClick={(event) => handleRow(event, current)}>{dateFormat(current.lastModified, i18n)}</TableCell>
      <TableCell onClick={(event) => handleRow(event, current)} className={classes.alignRight}>
        {filesize(current.size, { locale: i18n.language })}
      </TableCell>
    </TableRow>
  );
};
