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
import { DataSnapshot } from "firebase/database";
import { updateBalance } from "@/lib/functions";
import CardTransaction from "@/components/card/card-transaction";

export default function StaffTransactionPage() {
	const {user, loading, userRole} = useAuth()

  const path = usePathname();
	const staffUid: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const router = useRouter()

  const [transactionData, transactionLoading, transactionError] = useList(getDatabaseReference(`transaction/staff/${staffUid}`))
  const staffInfo = useObject(getDatabaseReference(`info/user/${staffUid}`))[0]?.val()
  const staffName = staffInfo?.name
  const [totalBalanceData, totalBalanceLoading] = useObject(getDatabaseReference(`balance/staff/${staffUid}`))
  const total: number = getTotalValue(transactionData)
  const totalBalanceValue = totalBalanceData?.val().value;
  
  const breadcrumb: {text: string, link?: string}[] = [
    { text: "Home", link: "/" },
    { text: "/" },
    { text: "Staff", link: `/staff` },
    { text: "/" },
    { text: staffName }
  ]

  const handleUpdateTotalBalance = () => {
      updateBalance("staff", staffUid, total).then(() => {
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
          !transactionLoading && !totalBalanceLoading && total != totalBalanceValue &&
          <div className="flex items-center gap-x-2">
            <Button variant="accent" onClick={handleUpdateTotalBalance}>
              Update Total Balance
            </Button>
            </div>
        }
        <ScrollArea className={"grow overflow-auto -mr-4 pr-4"}>
          {
            transactionLoading ? 
              <div className="p-4 rounded-xl bg-muted/100 flex items-center">
                <Skeleton className="flex-wrap h-10 w-10 mr-4 rounded-full"/>
                <div className={"flex-auto"}>
                  <Skeleton className="h-6 mb-1 w-1/2 rounded-xl"/>
                  <Skeleton className="h-4 w-2/5 rounded-xl"/>
                </div>
              </div>
            : transactionError ?
              <CardIcon
                title={"Error"}
                description={transactionError.message}>
                <MdError size={28}/>
              </CardIcon>
            : !transactionData || transactionData.length == 0 ?
              <CardIcon
                title={"No Record Found"}>
                <MdError size={28}/>
              </CardIcon>
            : <div className={"space-y-2"}>
              {
                transactionData.map((item: DataSnapshot) => {
                  const snapshot = item.val();
                  return (
                    <div key={item.key}>
                      <CardTransaction type={"staff"} uid={staffUid} transactionId={item.key!}
                                              title={snapshot.title} details={snapshot.details}
                                              value={snapshot.value} date={snapshot.date} access={userRole}/>
                    </div>
                  )
                })
              }
              </div>
          }
        </ScrollArea>
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