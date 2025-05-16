export interface OptionsInterface {
  value: string;
  label?: string;
}
export interface BreadcrumbInterface {
  label: string;
  href?: string;
}

export interface BalanceInterface {
  type:string;
  id: string;
  name: string;
  value: number;
  date?: string;
  status?: string;
}

export interface TransactionInterface {
  type:string;
  uid: string;
  transactionId: string;
  title: string;
  details?: string;
  value: number;
  date: string;
  access?:string;
}