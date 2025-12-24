import { getTotalValue } from '@/lib/utils';
import { DataSnapshot } from 'firebase/database';
import { useMemo } from 'react';

interface ExpenseHookProps {
  fileDutyValue: number;
  fileDutyPaid: boolean;
  dutyData?: DataSnapshot[];
  staffExpenseData?: DataSnapshot[];
  portExpenseData?: DataSnapshot[];
  customExpenseData?: DataSnapshot[];
  otherExpenseData?: DataSnapshot[];
  deliveryExpenseData?: DataSnapshot[];
  miscellaneousValue?: number;
  commissionValue?: number;
  paidValue?: number;
}

export function useFileTotalExpenses({
  fileDutyValue = 0,
  fileDutyPaid = false,
  dutyData = [],
  staffExpenseData = [],
  portExpenseData = [],
  customExpenseData = [],
  otherExpenseData = [],
  deliveryExpenseData = [],
  miscellaneousValue = 0,
  commissionValue = 0,
  paidValue = 0,
}: ExpenseHookProps) {
  const totalDuty = useMemo(() => {
    return fileDutyValue && fileDutyValue != 0
      ? fileDutyValue
      : getTotalValue(dutyData);
  }, [dutyData, fileDutyValue]);

  const totalStaffExpense = useMemo(() => {
    return getTotalValue(staffExpenseData);
  }, [staffExpenseData]);

  const totalPortExpense = useMemo(() => {
    return getTotalValue(portExpenseData);
  }, [portExpenseData]);

  const totalCustomExpense = useMemo(() => {
    return getTotalValue(customExpenseData);
  }, [customExpenseData]);

  const totalOtherExpense = useMemo(() => {
    return getTotalValue(otherExpenseData);
  }, [otherExpenseData]);

  const totalDeliveryExpense = useMemo(() => {
    return getTotalValue(deliveryExpenseData);
  }, [deliveryExpenseData]);

  const totalValue = useMemo(() => {
    return (
      (fileDutyPaid ? 0 : totalDuty) +
      totalPortExpense +
      totalCustomExpense +
      totalOtherExpense +
      totalDeliveryExpense +
      miscellaneousValue +
      commissionValue
    );
  }, [
    fileDutyPaid,
    totalDuty,
    totalPortExpense,
    totalCustomExpense,
    totalOtherExpense,
    totalDeliveryExpense,
    miscellaneousValue,
    commissionValue,
  ]);

  const balanceValue = useMemo(() => {
    return totalValue - paidValue;
  }, [totalValue, paidValue]);

  return {
    totalDuty,
    totalStaffExpense,
    totalPortExpense,
    totalCustomExpense,
    totalOtherExpense,
    totalDeliveryExpense,
    totalValue,
    balanceValue,
  };
}
