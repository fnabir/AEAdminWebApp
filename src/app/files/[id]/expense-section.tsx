import { formatCurrency } from "@/lib/utils";
import { DataSnapshot } from "firebase/database";
import { FileInfoRow } from "./file-info-row";
import CardSection from "@/components/card/card-section";

type Props = {
  title: string;
  data?: DataSnapshot[];
  total?: number;
};

export const ExpenseSection: React.FC<Props> = ({ title, data, total = 0 }) => {
  if (!data?.length) return null;

  return (
    <CardSection
      title={title}
      className="col-span-1 lg:col-span-6"
      contentClassName="flex flex-col divide-y divide-slate-500"
    >
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
    </CardSection>
  );
};