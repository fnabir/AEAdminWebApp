import { formatCurrency } from "@/lib/utils";
import { MdUpdate } from "react-icons/md";
import React, {useState} from "react";
import {Card} from "@/components/ui/card";

interface Props {
    value: number;
    date: string;
    text?: string;
    error?: string;
    update?: boolean;
    onClick?: () => void;
		className?: string;
}

const CardTotalBalance: React.FC<Props> = ({
                                         value,
                                         date,
                                         text,
                                         error,
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
      <Card className={`flex flex-row rounded-xl shadow bg-accent px-2 md:px-6 py-1 md:py-2 items-center ${className}`}>
        <div className="grow text-start">
          <div className="text-xl ">{`${error ? "Error loading " : ""}${titleText}`}</div>
          <p className="text-sm">{error ? error : dateText}</p>
        </div>

        {!error &&<div className="items-center text-right text-lg md:text-3xl font-medium font-mono">{formatCurrency(value)}</div>}

        { 
          !error && updateState && update && <button className="border-1 border-primary rounded-lg hover:bg-primary/20 ml-2 p-2 cursor-pointer duration-150" onClick={handleOnClick}>
            <MdUpdate size={24}/>
          </button>
        }
      </Card>
    )
}

export default CardTotalBalance;