import { formatCurrency } from '@/lib/utils';

interface PrintSingleExpenseRowProps {
  title: string;
  value: number;
}

const PrintSingleExpenseRow = ({
  title,
  value,
}: PrintSingleExpenseRowProps) => {
  return (
    value != 0 && (
      <tr className="w-full border-4 border-double border-accent-foreground">
        <td className={`w-2/3 py-2 pl-6 pr-2`}>{title}</td>
        <td className={`w-1/6 px-1.5 py-2 border-x border-accent-foreground`}>
          <div className="flex w-full">
            <div className="flex-1">TK.</div>
            {formatCurrency(value, 2, '')}
          </div>
        </td>
        <td className={`w-1/6 px-1.5 py-2`}>
          <div className="flex w-full">
            <div className="flex-1">TK.</div>
            {formatCurrency(value, 2, '')}
          </div>
        </td>
      </tr>
    )
  );
};

export default PrintSingleExpenseRow;
