/** @format */

import React, { useContext } from 'react';
import { ProfileContext } from '../lib/context';

const IsAdmin = ({ children }: any): undefined | React.ReactElement => {
  const profile = useContext(ProfileContext);

  return profile && profile.user && profile.user.isAdmin && <>{children}</>;
};

IsAdmin.displayName = 'IsAdmin';

export default IsAdmin;
