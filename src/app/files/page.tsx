"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {useRouter, useSearchParams} from "next/navigation";
import Loading from "@/components/loading";
import React from "react";

export default function FilesPage() {
	const {user, loading} = useAuth();
	const router = useRouter();
	const breadcrumb: {text: string, link?: string}[] = [
		{ text: "Home", link: "/" },
		{ text: "/" },
		{ text: "Files" },
	]

	const searchParams = useSearchParams()
	const year = searchParams.has('year') ? searchParams.get('year') : new Date().getFullYear()
  console.log(year)
	if (loading) return <Loading />;

	if (!loading && !user) {
		router.push("/login");
		return null;
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
				
			</div>
		</Layout>
	)
}