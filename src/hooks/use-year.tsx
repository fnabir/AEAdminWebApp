import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getCurrentYear } from '@/lib/utils';

export function useYear(validYears: number[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentYear = useMemo(() => getCurrentYear(), []);
  const yearParam = searchParams.get('year');

  const [year, setYear] = useState<number>(currentYear);

  useEffect(() => {
    if (!yearParam) {
      if (year !== currentYear) setYear(currentYear);
      return;
    }

    const parsed = Number(yearParam);

    if (Number.isNaN(parsed) || !validYears.includes(parsed)) {
      if (year !== currentYear) setYear(currentYear);

      const params = new URLSearchParams(searchParams);
      params.delete('year');
      router.replace(`${pathname}?${params.toString()}`);

      return;
    }

    if (parsed !== year) {
      setYear(parsed);
    }
  }, [
    yearParam,
    validYears,
    currentYear,
    year,
    router,
    pathname,
    searchParams,
  ]);

  const changeYear = (newYear: number) => {
    if (newYear === year || !validYears.includes(newYear)) return;

    const params = new URLSearchParams(searchParams);
    params.set('year', String(newYear));

    setYear(newYear);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return { year, changeYear };
}
