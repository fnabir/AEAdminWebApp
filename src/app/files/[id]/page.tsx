"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useState } from "react";
import { useObject } from "react-firebase-hooks/database";
import { formatCurrency, getDatabaseReference } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdEdit, MdError } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileDetailsFormData, FileDetailsFormSchema } from "@/lib/schemas";

export default function FileDetailsPage() {
	const {user, loading, userRole} = useAuth()

  const path = usePathname();
	const file: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const fileNo = file.slice(4)
  const fileYear = file.slice(0,4)

  const router = useRouter()

  const [open, setOpen] = useState(false);

  const [fileInfoData, filesInfoLoading, filesInfoError] = useObject(getDatabaseReference(`files/info/${fileYear}/${fileNo}`))
  const [fileDetailsData, filesDetailsLoading, filesDetailsError] = useObject(getDatabaseReference(`files/details/${fileYear}/${fileNo}`))
  const fileInfo = fileInfoData?.val()
  const fileDetails = fileDetailsData?.val()
  const [importerData, importerLoading, importerError] = useObject(getDatabaseReference(`info/importer/${fileInfo?.importer ? fileInfo.importer : ""}`))
  const importerInfo = importerData?.val()
  const fileName = `AE/${fileInfo?.type ? fileInfo?.type.slice(0,3) : "IMP"}/${fileNo}/${fileYear}`
  const commission = fileDetails?.assessmentValue && importerInfo ? (fileDetails.assessmentValue * importerInfo.commission / 100) > importerInfo.minCommission ? fileDetails.assessmentValue * importerInfo.commission / 100 : importerInfo.minCommission : 0

  const breadcrumb: {text: string, link?: string}[] = [
    { text: "Home", link: "/" },
    { text: "/" },
    { text: "Files", link: `/files?year=${fileYear}` },
    { text: "/" },
    { text: fileName }
  ]

  const {
		handleSubmit,
		formState: {  },
	} = useForm<FileDetailsFormData>({
		resolver: zodResolver(FileDetailsFormSchema),
	});

  const onSubmit = async () => {

  }

	if (loading) return <Loading />

	if (!loading && !user) {
		router.push("/login")
		return null
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
        { fileInfo && <div className="flex items-center pb-2 gap-x-2">
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>
							<Button>
								<MdEdit/> Update File Details
							</Button>
						</DialogTrigger>
						<DialogContent className={"border border-accent"}>
              <DialogHeader>
								<DialogTitle>Update File</DialogTitle>
								<DialogDescription>
									Click submit to update the file details.
								</DialogDescription>
              </DialogHeader>
							<Separator orientation={"horizontal"}/>
							<form onSubmit={handleSubmit(onSubmit)}
										className="flex-col">
								
								<DialogFooter className={"sm:justify-center pt-8"}>
									<DialogClose asChild>
										<Button type="button" size="lg" variant="secondary">
											Close
										</Button>
									</DialogClose>
									<Button type="submit" size="lg">Submit</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
        </div>}
        <ScrollArea className={"flex-grow -mr-4 pr-4 mb-2"}>
          {
            filesInfoLoading || filesDetailsLoading || importerLoading ?
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 justify-between">
                  <Skeleton className="rounded-md w-2/7 h-24"/>
                  <Skeleton className="rounded-md grow h-24"/>
                  <Skeleton className="rounded-md w-2/7 h-24"/>
                </div>
                <div className="flex gap-2 justify-between">
                  <Skeleton className="rounded-md w-2/7 h-24"/>
                  <Skeleton className="rounded-md grow h-24"/>
                  <Skeleton className="rounded-md w-2/7 h-24"/>
                </div>
                <Skeleton className="rounded-md w-full h-16"/>
              </div>
            : filesInfoError || filesDetailsError || importerError ?
              <CardIcon
                title={"Error"}
                description={filesInfoError ? filesInfoError.message : filesDetailsError ? filesDetailsError.message : importerError?.message}>
                <MdError size={28}/>
              </CardIcon>
            : !fileInfo || !importerData ?
              <CardIcon
                title={`File not found`}>
                <MdError size={28}/>
              </CardIcon>
            :
              <div className="flex flex-col gap-2">
                <div className={"flex gap-2"}>
                  <div className="rounded-md border-2 border-accent-foreground w-2/7 text-center p-2">
                    <div>{fileInfo.itemPackage}</div>
                    <div>{fileInfo.itemName}</div>
                    <div>{`LC No. ${fileInfo.lc}`}</div>
                  </div>
                  <div className="rounded-md border-2 border-accent-foreground w-3/7 text-center p-2">
                    <div className="font-bold text-xl">{fileInfo.importer}</div>
                    <div>{importerInfo.address1}</div>
                    <div>{importerInfo.address2}</div>
                  </div>
                  <div className="rounded-md border-2 border-accent-foreground w-2/7 text-center px-2 flex items-center justify-center">
                    <div className="grid grid-cols-2 text-sm text-start">
                      <div>BILL NO.</div>
                      <div className="text-end">{fileName}</div>

                      {fileDetails && fileDetails.deliveryDate && (
                        <>
                          <div>DATE:</div>
                          <div className="text-end">{fileDetails.deliveryDate}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className={"flex flex-row gap-2"}>
                  <div className="rounded-md border-2 border-accent-foreground w-2/7 text-center p-2">
                    { fileDetails && fileDetails.vessel && <div>{fileDetails.vessel}</div>}
                    { fileDetails && fileDetails.rotNo && <div>{`ROT NO: ${fileDetails.rotNo}`}</div>}
                    { fileInfo && fileInfo.bl && <div>{`B/L: ${fileInfo.bl}`}</div>}
                  </div>
                  <div className="rounded-md border-2 border-accent-foreground w-3/7 p-2 flex items-center justify-center">
                    <div className="flex space-x-4">
                      <div className="wrap text-start">
                        <div>C&F VALUE:</div>
                        <div>ASSESSMENT VALUE:</div>
                        { fileInfo.be && <div>{`B/E No. C-${fileInfo.be}`}</div> }
                      </div>
                      <div className="wrap text-end">
                        { fileDetails && fileDetails.cnfValue && <div>{formatCurrency(fileDetails.cnfValue, 2, "$")}</div> }
                        { fileDetails && fileDetails.cnfValue && <div>{formatCurrency(fileDetails.assessmentValue, 2)}</div> }
                        { fileDetails && fileDetails.beDate && <div>{`DATE: ${fileDetails.beDate}`}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-md border-2 border-accent-foreground w-2/7 text-center px-2 flex items-center justify-center">
                    <div className="grid grid-cols-2 text-sm text-start">
                      {fileDetails && fileDetails.assessmentDate && (
                        <>
                          <div>ASSESSMENT:</div>
                          <div className="text-end">{fileDetails.assessmentDate}</div>
                        </>
                      )}
                      {fileDetails && fileDetails.dutyPaymentDate && (
                        <>
                          <div>DUTY PAYMENT:</div>
                          <div className="text-end">{fileDetails.dutyPaymentDate}</div>
                        </>
                      )}
                      {fileDetails && fileDetails.deliveryDate && (
                        <>
                          <div>DELIVERY:</div>
                          <div className="text-end">{fileDetails.deliveryDate}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {
                  userRole == "admin" &&
                  <div className="flex flex-col gap-2">
                    {
                      fileDetails && fileDetails.customExpense &&
                      <div className={"flex flex-row gap-2 rounded-md border-2 border-accent-foreground p-2"}>
                        <div className="grow">Assessment/Custom Expense</div>
                        <div className="wrap">{formatCurrency(fileDetails.customExpense, 2)}</div>
                      </div>
                    }
                    {
                      fileDetails && fileDetails.deliveryExpense &&
                      <div className={"flex flex-row gap-2 rounded-md border-2 border-accent-foreground p-2"}>
                        <div className="grow">Delivery Expense</div>
                        <div className="wrap">{formatCurrency(fileDetails.deliveryExpense, 2)}</div>
                      </div>
                    }
                    {
                      fileDetails && fileDetails.cnfValue &&
                      <div className={"flex flex-row gap-2 rounded-md border-2 border-accent-foreground p-2"}>
                        <div className="grow">{`Agency Commission ${commission == importerInfo.minCommission ? "(Minimum)" : ""}`}</div>
                        <div className="wrap">{formatCurrency(commission, 2)}</div>
                      </div>
                    }
                  </div>
                }
              </div>
          }
        </ScrollArea>
			</div>
		</Layout>
	)
}