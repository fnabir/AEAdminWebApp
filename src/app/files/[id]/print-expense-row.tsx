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
      <>
        {data.map((item, index) => (
          <tr
            key={index}
            className="border-l-4 border-r-4 border-accent-foreground"
          >
            <td
              className={`w-2/3 pl-6 pr-2 align-top ${
                index === 0 ? 'pt-2' : ''
              } ${index === data.length - 1 ? 'pb-2' : ''}`}
            >
              {item.val().details}
            </td>

            <td
              className={`w-1/6 px-1.5 border-x border-accent-foreground ${
                data.length == 1 ? '' : 'align-top'
              } ${index === 0 ? 'pt-2' : ''} ${
                index === data.length - 1 ? 'pb-2' : ''
              }`}
            >
              <div className="flex">
                <div className="flex-1">TK.</div>
                {formatCurrency(item.val().value, 2, '')}
              </div>
            </td>

            {index === 0 && (
              <td className="w-1/6 px-1.5 py-2" rowSpan={data.length}>
                <div className="flex">
                  <div className="flex-1">TK.</div>
                  <div>{formatCurrency(total, 2, '')}</div>
                </div>
              </td>
            )}
          </tr>
        ))}

        <tr className="border-b-4 border-double border-accent-foreground">
          <td colSpan={3} />
        </tr>
      </>
    )
  );
};

export default PrintExpenseRow;
