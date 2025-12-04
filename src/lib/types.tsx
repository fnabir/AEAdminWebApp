export type options = {
  value: string;
  label?: string;
};

export type DutyWithPercentage = {
  percentage: number;
  value: number;
};

export type DutyValueOnly = {
  value: number;
};

export type FileDutyData = {
  CD?: DutyWithPercentage;
  RD?: DutyWithPercentage;
  SD?: DutyWithPercentage;
  VAT?: DutyWithPercentage;
  AIT?: DutyWithPercentage;
  AT?: DutyWithPercentage;
  DF?: DutyValueOnly;
};

export type expenseDataType = {
  id: number;
  details: string;
  value: number;
};

export type FileInfoType = {
  importer: string;
  itemCount?: number;
  itemName: string;
  itemPackage: string;
  bl?: string;
  lc?: number;
  be?: number;
  type?: 'export' | 'import';
  status: string;
  note?: string;
};

export type FileDetailsType = {
  vessel?: string;
  rotNo?: string;
  cnfValue?: number;
  assessableValue?: number;
  beDate?: string;
  assessmentDate?: string;
  dutyPaymentDate?: string;
  deliveryDate?: string;
  assessmentRef: number;
  dutyRef?: number;
  dutyPaid?: string;
  dutyValue?: number;
  paid?: number;
  remarks?: string;
};
