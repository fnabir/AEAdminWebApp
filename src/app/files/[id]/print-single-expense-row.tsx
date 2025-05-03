import { formatCurrency } from "@/lib/utils";

interface PrintSingleExpenseRowProps {
  title: string,
  value: number,
}

const PrintSingleExpenseRow = ({title, value} : PrintSingleExpenseRowProps) => {
  return (
    value != 0 &&
      <tr className="w-full border-4 border-double border-accent-foreground">
        <td className={`w-2/3 py-2 pl-6 pr-2`}>{title}</td> 
        <td className={`w-1/6 p-2 text-end border-x border-accent-foreground`}>{formatCurrency(value, 2)}</td>
        <td className={`w-1/6 p-2 text-end`}>{formatCurrency(value, 2)}</td>
      </tr>
  )
}

export default PrintSingleExpenseRow