import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export async function login(email: string, password: string) {
	return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
	try {
		await signOut(auth)
		console.log("Logged out successfully.")
	} catch (error) {
		console.error("Error logging out: ", error)
	}
}