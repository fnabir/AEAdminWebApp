import { useObject } from 'react-firebase-hooks/database';
import { useMemo } from 'react';
import { getDatabaseReference } from '@/lib/utils';

type LcByFile = Record<string, string | null>;
type ItemNameByFile = Record<string, string | null>;

export function useFilesInfo(year: number, fileNumbers: string[]) {
  const [snapshot, loading, error] = useObject(
    getDatabaseReference(`files/info/${year}`),
  );

  const { lcByFile, itemNameByFile } = useMemo<{
    lcByFile: LcByFile;
    itemNameByFile: ItemNameByFile;
  }>(() => {
    if (!snapshot) {
      return { lcByFile: {}, itemNameByFile: {} };
    }

    const data = snapshot.val() ?? {};

    const lcByFile = fileNumbers.reduce<LcByFile>((acc, fileNo) => {
      acc[fileNo] = data[fileNo]?.lc ?? null;
      return acc;
    }, {});

    const itemNameByFile = fileNumbers.reduce<ItemNameByFile>((acc, fileNo) => {
      acc[fileNo] = data[fileNo]?.itemName ?? null;
      return acc;
    }, {});

    return { lcByFile, itemNameByFile };
  }, [snapshot, fileNumbers]);

  return { lcByFile, itemNameByFile, loading, error };
}
