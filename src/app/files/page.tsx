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
import InputDropDown from "@/components/generic/input-dropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { breadcrumbItem } from "@/lib/types";
import AddFileDialog from "./add-file-dialog";

const breadcrumb: breadcrumbItem[] = [
  { text: "Home", link: "/" },
  { text: "/" },
  { text: "Files" },
]

const getYearsRange = (start = 2024, end = getCurrentYear()) =>
  Array.from({ length: end - start + 1 }, (_, i) => ({
    value: String(start + i)
  })).reverse();

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
			<div className="flex flex-col h-full">
        <div className="flex items-center space-x-2 divide-x-2 divide-slate-500">
          <InputDropDown id="year-select"
                        label={"Year"}
                        className="max-w-full w-36 -translate-y-2 pr-2"
                        options={getYearsRange()}
                        onChange={handleYearChange}
                        defaultValue={year}
          />
          <AddFileDialog year={year} filesData={filesData}/>
        </div>
        <ScrollArea className={"grow overflow-auto -mr-4 pr-4"}>
          {
            filesLoading ?
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                <Skeleton className="h-48"/>
                <Skeleton className="h-48"/>
                <Skeleton className="h-48"/>
                <Skeleton className="h-48"/>
              </div>
            : filesError ?
              <CardIcon
                title={"Error"}
                description={filesError.message}>
                <MdError size={28}/>
              </CardIcon>
            : !filesData || filesData.length === 0 ?
              <CardIcon
                title={`No files found of year ${year}`}>
                <MdError size={28}/>
              </CardIcon>
            : <div className={"grid grid-cols-1 lg:grid-cols-4 gap-2"}>
              {
                filesData.map((file: DataSnapshot) => {
                  return (
                    <FilesCard key={file.key}
                              fileNo={Number(file.key)} 
                              fileYear={year}
                              data={file}
                    />
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

function FilesCard({fileNo, fileYear, data}: { fileNo: number; fileYear: number; data:DataSnapshot}) {
  const val = data.val();
  const bl = val.bl;
  const lc = val.lc;
  const be = val.be;
  const status = val.status;
  return (
    <Card className="col-span-1 p-2 transition-all duration-150 border border-slate-500 hover:border-blue-500 -space-y-1">
      <div className="w-full flex items-center justify-between">
        <div className="wrap w-14 font-bold font-mono border border-slate-500 rounded-lg text-center p-1 text-lg">{fileNo}</div>
        {status && status != "Select" && <Badge className="text-sm h-6">{status}</Badge>}
        <Link href={`/files/${fileYear}${fileNo}`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <MdFileOpen className={`size-8 p-1 border border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20`}/>
              </TooltipTrigger>
              <TooltipContent>
                View File Details
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </div>
        <div className="text-xl font-bold">{val.importer}</div>
        <div>
          <div>{val.itemPackage}</div>
          <div className="truncate whitespace-nowrap">{val.itemName}</div>
        </div>
        <div>
          {bl && <CopyText text={`B/L: ${bl}`} copyText={bl} className="text-sm"/>}
          <div className="flex divide-x divide-slate-500 text-sm">
            {lc && lc != 0 ? <CopyText text={`LC: ${lc}`} copyText={lc.toString()} className="mr-1"/> : null}
            {be && be != 0 ? <CopyText text={`B/E: ${be}`} copyText={be.toString()} className="ml-1"/> : null}
          </div>
        </div>
    </Card>
  )
}