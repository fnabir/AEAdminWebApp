import { formatCurrency } from "@/lib/utils";
import { DataSnapshot } from "firebase/database";

interface PrintExpenseRowProps {
  data: DataSnapshot[] | undefined;
  total: number,
}

const PrintExpenseRow = ({data, total} : PrintExpenseRowProps) => {
  return (
    data && data.length > 0 &&
      <tr className="w-full border-4 border-double border-accent-foreground">
        <td className={"w-2/3 py-2 pl-6 pr-2"}>
        {
          data.map((item, index) => 
            <div key={index} >{item.val().details}</div>
          )
        }
        </td> 
        <td className={"w-1/6 p-2 text-end border-x border-accent-foreground"}>
        {
          data.map((item, index) => 
            <div key={index}>{formatCurrency(item.val().value, 2)}</div>
          )
        }
        </td>
        <td className={"w-1/6 p-2 text-end"}>{formatCurrency(total, 2)}</td>
      </tr>
  )
}

export default PrintExpenseRow