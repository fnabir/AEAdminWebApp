import React from "react";
import {formatCurrency} from "@/lib/utils";
import {Card} from "@/components/ui/card";
import {TransactionInterface} from "@/lib/interfaces";

const CardTransaction: React.FC<TransactionInterface> = ({title, details, value, date}) => {
    return (
      <Card className={`flex flex-row w-full px-2 lg:px-6 py-1 lg:py-2 space-x-1 lg:space-x-4 ${value > 0 ? 'bg-green-900' : 'bg-red-900'} items-center text-white`}>
        <div className="font-mono text-xs lg:text-base">
            {date}
        </div>
        <div className="grow flex flex-col lg:flex-row text-sm lg:text-base lg:space-x-1">
            <div className="font-semibold">{title}</div>
            {details && <div className="hidden lg:block">-</div>}
            {details && <div>{details}</div>}
          </div>
          <div className="text-sm lg:text-2xl font-mono font-medium">
            {formatCurrency(value)}
          </div>
      </Card>
    )
}

export default CardTransaction;