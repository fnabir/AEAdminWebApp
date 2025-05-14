import { formatCurrency } from "@/lib/utils";

interface PrintTotalRowProps {
  remarks?: string;
  total: number;
  paid:number;
  balance:number
}

const PrintTotalRow = ({remarks, total, paid, balance} : PrintTotalRowProps) => {
  return (
    <tr className="w-full border-4 border-double border-accent-foreground">
      <td className={`w-2/3 py-2 pl-6 pr-2 items-center`}>
        <pre className="w-full font-sans text-sm">
          {
            remarks ? remarks : "No Remarks"
          }
        </pre>
      </td> 
      <td className={`w-1/6 border-x border-accent-foreground`}>
        <div className="px-2 py-1">TOTAL</div>
        <div className="px-2 py-1 border-y border-y-accent-foreground">PAID</div>
        <div className="px-2 py-1">BALANCE</div>
      </td>
      <td className={`w-1/6 text-end`}>
        <div className="px-2 py-1">{formatCurrency(total, 2)}</div>
        <div className="px-2 py-1 border border-y-accent-foreground">{formatCurrency(paid, 2)}</div>
        <div className="px-2 py-1">{formatCurrency(balance, 2)}</div>
      </td>
    </tr>
  )
}

export default PrintTotalRow