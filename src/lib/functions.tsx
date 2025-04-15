import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { set, update } from "firebase/database";
import { getDatabaseReference, showToast } from "@/lib/utils";

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

export async function updateAccountInfo(uid: string, data: object) {
	await update(getDatabaseReference(`info/user/${uid}`), data).then(() => {
		showToast("Successful", "Updated the account info successfully.", "success");
	}).catch ((error) => {
		showToast("Error", `Failed to update the account info record: ${error.message}`, "error");
	})
}

export async function addNewFile(fileNo: number, fileYear: number, data: object) {
	await set(getDatabaseReference(`files/info/${fileYear}/${fileNo}`), data).then(() => {
		showToast("Successful", "Added the new file successfully.", "success");
	}).catch ((error) => {
		showToast("Error", `Failed to add the new file: ${error.message}`, "error");
	})
}

export async function updateTotalBalance(type: string, value: number) {
	await update(getDatabaseReference(`balance/total/${type}`), {
		value: value
	})
}