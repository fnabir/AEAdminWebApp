'use client';

import Layout from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn, formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import CardIcon from '@/components/card/card-icon';
import { MdError } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { FaAlignLeft, FaPrint } from 'react-icons/fa6';
import { useReactToPrint } from 'react-to-print';
import ExpenseDialog from './expense-dialog';
import DetailsDialog from './details-dialog';
import PrintHeaderRow from './print-header-row';
import PrintExpenseRow from './print-expense-row';
import PrintSingleExpenseRow from './print-single-expense-row';
import PrintTotalRow from './print-total-row';
import { format, parse } from 'date-fns';
import PrintDutyRow from './print-duty-row';
import PaidDialog from './paid-remarks-dialog';
import { ExpenseSection } from './expense-section';
import { FileInfoRow } from './file-info-row';
import { useFileTotalExpenses } from '@/hooks/use-file-total-expense';
import { useFileData } from '@/hooks/use-file-data';
import CardSection from '@/components/card/card-section';
import { updateTransaction } from '@/lib/functions';

export default function FileDetailsPage() {
  const { user, userLoading, isAdmin } = useAuth();
  const router = useRouter();

  const path = usePathname();
  const file = decodeURIComponent(
    path.substring(path.lastIndexOf('/') + 1),
  ).split('-');
  const fileNo = Number(file[1]);
  const fileYear = Number(file[0]);

  const [showPrintLayout, setShowPrintLayout] = useState<boolean>(false);

  const {
    fileInfo,
    fileDetails,
    importerInfo,
    fileName,
    breadcrumb,
    dutyData,
    staffExpenseData,
    portExpenseData,
    customExpenseData,
    otherExpenseData,
    deliveryExpenseData,
    importerTransactionInfo,
    fileLoading,
    fileError,
  } = useFileData(fileYear, fileNo);

  const fileDutyValue = fileDetails?.dutyValue ?? 0;
  const fileDutyPaid: boolean = fileDetails?.dutyPaid ? true : false;
  const miscellaneousValue = importerInfo?.miscExpense ?? 0;
  const paidValue = fileDetails?.paid ?? 0;

  const minCommission = useMemo(() => {
    return fileDetails?.assessableValue
      ? importerInfo?.commission && importerInfo?.minCommission
        ? (fileDetails.assessableValue * importerInfo.commission) / 100 <
          importerInfo.minCommission
        : false
      : false;
  }, [fileDetails, importerInfo]);
  const commissionValue = useMemo(() => {
    return fileDetails?.assessableValue
      ? importerInfo?.commission && importerInfo?.minCommission
        ? minCommission
          ? importerInfo.minCommission
          : Math.ceil(
              (fileDetails.assessableValue * importerInfo.commission) / 100,
            )
        : 0
      : 0;
  }, [fileDetails, importerInfo, minCommission]);

  const {
    totalDuty,
    totalStaffExpense,
    totalPortExpense,
    totalCustomExpense,
    totalOtherExpense,
    totalDeliveryExpense,
    totalValue,
    balanceValue,
  } = useFileTotalExpenses({
    fileDutyValue,
    fileDutyPaid,
    dutyData,
    staffExpenseData,
    portExpenseData,
    customExpenseData,
    otherExpenseData,
    deliveryExpenseData,
    miscellaneousValue,
    commissionValue,
    paidValue,
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: fileName,
  });
  const handlePrint = () => {
    if (contentRef.current) reactToPrintFn();
  };

  const updatedBillTransaction = useMemo(
    () =>
      fileDetails?.deliveryDate
        ? {
            title: fileName,
            details: fileInfo?.itemName,
            value: balanceValue,
            date: fileDetails.deliveryDate,
          }
        : null,
    [fileName, fileInfo?.itemName, balanceValue, fileDetails?.deliveryDate],
  );

  const handleUpdateTransaction = () => {
    if (updatedBillTransaction) {
      updateTransaction(
        'importer',
        fileInfo.importer,
        'bill',
        `${fileYear}-${fileNo}`,
        updatedBillTransaction,
      );
    }
  };

  const isTransactionUpdated =
    updatedBillTransaction && importerTransactionInfo
      ? updatedBillTransaction.title === importerTransactionInfo.title &&
        updatedBillTransaction.details === importerTransactionInfo.details &&
        updatedBillTransaction.value === importerTransactionInfo.value &&
        updatedBillTransaction.date === importerTransactionInfo.date
      : false;

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || fileLoading) return <Loading />;

  if (!user) return null;

  return (
    <Layout breadcrumb={breadcrumb}>
      <div className={'flex flex-col h-full'}>
        {fileInfo && (
          <div className="wrap flex flex-wrap  items-center pb-2 gap-1 divide-x-2 divide-slate-400">
            <div className="flex space-x-1 pr-1">
              <DetailsDialog
                fileNo={fileNo}
                fileYear={fileYear}
                fileInfo={fileInfo}
                fileDetails={fileDetails}
              />
              <ExpenseDialog
                fileNo={fileNo}
                fileYear={fileYear}
                type="duty"
                data={dutyData}
                title="Duty"
              />
            </div>
            {isAdmin && (
              <div className="flex space-x-1 items-center pr-1">
                <div>Expense</div>
                <ExpenseDialog
                  fileNo={fileNo}
                  fileYear={fileYear}
                  type="port"
                  data={portExpenseData}
                  title="Port"
                />
                <ExpenseDialog
                  fileNo={fileNo}
                  fileYear={fileYear}
                  type="custom"
                  data={customExpenseData}
                  title="Custom"
                />
                <ExpenseDialog
                  fileNo={fileNo}
                  fileYear={fileYear}
                  type="other"
                  data={otherExpenseData}
                  title="Other"
                />
                <ExpenseDialog
                  fileNo={fileNo}
                  fileYear={fileYear}
                  type="delivery"
                  data={deliveryExpenseData}
                  title="Delivery"
                />
              </div>
            )}
            {isAdmin && (
              <div className="flex space-x-1 items-center">
                <PaidDialog
                  fileNo={fileNo}
                  fileYear={fileYear}
                  fileDetails={fileDetails}
                />
                {fileInfo && fileDetails && importerInfo && (
                  <Button aria-label="Print file details" onClick={handlePrint}>
                    <FaPrint /> Print
                  </Button>
                )}
                <Button
                  aria-label="Toggle print layout"
                  onClick={() => setShowPrintLayout((prev) => !prev)}
                >
                  {showPrintLayout ? <FaAlignLeft /> : <FaPrint />}
                  Layout
                </Button>
                {fileDetails?.deliveryDate && !isTransactionUpdated && (
                  <Button onClick={handleUpdateTransaction}>
                    {!importerTransactionInfo
                      ? 'Add Balance to Transaction'
                      : 'Update Balance in Transaction'}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        <ScrollArea className={'grow -mr-4 pr-4 mb-2'}>
          {fileError ? (
            <CardIcon
              title={'Error'}
              description={
                fileError.message ?? 'Error occurred. Please try again'
              }
            >
              <MdError size={28} />
            </CardIcon>
          ) : !fileInfo || !importerInfo ? (
            <CardIcon title={`File not found`}>
              <MdError size={28} />
            </CardIcon>
          ) : (
            <div>
              <div
                className={`${
                  showPrintLayout ? 'hidden' : ''
                } grid grid-cols-1 lg:grid-cols-8 xl:grid-cols-12 gap-2`}
              >
                <CardSection
                  title={fileName}
                  className="col-span-1 lg:col-span-5"
                  contentClassName="flex flex-col divide-y divide-slate-500"
                >
                  <FileInfoRow
                    title="Importer"
                    value={fileInfo.importer}
                    className="font-bold"
                  />
                  <FileInfoRow
                    title="Package Details"
                    value={fileInfo.itemPackage}
                  />
                  <FileInfoRow title="Item Details" value={fileInfo.itemName} />
                  <FileInfoRow title="B/L No" value={fileInfo?.bl} />
                  <FileInfoRow title="LC No" value={fileInfo?.lc} />
                  <FileInfoRow title="Vessel" value={fileDetails?.vessel} />
                  <FileInfoRow title="Rotation No" value={fileDetails?.rotNo} />
                  {fileDetails?.cnfValue != null &&
                    fileDetails.cnfValue !== 0 && (
                      <FileInfoRow
                        title="C&F Value"
                        value={formatCurrency(fileDetails.cnfValue, 2)}
                      />
                    )}
                  {fileDetails?.assessableValue != null &&
                    fileDetails.assessableValue !== 0 && (
                      <FileInfoRow
                        title="Assessable Value"
                        value={formatCurrency(fileDetails.assessableValue, 2)}
                      />
                    )}
                  {(fileInfo?.be || fileInfo?.be !== 0) && (
                    <FileInfoRow title="B/E No" value={`C-${fileInfo.be}`} />
                  )}
                  <FileInfoRow title="B/E Date" value={fileDetails?.beDate} />
                  <FileInfoRow
                    title="Assessment Date"
                    value={fileDetails?.assessmentDate}
                  />
                  <FileInfoRow
                    title="Duty Payment Date"
                    value={fileDetails?.dutyPaymentDate}
                  />
                  <FileInfoRow
                    title="Delivery Date"
                    value={fileDetails?.deliveryDate}
                  />
                  {fileInfo?.note && (
                    <FileInfoRow title="Note" value={fileInfo?.note} />
                  )}
                </CardSection>

                {dutyData && dutyData.length !== 0 && (
                  <CardSection
                    title="Duty"
                    className="col-span-1 lg:col-span-3"
                    contentClassName="flex flex-col divide-y divide-slate-500"
                  >
                    {fileDetails?.assessmentRef &&
                      fileDetails.assessmentRef !== 0 && (
                        <FileInfoRow
                          title="Assessment Reference"
                          value={`A-${fileDetails.assessmentRef}`}
                        />
                      )}
                    {fileDetails?.dutyRef && fileDetails.dutyRef !== 0 && (
                      <FileInfoRow
                        title="Release Order No"
                        value={`R-${fileDetails.dutyRef}`}
                      />
                    )}
                    {dutyData.map((item, index) => (
                      <div key={index}>
                        <FileInfoRow
                          title={item.val().details}
                          value={formatCurrency(item.val().value, 2)}
                        />
                      </div>
                    ))}
                    {totalDuty !== 0 && (
                      <FileInfoRow
                        title="Total Duty"
                        value={formatCurrency(totalDuty, 2)}
                        className="font-bold"
                      />
                    )}
                    {fileDetails?.dutyPaid && (
                      <FileInfoRow
                        title="Duty Paid Details"
                        value={fileDetails?.dutyPaid}
                      />
                    )}
                  </CardSection>
                )}

                {isAdmin && (
                  <CardSection
                    title="Total"
                    className="col-span-1 lg:col-span-4"
                    contentClassName="flex flex-col divide-y divide-slate-500"
                  >
                    {miscellaneousValue !== 0 && (
                      <FileInfoRow
                        title="Miscellaneous Expense"
                        value={formatCurrency(miscellaneousValue, 2)}
                      />
                    )}
                    {commissionValue !== 0 && (
                      <FileInfoRow
                        title="Agency Commission"
                        value={formatCurrency(commissionValue, 2)}
                      />
                    )}
                    <FileInfoRow
                      title={'Total'}
                      value={formatCurrency(totalValue, 2)}
                    />
                    <FileInfoRow
                      title={'Paid'}
                      value={formatCurrency(paidValue, 2)}
                    />
                    <FileInfoRow
                      title={'Balance'}
                      value={formatCurrency(totalValue - paidValue, 2)}
                    />
                    {fileDetails?.remarks && (
                      <div className="flex">
                        <div className="grow">Remarks</div>
                        <pre className="font-sans text-sm py-1">
                          {fileDetails.remarks}
                        </pre>
                      </div>
                    )}
                  </CardSection>
                )}
                {isAdmin && (
                  <ExpenseSection
                    title="Port Expense"
                    data={portExpenseData}
                    total={totalPortExpense}
                  />
                )}
                {isAdmin && (
                  <ExpenseSection
                    title="Custom Expense"
                    data={customExpenseData}
                    total={totalCustomExpense}
                  />
                )}
                {isAdmin && (
                  <ExpenseSection
                    title="Other Expense"
                    data={otherExpenseData}
                    total={totalOtherExpense}
                  />
                )}
                {isAdmin && (
                  <ExpenseSection
                    title="Delivery Expense"
                    data={deliveryExpenseData}
                    total={totalDeliveryExpense}
                  />
                )}
              </div>
              <div
                className={cn('flex flex-col gap-2 print:block', {
                  hidden: !showPrintLayout,
                })}
                ref={contentRef}
              >
                <table role="table" className="w-full table border-collapse">
                  <tbody className="border-4 border-double border-accent-foreground">
                    <PrintHeaderRow />

                    <tr className="border-4 border-double border-accent-foreground leading-5.5 text-[15px]">
                      <td className={'p-2 space-y-2'} colSpan={3}>
                        <div className={'flex space-x-2'}>
                          <div className="w-3/10 p-1 rounded-md border-2 border-accent-foreground flex flex-col items-center justify-center text-center">
                            <div>{fileInfo.itemPackage}</div>
                            <div>{fileInfo.itemName}</div>
                            {fileInfo.lc && fileInfo.lc != 0 ? (
                              <div>{`LC No. ${fileInfo.lc}`}</div>
                            ) : null}
                          </div>
                          <div className="w-2/5 py-2 px-1 rounded-md border-2 border-accent-foreground text-center leading-5">
                            <div className="font-bold text-xl leading-8 uppercase">
                              {fileInfo.importer}
                            </div>
                            <div>{importerInfo?.address1}</div>
                            <div>{importerInfo?.address2}</div>
                          </div>
                          <div className="w-3/10 p-2 rounded-md border-2 border-accent-foreground flex flex-col items-center justify-center">
                            <div className="flex flex-row  w-full space-x-2">
                              <div className="grow">BILL NO.</div>
                              <div className="flex-wrap">{fileName}</div>
                            </div>
                            {fileDetails?.deliveryDate && (
                              <div className="flex flex-row w-full space-x-2">
                                <div className="grow">DATE:</div>
                                <div className="flex-wrap">
                                  {format(
                                    parse(
                                      fileDetails.deliveryDate,
                                      'dd/MM/yy',
                                      new Date(),
                                    ),
                                    'dd/MM/yyyy',
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {(fileInfo?.bl ||
                            fileDetails?.vessel ||
                            fileDetails?.rotNo) && (
                            <div className="w-3/10 p-2 flex flex-col items-center justify-center rounded-md border-2 border-accent-foreground">
                              {fileDetails && fileDetails.vessel && (
                                <div>{fileDetails.vessel}</div>
                              )}
                              {fileDetails && fileDetails.rotNo && (
                                <div>{`ROT NO: ${fileDetails.rotNo}`}</div>
                              )}
                              {fileInfo && fileInfo.bl && (
                                <div>{`B/L: ${fileInfo.bl}`}</div>
                              )}
                            </div>
                          )}
                          {(fileInfo.be ||
                            fileDetails?.cnfValue ||
                            fileDetails?.assessableValue ||
                            fileDetails?.beDate) && (
                            <div className="w-2/5 p-2 flex flex-col items-center justify-center rounded-md border-2 border-accent-foreground">
                              {fileDetails?.cnfValue && (
                                <div className="flex flex-row w-full space-x-2">
                                  <div className="grow">C&F VALUE:</div>
                                  <div className="flex-wrap">
                                    {formatCurrency(
                                      fileDetails.cnfValue,
                                      2,
                                      '$',
                                    )}
                                  </div>
                                </div>
                              )}
                              {fileDetails?.assessableValue && (
                                <div className="flex flex-row w-full space-x-2">
                                  <div className="grow">ASSESSABLE VALUE:</div>
                                  <div className="flex-wrap">
                                    {formatCurrency(
                                      fileDetails.assessableValue,
                                      2,
                                    )}
                                  </div>
                                </div>
                              )}
                              {fileInfo?.be &&
                              fileInfo.be !== 0 &&
                              fileDetails?.beDate ? (
                                <div className="flex flex-row w-full space-x-2">
                                  <div className="grow">{`B/E No. C-${fileInfo.be}`}</div>
                                  <div className="flex-wrap">{`DATE: ${fileDetails.beDate}`}</div>
                                </div>
                              ) : null}
                            </div>
                          )}
                          {fileDetails &&
                            (fileDetails?.assessmentDate ||
                              fileDetails?.dutyPaymentDate ||
                              fileDetails?.deliveryDate) && (
                              <div className="w-3/10 p-2 flex flex-col items-center justify-center rounded-md border-2 border-accent-foreground">
                                {fileDetails?.assessmentDate && (
                                  <div className="flex flex-row w-full space-x-1">
                                    <div className="grow">ASSESSMENT:</div>
                                    <div className="flex-wrap">
                                      {fileDetails.assessmentDate}
                                    </div>
                                  </div>
                                )}
                                {fileDetails?.dutyPaymentDate && (
                                  <div className="flex flex-row w-full space-x-1">
                                    <div className="grow">DUTY PAYMENT:</div>
                                    <div className="flex-wrap">
                                      {fileDetails.dutyPaymentDate}
                                    </div>
                                  </div>
                                )}
                                {fileDetails?.deliveryDate && (
                                  <div className="flex flex-row w-full space-x-1">
                                    <div className="grow">DELIVERY:</div>
                                    <div className="flex-wrap">
                                      {fileDetails.deliveryDate}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </td>
                    </tr>

                    <PrintDutyRow
                      data={dutyData}
                      dutyRef={fileDetails?.dutyRef}
                      assessmentRef={fileDetails?.assessmentRef}
                      paid={fileDetails?.dutyPaid}
                      total={totalDuty}
                    />
                    <PrintExpenseRow
                      data={staffExpenseData}
                      total={totalStaffExpense}
                    />
                    <PrintExpenseRow
                      data={portExpenseData}
                      total={totalPortExpense}
                    />
                    <PrintExpenseRow
                      data={customExpenseData}
                      total={totalCustomExpense}
                    />
                    <PrintExpenseRow
                      data={otherExpenseData}
                      total={totalOtherExpense}
                    />
                    <PrintExpenseRow
                      data={deliveryExpenseData}
                      total={totalDeliveryExpense}
                    />

                    <PrintSingleExpenseRow
                      title={
                        'Automation, Photo Copy, Conveyance, Courier, Document, Bank'
                      }
                      value={miscellaneousValue}
                    />
                    <PrintSingleExpenseRow
                      title={`Agency Commission ${
                        minCommission ? '(Minimum)' : ''
                      }`}
                      value={commissionValue}
                    />

                    <PrintTotalRow
                      remarks={fileDetails?.remarks}
                      total={totalValue}
                      paid={paidValue}
                      balance={balanceValue}
                    />
                  </tbody>
                </table>

                <div className="flex flex-col space-y-8 text-end pt-2 pr-8">
                  <div>Ahsan Enterprise</div>
                  <div>Proprietor</div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </Layout>
  );
}
