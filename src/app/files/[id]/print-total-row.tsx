import { formatCurrency } from '@/lib/utils';

interface PrintTotalRowProps {
  remarks?: string;
  total: number;
  paid: number;
  balance: number;
}

const PrintTotalRow = ({
  remarks,
  total,
  paid,
  balance,
}: PrintTotalRowProps) => {
  return (
    <tr className="w-full border-4 border-double border-accent-foreground">
      <td className={`w-2/3 py-2 pl-6 pr-2 items-center`}>
        <pre className="w-full font-sans text-sm">
          {remarks ? remarks : 'No Remarks'}
        </pre>
      </td>
      <td className={`w-1/6 border-x border-accent-foreground`}>
        <div className="px-1.5 py-1">TOTAL</div>
        <div className="px-1.5 py-1 border-y border-y-accent-foreground">
          PAID
        </div>
        <div className="px-1.5 py-1">BALANCE</div>
      </td>
      <td className={`w-1/6`}>
        <div className="flex px-1.5 py-1">
          <div className="flex-1">TK.</div>
          <div>{formatCurrency(total, 2, '')}</div>
        </div>
        <div className="flex px-1.5 py-1 border border-y-accent-foreground">
          <div className="flex-1">TK.</div>
          <div>{formatCurrency(paid, 2, '')}</div>
        </div>
        <div className="flex px-1.5 py-1">
          <div className="flex-1">TK.</div>
          <div>{formatCurrency(balance, 2, '')}</div>
        </div>
      </td>
    </tr>
  );
};

export default PrintTotalRow;
