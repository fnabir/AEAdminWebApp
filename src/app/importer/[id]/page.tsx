"use client"

import Layout from "@/components/layout";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from "next/navigation";
import Loading from "@/components/loading";
import React, { useEffect } from "react";
import { formatCurrency, showToast } from "@/lib/utils";
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
import AddPaymentDialog from "@/components/transaction/add-payment-dialog";
import { TransactionRow } from "@/components/transaction/transaction-row";
import { useTransactionData } from "@/hooks/use-transaction-data";

export default function ImporterTransactionPage() {
	const {user, userLoading, isAdmin} = useAuth()

  const path = usePathname();
	const importer: string = decodeURIComponent(path.substring(path.lastIndexOf("/") + 1));
  const router = useRouter()

  const {
      dataLoading,
      dataError,
      billData,
      paymentData,
      totalBalanceData,
      totalBill,
      totalPayment,
      totalBalance,
      totalBalanceValue,
      totalBalanceError
    } = useTransactionData(user, isAdmin, "importer", importer);
  
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
          !dataLoading && totalBalance != totalBalanceValue &&
          <Button className="w-fit" onClick={handleUpdateTotalBalance}>Update Total Balance</Button>
        }
        <div className="grow">
          {
            dataLoading ? 
              <div>
                {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg my-1" />
                ))}
              </div>
            : dataError ? 
              <CardIcon
                title={"Error"}
                description={dataError.message ?? "Error occurred retrieving transaction data."}>
                <MdError size={28}/>
              </CardIcon>
            : (!billData && !paymentData) ? 
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
                  contentClassName="flex flex-col gap-2 lg:gap-4"
                >
                  <ScrollArea className="flex-1 overflow-auto">
                    {
                      !billData || billData.length == 0 ?
                        <CardIcon
                          title={"No Expense Record Found"}>
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
                  contentClassName="flex flex-col gap-2 lg:gap-4"
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
                  <AddPaymentDialog type="importer" id={importer}/>
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