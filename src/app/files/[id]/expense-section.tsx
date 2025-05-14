import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DataSnapshot } from "firebase/database";
import { FileInfoRow } from "./file-info-row";

type Props = {
  title: string;
  data?: DataSnapshot[];
  total?: number;
};

export const ExpenseSection: React.FC<Props> = ({ title, data, total = 0 }) => {
  if (!data?.length) return null;

  return (
    <Card className="col-span-1 lg:col-span-6 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex items-center border-b-2 border-slate-700 pb-3 px-2 lg:px-6">
        <CardTitle className="text-xl lg:text-2xl font-bold w-full flex items-center justify-start space-x-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 lg:px-6 py-1 lg:py-2 flex flex-col divide-y divide-slate-500">
        {data.map((item, index) => (
          <FileInfoRow
            key={index}
            title={item.val().details}
            value={formatCurrency(item.val().value, 2)}
          />
        ))}
        {total !== 0 && (
          <FileInfoRow
            title="Total"
            value={formatCurrency(total, 2)}
            className="font-bold"
          />
        )}
      </CardContent>
    </Card>
  );
};