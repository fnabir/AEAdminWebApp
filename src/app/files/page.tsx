'use client';

import Layout from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import React, { useEffect, useMemo } from 'react';
import { useList } from 'react-firebase-hooks/database';
import { getCurrentYear, getDatabaseReference } from '@/lib/utils';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import CardIcon from '@/components/card/card-icon';
import { MdError, MdFileOpen } from 'react-icons/md';
import { DataSnapshot } from 'firebase/database';
import Link from '@/components/link';
import { Card } from '@/components/ui/card';
import { CopyText } from '@/components/generic/copy-text';
import InputDropDown from '@/components/generic/input-dropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import AddFileDialog from './add-file-dialog';
import { useYear } from '@/hooks/use-year';
import { BreadcrumbInterface } from '@/lib/interfaces';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ChangeFileNoDialog from './change-file-no-dialog';
import DeleteFileDialog from './delete-file-dialog';

const breadcrumb: BreadcrumbInterface[] = [
  { label: 'Home', href: '/' },
  { label: 'Files' },
];

const currentYear = getCurrentYear();
const getYearsRange = (start = 2021, end = currentYear) =>
  Array.from({ length: end - start + 1 }, (_, i) => ({
    value: String(start + i),
  })).reverse();
const validYears = getYearsRange().map((y) => Number(y.value));

export default function FilesPage() {
  const { user, userLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { year, changeYear } = useYear(validYears);

  const [statusFilters, setStatusFilters] = React.useState<string[]>([
    'new',
    'assessment',
    'duty payment',
    'delivery',
  ]);
  const [filesData, filesLoading, filesError] = useList(
    getDatabaseReference(`files/info/${year}`),
  );

  const reversedFilesData = useMemo(() => {
    return filesData?.slice().reverse() ?? [];
  }, [filesData]);

  const filteredFiles = useMemo(() => {
    if (!statusFilters.length) return reversedFilesData;

    return reversedFilesData.filter((file: DataSnapshot) => {
      const status = file.val()?.status?.toLowerCase();
      return statusFilters.includes(status);
    });
  }, [reversedFilesData, statusFilters]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading) return <Loading />;

  if (!user) return null;

  return (
    <Layout breadcrumb={breadcrumb}>
      <div className="flex flex-col h-full space-y-2">
        <div className="flex flex-wrap items-center space-x-2">
          <InputDropDown
            label={'Year'}
            className="max-w-full w-36 -translate-y-2"
            options={getYearsRange()}
            value={year.toString()}
            onChange={(e) => changeYear(Number(e.target.value))}
          />
          <AddFileDialog year={year} filesData={filesData} />
          <ChangeFileNoDialog year={year} filesData={filesData} />
          <ToggleGroup
            type="multiple"
            variant="outline"
            value={statusFilters}
            onValueChange={setStatusFilters}
          >
            <ToggleGroupItem value="new" aria-label="Toggle new">
              <div>New</div>
            </ToggleGroupItem>
            <ToggleGroupItem value="assessment" aria-label="Toggle assessment">
              <div>Assessment</div>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="duty payment"
              aria-label="Toggle duty payment"
            >
              <div>Duty Payment</div>
            </ToggleGroupItem>
            <ToggleGroupItem value="delivery" aria-label="Toggle delivery">
              <div>Delivery</div>
            </ToggleGroupItem>
            <ToggleGroupItem value="done" aria-label="Toggle done">
              <div>Done</div>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ScrollArea className={'grow overflow-auto -mr-4 pr-4'}>
          {filesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : filesError ? (
            <CardIcon
              title={'Error'}
              description={
                filesError?.message ?? 'Unexpected error. Please try again.'
              }
            >
              <MdError size={28} />
            </CardIcon>
          ) : !filesData || filesData.length === 0 ? (
            <CardIcon title={`No files found for ${year}`}>
              <MdError size={28} />
            </CardIcon>
          ) : (
            <div
              className={
                'grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-2'
              }
            >
              {filteredFiles.map((file: DataSnapshot) => {
                return (
                  <FilesCard
                    key={file.key}
                    fileNo={Number(file.key)}
                    fileYear={year}
                    data={file}
                    isAdmin={isAdmin}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </Layout>
  );
}

function FilesCard({
  fileNo,
  fileYear,
  data,
  isAdmin,
}: {
  fileNo: number;
  fileYear: number;
  data: DataSnapshot;
  isAdmin: boolean;
}) {
  const val = data.val();
  const bl = val.bl;
  const lc = val.lc;
  const be = val.be;
  const status = val.status;
  return (
    <Card className="col-span-1 backdrop-blur-sm overflow-hidden p-2 transition-all duration-150 border border-slate-500 hover:border-blue-500 gap-0">
      <div className="w-full flex items-center justify-between">
        <div className="wrap w-14 font-bold font-mono border border-slate-500 rounded-lg text-center p-1 text-lg">
          {fileNo}
        </div>
        {status && status !== 'Select' && (
          <Badge className="text-sm h-6">{status}</Badge>
        )}
        <div className="space-x-1.5">
          <Link href={`/files/${fileYear}-${fileNo}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <MdFileOpen
                    className={`size-8 p-1 border border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20`}
                  />
                </TooltipTrigger>
                <TooltipContent>View File Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Link>
          {isAdmin && <DeleteFileDialog year={fileYear} fileNo={fileNo} />}
        </div>
      </div>
      <div className="text-lg font-bold">{val.importer}</div>
      <div className="text-[15px]">{val.itemPackage}</div>
      <div className="text-[15px] truncate whitespace-nowrap">
        {val.itemName}
      </div>
      {bl && <CopyText text={`B/L: ${bl}`} copyText={bl} className="text-sm" />}
      <div className="flex divide-x divide-slate-500 text-sm">
        {be && be != 0 ? (
          <CopyText
            text={`B/E: ${be}`}
            copyText={be.toString()}
            className="mr-1"
          />
        ) : null}
        {lc && lc != 0 ? (
          <CopyText
            text={`LC: ${lc}`}
            copyText={lc.toString()}
            className="ml-1"
          />
        ) : null}
      </div>
      {val.note && (
        <div className="flex space-x-2">
          <div className="flex-wrap">Note: </div>
          <div className="flex-auto whitespace-pre-wrap wrap-break-word">
            {val.note}
          </div>
        </div>
      )}
    </Card>
  );
}
