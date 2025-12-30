'use client';

import Layout from '@/components/layout';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Loading from '@/components/loading';
import { useEffect } from 'react';
import { useList } from 'react-firebase-hooks/database';
import { getCurrentYear, getDatabaseReference } from '@/lib/utils';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import CardIcon from '@/components/card/card-icon';
import { MdChangeCircle, MdError, MdFileOpen } from 'react-icons/md';
import InputDropDown from '@/components/generic/input-dropdown';
import { useYear } from '@/hooks/use-year';
import { BreadcrumbInterface } from '@/lib/interfaces';
import AddRequisitionDialog from './add-requisition-dialog';
import { DataSnapshot } from 'firebase/database';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import ChangeRefDialog from './change-ref-dialog';
import DeleteRequisitionDialog from './delete-requisition-dialog';

const breadcrumb: BreadcrumbInterface[] = [
  { label: 'Home', href: '/' },
  { label: 'P/O Requisition' },
];

const currentYear = getCurrentYear();
const getYearsRange = (start = 2024, end = currentYear) =>
  Array.from({ length: end - start + 1 }, (_, i) => ({
    value: String(start + i),
  })).reverse();
const validYears = getYearsRange().map((y) => Number(y.value));

export default function RequisitionPage() {
  const { user, userLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { year, changeYear } = useYear(validYears);

  const [requisitionData, requisitionLoading, requisitionError] = useList(
    getDatabaseReference(`requisition/${year}`),
  );

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }
  }, [user, userLoading, router, isAdmin]);

  if (userLoading || !isAdmin) return <Loading />;

  return (
    <Layout breadcrumb={breadcrumb}>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex flex-wrap items-baseline space-x-2">
          <InputDropDown
            label={'Year'}
            className="max-w-full w-36"
            options={getYearsRange()}
            value={year.toString()}
            onChange={(e) => changeYear(Number(e.target.value))}
          />

          <AddRequisitionDialog year={year} />
        </div>
        <ScrollArea className={'grow overflow-auto -mr-4 pr-4'}>
          {requisitionLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : requisitionError ? (
            <CardIcon
              title={'Error'}
              description={
                requisitionError?.message ??
                'Unexpected error. Please try again.'
              }
            >
              <MdError size={28} />
            </CardIcon>
          ) : !requisitionData || requisitionData.length === 0 ? (
            <CardIcon title={`No data found for ${year}`}>
              <MdError size={28} />
            </CardIcon>
          ) : (
            <div
              className={
                'grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-2'
              }
            >
              {requisitionData.map((item) => {
                return (
                  <RequisitionCard
                    key={item.key}
                    ref={item.key!}
                    year={year}
                    data={item}
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

function RequisitionCard({
  ref,
  year,
  data,
}: {
  ref: string;
  year: number;
  data: DataSnapshot;
}) {
  const val = data.val();
  return (
    <Card className="col-span-1 backdrop-blur-sm overflow-hidden p-2 transition-all duration-150 border border-slate-500 hover:border-blue-500 gap-0">
      <div className="w-full flex items-center justify-between">
        <div className="wrap font-bold font-mono border border-slate-500 rounded-lg text-center p-1 text-lg">
          AE/POR/{ref}/{year}
        </div>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Link href={`/po-requisition/${year}-${ref}`} className="">
                  <MdFileOpen
                    className={`size-8 p-1 border border-card-foreground text-card-foreground rounded-md cursor-pointer hover:bg-card-foreground/20`}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent>View Requisition Letter</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ChangeRefDialog year={year} ref={ref} />
          <DeleteRequisitionDialog year={year} ref={ref} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {val.files &&
          Object.keys(val.files).map((fileNo) => (
            <Badge key={fileNo}>{fileNo}</Badge>
          ))}
      </div>
    </Card>
  );
}
