import { formatCurrency } from "@/lib/utils";
import { DataSnapshot } from "firebase/database";

interface PrintDutyRowRowProps {
  data: DataSnapshot[] | undefined;
  dutyRef?: number,
  assessmentRef?: number,
  total: number,
  paid?: string
}

const PrintDutyRow = ({data, dutyRef, assessmentRef, total, paid} : PrintDutyRowRowProps) => {
  return (
    data && data.length > 0 &&
      <tr className="w-full border-4 border-double border-accent-foreground">
        <td className={`w-5/6 h-full`} colSpan={2}>
        <div
          className="grid items-center justify-center text-center text-xs"
          style={{
            gridTemplateColumns: `35px 60px repeat(${data.length}, minmax(0, 1fr))`,
          }}
        >
          <div>Duty</div>
          <div className="border-x border-accent-foreground py-2.5 text-xs">
            {dutyRef && dutyRef !== 0 ? <div>{`R-${dutyRef}`}</div> : null}
            {assessmentRef && assessmentRef != 0 ? <div>{`A-${assessmentRef}`}</div> : null}
          </div>
          {
          data.map((item, index) => 
            <div key={index} className="border-r border-accent-foreground min-h-full items-center justify-center">
              <div className="w-full py-1 border-b border-accent-foreground">{item.val().details}</div>
              <div className="py-1">{formatCurrency(item.val().value, 2)}</div>
            </div>
          )
        }
        </div>
        </td>
        <td className={"w-1/6 px-2 py-1 text-end"}>
          {paid && <div className="text-center text-sm">{paid}</div>}
          <div>{formatCurrency(total, 2)}</div>
        </td>
      </tr>
  )
}

export default PrintDutyRow