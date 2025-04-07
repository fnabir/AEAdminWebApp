"use client"

import Layout from "@/components/layout";
import Loading from "@/components/loading";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const breadcrumb: {text: string, link?: string}[] = [
    { text: "Home"},
  ]

  useEffect(() => {
    if (!loading && (!user || error)) {
      router.push('/login');
    }
  }, [user, loading, router, error])

  if (loading) return <Loading/>

  if (user) {
    return (
      <Layout breadcrumb={breadcrumb}>
        <></>
        </Layout>
    )
  }
}
