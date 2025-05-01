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
import {format, parse} from "date-fns";
import ExpenseDialog from "./expense-dialog";
import DetailsDialog from "./details-dialog";

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

  const portExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/port`))[0]
  const customExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/custom`))[0]
  const otherExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/other`))[0]
  const deliveryExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/delivery`))[0]
  
  const totalPortExpense = portExpenseData ? getTotalValue(portExpenseData) : 0
  const totalCustomExpense = customExpenseData ? getTotalValue(customExpenseData) : 0
  const totalOtherExpense = otherExpenseData ? getTotalValue(otherExpenseData) : 0
  const totalDeliveryExpense = deliveryExpenseData ? getTotalValue(deliveryExpenseData) : 0
  const miscellaneousValue = fileDetails?.miscExpense ? fileDetails.miscExpense : 0
  const commissionValue = fileDetails?.assessmentValue && importerInfo?.commission && importerInfo?.minCommission ? 
                          fileDetails.assessmentValue * importerInfo.commission / 100 > importerInfo.minCommission ? 
                          Math.ceil(fileDetails.assessmentValue * importerInfo.commission / 100) : importerInfo.minCommission 
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
                    <table className="w-full">
                      <tbody>
                        <tr className="border-4 border-double border-accent-foreground">
                          <td className="flex flex-row items-center px-6 py-4">
                            <div className="grow flex flex-col">
                              <div className="text-4xl font-medium">আহ্সান এন্টারপ্রাইজ</div>
                              <div className="text-4xl font-semibold">AHSAN ENTERPRISE</div>
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
                            <div className="w-2/5 py-2 px-1 rounded-md border-2 border-accent-foreground text-center leading-5">
                              <div className="font-bold text-xl leading-8 uppercase">{fileInfo.importer}</div>
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
                        {
                          miscellaneousValue != 0 &&
                          <tr className="w-full border-4 border-double border-accent-foreground leading-5">
                            <td className="flex items-center">
                              <div className="w-2/3 py-2 pl-6 pr-2">Automation, Photo Copy, Conveyance, Courier, Document, Bank</div>
                              <div className="w-1/6 p-2 text-end border-x-1 border-x-accent-foreground">{formatCurrency(miscellaneousValue, 2)}</div>
                              <div className="w-1/6 p-2 text-end">{formatCurrency(miscellaneousValue, 2)}</div>
                            </td>
                          </tr>
                        }
                        {
                          fileDetails?.assessmentValue && commissionValue != 0 &&
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
                            <pre className="w-2/3 py-2 px-6 font-sans text-sm">
                              {
                                fileDetails?.remarks ? fileDetails.remarks : <div>No Remarks</div>
                              }
                            </pre>
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