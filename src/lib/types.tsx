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
  key: string,
  importer: string,
  itemName: string,
  itemPackage: string,
  status: string,
}