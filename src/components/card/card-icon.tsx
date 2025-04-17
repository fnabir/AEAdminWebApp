import React, { FC } from 'react';
import Link from "next/link";
import {Card} from "@/components/ui/card";

const CardIcon: FC<{title: string, number?: number, description?: string, route?: string, className?: string, children: React.ReactNode}> = ({
	title, number, description, route, children, className,
}) => {
	return(
		<Link
			href={route ? route : "#"}>
			<Card className={`flex-row w-full px-2 lg:px-6 py-2 lg:py-3 items-center bg-muted/50 hover:cursor-pointer hover:bg-muted/100 space-x-2 lg:space-x-4 ${className}`}>
				{children}
				<div className={"flex-1"}>
					<div className={"text-lg lg:text-xl font-bold"}>{title}</div>
					{description &&
						<div className={"text-sm text-muted-foreground pb-0"}>
							{description}
						</div>
					}
				</div>
				{!description && number && number > 0 &&
          <div className={"font-semibold text-primary-foreground bg-primary leading-8 w-8 h-8 rounded-full text-center"}>{number}</div>
				}
			</Card>
		</Link>
	);
};

export default CardIcon; 