"use client"

import Layout from "@/components/layout";
import {useObject} from "react-firebase-hooks/database";
import {getDatabaseReference, showToast} from "@/lib/utils";
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";
import InputText from "@/components/generic/input-text";
import {useForm} from "react-hook-form";
import {AccountFormData, AccountFormSchema} from "@/lib/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import Loading from "@/components/loading";
import {Button} from "@/components/ui/button";
import React, { useEffect } from "react";
import {useUpdateProfile} from "react-firebase-hooks/auth";
import {auth} from "@/firebase/config";
import {updateAccountInfo} from "@/lib/functions";
import ChangePassword from "@/app/account-details/changePassword";
import { breadcrumbItem } from "@/lib/types";
import { ButtonLoading } from "@/components/generic/button-loading";

const breadcrumb: breadcrumbItem[] = [
	{ text: "Home", link: "/" },
	{ text: "/" },
	{ text: "Account Details" },
]

export default function AccountPage() {
	const {user, loading} = useAuth();
	const router = useRouter();

	const [updateProfile] = useUpdateProfile(auth);
	const [userInfoData, userInfoLoading] = useObject(getDatabaseReference(`info/user/${user?.uid}`));

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AccountFormData>({
		resolver: zodResolver(AccountFormSchema),
	});

	const onSubmit = async (data: AccountFormData) => {
    if (!user) return;

    await updateAccountInfo(user.uid, {
      name: data.name,
      phone: data.phone,
    });

    if (data.name !== user.displayName) {
      const success = await updateProfile({displayName: data.name});
      if (success) {
        showToast("Success", "Updated user display name successfully.", "success");
      } else {
        showToast("Error", "Failed to update user display name.", "error");
      }
    }
  };

	useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || userInfoLoading) return <Loading />;

  if (!user) return null;

	const userInfo = userInfoData?.val();

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
				<form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm mx-auto mt-5 items-center">
					<InputText id={"name"}
										 type={"text"}
										 label={"Full Name"}
										 defaultValue={user.displayName || ""}
										 {...register("name")}
										 error={errors.name?.message || ""}
										 required
					/>
					<InputText id={"email"}
										 type={"email"}
										 label={"Email"}
										 defaultValue={user.email || ""}
										 readOnly
					/>
					<InputText id={"title"}
										 type={"text"}
										 label={"Title"}
										 defaultValue={userInfo?.title || ""}
										 readOnly
					/>
					<InputText id={"phone"}
										 type={"tel"}
										 label={"Phone Number"}
										 defaultValue={userInfo?.phone || ""}
										 {...register("phone")}
										 error={errors.phone?.message || ""}
					/>
					<ButtonLoading
            type="submit"
            loading = {isSubmitting}
            text = "Update"
            loadingText = "Updating..."
            className="mt-5"/>
				</form>

				<ChangePassword/>
			</div>
		</Layout>
	)
}