/** @format */

// #region Imports NPM
import React from 'react';
import AvatarMui from '@material-ui/core/Avatar';
// #endregion
// #region Imports Local
import { Profile } from '../src/profile/models/profile.dto';
import Alien from '../../../public/images/svg/photo/alien-blue.svg';
import Man from '../../../public/images/svg/photo/man-blue.svg';
import Woman from '../../../public/images/svg/photo/woman-blue.svg';
// #endregion

interface AvatarProps {
  profile: Profile;
  fullSize?: boolean;
  className?: string;
}

export const Avatar = (props: AvatarProps): React.ReactElement => {
  const { profile, fullSize = false, ...rest } = props;
  const { gender, thumbnailPhoto40, thumbnailPhoto } = profile;

  const photo = (fullSize ? thumbnailPhoto : thumbnailPhoto40) as string;

  const base64Prefix = 'data:image/png;base64,';
  /* eslint-disable prettier/prettier */
  const src = photo
    ? `${photo.startsWith('data:image/') ? '' : base64Prefix}${photo}`
    : gender === 1
      ? Man
      : gender === 2
        ? Woman
        : Alien;
  /* eslint-enable prettier/prettier */

  return <AvatarMui src={src} {...rest} />;
};
