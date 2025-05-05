"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useRef } from "react";
import { useList, useObject } from "react-firebase-hooks/database";
import { formatCurrency, generateFileCode, getDatabaseReference, getTotalValue } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdError } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { FaPrint } from "react-icons/fa6";
import { useReactToPrint } from 'react-to-print';
import ExpenseDialog from "./expense-dialog";
import DetailsDialog from "./details-dialog";
import PrintHeaderRow from "./print-header-row";
import PrintExpenseRow from "./print-expense-row";
import PrintSingleExpenseRow from "./print-single-expense-row";
import PrintTotalRow from "./print-total-row";
import { format, parse } from "date-fns";
import PrintDutyRow from "./print-duty-row";
import PaidDialog from "./paid-remarks-dialog";

export default function FileDetailsPage() {
	const {user, loading, userRole} = useAuth()

  const path = usePathname();
	const file: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const fileNo = Number(file.slice(4))
  const fileYear = Number(file.slice(0,4))

  const router = useRouter()

  const [fileInfoData, filesInfoLoading, filesInfoError] = useObject(getDatabaseReference(`files/info/${fileYear}/${fileNo}`))
  const [fileDetailsData, filesDetailsLoading, filesDetailsError] = useObject(getDatabaseReference(`files/details/${fileYear}/${fileNo}`))
  
  const fileInfo = fileInfoData?.val()
  const fileDetails = fileDetailsData?.val()

  const [importerData, importerLoading, importerError] = useObject(getDatabaseReference(`info/importer/${fileInfo?.importer ? fileInfo.importer : ""}`))
  const importerInfo = importerData?.val()

  const fileName = generateFileCode(fileNo, fileYear, fileInfo?.type)

  const dutyData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/duty`))[0]
  const portExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/port`))[0]
  const customExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/custom`))[0]
  const otherExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/other`))[0]
  const deliveryExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/delivery`))[0]
  
  const totalDuty = fileDetails?.dutyValue ? fileDetails?.dutyValue : dutyData ? getTotalValue(dutyData) : 0
  const totalPortExpense = portExpenseData ? getTotalValue(portExpenseData) : 0
  const totalCustomExpense = customExpenseData ? getTotalValue(customExpenseData) : 0
  const totalOtherExpense = otherExpenseData ? getTotalValue(otherExpenseData) : 0
  const totalDeliveryExpense = deliveryExpenseData ? getTotalValue(deliveryExpenseData) : 0
  const miscellaneousValue = importerInfo?.miscExpense ? importerInfo.miscExpense : 0
  const minCommission = fileDetails?.assessableValue && importerInfo?.commission && importerInfo?.minCommission ? 
                        fileDetails.assessableValue * importerInfo.commission / 100 < importerInfo.minCommission : false
  const commissionValue = fileDetails?.assessableValue && importerInfo?.commission && importerInfo?.minCommission ? 
                          minCommission ? importerInfo.minCommission : Math.ceil(fileDetails.assessableValue * importerInfo.commission / 100)  
                          : 0
  const totalValue = totalPortExpense + totalCustomExpense + totalOtherExpense + totalDeliveryExpense + miscellaneousValue + commissionValue
  const paidValue = fileDetails && fileDetails.paid ? fileDetails.paid : 0
  
  const breadcrumb: {text: string, link?: string}[] = [
    { text: "Home", link: "/" },
    { text: "/" },
    { text: "Files", link: `/files?year=${fileYear}` },
    { text: "/" },
    { text: fileName }
  ]

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
					<DetailsDialog
            fileNo={fileNo}
            fileYear={fileYear}
            fileInfoData={fileInfoData}
            fileDetailsData={fileDetailsData}
          />
          <ExpenseDialog 
            fileNo={fileNo}
            fileYear={fileYear}
            type="duty"
            data={dutyData}
            title="Duty"
          />
          {
            userRole == "admin" &&
            <ExpenseDialog 
              fileNo={fileNo}
              fileYear={fileYear}
              type="port"
              data={portExpenseData}
              title="Port Expenses"
            />
          }
          {
            userRole == "admin" &&
            <ExpenseDialog 
              fileNo={fileNo}
              fileYear={fileYear}
              type="custom"
              data={customExpenseData}
              title="Custom Expenses"
            />
          }
          {
            userRole == "admin" &&
            <ExpenseDialog 
              fileNo={fileNo}
              fileYear={fileYear}
              type="other"
              data={otherExpenseData}
              title="Other Expenses"
            />
          }
          {
            userRole == "admin" &&
            <ExpenseDialog 
              fileNo={fileNo}
              fileYear={fileYear}
              type="delivery"
              data={deliveryExpenseData}
              title="Delivery Expenses"
            />
          }
          {
            userRole == "admin" &&
            <PaidDialog 
              fileNo={fileNo}
              fileYear={fileYear}
              data={fileDetailsData}
            />
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
              <div className="flex flex-col gap-2" ref={contentRef}>
                <table className="w-full table border-collapse">
                  <tbody className="border-4 border-double border-accent-foreground">
                    
                    <PrintHeaderRow/>

                    <tr className="border-4 border-double border-accent-foreground leading-5.5 text-[15px]">
                      <td className={"p-2 space-y-2"} colSpan={3}>
                      <div className={"flex space-x-2"}>
                        <div className="w-3/10 p-1 rounded-md border-2 border-accent-foreground flex flex-col items-center justify-center text-center">
                          <div>{fileInfo.itemPackage}</div>
                          <div>{fileInfo.itemName}</div>
                          {fileInfo.lc && fileInfo.lc != 0 ? <div>{`LC No. ${fileInfo.lc}`}</div> : null}
                        </div>
                        <div className="w-2/5 py-2 px-1 rounded-md border-2 border-accent-foreground text-center leading-5">
                          <div className="font-bold text-xl leading-8 uppercase">{importerData?.key}</div>
                          <div>{importerInfo?.address1}</div>
                          <div>{importerInfo?.address2}</div>
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
                              <div className="flex-wrap">{format(parse(fileDetails.deliveryDate, "dd/MM/yy", new Date()), "dd/MM/yyyy")}</div>
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
                              fileDetails && fileDetails.assessableValue &&
                              <div className="flex flex-row w-full space-x-2">
                                <div className="grow">ASSESSABLE VALUE:</div>
                                <div className="flex-wrap">{formatCurrency(fileDetails.assessableValue, 2)}</div>
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

                    <PrintDutyRow
                      data={dutyData}
                      dutyRef={fileDetails?.dutyRef}
                      assessmentRef={fileDetails?.assessmentRef}
                      paid={fileDetails?.dutyPaid}
                      total={totalDuty}
                    />
                    <PrintExpenseRow
                      data={portExpenseData}
                      total={totalPortExpense}
                    />
                    <PrintExpenseRow
                      data={customExpenseData}
                      total={totalCustomExpense}
                    />
                    <PrintExpenseRow
                      data={otherExpenseData}
                      total={totalOtherExpense}
                    />
                    <PrintExpenseRow
                      data={deliveryExpenseData}
                      total={totalDeliveryExpense}
                    />

                    <PrintSingleExpenseRow
                      title={"Automation, Photo Copy, Conveyance, Courier, Document, Bank"}
                      value={miscellaneousValue}
                    />
                    <PrintSingleExpenseRow
                      title={`Agency Commission ${minCommission ? "(Minimum)" : ""}`}
                      value={commissionValue}
                    />

                    <PrintTotalRow
                      remarks={fileDetails?.remarks}
                      total={totalValue}
                      paid={paidValue}
                    />
                  
                  </tbody>
                </table>

                <div className="flex flex-col space-y-8 text-end pt-2 pr-8">
                  <div>Ahsan Enterprise</div>
                  <div>Proprietor</div>
                </div>
              </div>
          }
        </ScrollArea>
			</div>
		</Layout>
	)
}