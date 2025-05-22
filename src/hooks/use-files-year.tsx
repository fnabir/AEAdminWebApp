import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCurrentYear } from "@/lib/utils";

export function useFilesYear(validYears: number[]) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        router.replace("/files");
      }
    } else {
      setYear(currentYear);
    }
  }, [searchParams, validYears, router, currentYear]);

  const changeYear = (newYear: number) => {
    setYear(newYear);
    router.replace(`?year=${newYear}`);
  };

  return { year, changeYear };
}