"use client"

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/config';
import { getDatabaseReference } from '@/lib/utils';
import { useObject } from 'react-firebase-hooks/database';

export const useAuth = () => {
  const [user, userLoading, userError] = useAuthState(auth);

  const userRef = user ? getDatabaseReference(`info/user/${user.uid}`) : null;
  const userData = useObject(userRef)[0];

  const userRole = userData?.val()?.role ?? "user";
  const isAdmin = userRole === "admin";
	return { user, userRole, isAdmin, userLoading, userError };
};