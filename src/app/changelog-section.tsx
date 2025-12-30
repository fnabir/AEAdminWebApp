import { Card, CardContent } from '@/components/ui/card';
import packageJson from '../../package.json';
import { format } from 'date-fns';

type ChangelogItem = {
  date: string;
  details: string[];
};

const changelog: Record<string, ChangelogItem> = {
  '1.3.0': {
    date: '2025-12-30',
    details: [
      '[ADMIN][FEATURE] Add P/O Requisition Page.',
      '[ADMIN][FIX] Fixed alignment issues in the expense and balance of file print layout.',
      '[FIX] Resolved a logic error to ensure accurate duty totals when values are set to zero.',
    ],
  },
  '1.2.2': {
    date: '2025-12-07',
    details: [
      '[ADMIN][UPDATE] Add option to insert and delete expense row.',
      '[ADMIN][UPDATE] Change currency symbol for print.',
    ],
  },
  '1.2.1': {
    date: '2025-12-04',
    details: [
      '[UPDATE] Change file duty input dialog to update value automatically based on percentage.',
      '[ADMIN][FIX] Delete file was available to non-admin users.',
      '[FIX] Adding new file not accepting file no input after first time.',
    ],
  },
  '1.2.0': {
    date: '2025-11-30',
    details: [
      '[FEATURE] Swap file no option.',
      '[ADMIN][FEATURE] Delete file option.',
      '[UPDATE] File can be added back up to 2021.',
      '[UPDATE] Duty and Port input field will take up to 10 entries.',
      '[FIX] New file without status not showed until all the filters are disabled.',
    ],
  },
  '1.1.0': {
    date: '2025-10-29',
    details: ['[FEATURE] Note option for files.'],
  },
};

export function getChangelog(version: string): ChangelogItem | null {
  return changelog[version] ?? null;
}

export default function ChangelogSection({ isAdmin }: { isAdmin: boolean }) {
  const versionLog = changelog[packageJson.version] ?? null;

  const filteredDetails =
    versionLog?.details.filter((detail) => {
      return detail.startsWith('[ADMIN]') ? isAdmin : true;
    }) ?? [];

  function renderDetail(detail: string, index: number) {
    const cleanDetail = detail.replace('[ADMIN]', '').trim();

    const tagMatch = cleanDetail.match(/^\[(.*?)\]/);
    const tag = tagMatch ? tagMatch[1] : null;

    const message = tagMatch
      ? cleanDetail.replace(tagMatch[0], '').trim()
      : cleanDetail;

    return (
      <div key={index} className="py-1 space-x-2">
        {tag && (
          <span
            className={`font-semibold ${
              tag === 'FEATURE'
                ? 'text-green-500'
                : tag === 'UPDATE'
                ? 'text-sky-500'
                : tag === 'FIX'
                ? 'text-red-500'
                : 'text-gray-500'
            }`}
          >
            [{tag}]
          </span>
        )}

        <span className="text-slate-800 dark:text-slate-200">{message}</span>
      </div>
    );
  }
  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="-m-2 p-0 text-center">
        <div className="bg-secondary p-2 border-b border-slate-700/50">
          <div className="text-center">
            <div className="text-sm">VERSION</div>
            <div className="text-3xl font-mono text-cyan-500">
              {packageJson.version}
            </div>
            <div className="text-sm text-secondary-foreground">
              {format(new Date(versionLog.date), 'dd MMMM yyyy')}
            </div>
          </div>
        </div>
        <div className="p-4 text-sm text-start bg-white dark:bg-transparent">
          {versionLog && filteredDetails.length > 0 ? (
            filteredDetails.map((detail, index) => renderDetail(detail, index))
          ) : (
            <div className="py-1">No changelog available for this version.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
