"use client"

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/config';
import { getDatabaseReference } from '@/lib/utils';
import { useObject } from 'react-firebase-hooks/database';

export const useAuth = () => {
  const [user, userLoading, userError] = useAuthState(auth);

  const userRef = user ? getDatabaseReference(`info/user/${user.uid}`) : null;
  const userData = useObject(userRef)[0]?.val();

  const userRole = userData?.role ?? "";
  const isAdmin = userRole  === "admin";
	return { user, isAdmin, userLoading, userError };
};