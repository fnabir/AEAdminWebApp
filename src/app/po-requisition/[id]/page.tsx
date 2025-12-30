'use client';

import Layout from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { useEffect, useMemo } from 'react';
import { BreadcrumbInterface } from '@/lib/interfaces';
import { useObject } from 'react-firebase-hooks/database';
import { formatCurrency, getDatabaseReference } from '@/lib/utils';
import { format } from 'date-fns';
import { useFilesInfo } from '@/hooks/use-lc-for-files';
import { useFileCharges } from '@/hooks/use-file-charges';
import FileExpenseDialog from './file-expense-dialog';

const CHARGES = [
  { key: 'duty', label: 'Duty' },
  { key: 'port', label: 'Port Charge' },
  { key: 'noc', label: 'NOC' },
  { key: 'examine', label: 'Examine for Lab Test' },
  { key: 'section', label: 'Section Change' },
  { key: 'labour', label: 'Labour' },
  { key: 'truck', label: 'Truck' },
  { key: 'assessment', label: 'Assessment / Delivery' },
] as const;

export default function RequisitionLetterPage() {
  const { user, userLoading } = useAuth();
  const router = useRouter();

  const path = usePathname();
  const uri = decodeURIComponent(
    path.substring(path.lastIndexOf('/') + 1),
  ).split('-');
  const year = Number(uri[0]);
  const ref = Number(uri[1]);

  const breadcrumb: BreadcrumbInterface[] = useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'P/O Requisition', href: `/po-requisition?year=${year}` },
      { label: `AE/POR/${ref}/${year}` },
    ],
    [year, ref],
  );

  const [data, requisitionLoading] = useObject(
    getDatabaseReference(`requisition/${year}/${ref}`),
  );

  const fileKeys = useMemo<string[]>(() => {
    if (!data?.exists()) return [];

    const files = data.val()?.files;
    if (!files || typeof files !== 'object') return [];

    return Object.keys(files);
  }, [data]);

  const {
    lcByFile,
    itemNameByFile,
    loading: lcLoading,
  } = useFilesInfo(year, fileKeys);

  const lcString = useMemo(
    () => formatLcList(Object.values(lcByFile ?? {})),
    [lcByFile],
  );

  const requisitionVal = useMemo(() => data?.val() ?? null, [data]);

  const arrival = requisitionVal?.arrival;
  const delivery = requisitionVal?.delivery;

  const requisitionFiles = useMemo<Record<string, any>>(
    () => requisitionVal?.files ?? {},
    [requisitionVal],
  );

  const {
    subtotalByFile,
    chargesByFile,
    total,
    loading: chargesLoading,
  } = useFileCharges(year, fileKeys, requisitionFiles);

  const visibleCharges = useMemo(() => {
    if (!chargesByFile || fileKeys.length === 0) return [];

    return CHARGES.filter(({ key }) =>
      fileKeys.some((fileNo) => (chargesByFile[fileNo]?.[key] ?? 0) !== 0),
    );
  }, [chargesByFile, fileKeys]);

  const loading = requisitionLoading || lcLoading || chargesLoading;

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || loading) return <Loading />;

  if (!user) return null;

  return (
    <Layout breadcrumb={breadcrumb}>
      <div className={'flex flex-col h-full space-y-2'}>
        <div className="flex space-x-2">
          {fileKeys.map((fileNo) => (
            <FileExpenseDialog
              key={fileNo}
              ref={ref}
              year={year}
              item={itemNameByFile[fileNo] ?? '-'}
              fileNo={Number(fileNo)}
              lc={lcByFile[fileNo] ?? '-'}
              charges={chargesByFile[fileNo]}
            />
          ))}
        </div>
        <div className="flex">
          <p className="flex-1">
            AE/POR/{ref}/{year}
          </p>
          {requisitionVal.letterDate && (
            <p>{format(requisitionVal.letterDate, 'dd.MM.yyyy')}</p>
          )}
        </div>
        <p>
          Mr. Saiful Islam
          <br />
          Manager Supply Chain
          <br />
          Bio Pharma Ltd.
        </p>
        <p>
          <strong>Subject:</strong> Payment Request for Customs Clearance and
          Delivery for L/C Nos. {lcString}
        </p>
        <p>Dear Sir,</p>
        <p>Assalamualikum Wrt. Wbr.</p>
        <p>
          We are pleased to inform you that the subject consignments arrived at
          Chittagong Port on{' '}
          <strong>{arrival ? format(arrival, 'dd.MM.yyyy') : '—'}</strong>.
        </p>
        <p>
          The customs assessment has been finalized, and we have scheduled the
          delivery for{' '}
          <strong>{delivery ? format(delivery, 'dd.MM.yyyy') : '—'}</strong>. To
          facilitate a timely release of the goods, we kindly request you to
          deposit the Duty, Port, Agency, Labor and other charges to our bank
          account as per the details below:
        </p>
        <table>
          <tbody>
            <tr>
              <td className="w-36">
                <strong>Account Name</strong>
              </td>
              <td>: AHSAN ENTERPRISE</td>
            </tr>
            <tr>
              <td>
                <strong>Account No</strong>
              </td>
              <td>: 20501030100151503 (Current Account)</td>
            </tr>
            <tr>
              <td>
                <strong>Bank</strong>
              </td>
              <td>: Islami Bank Bangladesh Ltd (IBBL)</td>
            </tr>
            <tr>
              <td>
                <strong>Branch</strong>
              </td>
              <td>: Agrabad Branch, Chattogram</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse border border-primary">
          <tbody>
            <tr>
              <th className="border border-primary text-left px-2 py-1">
                Item Name
              </th>
              {fileKeys.map((fileNo) => (
                <th key={fileNo} className="border border-primary px-2">
                  {itemNameByFile[fileNo] ?? '—'}
                </th>
              ))}
            </tr>

            <tr>
              <th className="border border-primary text-left px-2 py-1">
                LC No.
              </th>
              {fileKeys.map((fileNo) => (
                <td
                  key={fileNo}
                  className="border border-primary px-2 text-right"
                >
                  {lcByFile[fileNo] ?? '—'}
                </td>
              ))}
            </tr>

            {visibleCharges.map(({ key, label }) => (
              <tr key={key}>
                <th className="border border-primary px-2 py-1 text-left">
                  {label}
                </th>

                {fileKeys.map((fileNo) => {
                  const value = chargesByFile[fileNo]?.[key] ?? 0;

                  return (
                    <td
                      key={fileNo}
                      className={`border border-primary px-2 py-1 text-right ${
                        key === 'duty' ? 'text-destructive' : ''
                      }`}
                    >
                      {value === 0 ? '-' : formatCurrency(value, 2, '')}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr>
              <th className="border border-primary text-left px-2 py-1">
                Subtotal
              </th>
              {fileKeys.map((fileNo) => (
                <td
                  key={fileNo}
                  className="border border-primary px-2 text-right font-semibold"
                >
                  {formatCurrency(subtotalByFile[fileNo], 2, '')}
                </td>
              ))}
            </tr>

            <tr>
              <th className="border border-primary text-left px-2 py-1">
                Total
              </th>
              <td
                colSpan={fileKeys?.length ? fileKeys.length + 1 : 1}
                className="border border-primary px-2 font-semibold text-right"
              >
                {formatCurrency(total, 2, '')}
              </td>
            </tr>
          </tbody>
        </table>

        <p>
          Please confirm with the deposit slip or confirmation at your earliest
          convenience to avoid any delay or port demurrage.
        </p>
        <p>Thank you for your cooperation.</p>
      </div>
    </Layout>
  );
}

function formatLcList(lcs: (string | null | undefined)[]) {
  const clean = lcs.filter(Boolean) as string[];

  if (clean.length === 0) return '';
  if (clean.length === 1) return clean[0];

  return `${clean.slice(0, -1).join(', ')} & ${clean.at(-1)}`;
}
