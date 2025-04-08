"use client"

import Layout from "@/components/layout";
import Loading from "@/components/loading";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/firebase/config";
import { getDatabaseReference } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useListKeys } from "react-firebase-hooks/database";

export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();

  const breadcrumb: {text: string, link?: string}[] = [
    { text: "Home"},
  ]

  const currentYear = new Date().getFullYear()
  const [snapshotFileLastYear] = useListKeys(getDatabaseReference(`files/${currentYear-1}`));
  const [snapshotFileCurrentYear] = useListKeys(getDatabaseReference(`files/${currentYear}`));

  const FilesCard = ({title, count, date, year} : {title: string, count: number, date?: string, year: string|number}) => {
    return (
      <div className="w-full sm:w-1/2 md:w-1/3 p-1">
        <Card className="relative overflow-hidden">
          <div className="absolute right-1 top-0 text-primary/30 z-0 pointer-events-none select-none text-6xl font-bold leading-none">
            {year}
          </div>
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="-mt-2">
              <div className="text-5xl font-bold">{count}</div>
            </CardContent>
            <CardFooter>
              {date ? `Last updated on ${date}` : ""}
            </CardFooter>
          </div>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    if (!loading && (!user || error)) {
      router.push('/login');
    }
  }, [user, loading, router, error])

  if (loading) return <Loading/>

  if (user) {
    return (
      <Layout breadcrumb={breadcrumb}>
        <div className="flex flex-wrap">
          <FilesCard title={"Total Files"} count={snapshotFileCurrentYear? snapshotFileCurrentYear.length : 0} year={currentYear}/>
          <FilesCard title={"Total Files"} count={snapshotFileLastYear? snapshotFileLastYear.length : 0} year={currentYear-1}/>
        </div>
      </Layout>
    )
  }
}
