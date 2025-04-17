"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React from "react";
import { useList, useObject } from "react-firebase-hooks/database";
import { getDatabaseReference, getTotalValue, showToast } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdError } from "react-icons/md";
import { Button } from "@/components/ui/button";
import CardTotalBalance from "@/components/card/card-total-balance";
import { updateBalance } from "@/lib/functions";
import CardTransaction from "@/components/card/card-transaction";

export default function ImporterTransactionPage() {
	const {user, loading, userRole} = useAuth()

  const path = usePathname();
	const importer: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const router = useRouter()

  const [billData, billLoading, billError] = useList(getDatabaseReference(`transaction/importer/${importer}/bill`))
  const [paymentData, paymentLoading, paymentError] = useList(getDatabaseReference(`transaction/importer/${importer}/payment`))
  const [totalBalanceData, totalBalanceLoading] = useObject(getDatabaseReference(`balance/importer/${importer}`))
  const total: number = getTotalValue(billData) + getTotalValue(paymentData)
  const totalBalanceValue = totalBalanceData?.val().value;
  
  const breadcrumb: {text: string, link?: string}[] = [
    { text: "Home", link: "/" },
    { text: "/" },
    { text: "Importer", link: `/staff` },
    { text: "/" },
    { text: importer }
  ]

  const handleUpdateTotalBalance = () => {
      updateBalance("importer", importer, total).then(() => {
        showToast("Success", "Total balance updated successfully", "success");
      }).catch((error) => {
        showToast("Error", `Error updating total balance: ${error.message}`, "error");
      })
    }

	if (loading) return <Loading />

	if (!loading && !user) {
		router.push("/login")
		return null
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full space-y-2"}>
        {
          !billLoading && !paymentLoading && !totalBalanceLoading && total != totalBalanceValue &&
          <div className="flex items-center gap-x-2">
            <Button variant="accent" onClick={handleUpdateTotalBalance}>
              Update Total Balance
            </Button>
            </div>
        }
        <div className="grow">
          {
            billLoading || paymentLoading ? 
              <div className="p-4 rounded-xl bg-muted/100 flex items-center">
                <Skeleton className="flex-wrap h-10 w-10 mr-4 rounded-full"/>
                <div className={"flex-auto"}>
                  <Skeleton className="h-6 mb-1 w-1/2 rounded-xl"/>
                  <Skeleton className="h-4 w-2/5 rounded-xl"/>
                </div>
              </div>
            : billError || paymentError ? 
              <CardIcon
                title={"Error"}
                description={billError ? billError.message : paymentError?.message}>
                <MdError size={28}/>
              </CardIcon>
            : (!billData || billData.length == 0) && (!paymentData || paymentData.length == 0) ? 
              <CardIcon
                title={"No Record Found"}>
                <MdError size={28}/>
              </CardIcon>
            : <div className="flex flex-col lg:flex-row gap-2">
               <ScrollArea className="flex-1 overflow-auto">
                {
                  !billData || billData.length == 0 ?
                    <CardIcon
                      title={"No Bill Record Found"}>
                      <MdError size={28}/>
                    </CardIcon>
                  : billData.map((item) => {
                    const snapshot = item.val()
                    return (
                      <div key={item.key}>
                        <CardTransaction type={"importer"} uid={importer} transactionId={item.key!}
                                          title={snapshot.title} details={snapshot.details}
                                          value={snapshot.value} date={snapshot.date} access={userRole}/>
                      </div>
                    )
                  })
                }
               </ScrollArea>
               <ScrollArea className="flex-1 overflow-auto">
               {
                  !paymentData || paymentData.length == 0 ?
                    <CardIcon
                      title={"No Payment Record Found"}>
                      <MdError size={28}/>
                    </CardIcon>
                  : paymentData.map((item) => {
                    const snapshot = item.val()
                    return (
                      <div key={item.key}>
                        <CardTransaction type={"importer"} uid={importer} transactionId={item.key!}
                                                title={snapshot.title} details={snapshot.details}
                                                value={snapshot.value} date={snapshot.date} access={userRole}/>
                      </div>
                    )
                  })
                }
               </ScrollArea>
            </div>
          }
        </div>
        <div>
          {totalBalanceData &&
            <CardTotalBalance value={total}
                              date={totalBalanceData.val().date}
                              onClick={handleUpdateTotalBalance}
                              update={total != totalBalanceValue}/>
          }
        </div>
			</div>
		</Layout>
	)
}