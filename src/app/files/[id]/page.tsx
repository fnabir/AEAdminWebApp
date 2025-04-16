"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useState } from "react";
import { useListKeys, useObject } from "react-firebase-hooks/database";
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
import InputDropDown from "@/components/generic/input-dropdown";
import InputText from "@/components/generic/input-text";
import { updateFile } from "@/lib/functions";
import { fileStatusOptions } from "@/lib/arrays";

export default function FileDetailsPage() {
	const {user, loading, userRole} = useAuth()

  const path = usePathname();
	const file: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const fileNo = Number(file.slice(4))
  const fileYear = Number(file.slice(0,4))

  const router = useRouter()

  const [open, setOpen] = useState(false);

  const [fileInfoData, filesInfoLoading, filesInfoError] = useObject(getDatabaseReference(`files/info/${fileYear}/${fileNo}`))
  const [fileDetailsData, filesDetailsLoading, filesDetailsError] = useObject(getDatabaseReference(`files/details/${fileYear}/${fileNo}`))
  const fileInfo = fileInfoData?.val()
  const fileDetails = fileDetailsData?.val()
  const [importerData, importerLoading, importerError] = useObject(getDatabaseReference(`info/importer/${fileInfo?.importer ? fileInfo.importer : ""}`))
  const importerInfo = importerData?.val()
  const importerNames = useListKeys(getDatabaseReference(`info/importer`))[0];
  const importerNameOptions = importerNames?.map((importerName) => ({ value: importerName}))
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
    register,
		handleSubmit,
		formState: { errors },
	} = useForm<FileDetailsFormData>({
		resolver: zodResolver(FileDetailsFormSchema),
	});

  const onSubmit = async (data: FileDetailsFormData) => {
    const dataInfo = {
      importer: data.importer,
      itemCount : data.itemCount,
      itemPackage : data.itemPackage,
      itemName : data.itemName,
      lc: data.lc,
      be: data.be,
      bl: data.bl,
      status: data.status
    }
    const dataDetails = {
      vessel: data.vessel,
      rotNo: data.rotNo,
      cnfValue: data.cnfValue,
      assessmentValue: data.assessmentValue,
      beData: data.beDate,
      assessmentDate: data.assessmentDate,
      dutyPaymentDate: data.dutyPaymentDate,
      deliveryDate: data.deliveryDate,
      customExpense: data.customExpense,
      deliveryExpense: data.deliveryExpense,
    }
    updateFile(fileNo, fileYear, dataInfo, dataDetails).finally(() => {
      setOpen(false);
    })
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
							<form className="flex-col" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex space-x-2">
                  <InputDropDown id="importer"
                                label="Importer"
                                options={importerNameOptions ? importerNameOptions : []}
                                defaultValue={fileInfo.importer}
                                {...register('importer')}
                                helperText={errors.importer ? errors.importer.message : ""}
                                color={errors.importer ? "error" : "default"}
                                className="flex-[0.7]"
                                required
                  />
                  <InputText id="itemCount"
                              type="number"
                              label="Item Count"
                              defaultValue={fileDetails?.itemCount ? fileDetails.itemCount : 1}
                              {...register("itemCount")}
                              className="flex-[0.3]"
                              required
                    />
                </div>
                <InputText id="itemPackage"
                            type="text"
                            label="Package Details"
                            defaultValue={fileInfo.itemPackage}
                            {...register("itemPackage")}
                            helperText={errors.itemPackage ? errors.itemPackage.message : ""}
                            color={errors.itemPackage ? "error" : "default"}
                            required
                />
                <InputText id="itemName"
                            type="text"
                            label="Item Name"
                            defaultValue={fileInfo.itemName}
                            {...register("itemName")}
                            helperText={errors.itemName ? errors.itemName.message : ""}
                            color={errors.itemName ? "error" : "default"}
                            required
                />
                <div className="flex space-x-2">
                  <InputText id="lc"
                              type="number"
                              label="LC No"
                              defaultValue={fileInfo?.lc ? fileInfo.lc : 0}
                              {...register("lc", {valueAsNumber: true})}
                              className="flex-[0.5]"
                  />
                  <InputText id="bl"
                            type="text"
                            label="B/L No"
                            defaultValue={fileInfo?.bl}
                            {...register("bl")}
                            className="flex-[0.5]"
                  />
                </div>
                <div className="flex space-x-2">
                  <InputText id="vessel"
                            type="text"
                            label="Vessel Name"
                            defaultValue={fileDetails?.vessel}
                            {...register("vessel")}
                            className="flex-[0.55]"
                  />
                  <InputText id="rotNo"
                            type="text"
                            label="Rot No"
                            defaultValue={fileDetails?.rotNo}
                            {...register("rotNo")}
                            className="flex-[0.45]"
                  />
                </div>
                <div className="flex space-x-2">
                <InputText id="cnfValue"
                            type="number"
                            label="C&F Value"
                            defaultValue={fileDetails?.cnfValue ? fileDetails.cnfValue : 0}
                            {...register("cnfValue", {valueAsNumber: true})}
                            pre="$"
                            helperText={errors.cnfValue ? errors.cnfValue.message : ""}
                            color={errors.cnfValue ? "error" : "default"}
                            className="flex-[1]"
                            step={0.01}
									/>
                  <InputText id="assessmentValue"
                            type="number"
                            label="Assessment Value"
                            defaultValue={fileDetails?.assessmentValue ? fileDetails.assessmentValue : 0}
                            {...register("assessmentValue", {valueAsNumber: true})}
                            pre="৳"
                            helperText={errors.assessmentValue ? errors.assessmentValue.message : ""}
                            color={errors.assessmentValue ? "error" : "default"}
                            className="flex-[1]"
                            step={0.01}
									/>
                </div>
                <div className="flex space-x-2">
                  <InputText id="be"
                            type="number"
                            label="B/E No"
                            defaultValue={fileInfo.be}
                            {...register("be", {valueAsNumber: true})}
                            pre="C"
                            className="flex-[0.8]"
                  />
                  <InputText id="be"
                            type="text"
                            label="B/E Date"
                            defaultValue={fileDetails?.beDate}
                            {...register("beDate")}
                            className="flex-[1]"
                  />
                  <InputText id="assessmentDate"
                            type="text"
                            label="Assessment Date"
                            defaultValue={fileDetails?.assessmentDate}
                            {...register("assessmentDate")}
                            className="flex-[1]"
                  />
                </div>
                <div className="flex space-x-2">
                  <InputText id="dutyPaymentDate"
                            type="text"
                            label="Duty Payment Date"
                            defaultValue={fileDetails?.dutyPaymentDate}
                            {...register("dutyPaymentDate")}
                            className="flex-[1]"
                  />
                  <InputText id="deliveryDate"
                            type="text"
                            label="Delivery Date"
                            defaultValue={fileDetails?.deliveryDate}
                            {...register("deliveryDate")}
                            className="flex-[0.8]"
                  />
                </div>
                {userRole == "admin" &&
                  <div className="flex space-x-2">
                    <InputText id="customExpense"
                              type="number"
                              label="Custom Expense"
                              defaultValue={fileDetails?.customExpense}
                              {...register("customExpense")}
                              pre="৳"
                              className="flex-[0.5]"
                    />
                    <InputText id="deliveryExpense"
                              type="number"
                              label="Delivery Expense"
                              defaultValue={fileDetails?.deliveryExpense}
                              {...register("deliveryExpense")}
                              pre="৳"
                              className="flex-[0.5]"
                    />
                  </div>
                }
                <InputDropDown id="status"
                                label="Status"
                                options={fileStatusOptions}
                                {...register('status')}
                />
								
								<DialogFooter className={"sm:justify-center pt-8 gap-4"}>
									<DialogClose asChild>
										<Button type="button" size="lg" variant="destructive">
											Close
										</Button>
									</DialogClose>
									<Button type="submit" size="lg">Submit</Button>
                  <Button type="reset" size="lg" variant={"accent"}>Reset</Button>
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
                  <div className="w-2/7 flex flex-col items-center justify-center p-2 rounded-md border-2 border-accent-foreground">
                    <div>{fileInfo.itemPackage}</div>
                    <div>{fileInfo.itemName}</div>
                    {fileInfo.lc && fileInfo.lc != 0 ? <div>{`LC No. ${fileInfo.lc}`}</div> : null}
                  </div>
                  <div className="rounded-md border-2 border-accent-foreground w-3/7 text-center p-2">
                    <div className="font-bold text-xl">{fileInfo.importer}</div>
                    <div>{importerInfo.address1}</div>
                    <div>{importerInfo.address2}</div>
                  </div>
                  <div className="w-2/7 flex items-center justify-center rounded-md border-2 border-accent-foreground px-2">
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
                  {
                    ((fileInfo && fileInfo.bl) || (fileDetails && (fileDetails.vessel || fileDetails.rotNo || fileDetails.bl))) &&
                    <div className="rounded-md border-2 border-accent-foreground w-2/7 text-center p-2">
                      { fileDetails && fileDetails.vessel && <div>{fileDetails.vessel}</div>}
                      { fileDetails && fileDetails.rotNo && <div>{`ROT NO: ${fileDetails.rotNo}`}</div>}
                      { fileInfo && fileInfo.bl && <div>{`B/L: ${fileInfo.bl}`}</div>}
                    </div>
                  }
                  {
                    ((fileInfo && fileInfo.be) || (fileDetails && (fileDetails.cnfValue || fileDetails.assessmentValue || fileDetails.beDate))) && 
                    <div className="rounded-md border-2 border-accent-foreground w-3/7 p-2 flex items-center justify-center">
                      <div className="flex space-x-4">
                        <div className="wrap text-start">
                          <div>C&F VALUE:</div>
                          <div>ASSESSMENT VALUE:</div>
                          { fileInfo.be && fileInfo.be != 0 ? <div>{`B/E No. C-${fileInfo.be}`}</div> : null}
                        </div>
                        <div className="wrap text-end">
                          { fileDetails && fileDetails.cnfValue && <div>{formatCurrency(fileDetails.cnfValue, 2, "$")}</div> }
                          { fileDetails && fileDetails.assessmentValue && <div>{formatCurrency(fileDetails.assessmentValue, 2)}</div> }
                          { fileDetails && fileDetails.beDate && <div>{`DATE: ${fileDetails.beDate}`}</div>}
                        </div>
                      </div>
                    </div>
                  }
                  {
                    (fileDetails && (fileDetails.assessmentDate || fileDetails.dutyPaymentDate || fileDetails.deliveryDate)) && 
                    <div className="rounded-md border-2 border-accent-foreground w-2/7 text-center px-2 flex items-center justify-center">
                      <div className="grid grid-cols-2 text-sm text-start">
                        {fileDetails.assessmentDate && (
                          <>
                            <div>ASSESSMENT:</div>
                            <div className="text-end">{fileDetails.assessmentDate}</div>
                          </>
                        )}
                        {fileDetails.dutyPaymentDate && (
                          <>
                            <div>DUTY PAYMENT:</div>
                            <div className="text-end">{fileDetails.dutyPaymentDate}</div>
                          </>
                        )}
                        {fileDetails.deliveryDate && (
                          <>
                            <div>DELIVERY:</div>
                            <div className="text-end">{fileDetails.deliveryDate}</div>
                          </>
                        )}
                      </div>
                    </div>
                  }
                </div>

                {
                  userRole == "admin" &&
                  <div className="flex flex-col gap-2">
                    {
                      fileDetails && fileDetails.customExpense ?
                      <div className={"flex flex-row gap-2 rounded-md border-2 border-accent-foreground p-2"}>
                        <div className="grow">Assessment/Custom Expense</div>
                        <div className="wrap">{formatCurrency(fileDetails.customExpense, 2)}</div>
                      </div>
                      : null
                    }
                    {
                      fileDetails && fileDetails.deliveryExpense ?
                      <div className={"flex flex-row gap-2 rounded-md border-2 border-accent-foreground p-2"}>
                        <div className="grow">Delivery Expense</div>
                        <div className="wrap">{formatCurrency(fileDetails.deliveryExpense, 2)}</div>
                      </div>
                      : null
                    }
                    {
                      fileDetails && fileDetails.assessmentValue ?
                      <div className={"flex flex-row gap-2 rounded-md border-2 border-accent-foreground p-2"}>
                        <div className="grow">{`Agency Commission ${commission == importerInfo.minCommission ? "(Minimum)" : ""}`}</div>
                        <div className="wrap">{formatCurrency(commission, 2)}</div>
                      </div>
                      : null
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