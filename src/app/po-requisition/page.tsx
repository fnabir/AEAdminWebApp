import { Suspense } from 'react';
import Loading from '@/components/loading';
import RequisitionPageClient from './requisition-page-client';

export default function RequisitionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <RequisitionPageClient />
    </Suspense>
  );
}
