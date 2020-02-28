/** @format */
/** @format */

// #region Imports NPM
import React, { useState, useEffect } from 'react';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import CopyToClipboard from 'react-copy-to-clipboard';
// import clsx from 'clsx';
import { ClickAwayListener } from '@material-ui/core';
import { useTranslation } from '../../lib/i18n-client';
// #endregion
// #region Imports Local
// #endregion

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // 'opacity': 0.6,
      'transition': `all 200ms ${theme.transitions.easing.easeOut} 0ms`,
      '&:hover': {
        color: theme.palette.secondary.main,
      },
      '& svg': {
        fontSize: '1rem',
      },
    },
  }),
);

interface CopyButtonProps extends IconButtonProps {
  text: string;
}

const CopyButton = ({ text }: CopyButtonProps): React.ReactElement => {
  const classes = useStyles({});
  const { t } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  useEffect(() => {
    if (text && open) {
      setTimeout(() => setOpen(false), 3000);
    }
  }, [open, text]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <CopyToClipboard text={text} onCopy={handleOpen}>
        <Tooltip
          open={open}
          onClose={handleClose}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title={t('common:copied')}
          placement="top"
          arrow
        >
          <IconButton className={classes.root} size="small" aria-label="copy">
            <FileCopyIcon />
          </IconButton>
        </Tooltip>
      </CopyToClipboard>
    </ClickAwayListener>
  );
};

export default CopyButton;
