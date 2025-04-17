"use client"

import Layout from "@/components/layout";
import Loading from "@/components/loading";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Separator from "@/components/generic/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, getCurrentYear, getDatabaseReference } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useListKeys, useObject } from "react-firebase-hooks/database";

const breadcrumb: {text: string, link?: string}[] = [
  { text: "Home"},
]

const FilesCard = ({title, countLoading, count, date, year} : {title: string, countLoading:boolean, count: number, date?: string, year: string|number}) => {
  return (
    <Link className="w-full md:w-1/2 lg:w-1/3 p-1" href={`/files?year=${year}`}>
      <Card className="relative hover:border-sky-800 overflow-hidden">
        <div className="absolute right-1 top-0 text-primary/30 z-0 pointer-events-none select-none text-4xl lg:text-6xl font-bold leading-none">
          {year}
        </div>
        <div className="relative z-10">
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="-mt-2">
            {
              countLoading ? <Skeleton className="h-12 w-1/4 bg-accent-foreground/50"/>
              : <div className="text-3xl lg:text-5xl font-bold">{count}</div>
            }
          </CardContent>
          <CardFooter className="-mt-1 lg:mt-0 text-sm lg:text-base">
            {date ? `Last updated on ${date}` : ""}
          </CardFooter>
        </div>
      </Card>
    </Link>
  )
}

const BalanceCard = ({title, balanceLoading, balance, date, link} : {title:string, balanceLoading:boolean, balance:number, date:string, link:string}) => {
  return (
    <Link className="w-full md:w-1/2 lg:w-1/3 p-1" href={`/${link}`}>
      <Card className="hover:border-sky-800 !gap-2">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="-mt-4 lg:-mt-2">
          {
            balanceLoading ? <Skeleton className="h-12 w-1/2 bg-accent-foreground/50"/>
            : <div className="text-3xl lg:text-4xl font-bold">{formatCurrency(balance)}</div>
          }
        </CardContent>
        <CardFooter className="-mt-2 lg:mt-0 text-sm lg:text-base">
          {date ? `Last updated on ${date}` : ""}
        </CardFooter>
      </Card>
    </Link>
  )
}

export default function Home() {
  const {user, loading, userRole} = useAuth();
  const router = useRouter();

  const [snapshotFileLastYear, loadingFileLastYear] = useListKeys(getDatabaseReference(`files/info/${getCurrentYear()-1}`));
  const [snapshotFileCurrentYear, loadingFileCurrentYear] = useListKeys(getDatabaseReference(`files/info/${getCurrentYear()}`));
  const [importerBalanceData, importerBalanceLoading] = useObject(getDatabaseReference(`balance/total/importer`));
  const [staffBalanceData, staffBalanceLoading] = useObject(getDatabaseReference(`balance/total/staff`));

  useEffect(() => {
    if (!loading && (!user)) {
      router.push('/login');
    }
  }, [user, loading, router])

  if (loading) return <Loading/>

  if (user) {
    return (
      <Layout breadcrumb={breadcrumb}>
        <div className={"flex flex-col h-full space-y-2"}>
          <div className="flex flex-col">
            <div className="flex flex-row px-1 items-center">
              <div>Files</div>
              <Separator orientation="horizontal"/>
            </div>
            <div className="flex flex-wrap">
              <FilesCard title={"Total Files"} countLoading={loadingFileCurrentYear} count={snapshotFileCurrentYear? snapshotFileCurrentYear.length : 0} year={getCurrentYear()}/>
              <FilesCard title={"Total Files"} countLoading={loadingFileLastYear} count={snapshotFileLastYear? snapshotFileLastYear.length : 0} year={getCurrentYear()-1}/>
            </div>
          </div>
          { 
            userRole == "admin" && 
            <div className="flex flex-col">
              <div className="flex flex-row px-1 items-center">
                <div>Balance</div>
                <Separator orientation="horizontal"/>
              </div>
              
              <div className="flex flex-wrap">
                  <BalanceCard title={"Importer Balance"} 
                                balanceLoading={importerBalanceLoading} 
                                balance={importerBalanceData?.val().value ? importerBalanceData?.val().value : 0} 
                                date={importerBalanceData?.val().date ? importerBalanceData?.val().date : 0}
                                link={"importer"}/>
                  <BalanceCard title={"Staff Balance"} 
                                balanceLoading={staffBalanceLoading} 
                                balance={staffBalanceData?.val().value ? staffBalanceData?.val().value : 0} 
                                date={staffBalanceData?.val().date ? staffBalanceData?.val().date : 0}
                                link={"staff"}/>
              </div>
            </div>
          }
        </div>
      </Layout>
    )
  }
}
