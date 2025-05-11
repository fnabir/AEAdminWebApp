import { useState } from "react";
import { auth } from "@/firebase/config";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { showToast } from "@/lib/utils";
import { ChangePasswordFormData } from "@/lib/schemas";
import { FirebaseError } from "firebase/app";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);

  const changePassword = async (data: ChangePasswordFormData) => {
    setLoading(true);
    const user = auth.currentUser;

    if (!user) {
      showToast("Error", "No user is signed in.", "error");
      setLoading(false);
      return false;
    }

    const credential = EmailAuthProvider.credential(user.email as string, data.currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);

      if (data.currentPassword === data.newPassword) {
        showToast("No Change", "New password is same as current password.", "default");
      } else {
        await updatePassword(user, data.newPassword);
        showToast("Success", "Password updated successfully", "success");
      }
      
      return true;

    } catch (error) {
      const e = error as FirebaseError
      if (e.code === "auth/wrong-password") {
        showToast("Error", "Wrong current password.", "error");
      } else {
        showToast("Error", e?.message || "An error occurred.", "error");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}