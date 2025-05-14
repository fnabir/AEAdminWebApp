export type breadcrumbItem = {
    text: string,
    link?: string,
}

export type options = {
  value: string,
  label?: string,
}

export type expenseDataType = {
  id: number,
  details: string,
  value: number,
}

export type FileInfoType = {
  importer: string;
  itemCount?: number;
  itemName: string;
  itemPackage: string;
  bl?: string;
  lc?: number;
  be?: number;
  type?: "export" | "import";
  status: string;
}

export type FileDetailsType = {
  vessel?: string;
  rotNo?: string;
  cnfValue?: number;
  assessableValue?: number;
  beDate?:string;
  assessmentDate?: string;
  dutyPaymentDate?: string;
  deliveryDate?: string;
  assessmentRef: number;
  dutyRef?: number;
  dutyPaid?: string;
  dutyValue?: number;
  paid?: number;
  remarks?: string;
}