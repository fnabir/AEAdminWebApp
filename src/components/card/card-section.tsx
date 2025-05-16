import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { IconType } from "react-icons";

interface Props {
  title: string;
  icon?: IconType;
  iconColor?: string;
  backdropColor?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const CardSection: React.FC<Props> = ({title, icon:Icon, iconColor, backdropColor, children, className, contentClassName}) => {
  return <Card className={`backdrop-blur-sm overflow-hidden ${className}`}>
    {backdropColor && <div className={`-z-1 absolute -top-5 -right-5 size-30 rounded-full opacity-40 blur-2xl ${backdropColor}`}/>}
    <CardHeader className="flex items-center border-b-2 border-slate-700 pb-3 px-2 lg:px-6">
        <CardTitle className="text-xl lg:text-2xl font-bold w-full flex items-center justify-between">
            <div>{title}</div>
            {Icon && <Icon className={`size-7 ${iconColor}`} />}
        </CardTitle>
    </CardHeader>
    <CardContent className={`px-2 lg:px-6 py-1 lg:py-2 ${contentClassName}`}>
      {children}
    </CardContent>
  </Card>
}

export default CardSection;