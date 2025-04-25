import { auth } from "@/firebase/config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { set, update } from "firebase/database";
import { getDatabaseReference, showToast } from "@/lib/utils";
import { expenseDataType } from "@/lib/types";

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

export async function updateFile(fileNo: number, fileYear: number, dataInfo: object, dataDetails: object) {
	await update(getDatabaseReference(`files/info/${fileYear}/${fileNo}`), dataInfo).then(async () => {
    await update(getDatabaseReference(`files/details/${fileYear}/${fileNo}`), dataDetails).then(() => {
		  showToast("Successful", "Updated the file details successfully.", "success");
    }).catch ((error) => {
      showToast("Error", `Failed to update the file details: ${error.message}`, "error");
    })
	}).catch ((error) => {
		showToast("Error", `Failed to update the file details: ${error.message}`, "error");
	})
}

export async function updateFileExpense(fileNo: number, fileYear: number, type: "port" | "custom" | "other" | "delivery", dataSet: expenseDataType[]) {
	const data = dataSet.reduce((acc, item) => {
		if (item.details != "" && item.value != 0) 
			acc[item.id] = {details: item.details, value: item.value}
		return acc
	}, {} as Record<number, { details: string; value: number }>)
	try {
		await set(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/${type}`), data)
    showToast("Successful", `Updated the file ${type} expense successfully.`, "success")
	} catch (error) {
		showToast("Error", `Failed to update the file ${type} expense: ${error}`, "error");
	}
}

export async function updateTotalBalance(type: string, value: number) {
	await update(getDatabaseReference(`balance/total/${type}`), {
		value: value
	})
}

export async function updateBalance(type: string, id: string, value: number) {
	await update(getDatabaseReference(`balance/${type}/${id}`), {
		value: value
	})
}