"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LoginFormSchema, LoginFormData } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/firebase/config";
import { getDatabaseReference, showToast } from "@/lib/utils";
import Image from "next/image";
import TextLogo from "@/images/logo.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import InputText from "@/components/generic/input-text";
import ResetPassword from "@/app/login/resetPassword";
import { login, logout } from "@/lib/functions";
import { FirebaseError } from "firebase/app";
import InputPassword from "@/components/generic/input-password";
import { get } from "firebase/database";
import { ButtonLoading } from "@/components/generic/button-loading";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      console.log("Logged in successfully");

      const user = auth.currentUser;

      if (!user) {
        showToast("Error", "No user found after login.", "error");
        return;
      }

      const snapshot = await get(
        getDatabaseReference(`info/user/${user.uid}/webAppAccess`),
      );

      if (snapshot?.val() === true) {
        router.push("/");
      } else {
        await logout();
        showToast(
          "Access Denied",
          "Not authorized to use this service",
          "error",
        );
      }
    } catch (e) {
      const error = e as FirebaseError;
      console.log(error);
      switch (error.code) {
        case "auth/invalid-email":
          showToast("Error", "Invalid email address!", "error");
          break;
        case "auth/user-not-found":
          showToast("Error", "Email not registered with us!", "error");
          break;
        case "auth/wrong-password":
          showToast("Error", "Wrong password!", "error");
          break;
        case "auth/network-request-failed":
          showToast("Error", "Network connection issue!", "error");
          break;
        default:
          showToast("Error", "Invalid email/password!", "error");
          break;
      }
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="relative md:py-3 w-full max-w-md mx-auto">
        <div className="absolute inset-0 bg-linear-to-r from-sky-500 to-sky-900 shadow-lg transform md:-rotate-6 rounded-2xl" />
        <Card className="w-full mx-auto bg-black/80 ring-1 ring-blue-800/5 shadow-black shadow-lg md:rounded-2xl backdrop-blur-2xl text-center">
          <CardHeader>
            <Image
              className={`size-24 pt-10 mx-auto`}
              src={TextLogo}
              alt={"Ahsan Enterprise"}
              priority={true}
            />
            <div className="text-2xl font-bold">AHSAN ENTERPRISE</div>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
              <InputText
                type={"email"}
                label={"Email"}
                floating={false}
                {...register("email")}
                placeholder="user@ahsanenterprise.com"
                error={errors.email?.message || ""}
                required
              />
              <InputPassword
                label={"Password"}
                floating={false}
                {...register("password")}
                placeholder="******"
                error={errors.password?.message || ""}
                required
              />
              <ButtonLoading
                type="submit"
                loading={isSubmitting}
                loadingText="Logging in..."
              >
                Login
              </ButtonLoading>
            </form>
            <div className="text-center">
              <ResetPassword />
            </div>
            <div className="mt-4 text-center text-sm">
              <div>By logging in, you agree to our</div>
              <a
                className="underline"
                target="_blank"
                href="https://asianliftbd.com/terms-of-use"
                rel="noopener noreferrer"
              >
                Terms of Use
              </a>{" "}
              and{" "}
              <a
                className="underline"
                target="_blank"
                href="https://asianliftbd.com/privacy-policy"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
