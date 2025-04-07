"use client"

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/config';

export const useAuth = () => {
	const [user, loading, error] = useAuthState(auth);
	const admin = ["wGCJbfgAZIQgM6Wh5wz4x7KZlpF2"];
	const staff = ["LzcKIs2huyaK83FEOqbkJCumezu2"];
	const userRole = user ? admin.includes(user.uid) ? "admin" : staff.includes(user.uid) ? "staff" : "user" : "";
	return { user, userRole, loading, error };
};