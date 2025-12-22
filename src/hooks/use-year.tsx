import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getCurrentYear } from '@/lib/utils';

export function useYear(validYears: number[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentYear = getCurrentYear();
  const [year, setYear] = useState(currentYear);

  useEffect(() => {
    const selectedYear = searchParams.get('year');

    if (selectedYear) {
      const newYear = Number(selectedYear);

      if (validYears.includes(newYear)) {
        setYear(newYear);
      } else {
        setYear(currentYear);
        router.replace(pathname);
      }
    } else {
      setYear(currentYear);
    }
  }, [searchParams, validYears, router, currentYear, pathname]);

  const changeYear = (newYear: number) => {
    setYear(newYear);
    router.replace(`${pathname}?year=${newYear}`);
  };

  return { year, changeYear };
}
