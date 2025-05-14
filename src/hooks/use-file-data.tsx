import { useObject, useList } from "react-firebase-hooks/database";
import { generateFileCode, getDatabaseReference } from "@/lib/utils";
import { breadcrumbItem, FileDetailsType, FileInfoType } from "@/lib/types";
import { useMemo } from "react";

export function useFileData(fileYear: number, fileNo: number) {
  const [fileInfoData, fileInfoLoading, fileInfoError] = useObject(getDatabaseReference(`files/info/${fileYear}/${fileNo}`));
  const [fileDetailsData, fileDetailsLoading, fileDetailsError] = useObject(getDatabaseReference(`files/details/${fileYear}/${fileNo}`));

  const fileInfo: FileInfoType = fileInfoData?.val();
  const fileDetails: FileDetailsType = fileDetailsData?.val();

  const shouldFetchImporter = !!fileInfo?.importer;
  const [importerData, importerLoading, importerError] = useObject(
    shouldFetchImporter ? getDatabaseReference(`info/importer/${fileInfo.importer}`) : null
  );
  const importerInfo = importerData?.val();

  const fileName = useMemo(() => generateFileCode(fileNo, fileYear, fileInfo?.type), [fileNo, fileYear, fileInfo?.type]);
  const breadcrumb: breadcrumbItem[] = useMemo(() => [
    { text: "Home", link: "/" },
    { text: "/" },
    { text: "Files", link: `/files?year=${fileYear}` },
    { text: "/" },
    { text: fileName }
  ], [fileYear, fileName]);

  const dutyData = useList(getDatabaseReference(`files/expense/${fileYear}/${fileNo}/duty`))[0];
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
    portExpenseData,
    customExpenseData,
    otherExpenseData,
    deliveryExpenseData,
    fileLoading,
    fileError,
  };
}