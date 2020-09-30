/** @format */

//#region Imports NPM
import React from 'react';
import AvatarMui from '@material-ui/core/Avatar';
//#endregion
//#region Imports Local
import { Profile, ProfileInput } from '@lib/types';
import Alien from '@public/images/svg/avatar/alien-blue.svg';
import Man from '@public/images/svg/avatar/man-blue.svg';
import Woman from '@public/images/svg/avatar/woman-blue.svg';
//#endregion

export interface AvatarProps {
  profile?: Profile | ProfileInput;
  alt: string;
  base64?: string;
  fullSize?: boolean;
  className?: string;
}

/**
 * TODO: DOCUMENT THIS
 */
// eslint-disable-next-line react/display-name
const Avatar = React.forwardRef(({ profile, fullSize = false, base64, ...rest }: AvatarProps, ref?: React.Ref<HTMLDivElement>) => {
  let source = 'data:image/png;base64,';

  if (base64) {
    return <AvatarMui ref={ref} src={source + base64} {...rest} />;
  }

  if (!profile) {
    return <AvatarMui ref={ref} src={Alien} {...rest} />;
  }

  const { gender, thumbnailPhoto40, thumbnailPhoto } = profile;
  const photo = fullSize ? thumbnailPhoto : thumbnailPhoto40;

  source = photo ? source + photo : gender === 1 ? Man : gender === 2 ? Woman : Alien;

  return <AvatarMui ref={ref} src={source} {...rest} />;
});

export default Avatar;
