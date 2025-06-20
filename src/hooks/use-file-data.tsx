import { useObject, useList } from "react-firebase-hooks/database";
import { generateFileCode, getDatabaseReference } from "@/lib/utils";
import { FileDetailsType, FileInfoType } from "@/lib/types";
import { useMemo } from "react";
import { BreadcrumbInterface } from "@/lib/interfaces";

export function useFileData(fileYear: number, fileNo: number) {
  const [fileInfoData, fileInfoLoading, fileInfoError] = useObject(getDatabaseReference(`files/info/${fileYear}/${fileNo}`));
  const [fileDetailsData, fileDetailsLoading, fileDetailsError] = useObject(getDatabaseReference(`files/details/${fileYear}/${fileNo}`));

  const fileInfo: FileInfoType = fileInfoData?.val();
  const fileDetails: FileDetailsType = fileDetailsData?.val();

  const shouldFetchImporter = !!fileInfo?.importer;
  const [importerData, importerLoading, importerError] = useObject(
    shouldFetchImporter ? getDatabaseReference(`info/importer/${fileInfo.importer}`) : null
  );
  const importerTransactionInfo = useObject(
    shouldFetchImporter ? getDatabaseReference(`transaction/importer/${fileInfo.importer}/bill/${fileYear}-${fileNo}`) : null
  )[0]?.val();
  const importerInfo = importerData?.val();

  const fileName = useMemo(() => generateFileCode(fileNo, fileYear, fileInfo?.type), [fileNo, fileYear, fileInfo?.type]);
  const breadcrumb: BreadcrumbInterface[] = useMemo(() => [
    { label: "Home", href: "/" },
    { label: "Files", href: `/files?year=${fileYear}` },
    { label: fileName }
  ], [fileYear, fileName]);

  const dutyData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/duty`))[0];
  const staffExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/staff`))[0];
  const portExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/port`))[0];
  const customExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/custom`))[0];
  const otherExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/other`))[0];
  const deliveryExpenseData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/delivery`))[0];

  const fileLoading = fileInfoLoading || fileDetailsLoading || importerLoading;
  const fileError = fileInfoError || fileDetailsError || importerError;

  return {
    fileInfo,
    fileDetails,
    importerInfo,
    fileName,
    breadcrumb,
    dutyData,
    staffExpenseData,
    portExpenseData,
    customExpenseData,
    otherExpenseData,
    deliveryExpenseData,
    importerTransactionInfo,
    fileLoading,
    fileError,
  };
}