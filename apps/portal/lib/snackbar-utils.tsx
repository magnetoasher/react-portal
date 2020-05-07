/** @format */

import React from 'react';
import { useSnackbar, VariantType, WithSnackbarProps } from 'notistack';
import { ApolloError } from 'apollo-client';
import { GraphQLError } from 'graphql';
// TODO: хз почему не работает
// import { UseTranslationResponse } from 'react-i18next';
import { useTranslation } from './i18n-client';

interface SnackbarUtilsProps {
  setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void;
  setUseTranslationRef: (useTranslation: any) => void;
}

const InnerSnackbarUtilsConfigurator: React.FC<SnackbarUtilsProps> = (props: SnackbarUtilsProps) => {
  props.setUseSnackbarRef(useSnackbar());
  props.setUseTranslationRef(useTranslation());
  return null;
};

let useSnackbarRef: WithSnackbarProps;
let useTranslationRef: any;

const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps): void => {
  useSnackbarRef = useSnackbarRefProp;
};

const setUseTranslationRef = (useTranslationRefProp: any): void => {
  useTranslationRef = useTranslationRefProp;
};

export const SnackbarUtilsConfigurator = (): React.ReactElement => {
  return (
    <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef} setUseTranslationRef={setUseTranslationRef} />
  );
};

export default {
  error(errors: ApolloError | readonly GraphQLError[] | string) {
    const { t } = useTranslationRef;

    if (typeof errors === 'string') {
      this.show(t('common:error', { message: errors }));
    } else if (errors instanceof ApolloError) {
      errors.graphQLErrors.forEach(({ message }) => {
        if (typeof message === 'object') {
          this.show(t('common:error', { message: (message as any).error }));
        } else {
          this.show(t('common:error', { message }));
        }
      });

      if (errors.networkError) {
        const { message } = errors.networkError;
        this.show(t('common:error', { message }));
      }
    } else if (errors instanceof GraphQLError) {
      errors.forEach(({ message }) => {
        if (typeof message === 'object') {
          this.show(t('common:error', { message: (message as any).error }));
        } else {
          this.show(t('common:error', { message }));
        }
      });
    }
  },

  show: (message: string, variant: VariantType = 'error') => useSnackbarRef.enqueueSnackbar(message, { variant }),
};
