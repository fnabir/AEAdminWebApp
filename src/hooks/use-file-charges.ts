import { useMemo } from 'react';
import { useObject } from 'react-firebase-hooks/database';
import { getDatabaseReference, getTotalValue } from '@/lib/utils';

export function useFileCharges(
  year: number,
  fileKeys: string[],
  filesData: Record<string, any>,
) {
  const [detailsSnap, detailsLoading] = useObject(
    getDatabaseReference(`files/details/${year}`),
  );

  const [expenseSnap, expenseLoading] = useObject(
    getDatabaseReference(`files/expense/${year}`),
  );

  const loading = detailsLoading || expenseLoading;

  const { subtotalByFile, total, chargesByFile } = useMemo(() => {
    const subtotalByFile: Record<string, number> = {};
    const chargesByFile: Record<
      string,
      {
        duty: number;
        port: number;
        noc: number;
        examine: number;
        section: number;
        labour: number;
        truck: number;
        assessment: number;
      }
    > = {};

    let total = 0;

    const details = detailsSnap?.val() ?? {};
    const expenses = expenseSnap?.val() ?? {};

    fileKeys.forEach((fileNo) => {
      let duty = 0;

      if (
        details[fileNo]?.dutyValue != null &&
        details[fileNo]?.dutyValue != 0
      ) {
        duty = Number(details[fileNo].dutyValue);
      } else {
        const dutyData = expenses[fileNo]?.duty as
          | Record<string, { value: number }>
          | undefined;
        duty = dutyData
          ? Object.values(dutyData).reduce(
              (sum: number, item) => sum + Number(item?.value || 0),
              0,
            )
          : 0;
      }

      const fileCharges = filesData[fileNo] ?? {};
      const port = Number(fileCharges.port || 0);
      const noc = Number(fileCharges.noc || 0);
      const examine = Number(fileCharges.examine || 0);
      const section = Number(fileCharges.section || 0);
      const labour = Number(fileCharges.labour || 0);
      const truck = Number(fileCharges.truck || 0);
      const assessment = Number(fileCharges.assessment || 0);

      const subtotal =
        port + noc + examine + section + labour + truck + assessment;
      subtotalByFile[fileNo] = subtotal;

      total += subtotal;

      chargesByFile[fileNo] = {
        duty,
        port,
        noc,
        examine,
        section,
        labour,
        truck,
        assessment,
      };
    });

    return { subtotalByFile, total, chargesByFile };
  }, [detailsSnap, expenseSnap, fileKeys]);

  return { subtotalByFile, total, chargesByFile, loading };
}
