"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useEffect, useMemo } from "react";
import { useList, useObject } from "react-firebase-hooks/database";
import { cn, formatCurrency, getDatabaseReference, getTotalValue, showToast } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import CardIcon from "@/components/card/card-icon";
import { MdError } from "react-icons/md";
import { Button } from "@/components/ui/button";
import CardTotalBalance from "@/components/card/card-total-balance";
import { updateBalance } from "@/lib/functions";
import { BreadcrumbInterface } from "@/lib/interfaces";
import CardSection from "@/components/card/card-section";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { FaListUl } from "react-icons/fa6";
import AddPaymentDialog from "./add-payment-dialog";
import DeleteTransactionDialog from "./delete-transaction-dialog";

export default function ImporterTransactionPage() {
	const {user, userLoading, isAdmin} = useAuth()

  const path = usePathname();
	const importer: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const router = useRouter()

  const [billData, billLoading, billError] = useList(
    user && isAdmin ? getDatabaseReference(`transaction/importer/${importer}/bill`): null
    );
  const [paymentData, paymentLoading, paymentError] = useList(
    user && isAdmin ? getDatabaseReference(`transaction/importer/${importer}/payment`): null
    );
    const [totalBalanceSnapshot, totalBalanceLoading, totalBalanceError] = useObject(
      user && isAdmin ? getDatabaseReference(`balance/importer/${importer}`) : null
    );
    const totalBalanceData = totalBalanceSnapshot?.val();
    
    const totalBill = useMemo(() => {
      return getTotalValue(billData);
    }, [billData])
    const totalPayment = useMemo(() => {
      return getTotalValue(paymentData);
    }, [paymentData])
    const totalBalance = useMemo(() => {
        return totalBill - totalPayment;
      }, [totalBill, totalPayment]);
    const totalBalanceValue = totalBalanceData?.value ?? 0;
  
  const breadcrumb: BreadcrumbInterface[] = [
    { label: "Home", href: "/" },
    { label: "Importer Balance", href: `/importer` },
    { label: importer }
  ];

  const handleUpdateTotalBalance = () => {
    updateBalance("importer", importer, totalBalance).then(() => {
      showToast("Success", "Total balance updated successfully", "success");
    }).catch((error) => {
      showToast("Error", `Error updating total balance: ${error.message}`, "error");
    })
  };

	useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading) return <Loading />

  if (!user) return null;

	return (
		<Layout breadcrumb={breadcrumb}>
			<div className={"flex flex-col h-full space-y-2"}>
        {
          !billLoading && !paymentLoading && !totalBalanceLoading && totalBalance != totalBalanceValue &&
          <Button className="w-fit" onClick={handleUpdateTotalBalance}>Update Total Balance</Button>
        }
        <div className="grow">
          {
            billLoading || paymentLoading ? 
              <div>
                {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg my-1" />
                ))}
              </div>
            : billError || paymentError ? 
              <CardIcon
                title={"Error"}
                description={billError ? billError.message : paymentError?.message}>
                <MdError size={28}/>
              </CardIcon>
            : (!billData) && (!paymentData) ? 
              <CardIcon
                title={"No Record Found"}>
                <MdError size={28}/>
              </CardIcon>
            : <div className="grid grid-cols-2 gap-2 lg:gap-6">
                <CardSection
                  title="Bill"
                  icon={FaListUl}
                  iconColor="text-blue-500"
                  backdropColor="bg-blue-500"
                  className="col-span-2 xl:col-span-1"
                  contentClassName="flex flex-col gap-2 lg: gap-4"
                >
                  <ScrollArea className="flex-1 overflow-auto">
                    {
                      !billData || billData.length == 0 ?
                        <CardIcon
                          title={"No Bill Record Found"}>
                          <MdError size={28}/>
                        </CardIcon>
                      : billData.map((item) => {
                        const val = item.val()
                        return (
                          <TransactionRow
                            key={item.key}
                            type="importer"
                            id={importer}
                            transactionType="bill"
                            transactionId={item.key!}
                            title={val.title}
                            details={val.details}
                            value={val.value}
                            date={val.date}/>
                        )
                      })
                    }
                  </ScrollArea>
                  <div className="flex justify-between bg-secondary rounded-lg p-2 text-xl font-semibold">
                    <div>Total Bill</div>
                    <div>{formatCurrency(totalBill, 2)}</div>
                  </div>
                </CardSection>
               
                <CardSection
                  title="Payment"
                  icon={FaRegMoneyBillAlt}
                  iconColor="text-green-500"
                  backdropColor="bg-green-500"
                  className="col-span-2 xl:col-span-1"
                  contentClassName="flex flex-col gap-2 lg: gap-4"
                >
                  <ScrollArea className="flex-1 overflow-auto">
                    {
                      !paymentData || paymentData.length == 0 ?
                        <CardIcon
                          title={"No Payment Record Found"}>
                          <MdError size={28}/>
                        </CardIcon>
                      : paymentData.map((item) => {
                        const val = item.val()
                        return (
                          <TransactionRow
                            key={item.key}
                            type="importer"
                            id={importer}
                            transactionType="payment"
                            transactionId={item.key!}
                            title={val.title}
                            details={val.details}
                            value={val.value}
                            date={val.date}/>
                        )
                      })
                    }
                  </ScrollArea>
                  <div className="flex justify-between bg-secondary rounded-lg p-2 text-xl font-semibold">
                    <div>Total Payment</div>
                    <div>{formatCurrency(totalPayment, 2)}</div>
                  </div>
                  <AddPaymentDialog importer={importer}/>
                </CardSection>
            </div>
          }
        </div>
        <div>
          {totalBalanceData &&
            <CardTotalBalance value={totalBalance}
                              date={totalBalanceData.date}
                              onClick={handleUpdateTotalBalance}
                              update={totalBalance != totalBalanceValue}
                              error={totalBalanceError?.message}/>
          }
        </div>
			</div>
		</Layout>
	)
}

function TransactionRow({ type, id, transactionType, transactionId, date, title, details, value}: { 
  type: string, id: string, transactionType: string, transactionId: string, date: string; title: string; details?: string; value: number;}) {
  return (
    <div className={cn(
                "group flex items-center justify-between",
                "p-2 rounded-lg",
                "hover:bg-secondary",
                "transition-all duration-200",
              )}>
      <div className="w-full flex items-center gap-2 lg:gap-6">
        <div className="font-mono text-xs lg:text-[15px]">{date}</div>
        <div className="grow">
          <div className="font-medium text-zinc-900 dark:text-zinc-100">{title}</div>
          {details && (
            <p className="text-sm text-muted-foreground">{details}</p>
          )}
        </div>
        <span className="text-base lg:text-xl font-medium">{formatCurrency(value, 2)}</span>
        <DeleteTransactionDialog
          type={type}
          id={id}
          transactionType = {transactionType}
          transactionId={transactionId}
        >
          <div className={cn(
                "group flex items-center justify-between",
                "bg-secondary p-2 my-4 rounded-lg",
                "transition-all duration-200",
              )}>
            <div className="w-full flex items-center gap-2 lg:gap-6">
              <div className="font-mono text-xs lg:text-sm">{date}</div>
              <div className="grow font-medium">{title}</div>
              <span className="text-base lg:text-xl font-medium">{formatCurrency(value, 2)}</span>
            </div>
          </div>
        </DeleteTransactionDialog>
      </div>
    </div>
  )
}