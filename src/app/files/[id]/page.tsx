"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useRef, useState } from "react";
import { useList, useListKeys, useObject } from "react-firebase-hooks/database";
import { formatCurrency, getDatabaseReference, getTotalValue } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdAdd, MdEdit, MdError } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogClose, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FileDetailsFormData, FileDetailsFormSchema } from "@/lib/schemas";
import InputDropDown from "@/components/generic/input-dropdown";
import InputText from "@/components/generic/input-text";
import { updateFile, updateFileExpense } from "@/lib/functions";
import { fileStatusOptions } from "@/lib/arrays";
import { FaPrint } from "react-icons/fa6";
import { useReactToPrint } from 'react-to-print';
import {format, parse} from "date-fns";
import { expenseDataType } from "@/lib/types";
import { InputDate } from "@/components/generic/input-date";
import InputTextarea from "@/components/generic/input-textarea";

export default function FileDetailsPage() {
	const {user, loading, userRole} = useAuth()

  const path = usePathname();
	const file: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const fileNo = Number(file.slice(4))
  const fileYear = Number(file.slice(0,4))

  const router = useRouter()

  const [openDetails, setOpenDetails] = useState(false)
  const [openPort, setOpenPort] = useState(false)
  const [openCustom, setOpenCustom] = useState(false)
  const [openOther, setOpenOther] = useState(false)
  const [openDelivery, setOpenDelivery] = useState(false)
  
  const [portExpenseSets, setPortExpenseSets] = useState<expenseDataType[]>([
		{ id: 1, details: "", value: 0 },
	]);
  const [customExpenseSets, setCustomExpenseSets] = useState<expenseDataType[]>([
		{ id: 1, details: "", value: 0 },
	]);
  const [otherExpenseSets, setOtherExpenseSets] = useState<expenseDataType[]>([
		{ id: 1, details: "", value: 0 },
	]);
  const [deliveryExpenseSets, setDeliveryExpenseSets] = useState<expenseDataType[]>([
		{ id: 1, details: "", value: 0 },
	]);

  const [fileInfoData, filesInfoLoading, filesInfoError] = useObject(getDatabaseReference(`files/info/${fileYear}/${fileNo}`))
  const [fileDetailsData, filesDetailsLoading, filesDetailsError] = useObject(getDatabaseReference(`files/details/${fileYear}/${fileNo}`))
  const fileInfo = fileInfoData?.val()
  const fileDetails = fileDetailsData?.val()
  const portExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/port`))[0]
  const customExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/custom`))[0]
  const otherExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/other`))[0]
  const deliveryExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/delivery`))[0]
  const [importerData, importerLoading, importerError] = useObject(getDatabaseReference(`info/importer/${fileInfo?.importer ? fileInfo.importer : ""}`))
  const importerInfo = importerData?.val()
  
  const importerNames = useListKeys(getDatabaseReference(`info/importer`))[0];
  const importerNameOptions = importerNames?.map((importerName) => ({ value: importerName}))
  const fileName = `AE/${fileInfo?.type ? fileInfo?.type.slice(0,3) : "IMP"}/${fileNo}/${fileYear}`
  
  const totalPortExpense = portExpenseData ? getTotalValue(portExpenseData) : 0
  const totalCustomExpense = customExpenseData ? getTotalValue(customExpenseData) : 0
  const totalOtherExpense = otherExpenseData ? getTotalValue(otherExpenseData) : 0
  const totalDeliveryExpense = deliveryExpenseData ? getTotalValue(deliveryExpenseData) : 0
  const miscellaneousValue: number = fileDetails && fileDetails.miscellaneous ? fileDetails.miscellaneous : 1200
  const commissionValue: number = Math.ceil(fileDetails?.assessmentValue && importerInfo ? (fileDetails.assessmentValue * importerInfo.commission / 100) > importerInfo.minCommission ? fileDetails.assessmentValue * importerInfo.commission / 100 : importerInfo.minCommission : 0)
  const totalValue: number = totalPortExpense + totalCustomExpense + totalOtherExpense + totalDeliveryExpense + miscellaneousValue + commissionValue
  const paidValue: number = fileDetails && fileDetails.paid ? fileDetails.paid : 0

  const addExpenseSet = (type: "port" | "custom" | "other" | "delivery") => {
		if (type == "port" && portExpenseSets.length < 8) {
			setPortExpenseSets((prev: expenseDataType[]) => [...prev, { id: prev.length + 1, details: "", value: 0 }])
		} else if (type == "custom" && customExpenseSets.length < 3) {
			setCustomExpenseSets((prev: expenseDataType[]) => [...prev, { id: prev.length + 1, details: "", value: 0 }])
		} else if (type == "other" && otherExpenseSets.length < 3) {
			setOtherExpenseSets((prev: expenseDataType[]) => [...prev, { id: prev.length + 1, details: "", value: 0 }])
		} else if (type == "delivery" && deliveryExpenseSets.length < 3) {
			setDeliveryExpenseSets((prev: expenseDataType[]) => [...prev, { id: prev.length + 1, details: "", value: 0 }]);
		} 
	};

	function handleExpenseDataChange (id: number, field: "details" | "value", value: string | number, type: "port" | "custom" | "other" | "delivery") {
    switch (type) {
      case "port":
        setPortExpenseSets((prev) => prev.map((set) =>set.id === id ? { ...set, [field]: value } : set))
        break
      case "custom":
        setCustomExpenseSets((prev) => prev.map((set) =>set.id === id ? { ...set, [field]: value } : set))
        break
      case "other":
        setOtherExpenseSets((prev) => prev.map((set) =>set.id === id ? { ...set, [field]: value } : set))
        break
      case "delivery":
        setDeliveryExpenseSets((prev) => prev.map((set) =>set.id === id ? { ...set, [field]: value } : set))
        break
    }
	}

  if (portExpenseData) {
    portExpenseData.map((item, index) => {
      const snapshot = item.val()
      if (portExpenseSets.length  <= index + 1 ) {
        addExpenseSet("port");
        handleExpenseDataChange(index + 1, "details", snapshot.details, "port");
        handleExpenseDataChange(index + 1, "value", snapshot.value, "port");
      }
    })
  }

  if (customExpenseData) {
    customExpenseData.map((item, index) => {
      const snapshot = item.val()
      if (customExpenseSets.length  <= index + 1 ) {
        addExpenseSet("custom");
        handleExpenseDataChange(index + 1, "details", snapshot.details, "custom");
        handleExpenseDataChange(index + 1, "value", snapshot.value, "custom");
      }
    })
  }

  if (otherExpenseData) {
    otherExpenseData.map((item, index) => {
      const snapshot = item.val()
      if (otherExpenseSets.length  <= index + 1 ) {
        addExpenseSet("other");
        handleExpenseDataChange(index + 1, "details", snapshot.details, "other");
        handleExpenseDataChange(index + 1, "value", snapshot.value, "other");
      }
    })
  }

  if (deliveryExpenseData) {
    deliveryExpenseData.map((item, index) => {
      const snapshot = item.val()
      console.log(snapshot)
      if (deliveryExpenseSets.length  <= index + 1 ) {
        addExpenseSet("delivery");
        handleExpenseDataChange(index + 1, "details", snapshot.details, "delivery");
        handleExpenseDataChange(index + 1, "value", snapshot.value, "delivery");
      }
    })
  }
  
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
      beDate: data.beDate ? format(new Date(data.beDate), "dd.MM.yyyy") : null,
      assessmentDate: data.assessmentDate ? format(new Date(data.assessmentDate), "dd.MM.yy") : null,
      dutyPaymentDate: data.dutyPaymentDate ? format(new Date(data.dutyPaymentDate), "dd.MM.yy") : null,
      deliveryDate: data.deliveryDate ? format(new Date(data.deliveryDate), "dd.MM.yy") : null,
      remarks: data.remarks
    }
    updateFile(fileNo, fileYear, dataInfo, dataDetails).finally(() => {
      setOpenDetails(false);
    })
  }

  const handleExpenseData = async (type: "port" | "custom" | "other" | "delivery") => {
    let data: expenseDataType[] = []
    switch (type) {
      case "port":
        data = portExpenseSets
        break
      case "custom":
        data = customExpenseSets
        break
      case "other":
        data = otherExpenseSets
        break
      case "delivery":
        data = deliveryExpenseSets
        break
    }
    updateFileExpense(fileNo, fileYear, type, data).finally(() => {
      setOpenPort(false)
      setOpenCustom(false)
      setOpenOther(false)
      setOpenDelivery(false)
    })
  }

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef, documentTitle: fileName });

	if (loading) return <Loading />

	if (!loading && !user) {
		router.push("/login")
		return null
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
        { fileInfo && <div className="flex flex-wrap items-center pb-2 gap-2">
					<Dialog open={openDetails} onOpenChange={setOpenDetails}>
						<DialogTrigger asChild>
							<Button>
								<MdEdit/> File Details
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
                                defaultValue={fileInfo?.importer}
                                {...register('importer')}
                                helperText={errors.importer ? errors.importer.message : ""}
                                color={errors.importer ? "error" : "default"}
                                className="flex-[0.7]"
                                required
                  />
                  <InputText id="itemCount"
                              type="number"
                              label="Item Count"
                              defaultValue={fileInfo?.itemCount}
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
                            className="flex-[1]"
                  />
                  <InputDate
                    label="B/E Date"
                    type="date"
                    value={fileDetails?.beDate ? format(parse(fileDetails.beDate, "dd.MM.yyyy", new Date()), "yyyy-MM-dd") : ""}
                    {...register("beDate")}
                    className="flex-[1]"
                  />
                </div>
                <div className="flex space-x-2">
                  <InputDate
                    label="Assessment Date"
                    type="date"
                    value={fileDetails?.assessmentDate ? format(parse(fileDetails.assessmentDate, "dd.MM.yy", new Date()), "yyyy-MM-dd") : ""}
                    {...register("assessmentDate")}
                    className="flex-[1]"
                  />
                  <InputDate
                    label="Duty Payment Date"
                    type="date"
                    value={fileDetails?.dutyPaymentDate ? format(parse(fileDetails.dutyPaymentDate, "dd.MM.yy", new Date()), "yyyy-MM-dd") : ""}
                    {...register("dutyPaymentDate")}
                    className="flex-[1]"
                  />
                  <InputDate
                    label="Delivery Date"
                    type="date"
                    value={fileDetails?.deliveryDate ? format(parse(fileDetails.deliveryDate, "dd.MM.yy", new Date()), "yyyy-MM-dd") : ""}
                    {...register("deliveryDate")}
                    className="flex-[1]"
                  />
                </div>
                <InputTextarea label="Remarks"
                                defaultValue={fileDetails?.remarks}
                                {...register("remarks")}
                />
                <InputDropDown id="status"
                                label="Status"
                                options={fileStatusOptions}
                                defaultValue={fileInfo?.status}
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
          {
            userRole == "admin" && <Dialog open={openPort} onOpenChange={setOpenPort}>
              <DialogTrigger asChild>
                <Button>
                  <MdEdit/> Port Expense
                </Button>
              </DialogTrigger>
              <DialogContent className={"border border-accent"}>
                <DialogHeader>
                  <DialogTitle>Port Expense</DialogTitle>
                </DialogHeader>
                <Separator orientation={"horizontal"}/>
                <form className="flex-col text-center" onSubmit={() => handleExpenseData("port")}>
                  {
                    portExpenseSets.length < 8 && (
                      <Button type="button" variant="default" size="sm" onClick={() => addExpenseSet("port")}><MdAdd/> Add</Button>
                    )
                  }
                  {
                    portExpenseSets.map((set, index) => (
                      <div key={set.id} className="flex flex-row gap-x-2 items-baseline">
                        <InputText label={`Port Expense ${index + 1}`}
                                    className={`flex-[0.7]`}
                                    defaultValue={portExpenseSets[index].details}
                                    onChange={(e) => {handleExpenseDataChange(set.id, "details", e.target.value, "port")}}
                        />
                        <InputText label={`Amount ${index + 1}`}
                                    type="number" pre={`৳`} className={`flex-[0.3]`}
                                    defaultValue={portExpenseSets[index].value}
                                    onChange={(e) => handleExpenseDataChange(set.id, "value", Number(e.target.value), "port")}
                        />
                      </div>
                    ))
                  }
                  <DialogFooter className={"sm:justify-center pt-8 gap-4"}>
                    <DialogClose asChild>
                      <Button type="button" size="lg" variant="destructive">
                        Close
                      </Button>
                    </DialogClose>
                    <Button type="submit" size="lg">Submit</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          }
          {
            userRole == "admin" && <Dialog open={openCustom} onOpenChange={setOpenCustom}>
						<DialogTrigger asChild>
							<Button>
								<MdEdit/> Custom Expense
							</Button>
						</DialogTrigger>
						<DialogContent className={"border border-accent"}>
              <DialogHeader>
								<DialogTitle>Custom Expense</DialogTitle>
              </DialogHeader>
							<Separator orientation={"horizontal"}/>
							<form className="flex-col text-center" onSubmit={() => handleExpenseData("custom")}>
                {
                  customExpenseSets.length < 3 && (
                    <Button type="button" variant="default" size="sm" onClick={() => addExpenseSet("custom")}><MdAdd/> Add</Button>
                  )
                }
                {
                  customExpenseSets.map((set, index) => (
                    <div key={set.id} className="flex flex-row gap-x-2 items-baseline">
                      <InputText label={`Custom Expense ${index + 1}`}
                                  className={`flex-[0.7]`}
                                  defaultValue={customExpenseSets[index].details}
                                  onChange={(e) => {handleExpenseDataChange(set.id, "details", e.target.value, "custom")}}
                      />
                      <InputText label={`Amount ${index + 1}`}
                                  type="number" pre={`৳`} className={`flex-[0.3]`}
                                  defaultValue={customExpenseSets[index].value}
                                  onChange={(e) => handleExpenseDataChange(set.id, "value", Number(e.target.value), "custom")}
                      />
                    </div>
                  ))
                }
								<DialogFooter className={"sm:justify-center pt-8 gap-4"}>
									<DialogClose asChild>
										<Button type="button" size="lg" variant="destructive">
											Close
										</Button>
									</DialogClose>
									<Button type="submit" size="lg">Submit</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
          }
          {
            userRole == "admin" && <Dialog open={openOther} onOpenChange={setOpenOther}>
						<DialogTrigger asChild>
							<Button>
								<MdEdit/> Other Expense
							</Button>
						</DialogTrigger>
						<DialogContent className={"border border-accent"}>
              <DialogHeader>
								<DialogTitle>Other Expense</DialogTitle>
              </DialogHeader>
							<Separator orientation={"horizontal"}/>
							<form className="flex-col text-center" onSubmit={() => handleExpenseData("other")}>
                {
                  otherExpenseSets.length < 3 && (
                    <Button type="button" variant="default" size="sm" onClick={() => addExpenseSet("other")}><MdAdd/> Add</Button>
                  )
                }
                {
                  otherExpenseSets.map((set, index) => (
                    <div key={set.id} className="flex flex-row gap-x-2 items-baseline">
                      <InputText label={`Other Expense ${index + 1}`}
                                  className={`flex-[0.7]`}
                                  defaultValue={otherExpenseSets[index].details}
                                  onChange={(e) => {handleExpenseDataChange(set.id, "details", e.target.value, "other")}}
                      />
                      <InputText label={`Amount ${index + 1}`}
                                  type="number" pre={`৳`} className={`flex-[0.3]`}
                                  defaultValue={otherExpenseSets[index].value}
                                  onChange={(e) => handleExpenseDataChange(set.id, "value", Number(e.target.value), "other")}
                      />
                    </div>
                  ))
                }
								<DialogFooter className={"sm:justify-center pt-8 gap-4"}>
									<DialogClose asChild>
										<Button type="button" size="lg" variant="destructive">
											Close
										</Button>
									</DialogClose>
									<Button type="submit" size="lg">Submit</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
          }
          {
            userRole == "admin" && <Dialog open={openDelivery} onOpenChange={setOpenDelivery}>
						<DialogTrigger asChild>
							<Button>
								<MdEdit/> Delivery Expense
							</Button>
						</DialogTrigger>
						<DialogContent className={"border border-accent"}>
              <DialogHeader>
								<DialogTitle>Delivery Expense</DialogTitle>
              </DialogHeader>
							<Separator orientation={"horizontal"}/>
							<form className="flex-col text-center" onSubmit={() => handleExpenseData("delivery")}>
                {
                  deliveryExpenseSets.length < 3 && (
                    <Button type="button" variant="default" size="sm" onClick={() => addExpenseSet("delivery")}><MdAdd/> Add</Button>
                  )
                }
                {
                  deliveryExpenseSets.map((set, index) => (
                    <div key={set.id} className="flex flex-row gap-x-2 items-baseline">
                      <InputText label={`Delivery Expense ${index + 1}`}
                                  className={`flex-[0.7]`}
                                  defaultValue={deliveryExpenseSets[index].details}
                                  onChange={(e) => {handleExpenseDataChange(set.id, "details", e.target.value, "delivery")}}
                      />
                      <InputText label={`Amount ${index + 1}`}
                                  type="number" pre={`৳`} className={`flex-[0.3]`}
                                  defaultValue={deliveryExpenseSets[index].value}
                                  onChange={(e) => handleExpenseDataChange(set.id, "value", Number(e.target.value), "delivery")}
                      />
                    </div>
                  ))
                }
								<DialogFooter className={"sm:justify-center pt-8 gap-4"}>
									<DialogClose asChild>
										<Button type="button" size="lg" variant="destructive">
											Close
										</Button>
									</DialogClose>
									<Button type="submit" size="lg">Submit</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
          }
          {
            userRole == "admin" && <Button onClick={() => reactToPrintFn()}>
              <FaPrint/> Print
            </Button>
          }
        </div>
        }
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
                {
                  userRole == "admin" &&
                  <div className="flex flex-col gap-2" ref={contentRef}>
                    <table className="w-full table border border-double border-accent-foreground">
                      <tbody>
                        <tr className="border-4 border-double border-accent-foreground">
                          <td className="flex flex-row items-center px-6 py-4">
                            <div className="grow flex flex-col">
                              <div className="text-4xl text-bold">AHSAN ENTERPRISE</div>
                              <div className="text-xl font-semibold">IMPORT, EXPORT, INDENT, C&F</div>
                              <div className="text-lg leading-6">Noor Mohal, Anandipur Gate, P.C. Road</div>
                              <div className="text-lg leading-6">Halishahar, Chittagong</div>
                            </div>
                            <div className="flex-wrap flex flex-row space-x-4 leading-5">
                              <div className="flex-wrap">
                                Phone:<br/>Mobile:<br/><br/>Fax:<br/>E-Mail:
                              </div>
                              <div className="flex-wrap">
                                031-2511325<br/>01711-748836<br/>01611-748836<br/>031-727038<br/>rafije@gmail.com
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-x-4 border-t-4 border-double border-accent-foreground mx-[4px] leading-5.5 text-[15px]">
                          <td className={"flex flex-col p-2 space-y-2"}>
                          <div className={"flex space-x-2"}>
                            <div className="w-3/10 p-1 rounded-md border-2 border-accent-foreground flex flex-col items-center justify-center text-center">
                              <div>{fileInfo.itemPackage}</div>
                              <div>{fileInfo.itemName}</div>
                              {fileInfo.lc && fileInfo.lc != 0 ? <div>{`LC No. ${fileInfo.lc}`}</div> : null}
                            </div>
                            <div className="w-2/5 p-2 rounded-md border-2 border-accent-foreground text-center leading-5">
                              <div className="font-bold text-2xl leading-9">{fileInfo.importer}</div>
                              <div>{importerInfo.address1}</div>
                              <div>{importerInfo.address2}</div>
                            </div>
                            <div className="w-3/10 p-2 rounded-md border-2 border-accent-foreground flex flex-col items-center justify-center">
                              <div className="flex flex-row  w-full space-x-2">
                                <div className="grow">BILL NO.</div>
                                <div className="flex-wrap">{fileName}</div>
                              </div>
                              {
                                fileDetails?.deliveryDate && 
                                <div className="flex flex-row w-full space-x-2">
                                  <div className="grow">DATE:</div>
                                  <div className="flex-wrap">{format(parse(fileDetails.deliveryDate, "dd.MM.yy", new Date()), "dd.MM.yyyy")}</div>
                                </div>
                              }
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {
                              ((fileInfo && fileInfo.bl) || (fileDetails && (fileDetails.vessel || fileDetails.rotNo || fileDetails.bl))) &&
                              <div className="w-3/10 p-2 flex flex-col items-center justify-center rounded-md border-2 border-accent-foreground">
                                { fileDetails && fileDetails.vessel && <div>{fileDetails.vessel}</div>}
                                { fileDetails && fileDetails.rotNo && <div>{`ROT NO: ${fileDetails.rotNo}`}</div>}
                                { fileInfo && fileInfo.bl && <div>{`B/L: ${fileInfo.bl}`}</div>}
                              </div>
                            }
                            {
                              ((fileInfo && fileInfo.be) || (fileDetails && (fileDetails.cnfValue || fileDetails.assessmentValue || fileDetails.beDate))) && 
                              <div className="w-2/5 p-2 flex flex-col items-center justify-center rounded-md border-2 border-accent-foreground">
                                { 
                                  fileDetails && fileDetails.cnfValue &&
                                  <div className="flex flex-row w-full space-x-2">
                                    <div className="grow">C&F VALUE:</div>
                                    <div className="flex-wrap">{formatCurrency(fileDetails.cnfValue, 2, "$")}</div>
                                  </div>
                                }
                                { 
                                  fileDetails && fileDetails.assessmentValue &&
                                  <div className="flex flex-row w-full space-x-2">
                                    <div className="grow">ASSESSMENT VALUE:</div>
                                    <div className="flex-wrap">{formatCurrency(fileDetails.assessmentValue, 2)}</div>
                                  </div>
                                }
                                { 
                                  fileInfo.be && fileInfo.be != 0 && fileDetails && fileDetails.beDate ?
                                  <div className="flex flex-row w-full space-x-2">
                                    <div className="grow">{`B/E No. C-${fileInfo.be}`}</div>
                                    <div className="flex-wrap">{`DATE: ${fileDetails.beDate}`}</div>
                                  </div>
                                  : null
                                }
                              </div>
                            }
                            {
                              (fileDetails && (fileDetails.assessmentDate || fileDetails.dutyPaymentDate || fileDetails.deliveryDate)) && 
                              <div className="w-3/10 p-2 flex flex-col items-center justify-center rounded-md border-2 border-accent-foreground">
                                {
                                  fileDetails && fileDetails.assessmentDate && 
                                  <div className="flex flex-row w-full space-x-1">
                                    <div className="grow">ASSESSMENT:</div>
                                    <div className="flex-wrap">{fileDetails.assessmentDate}</div>
                                  </div>
                                }
                                {
                                  fileDetails && fileDetails.dutyPaymentDate && 
                                  <div className="flex flex-row w-full space-x-1">
                                    <div className="grow">DUTY PAYMENT:</div>
                                    <div className="flex-wrap">{fileDetails.dutyPaymentDate}</div>
                                  </div>
                                }
                                {
                                  fileDetails && fileDetails.deliveryDate && 
                                  <div className="flex flex-row w-full space-x-1">
                                    <div className="grow">DELIVERY:</div>
                                    <div className="flex-wrap">{fileDetails.deliveryDate}</div>
                                  </div>
                                }
                              </div>
                            }
                            </div>
                          </td>
                        </tr>
                        {
                          portExpenseData && portExpenseData.length > 0 &&
                          <tr className="w-full border-4 border-double border-accent-foreground">
                            <td className="flex items-center">
                              <div className={`w-2/3 py-2 px-6 flex flex-col leading-5`}>
                                {
                                  portExpenseData.map((item, index) => 
                                    <div key={index}>{item.val().details}</div>
                                  )
                                }
                              </div>
                              <div className="w-1/6 p-2 text-end border-x border-x-accent-foreground leading-5">
                                {
                                  portExpenseData.map((item, index) => 
                                    <div key={index}>{formatCurrency(item.val().value, 2)}</div>
                                  )
                                }
                                </div>
                              <div className={`w-1/6 p-2 text-end`}>{formatCurrency(totalPortExpense, 2)}</div>
                            </td>
                          </tr>
                        }
                        {
                          customExpenseData && customExpenseData.length > 0 &&
                          <tr className="w-full border-4 border-double border-accent-foreground">
                            <td className="flex items-center">
                              <div className={`w-2/3 py-2 px-6 flex flex-col`}>
                                {
                                  customExpenseData.map((item, index) => 
                                    <div key={index}>{item.val().details}</div>
                                  )
                                }
                              </div>
                              <div className="w-1/6 p-2 text-end border-x border-x-accent-foreground">
                                {
                                  customExpenseData.map((item, index) => 
                                    <div key={index}>{formatCurrency(item.val().value, 2)}</div>
                                  )
                                }
                                </div>
                              <div className={`w-1/6 p-2 text-end`}>{formatCurrency(totalCustomExpense, 2)}</div>
                            </td>
                          </tr>
                        }
                        {
                          otherExpenseData && otherExpenseData.length > 0 &&
                          <tr className="w-full border-4 border-double border-accent-foreground">
                            <td className="flex items-center">
                              <div className={`w-2/3 py-2 px-6 flex flex-col`}>
                                {
                                  otherExpenseData.map((item, index) => 
                                    <div key={index}>{item.val().details}</div>
                                  )
                                }
                              </div>
                              <div className="w-1/6 p-2 text-end border-l border-l-accent-foreground">
                                {
                                  otherExpenseData.map((item, index) => 
                                    <div key={index}>{formatCurrency(item.val().value, 2)}</div>
                                  )
                                }
                                </div>
                              <div className={`w-1/6 p-2 text-end border-l border-l-accent-foreground`}>{formatCurrency(totalOtherExpense, 2)}</div>
                            </td>
                          </tr>
                        }
                        {
                          deliveryExpenseData && deliveryExpenseData.length > 0 &&
                          <tr className="w-full border-4 border-double border-accent-foreground">
                            <td className="flex">
                              <div className={`w-2/3 py-2 px-6 flex flex-col`}>
                                {
                                  deliveryExpenseData.map((item, index) => 
                                    <div key={index}>{item.val().details}</div>
                                  )
                                }
                              </div>
                              <div className="w-1/6 p-2 text-end border-x border-x-accent-foreground">
                                {
                                  deliveryExpenseData.map((item, index) => 
                                    <div key={index}>{formatCurrency(item.val().value, 2)}</div>
                                  )
                                }
                                </div>
                              <div className={`w-1/6 p-2 text-end`}>{formatCurrency(totalDeliveryExpense, 2)}</div>
                            </td>
                          </tr>
                        }
                        <tr className="w-full border-4 border-double border-accent-foreground leading-5">
                          <td className="flex items-center">
                            <div className="w-2/3 py-2 pl-6 pr-2">Automation, Photo Copy, Conveyance, Courier, Document, Bank</div>
                            <div className="w-1/6 p-2 text-end border-x-1 border-x-accent-foreground">{formatCurrency(miscellaneousValue, 2)}</div>
                            <div className="w-1/6 p-2 text-end">{formatCurrency(miscellaneousValue, 2)}</div>
                          </td>
                        </tr>
                        {
                          fileDetails?.assessmentValue &&
                          <tr className="w-full border-4 border-double border-accent-foreground">
                            <td className="flex items-center">
                              <div className="w-2/3 py-2 px-6">{`Agency Commission ${commissionValue == importerInfo.minCommission ? "(Minimum)" : ""}`}</div>
                              <div className="w-1/6 p-2 text-end border-x-1 border-x-accent-foreground">{formatCurrency(commissionValue, 2)}</div>
                              <div className="w-1/6 p-2 text-end">{formatCurrency(commissionValue, 2)}</div>
                            </td>
                          </tr>
                        }
                        <tr className="w-full border-4 border-double border-accent-foreground">
                          <td className="flex items-center">
                            <div className="w-2/3 py-2 px-6">
                              {
                                fileDetails?.remarks ? fileDetails.remarks : <div>No Remarks</div>
                              }
                            </div>
                            <div className="w-1/6 border-x border-x-accent-foreground flex flex-col">
                              <div className="px-2 py-1">TOTAL</div>
                              <div className="px-2 py-1 border-y border-y-accent-foreground">PAID</div>
                              <div className="px-2 py-1">BALANCE</div>
                            </div>
                            <div className="w-1/6 text-end">
                              <div className="px-2 py-1">{formatCurrency(totalValue, 2)}</div>
                              <div className="px-2 py-1 border border-y-accent-foreground">{formatCurrency(paidValue, 2)}</div>
                              <div className="px-2 py-1">{formatCurrency(totalValue - paidValue, 2)}</div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="flex flex-col space-y-8 text-end pt-2 pr-8">
                      <div>Ahsan Enterprise</div>
                      <div>Proprietor</div>
                    </div>
                  </div>
                }
              </div>
          }
        </ScrollArea>
			</div>
		</Layout>
	)
}