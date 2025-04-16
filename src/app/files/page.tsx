"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {useRouter, useSearchParams} from "next/navigation";
import Loading from "@/components/loading";
import React, { useEffect, useState } from "react";
import { useList, useListKeys } from "react-firebase-hooks/database";
import { getCurrentYear, getDatabaseReference, showToast } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdAdd, MdError, MdFileOpen } from "react-icons/md";
import { DataSnapshot } from "firebase/database";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CopyText } from "@/components/generic/copy-text";
import { Button } from "@/components/ui/button";
import InputDropDown from "@/components/generic/input-dropdown";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CustomSeparator from "@/components/generic/separator";
import { DialogClose } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInfoFormData, FileInfoFormSchema } from "@/lib/schemas";
import Separator from "@/components/generic/separator";
import InputText from "@/components/generic/input-text";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fileStatusOptions } from "@/lib/arrays";
import { addNewFile } from "@/lib/functions";
import { Badge } from "@/components/ui/badge";

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
  fileNo, fileYear, importer, 
  itemPackage, itemName,
  bl, be, lc,
  status
} : {
  fileNo: number, 
  fileYear: number, 
  importer: string,
  itemPackage?: string, 
  itemName?: string,
  bl?: string,
  be?: number,
  lc?: number,
  status?: string,}) => {
  return (
    <Card className="w-full md:w-1/4 md:min-w-fit flex-row p-2 items-center transition-all duration-150 border-1 border-foreground/50">
      <div className="wrap w-14 uppercase font-bold font-mono border-1 border-accent-foreground rounded-lg text-center p-2 text-xl">{fileNo}</div>
      <div className="grow flex flex-col">
        <div className="text-xl font-bold">{importer}</div>
        <div>{itemPackage}</div>
        <div>{itemName}</div>
        {bl && <CopyText text={`B/L: ${bl}`} copyText={bl}/>}
        {lc && lc != 0 ? <CopyText text={`LC: ${lc}`} copyText={lc.toString()}/> : null}
        {be && be != 0 ? <CopyText text={`B/E: ${be}`} copyText={be.toString()}/> : null}
        {status && status != "Select" && <Badge className={`text-md`}>{status}</Badge>}
      </div>
      <Link href={`/files/${fileYear}${fileNo}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <MdFileOpen className={`size-8 p-1 border-2 border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20`}/>
            </TooltipTrigger>
            <TooltipContent>
              View File Details
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>
    </Card>
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

  const [open, setOpen] = useState(false);
  const [newFile, setNewFile] = useState(false);
  const [newFileNo, setNewFileNo] = useState<number | undefined>();
  const importerNames = useListKeys(getDatabaseReference(`info/importer`))[0];
	const importerNameOptions = importerNames?.map((importerName) => ({ value: importerName}))

  const {
		register,
		handleSubmit,
    reset,
		formState: { errors },
	} = useForm<FileInfoFormData>({
		resolver: zodResolver(FileInfoFormSchema),
	});

  const onSubmit = async (data : FileInfoFormData) => {
    if (newFileNo)
      await addNewFile(newFileNo, year, data).finally(() => {
        setOpen(false)
      })
  }

  const checkNewFile = () => {
    try {
      if (newFileNo == undefined) {
        showToast("Error", `Input New File No`, "error")
        setNewFile(false)
      } else if (filesData && !filesData.some(snapshot => Number(snapshot.key) === newFileNo)) setNewFile(true)
      else {
        showToast("Error", `File No ${newFileNo}/${year} already exists`, "error")
        setNewFile(false)
      }
    } catch (error) {
      console.error("Error checking file:", error);
      return false;
    }
  }

	if (loading) return <Loading />

	if (!loading && !user) {
		router.push("/login")
		return null
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
        <div className="flex items-center gap-x-2">
          <InputDropDown id="year-select"
                        label={"Year"}
                        className="max-w-full w-36 -translate-y-2"
                        options={getYearsRange()}
                        onChange={handleYearChange}
                        defaultValue={year}
          />

          <Separator orientation={"vertical"}/>

					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button onClick={() => {
                setNewFile(false)
                setNewFileNo(undefined)
                reset()
              }}>
								<MdAdd/> Add New File
							</Button>
						</DialogTrigger>
						<DialogContent className={"border border-accent"}>
              <DialogHeader>
								<DialogTitle>{ newFile ? `AE/IMP/${newFileNo}/${year}` : "Add New File"}</DialogTitle>
								<DialogDescription>
									Click submit to add the new file
								</DialogDescription>
              </DialogHeader>
							<CustomSeparator orientation={"horizontal"}/>
							<form onSubmit={handleSubmit(onSubmit)}
										className="flex-col">
								{
                  !newFile ? <div className="flex flex-col space-y-2 text-center">
                      <InputText id="newFileNo"
                        type="text"
                        label="New File No"
                        onChange={(e) => setNewFileNo(Number(e.target.value))}
                      />
                      <Button type="button" size="lg" onClick={checkNewFile}>Check</Button>
                    </div>
                  :
                    <div>
                      <InputDropDown id="importer"
                                     label="Importer"
                                     options={importerNameOptions ? importerNameOptions : []}
                                     {...register('importer')}
                                     helperText={errors.importer ? errors.importer.message : ""}
                                     color={errors.importer ? "error" : "default"}
                                     required
                      />
                      <InputText id="itemPackage"
															   type="text"
															   label="Package Details"
															   {...register("itemPackage")}
															   helperText={errors.itemPackage ? errors.itemPackage.message : ""}
															   color={errors.itemPackage ? "error" : "default"}
                                 required
									    />
                      <InputText id="itemName"
															   type="text"
															   label="Item Name"
															   {...register("itemName")}
															   helperText={errors.itemName ? errors.itemName.message : ""}
															   color={errors.itemName ? "error" : "default"}
                                 required
									    />
                      <InputText id="bl"
															   type="text"
															   label="B/L No"
															   {...register("bl")}
                                 helperText={errors.bl ? errors.bl.message : ""}
															   color={errors.bl ? "error" : "default"}
									    />
                      <InputText id="lc"
															   type="number"
															   label="LC No"
                                 defaultValue={0}
															   {...register("lc", {valueAsNumber: true})}
                                 helperText={errors.lc ? errors.lc.message : ""}
															   color={errors.lc ? "error" : "default"}
									    />
                      <InputText id="be"
															   type="number"
															   label="B/E No"
                                 defaultValue={0}
															   {...register("be", {valueAsNumber: true})}
                                 helperText={errors.be ? errors.be.message : ""}
															   color={errors.be ? "error" : "default"}
                                 pre="C"
									    />
                      <InputDropDown id="status"
                                     label="Status"
                                     options={fileStatusOptions}
                                     {...register('status')}
                      />
                    </div>
                }

								<DialogFooter className={"sm:justify-center pt-8 gap-4"}>
									<DialogClose asChild>
										<Button type="button" size="lg" variant="destructive">
											Close
										</Button>
									</DialogClose>
									{
                    newFile && <Button type="submit" size="lg">Submit</Button>
                  }
                  {
                    newFile && <Button type="reset" size="lg" variant={"accent"}>Reset</Button>
                  }
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
        </div>
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
            : <div className={"flex flex-wrap gap-2"}>
              {
                filesData.map((file: DataSnapshot) => {
                  const snapshot = file.val();
                  return (
                    <FileCard key={file.key}
                              fileNo={Number(file.key)} 
                              fileYear={year} 
                              importer={snapshot.importer}
                              itemPackage={snapshot.itemPackage}
                              itemName={snapshot.itemName}
                              bl={snapshot.bl}
                              be={snapshot.be}
                              lc={snapshot.lc}
                              status={snapshot.status}/>
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