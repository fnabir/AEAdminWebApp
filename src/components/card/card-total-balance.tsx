import { formatCurrency } from "@/lib/utils";
import { MdUpdate } from "react-icons/md";
import React, {useState} from "react";
import {Card} from "@/components/ui/card";

interface Props {
    value: number
    date: string
    text?: string
    update?: boolean
    onClick?: () => void
		className?: string
}

const CardTotalBalance: React.FC<Props> = ({
                                         value,
                                         date,
                                         text,
                                         update = false,
                                         onClick,
	className,
}) => {
	const titleText = text ? text : "Total Balance";
	const dateText = date == null || date == '' ? 'Last update date not found' : 'Last updated on ' + (date);
	const [updateState, setUpdateState] = useState(update);
	const handleOnClick = () => {
		if (onClick !== undefined) {
			onClick()
			setUpdateState(false);
		}
	};

    return (
      <Card className={`rounded-xl shadow bg-muted flex pl-6 pr-2 pt-2 ${className}`}>
          <div className={(updateState && update ? "" : "pr-2") + " w-full mx-auto md:flex md:items-center md:justify-between text-primary"}>
              <div>
                  <div className="text-xl text-center md:text-start">{titleText}</div>
                  <p id="updatedate" className="text-sm pb-2 sm:text-center md:text-start">{dateText}</p>
              </div>
              <div className="items-center text-right mt-3 text-3xl font-medium font-mono sm:mt-0">
                  {formatCurrency(value)}
              </div>
          </div>
          <button className={updateState && update ? "w-10 bg-black bg-opacity-40 rounded-lg hover:bg-opacity-70 m-2 p-2" : "hidden"}
                  onClick={handleOnClick}>
              <MdUpdate className='w-6 h-6'/>
          </button>
      </Card>
    )
}

export default CardTotalBalance;