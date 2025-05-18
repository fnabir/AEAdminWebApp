import { useObject, useList } from "react-firebase-hooks/database";
import { getDatabaseReference, getTotalValue } from "@/lib/utils";
import { useMemo } from "react";
import { User } from "firebase/auth";

export function useTransactionData(user: User | null | undefined, isAdmin: boolean, type: string, id: string) {
  const [billData, billLoading, billError] = useList(
    user && isAdmin ? getDatabaseReference(`transaction/${type}/${id}/bill`): null
    );
  const [paymentData, paymentLoading, paymentError] = useList(
    user && isAdmin ? getDatabaseReference(`transaction/${type}/${id}/payment`): null
    );
  const [totalBalanceSnapshot, totalBalanceLoading, totalBalanceError] = useObject(
    user && isAdmin ? getDatabaseReference(`balance/${type}/${id}`) : null
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

  const dataLoading = billLoading || paymentLoading || totalBalanceLoading;
  const dataError = billError || paymentError || totalBalanceError;

  return {
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
  };
}