/** @format */

//#region Imports NPM
import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { format as dateFnsFormat } from 'date-fns';
//#endregion
//#region Imports Local
import { includeDefaultNamespaces, nextI18next, I18nPage } from '@lib/i18n-client';
import { LDAP_NEW_USER, LDAP_CHECK_USERNAME } from '@lib/queries';
import { resizeImage } from '@lib/utils';
import { ProfileContext } from '@lib/context';
import snackbarUtils from '@lib/snackbar-utils';
import { Data, Profile, ProfileInput, Contact } from '@lib/types';
import { MaterialUI } from '@front/layout';
import ProfileEditComponent from '@front/components/profile/edit';
//#endregion

const newParameters: ProfileInput = {
  contact: Contact.PROFILE,
  notShowing: true,
  disabled: false,
  gender: 0,
  birthday: undefined,
  username: '',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
};

const ProfileEditPage: I18nPage = ({ t, i18n, ...rest }): React.ReactElement => {
  const router = useRouter();
  const [current, setCurrent] = useState<ProfileInput>(newParameters);
  const [updated, setUpdated] = useState<ProfileInput>(newParameters);
  const [thumbnailPhoto, setThumbnail] = useState<File | undefined>();
  const { user } = useContext(ProfileContext);
  const locale = i18n.language as 'ru' | 'en' | undefined;
  const { isAdmin } = user || { isAdmin: false };

  const [ldapNewUser, { loading: loadingLdapNewUser, error: errorLdapNewUser }] = useMutation<Data<'ldapNewUser', Profile>>(LDAP_NEW_USER, {
    onCompleted: (data) => {
      if (data.ldapNewUser.id) {
        router.push(`/profile/edit/${data.ldapNewUser.id}`);
      }
    },
  });

  const [checkUsername, { loading: loadingCheckUsername, error: errorCheckUsername }] = useMutation<Data<'ldpCheckUsername', boolean>>(
    LDAP_CHECK_USERNAME,
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (current && acceptedFiles.length > 0) {
        setThumbnail(acceptedFiles[0]);
        setCurrent({ ...current, thumbnailPhoto: (await resizeImage(acceptedFiles[0])) as string });
      }
    },
    [current],
  );

  const handleCheckUsername = async (): Promise<void> => {
    if (updated.username) {
      const data = await checkUsername({
        variables: {
          value: updated.username,
        },
      });
      const { ldapCheckUsername } = data.data ?? { ldapCheckUsername: false };

      if (ldapCheckUsername === false) {
        snackbarUtils.error(t('profile:checkUsername:busy', { current: updated.username }));
      } else if (ldapCheckUsername === true) {
        snackbarUtils.show(t('profile:checkUsername:free', { current: updated.username }), 'success');
      }
    }
  };

  const handleChange = (name: keyof ProfileInput, value_?: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const element: EventTarget & HTMLInputElement = event.target;
    const value: string | boolean | number = value_ || (element.type === 'checkbox' ? element.checked : element.value);

    if (isAdmin && current) {
      const result = name === 'gender' ? +value : value;

      setCurrent({ ...current, [name]: result });
      setUpdated({ ...updated, [name]: result, disabled: updated.contact !== Contact.PROFILE });
    }
  };

  const handleBirthday = (date: Date): void => {
    if (current && updated) {
      setCurrent({ ...current, birthday: dateFnsFormat(date, 'yyyy-MM-dd') });
      setUpdated({ ...updated, birthday: dateFnsFormat(date, 'yyyy-MM-dd') });
    }
  };

  const handleSave = (): void => {
    ldapNewUser({
      variables: {
        ldap: updated,
        photo: thumbnailPhoto,
      },
    });
  };

  useEffect(() => {
    if (errorLdapNewUser) {
      snackbarUtils.error(errorLdapNewUser);
    }
    if (errorCheckUsername) {
      snackbarUtils.error(errorCheckUsername);
    }
  }, [errorCheckUsername, errorLdapNewUser]);

  const hasUpdate = useMemo<boolean>(() => {
    if (loadingLdapNewUser) {
      return true;
    }
    if (
      updated && Object.keys(updated).length > 1 && updated.contact === Contact.PROFILE
        ? updated.firstName || updated.lastName || updated.middleName
        : (updated.firstName || updated.lastName || updated.middleName) && updated.username
    ) {
      return !!updated || !!thumbnailPhoto;
    }
    return false;
  }, [loadingLdapNewUser, thumbnailPhoto, updated]);

  return (
    <>
      <Head>
        <title>{t('profile:new.title')}</title>
      </Head>
      <MaterialUI {...rest}>
        <ProfileEditComponent
          isAdmin={isAdmin}
          newProfile
          loadingCheckUsername={loadingCheckUsername}
          loadingProfile={false}
          loadingChanged={loadingLdapNewUser}
          profile={current}
          hasUpdate={hasUpdate}
          onDrop={onDrop}
          handleCheckUsername={handleCheckUsername}
          handleChange={handleChange}
          handleBirthday={handleBirthday}
          handleSave={handleSave}
          locale={locale}
        />
      </MaterialUI>
    </>
  );
};

ProfileEditPage.getInitialProps = ({ query }) => ({
  query,
  namespacesRequired: includeDefaultNamespaces(['profile', 'phonebook']),
});

export default nextI18next.withTranslation('profile')(ProfileEditPage);
