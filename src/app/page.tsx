'use client';

import Layout from '@/components/layout';
import Loading from '@/components/loading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  formatCurrency,
  getCurrentYear,
  getDatabaseReference,
} from '@/lib/utils';
import Link from '@/components/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useList, useListKeys, useObject } from 'react-firebase-hooks/database';
import { IconType } from 'react-icons';
import { child, DataSnapshot, get } from 'firebase/database';
import {
  FaBookOpen,
  FaBriefcase,
  FaRegEye,
  FaRegEyeSlash,
  FaRegUser,
} from 'react-icons/fa6';
import { FaRegMoneyBillAlt } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import ChangelogSection from './changelog-section';
import { BreadcrumbInterface } from '@/lib/interfaces';
import { FileInfoType } from '@/lib/types';
import CardSection from '@/components/card/card-section';

type KeyCount = {
  key: string;
  count: number;
};

const breadcrumb: BreadcrumbInterface[] = [{ label: 'Home' }];
const currentYear = getCurrentYear();

export default function Home() {
  const { user, userLoading, isAdmin, isStaff } = useAuth();
  const router = useRouter();

  const [counts, setCounts] = useState<KeyCount[]>([]);

  const [fileLastYear, fileLastYearLoading] = useList(
    getDatabaseReference(`files/info/${currentYear - 1}`),
  );
  const [fileCurrentYear, fileCurrentYearLoading] = useList(
    getDatabaseReference(`files/info/${currentYear}`),
  );
  const [importerBalanceData, importerBalanceLoading] = useObject(
    getDatabaseReference(`balance/total/importer`),
  );
  const [totalStaffBalanceData, totalStaffBalanceLoading] = useObject(
    getDatabaseReference(`balance/total/staff`),
  );
  const [staffBalanceData, staffBalanceLoading] = useObject(
    getDatabaseReference(`balance/staff/${user?.uid}`),
  );
  const [requisitionData = [], requisitionLoading] = useListKeys(
    getDatabaseReference('requisition'),
  );

  useEffect(() => {
    if (requisitionLoading || !requisitionData) return;

    async function loadCounts() {
      const results = await Promise.all(
        requisitionData.map(async (key) => {
          const snapshot = await get(
            child(getDatabaseReference('files/info'), key),
          );

          return {
            key,
            count: snapshot.exists() ? snapshot.size : 0,
          };
        }),
      );

      setCounts(results);
    }

    loadCounts();
  }, [requisitionData, requisitionLoading]);

  const highestCount =
    counts.length > 0 ? Math.max(...counts.map((item) => item.count)) : 0;

  const getInitialShowBalance = () => {
    if (typeof window !== 'undefined') {
      const storedShowBalance = localStorage.getItem('showBalance');
      return storedShowBalance !== null ? storedShowBalance === 'true' : true;
    }
    return true;
  };

  const [showBalance, setShowBalance] = useState<boolean>(
    getInitialShowBalance,
  );

  const toggleShowBalance = () => {
    setShowBalance((prev) => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('showBalance', String(newValue));
      }
      return newValue;
    });
  };

  const fileCount = fileCurrentYear?.length || 0;

  const statusFiles = useMemo(() => {
    const statusMap: Record<string, (FileInfoType & { key: string })[]> = {
      new: [],
      assessment: [],
      dutyPayment: [],
      delivery: [],
      done: [],
    };

    const files = [...(fileCurrentYear || []), ...(fileLastYear || [])];

    files.forEach((item) => {
      const val = item.val();
      const status = val?.status?.replace(/\s+/g, '').toLowerCase();
      if (status && status in statusMap) {
        statusMap[status as keyof typeof statusMap].push({
          key: item.key,
          year: currentYear,
          ...val,
        });
      }
    });

    return statusMap;
  }, [fileCurrentYear, fileLastYear]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading) return <Loading />;

  if (!user) return null;

  return (
    <Layout breadcrumb={breadcrumb}>
      <div className={'flex flex-col h-full space-y-2'}>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <Card className="backdrop-blur-sm overflow-hidden">
              <div className="-z-1 absolute -top-5 -right-5 size-30 rounded-full opacity-40 blur-2xl bg-cyan-500" />
              <CardHeader className="flex items-center border-b-2 border-slate-700 pb-3">
                <CardTitle className="text-xl lg:text-2xl font-semibold w-full flex items-center justify-center space-x-2">
                  <div>Balance</div>
                  <div className="grow">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleShowBalance}
                      className="text-primary hover:bg-primary-foreground border-slate-500"
                    >
                      {showBalance ? (
                        <FaRegEye className="size-5" />
                      ) : (
                        <FaRegEyeSlash className="size-5" />
                      )}
                      <span className="sr-only">Toggle Show Balance</span>
                    </Button>
                  </div>
                  <FaRegMoneyBillAlt className="size-7 text-cyan-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {isAdmin && (
                    <BalanceCard
                      data={importerBalanceData}
                      link="importer"
                      loading={importerBalanceLoading}
                      icon={FaBriefcase}
                      showBalance={showBalance}
                    />
                  )}

                  {isAdmin && (
                    <BalanceCard
                      data={totalStaffBalanceData}
                      link="staff"
                      loading={totalStaffBalanceLoading}
                      icon={FaRegUser}
                      showBalance={showBalance}
                    />
                  )}

                  {isStaff && (
                    <BalanceCard
                      data={staffBalanceData}
                      header={user?.displayName ?? 'User'}
                      link={`staff/${user.uid}`}
                      loading={staffBalanceLoading}
                      icon={FaRegUser}
                      showBalance={showBalance}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <CardSection
              title="Job Files"
              backdropColor="bg-blue-500"
              icon={FaBookOpen}
              iconColor="text-blue-500"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 border-b-2 border-slate-700 pb-6">
                <FileCard
                  title="Total Files"
                  value={fileCount}
                  year={currentYear}
                  loading={fileCurrentYearLoading}
                />
                <FileCard
                  title="Last Year Files"
                  value={fileLastYear?.length || 0}
                  year={currentYear - 1}
                  loading={fileLastYearLoading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 py-6">
                {Object.entries(statusFiles).map(
                  ([status, files]) =>
                    status !== 'done' && (
                      <FileStatus
                        key={`status-${status}`}
                        title={status.replace(/([A-Z])/g, ' $1').trim()}
                        files={files}
                        loading={fileCurrentYearLoading}
                      />
                    ),
                )}
              </div>
            </CardSection>
          </div>

          <div className="col-span-12 lg:col-span-3 space-y-6 pb-6">
            <ChangelogSection isAdmin={isAdmin} />

            <CardSection title="Status Overview" contentClassName="space-y-2">
              {Object.entries(statusFiles).map(
                ([status, files], index) =>
                  status !== 'done' && (
                    <FileStatusCount
                      key={status}
                      index={index}
                      title={status.replace(/([A-Z])/g, ' $1').trim()}
                      count={files.length}
                      total={fileCount - (statusFiles['done']?.length || 0)}
                      loading={fileCurrentYearLoading}
                    />
                  ),
              )}
            </CardSection>

            {isAdmin && (
              <Link href={'/po-requisition'}>
                <CardSection
                  title="P/O Requisition"
                  className="hover:border-sky-500"
                  contentClassName="space-y-2"
                >
                  {requisitionData.length == 0 ? (
                    <p>No data available</p>
                  ) : (
                    counts
                      .sort((a, b) => Number(b.key) - Number(a.key))
                      .map((item, index) => (
                        <FileStatusCount
                          key={item.key}
                          index={index}
                          title={item.key}
                          count={item.count}
                          total={highestCount}
                          loading={requisitionLoading}
                        />
                      ))
                  )}
                </CardSection>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FileCard({
  title,
  value,
  year,
  loading,
}: {
  title: string;
  value: number;
  year: number;
  loading: boolean;
}) {
  return loading ? (
    <Skeleton className="min-h-24 rounded-lg" />
  ) : (
    <Link
      className={`bg-secondary/50 rounded-lg border border-sky-700 p-4 relative overflow-hidden hover:bg-secondary`}
      href={`/files?year=${year}`}
    >
      <div className="flex">
        <div className="grow flex flex-col">
          <div>{title}</div>
          <div className="text-4xl font-bold">{value}</div>
        </div>
        <div className="text-4xl font-bold text-secondary-foreground/50 -m-2">
          {year}
        </div>
      </div>
    </Link>
  );
}

function FileStatus({
  title,
  files,
  loading,
}: {
  title: string;
  files: (FileInfoType & { key: string })[];
  loading: boolean;
}) {
  return loading ? (
    <Skeleton className="min-h-36 rounded-lg" />
  ) : (
    <div className="p-2 bg-secondary rounded-lg border border-slate-500 overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b-2 border-slate-500">
        <div className="capitalize">{title}</div>
        <div className="size-6 flex items-center justify-center bg-card border border-blue-500 rounded-full">
          {files?.length}
        </div>
      </div>
      <div className="divide-y divide-slate-500">
        {files.map((file) => (
          <div key={file.key} className="flex items-center space-x-2">
            <div className="w-8 text-center">{file.key}</div>
            <div className="text-sm w-full overflow-hidden py-2">
              <div className="font-semibold">{file.importer}</div>
              <div className="text-xs truncate whitespace-nowrap">
                {file.itemName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileStatusCount({
  index,
  title,
  count,
  total,
  loading,
}: {
  index: number;
  title: string;
  count: number;
  total: number;
  loading: boolean;
}) {
  const getColor = () => {
    switch (index) {
      case 0:
        return 'from-cyan-500 to-blue-500';
      case 1:
        return 'from-green-500 to-emerald-500';
      case 2:
        return 'from-blue-500 to-indigo-500';
      case 3:
        return 'from-purple-500 to-pink-500';
    }
  };

  return loading ? (
    <Skeleton className="min-h-9 rounded-lg" />
  ) : (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="capitalize">{title}</div>
        <div className="text-secondary-foreground">{count}</div>
      </div>
      <div className="h-2 bg-slate-500/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-linear-to-r ${getColor()} rounded-full transition-all duration-700`}
          style={{ width: `${(count / total) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function BalanceCard({
  data,
  header,
  link,
  icon: Icon,
  loading,
  showBalance,
}: {
  data: DataSnapshot | undefined;
  header?: string;
  link: string;
  icon: IconType;
  loading: boolean;
  showBalance: boolean;
}) {
  const snapshot = data?.val();
  return loading ? (
    <Skeleton className="min-h-30 rounded-lg" />
  ) : data ? (
    <Link
      className={`bg-secondary/50 rounded-lg border border-cyan-700 p-4 relative overflow-hidden hover:bg-secondary`}
      href={link}
    >
      <div className="capitalize">{header ?? link}</div>
      <div className="text-3xl font-bold mb-1">
        {showBalance ? formatCurrency(snapshot?.value ?? 0) : '---'}
      </div>
      {snapshot?.date && (
        <div className="text-sm text-secondary-foreground">
          {showBalance ? `Last updated on ${snapshot.date}` : '--------'}
        </div>
      )}
      <div className="absolute top-4 right-4 flex items-center">
        <Icon className={`size-6 text-cyan-600 dark:text-cyan-400`} />
      </div>
      <div className="absolute -top-6 -right-6 size-20 rounded-full bg-linear-to-r opacity-40 blur-2xl from-cyan-500 to-blue-500" />
    </Link>
  ) : null;
}
