import { formatCurrency } from '@/lib/utils';
import { DataSnapshot } from 'firebase/database';

interface PrintExpenseRowProps {
  data: DataSnapshot[] | undefined;
  total: number;
}

const PrintExpenseRow = ({ data, total }: PrintExpenseRowProps) => {
  return (
    data &&
    data.length > 0 && (
      <tr className="w-full border-4 border-double border-accent-foreground">
        <td className={'w-2/3 py-2 pl-6 pr-2'}>
          {data.map((item, index) => (
            <div key={index}>{item.val().details}</div>
          ))}
        </td>
        <td className={'w-1/6 px-1.5 py-2 border-x border-accent-foreground'}>
          {data.map((item, index) => (
            <div key={index} className="flex">
              <div className="flex-1">TK.</div>
              {formatCurrency(item.val().value, 2, '')}
            </div>
          ))}
        </td>
        <td className={'w-1/6 px-1.5 py-2'}>
          <div className="flex">
            <div className="flex-1">TK.</div>
            <div>{formatCurrency(total, 2, '')}</div>
          </div>
        </td>
      </tr>
    )
  );
};

export default PrintExpenseRow;
