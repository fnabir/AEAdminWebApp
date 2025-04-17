"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React from "react";
import { getDatabaseReference, getTotalValue, showToast } from "@/lib/utils";
import { useList, useObject } from "react-firebase-hooks/database";
import CardTotalBalance from "@/components/card/card-total-balance";
import { Button } from "@/components/ui/button";
import { MdError } from "react-icons/md";
import CardIcon from "@/components/card/card-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { DataSnapshot } from "firebase/database";
import CardBalance from "@/components/card/card-balance";
import { updateTotalBalance } from "@/lib/functions";

export default function ImporterBalancePage() {
	const {user, loading} = useAuth();
	const router = useRouter();
	const breadcrumb: {text: string, link?: string}[] = [
		{ text: "Home", link: "/" },
		{ text: "/" },
		{ text: "Importer Balance" },
	]

	const [balanceData, balanceLoading, balanceError] = useList(getDatabaseReference("balance/importer"))
	const [totalBalanceData, totalBalanceLoading] = useObject(getDatabaseReference("balance/total/importer"))
	const total: number = getTotalValue(balanceData)
	const totalBalanceValue = totalBalanceData && totalBalanceData.val().value ? totalBalanceData.val().value : 0;

	const handleUpdateTotalBalance = () => {
		updateTotalBalance("importer", total).then(() => {
			showToast("Success", "Total balance updated successfully", "success");
		}).catch((error) => {
			showToast("Error", `Error updating total balance: ${error.message}`, "error");
		})
	}

	if (loading) return <Loading />;

	if (!loading && !user) {
		router.push("/login");
		return null;
	}

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full"}>
        {
          !balanceLoading && !totalBalanceLoading && total != totalBalanceValue &&
            <div className="flex items-center pb-2 gap-x-2">
              <Button variant="accent" onClick={handleUpdateTotalBalance}>
                Update Total Balance
              </Button>
            </div>
        }
				<ScrollArea className={"flex-grow -mr-4 pr-4 mb-2"}>
					{
						balanceLoading ? 
						  <div className="p-4 rounded-xl bg-muted/100 flex items-center">
								<Skeleton className="flex-wrap h-10 w-10 mr-4 rounded-full"/>
								<div className={"flex-auto"}>
									<Skeleton className="h-6 mb-1 w-1/2 rounded-xl"/>
									<Skeleton className="h-4 w-2/5 rounded-xl"/>
								</div>
							</div>
            : balanceError ?
							<CardIcon
								title={"Error"}
								description={balanceError.message}>
								<MdError size={28}/>
							</CardIcon>
            : !balanceData || balanceData.length == 0 ?
              <CardIcon
                title={"No Record Found"}>
                <MdError size={28}/>
              </CardIcon>
            : <div className={"space-y-2"}>
              {
                balanceData.map((item: DataSnapshot) => {
                  const snapshot = item.val();
                  return (
                    <div key={item.key}>
                      <CardBalance type={"importer"} id={item.key!}
                                    name={item.key!} value={snapshot.value}
                                    date={snapshot.date}
                                    status={snapshot.status}/>
                    </div>
                  )
                })
              }
              </div>
					}
				</ScrollArea>
        {totalBalanceData &&
          <CardTotalBalance value={total}
                            date={totalBalanceData.val().date}
                            onClick={handleUpdateTotalBalance}
                            update={total != totalBalanceValue}/>
        }
			</div>
		</Layout>
	)
}