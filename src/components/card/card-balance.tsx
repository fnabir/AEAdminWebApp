import { formatCurrency } from "@/lib/utils";
import Link from "@/components/link";
import {Badge} from "@/components/ui/badge";
import {Card, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {BalanceInterface} from "@/lib/interfaces";

export default function CardBalance(props:BalanceInterface) {
    return (
      <Link
        href={`/${props.type}/${props.id}`}>
          <Card
            className={`flex-row w-full justify-between items-center px-6 py-2
                        ${props.status === "cancel" ? "bg-red-900 text-white hover:bg-red-900/80" : 
                          props.value < 0 ? "bg-yellow-900 text-white hover:bg-yellow-900/80" : 
                          props.value === 0 ? "bg-green-900 text-white hover:bg-green-900/80" : "bg-muted hover:bg-muted/80 text-primary" }`}
            >
            <div className={"flex-grow items-center"}>
              <CardHeader className={"flex-row items-center space-x-2 space-y-0 p-0"}>
                <CardTitle className="font-semibold">{props.name}</CardTitle>
                {
                  (props.status === "cancel" || props.value < 0) &&
                  <Badge>{props.status == 'cancel' ? "Cancelled" : props.value < 0 ? "Overpaid" : ""}</Badge>
                }
              </CardHeader>
              { props.date && <CardFooter className="text-sm p-0">{props.date}</CardFooter>}
            </div>
            <div className={"flex-wrap items-center text-2xl font-medium font-mono"}>
                {formatCurrency(props.value)}
            </div>
          </Card>
        </Link>
    )
}