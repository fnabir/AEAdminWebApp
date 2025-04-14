"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {useRouter, useSearchParams} from "next/navigation";
import Loading from "@/components/loading";
import React, { useEffect, useState } from "react";
import { useList } from "react-firebase-hooks/database";
import { getCurrentYear, getDatabaseReference } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdError, MdFileOpen } from "react-icons/md";
import { DataSnapshot } from "firebase/database";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CopyText } from "@/components/generic/copy-text";
import { Button } from "@/components/ui/button";
import CustomDropDown from "@/components/generic/custom-dropdown";

const breadcrumb: {text: string, link?: string}[] = [
  { text: "Home", link: "/" },
  { text: "/" },
  { text: "Files" },
]

const getYearsRange = (start = 2024, end = getCurrentYear()) =>
  Array.from({ length: end - start + 1 }, (_, i) => ({
    value: String(start + i)
  })).reverse();

const FileCard = ({
  fileNo, 
  fileYear, 
  client, 
  itemPackage, 
  itemName,
  bl, be, lc,
} : {
  type: "Import" | "Export", 
  fileNo: number, 
  fileYear: number, 
  client: string,
  itemPackage?: string, 
  itemName?: string,
  bl?: string,
  be?: string,
  lc?: string,}) => {
  return (
    <div className="w-full md:w-1/4 md:min-w-fit p-1">
      <Card className="flex-row p-2 items-center transition-all duration-150">
        <div className="wrap w-14 uppercase font-bold font-mono border-1 border-accent-foreground rounded-lg text-center p-2 text-xl">{fileNo}</div>
        <div className="grow">
          <div className="text-xl font-bold">{client}</div>
          <div>{itemPackage}</div>
          <div>{itemName}</div>
          <CopyText text={`B/L: ${bl}`} copyText={bl}/>
          <CopyText text={`LC: ${lc}`} copyText={lc}/>
          <CopyText text={`B/E: ${be}`} copyText={be} />
        </div>
        <Link href={`/files/${fileYear}${fileNo}`}>
          <Button size={"icon"}>
            <MdFileOpen size={24}/>
          </Button>
        </Link>
      </Card>
    </div>
  )
}

export default function FilesPage() {
	const {user, loading} = useAuth()
  const searchParams = useSearchParams()
	const router = useRouter()

	const selectedYear = searchParams.has("year") ? Number(searchParams.get('year')) : getCurrentYear()
  const [year, setYear] = useState(selectedYear)

  useEffect(() => {
    setYear(selectedYear)
  }, [selectedYear])

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value
    if (newYear != "Select") router.push(`?year=${newYear}`)
  }
  
  const [filesData, filesLoading, filesError] = useList(getDatabaseReference(`files/info/${year}`))

	if (loading) return <Loading />

	if (!loading && !user) {
		router.push("/login")
		return null
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
        <CustomDropDown id="year-select"
                        label={"Year"}
                        className="max-w-full w-36 pb-2"
                        options={getYearsRange()}
                        onChange={handleYearChange}
        />
        <ScrollArea className={"flex-grow mb-4 -mr-4 pr-4"}>
          {
            filesLoading ?
              <div className="p-4 rounded-md flex items-center">
                <Skeleton className="flex-wrap h-10 w-16 mr-4 rounded-lg"/>
                <div className={"flex-auto"}>
                  <Skeleton className="h-6 mb-1 w-1/2 rounded-xl"/>
                  <div className="flex flex-row space-x-2">
                    <Skeleton className="h-4 w-16 rounded-xl"/>
                    <Skeleton className="h-4 w-32 rounded-xl"/>
                    <Skeleton className="h-4 w-24 rounded-xl"/>
                    <Skeleton className="h-4 w-12 rounded-xl"/>
                  </div>
                </div>
              </div>
            : filesError ?
              <CardIcon
                title={"Error"}
                description={filesError.message}>
                <MdError size={28}/>
              </CardIcon>
            : !filesData || filesData.length == 0 ?
              <CardIcon
                title={`No files found of year ${year}`}>
                <MdError size={28}/>
              </CardIcon>
            : <div className={"flex flex-wrap"}>
              {
                filesData.map((file: DataSnapshot) => {
                  const snapshot = file.val();
                  return (
                    <FileCard key={file.key} 
                              type={snapshot.type} 
                              fileNo={Number(file.key)} 
                              fileYear={year} 
                              client={snapshot.client}
                              itemPackage={snapshot.itemPackage}
                              itemName={snapshot.itemName}
                              bl={snapshot.bl}
                              be={snapshot.be}
                              lc={snapshot.lc}/>
                  )
                })
              }
              </div>
          }
        </ScrollArea>
			</div>
		</Layout>
	)
}