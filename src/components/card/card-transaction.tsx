import React from "react";
import {formatCurrency} from "@/lib/utils";
import {Card} from "@/components/ui/card";
import {TransactionInterface} from "@/lib/interfaces";

const CardTransaction: React.FC<TransactionInterface> = ({title, details, value, date}) => {
    return (
      <Card className={`flex flex-row w-full px-2 md:px-6 py-1 md:py-2 space-x-1 md:space-x-4 ${value > 0 ? 'bg-green-900' : 'bg-red-900'} items-center text-white`}>
        <div className="font-mono text-xs md:text-base">
            {date}
        </div>
        <div className="grow flex flex-col md:flex-row text-sm md:text-base md:space-x-1">
            <div className="font-semibold">{title}</div>
            {details && <div className="hidden md:block">-</div>}
            {details && <div>{details}</div>}
          </div>
          <div className="text-sm md:text-2xl font-mono font-medium">
            {formatCurrency(value)}
          </div>
      </Card>
    )
}

export default CardTransaction;