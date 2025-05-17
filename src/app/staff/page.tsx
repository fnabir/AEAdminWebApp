"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useEffect, useMemo } from "react";
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
import { BreadcrumbInterface } from "@/lib/interfaces";

const breadcrumb: BreadcrumbInterface[] = [
  { label: "Home", href: "/" },
  { label: "Staff Balance" },
]

export default function StaffBalancePage() {
  const {user, userLoading, isAdmin} = useAuth();
  const router = useRouter();

  const [balanceData, balanceLoading, balanceError] = useList(
    user && isAdmin ? getDatabaseReference("balance/staff") : null
  );
  const [totalBalanceSnapshot, totalBalanceLoading, totalBalanceError] = useObject(
    user && isAdmin ? getDatabaseReference("balance/total/staff") : null
  );
  const totalBalanceData = totalBalanceSnapshot?.val();
  const total = useMemo(() => {
      return getTotalValue(balanceData);
    }, [balanceData]);
  const totalBalanceValue = totalBalanceData?.value ?? 0;

	const handleUpdateTotalBalance = () => {
		updateTotalBalance("staff", total).then(() => {
			showToast("Success", "Total balance updated successfully", "success");
		}).catch((error) => {
			showToast("Error", `Error updating total balance: ${error.message}`, "error");
		})
	}

	useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading) return <Loading />

  if (!user) return null

	return (
		<Layout breadcrumb={breadcrumb}>
			{
        <div className="flex flex-col h-full">
          {
            !balanceLoading && !totalBalanceLoading && totalBalanceData && total != totalBalanceValue &&
              <div className="flex items-center pb-2 gap-x-2">
                <Button variant="accent" onClick={handleUpdateTotalBalance}>
                  Update Total Balance
                </Button>
              </div>
          }
          <ScrollArea className="grow -mr-4 pr-4 mb-2">
            {
              balanceLoading ? 
                <div className="flex flex-col space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                  ))}
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
              : <div className="flex flex-col space-y-2">
                {
                  balanceData.map((item: DataSnapshot) => {
                    const val = item.val();
                    return (
                      <CardBalance
                        key={item.key!}
                        type={"staff"}
                        id={item.key!}
                        name={val.name}
                        value={val.value}
                        date={val.date}
                        status={val.status}/>
                  )
                })
              }
              </div>
            }
          </ScrollArea>
          {totalBalanceData &&
            <CardTotalBalance value={total}
                              date={totalBalanceData.date}
                              error={totalBalanceError?.message}
                              onClick={handleUpdateTotalBalance}
                              update={total != totalBalanceValue}/>
          }
        </div>
      }
		</Layout>
	)
}