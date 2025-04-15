import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import {auth} from "@/firebase/config";
import {useForm} from "react-hook-form";
import {ChangePasswordFormData, ChangePasswordSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {showToast} from "@/lib/utils";
import InputText from "@/components/generic/input-text";
import React, {useState} from "react";

export default function ChangePassword() {
	const [open, setOpen] = useState<boolean>(false);
	const [submit, setSubmit] = useState<boolean>(false);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ChangePasswordFormData>({
		resolver: zodResolver(ChangePasswordSchema),
	});

	const onSubmit = async (data: ChangePasswordFormData) => {
		setSubmit(true);
		const user = auth.currentUser;

		if (!user) {
			showToast("Error", "No user is signed in.", "error");
			return;
		}

		const credential = EmailAuthProvider.credential(user.email as string, data.currentPassword);
		try {
			await reauthenticateWithCredential(user, credential);
			try {
				if (data.currentPassword === data.newPassword) {
					showToast("Success", "Password didn't change", "success");
				} else {
					await updatePassword(user, data.newPassword);
					showToast("Success", "Password updated successfully", "success");
				}
				setOpen(false);
			} catch {
				showToast("Error", "An error occurred while updating the password.", "error");
			}
		} catch {
			showToast("Error", "Wrong current password.", "error");
		}
		setSubmit(false);
	}

	return (
		<div>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>
					<Button variant="link" className="w-full mt-3" onClick={() => reset()}>Change Password</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="mx-auto w-full max-w-sm">
						<DrawerHeader>
							<DrawerTitle className={"text-center"}>Change Password</DrawerTitle>
							<DrawerDescription className={"text-center"}>Enter your registered mail with us to get the link to reset
								password</DrawerDescription>
						</DrawerHeader>
						<form onSubmit={handleSubmit(onSubmit)}>
							<InputText id={"currentPassword"}
												 type={"password"}
												 label={"Current Password"}
												 {...register('currentPassword')}
												 helperText={errors.currentPassword ? errors.currentPassword.message : ""}
												 color={errors.currentPassword ? "error" : "default"}
												 required
							/>
							<InputText id={"newPassword"}
												 type={"password"}
												 label={"New Password"}
												 {...register('newPassword')}
												 helperText={errors.newPassword ? errors.newPassword.message : ""}
												 color={errors.newPassword ? "error" : "default"}
												 required
							/>
							<InputText id={"confirmNewPassword"}
                         type={"password"}
												 label={"Confirm New Password"}
												 {...register('confirmNewPassword')}
												 helperText={errors.confirmNewPassword ? errors.confirmNewPassword.message : ""}
												 color={errors.confirmNewPassword ? "error" : "default"}
												 required
							/>
							<DrawerFooter>
								<Button type="submit" disabled={submit}>{submit ? "Updating..." : "Update Password"}</Button>
								<DrawerClose asChild>
									<Button variant="outline">Cancel</Button>
								</DrawerClose>
							</DrawerFooter>
						</form>
					</div>
				</DrawerContent>
			</Drawer>
		</div>
	)
}