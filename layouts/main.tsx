/** @format */

// #region Imports NPM
import React, { useState, ReactNode, useEffect } from 'react';
import { useMediaQuery } from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/core/styles';
// #endregion

// #region Imports Local
import AppBar, { appBarHeight } from '../components/app-bar';
import Drawer from '../components/drawer';
// #endregion

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    root: {},
    main: {
      display: 'flex',
    },
    content: {
      flexGrow: 1,
      height: `calc(100vh - ${appBarHeight}px)`,
      overflow: 'auto',
    },
  }));

interface Main {
  children: ReactNode;
}

export default (props: Main): React.ReactElement => {
  const classes = useStyles({});
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const [drawerOpen, setDrawerOpen] = useState<boolean>(lgUp);

  useEffect(() => {
    setDrawerOpen(lgUp);
  }, [lgUp]);

  const handleDrawerOpen = (): void => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className={classes.root}>
      <AppBar handleDrawerOpen={handleDrawerOpen} />
      <div className={classes.main}>
        <Drawer open={drawerOpen} handleOpen={handleDrawerOpen} />
        <div id="content" className={classes.content}>
          {props.children}
        </div>
      </div>
    </div>
  );
};
