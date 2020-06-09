/** @format */

//#region Imports NPM
import React, { FC } from 'react';
import { Theme, makeStyles, createStyles } from '@material-ui/core/styles';
import { LinearProgress, CircularProgress, Box } from '@material-ui/core';
import clsx from 'clsx';
//#endregion
//#region Imports Local
import BaseIcon from '@front/components/ui/icon';
import ConditionalWrapper from '@lib/conditional-wrapper';
import ServicesSyncIcon from '@public/images/svg/icons/wait_services.svg';
//#endregion

export enum LoadingWhere {
  Default,
  Service,
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loading: {
      color: 'red',
    },
    margin: {
      margin: theme.spacing(2),
    },
    fixed: {
      display: 'block',
      position: 'fixed',
      width: '100%',
    },
    icon: {
      width: '10em',
    },
    absolute: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
  }),
);

interface LoadingComponentProps {
  where?: LoadingWhere;
  activate?: boolean;
  variant?: 'determinate' | 'indeterminate' | 'static' | 'buffer' | 'query';
  disableShrink?: boolean;
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  type?: 'linear' | 'circular';
  full?: boolean;
  wrapperClasses?: string;
  noMargin?: boolean;
  absolute?: boolean;
  children?: any;
}

const LoadingComponent: FC<LoadingComponentProps> = ({
  where = LoadingWhere.Default,
  activate = true,
  variant,
  disableShrink,
  size,
  thickness,
  color,
  type,
  noMargin,
  full = false,
  wrapperClasses,
  absolute,
  children,
}): React.ReactElement => {
  const classes = useStyles({});

  if (!activate) {
    return (children && React.Children.map(children, (child) => <>{child}</>)) ?? null;
  }

  let icon: React.ReactElement | undefined;

  switch (where) {
    case LoadingWhere.Service:
      icon = <img className={classes.icon} src={ServicesSyncIcon} />;
      break;
    default:
  }

  if (type === 'linear') {
    const className = clsx(classes.loading, {
      [classes.margin]: !noMargin,
      [classes.fixed]: noMargin,
    });

    return (
      <LinearProgress
        variant={(variant as 'determinate' | 'indeterminate' | 'buffer' | 'query') || 'indeterminate'}
        className={className}
      />
    );
  }

  if (icon) {
    return (
      <ConditionalWrapper
        condition={full}
        wrapper={(child) => (
          <Box
            className={clsx(wrapperClasses, { [classes.absolute]: absolute })}
            display="flex"
            height="100%"
            width="100%"
            justifyContent="center"
            alignItems="center"
          >
            {child}
          </Box>
        )}
      >
        {icon}
      </ConditionalWrapper>
    );
  }

  return (
    <ConditionalWrapper
      condition={full}
      wrapper={(child) => (
        <Box
          className={clsx(wrapperClasses, { [classes.absolute]: absolute })}
          display="flex"
          height="100%"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          {child}
        </Box>
      )}
    >
      <CircularProgress
        color={color || 'primary'}
        variant={(variant as 'determinate' | 'indeterminate' | 'static') || 'indeterminate'}
        disableShrink={disableShrink || false}
        size={size || 24}
        thickness={thickness || 4}
        className={clsx({
          [classes.margin]: !noMargin,
        })}
      />
    </ConditionalWrapper>
  );
};

export default LoadingComponent;
