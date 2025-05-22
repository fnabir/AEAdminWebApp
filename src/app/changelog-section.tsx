import { Card, CardContent } from '@/components/ui/card';
import packageJson from '../../package.json';
import { format } from 'date-fns';

type ChangelogItem = {
  access?: boolean;
  details: string;
};

function getChangelog(isAdmin: boolean): Record<string, ChangelogItem[]> {
  return {
    added: [
    ],
    changed: [
      {
        access: isAdmin,
        details: "Loading winodow now shows up as soon as the page found and fades out at the end."
      }
    ],
    fixed: [
      {
        access: isAdmin,
        details: "Changing year to see the files would create another entry to url history. Thus clicking back would take through the change of years in the same page."
      }
    ],
  };
}

function ChangelogCategory({ title, items }: { title: string, items: ChangelogItem[] }) {
  const visibleItems = items.filter((item) => item.access ?? true);
  if (visibleItems.length === 0) return null;

  return (
    <div className="pb-1">
      <div className="uppercase">{title}</div>
      <ul className="list-disc ml-5 my-1 space-y-1 text-sm">
        {visibleItems.map((item, i) => (
          <li key={i}>{item.details}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ChangelogSection({ isAdmin }: { isAdmin: boolean }) {
  const changelog = getChangelog(isAdmin);

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="-m-2 p-0 text-center">
        <div className="bg-secondary p-2 border-b border-slate-700/50">
          <div className="text-center">
            <div className="text-sm">VERSION</div>
            <div className="text-3xl font-mono text-cyan-500">{packageJson.version}</div>
            <div className="text-sm text-secondary-foreground">{format(new Date(packageJson.releaseDate), "dd MMMM yyyy")}</div>
          </div>
        </div>
        <div className="p-4 text-sm text-start divide-y divide-slate-500 space-y-1">
          {Object.entries(changelog).map(([key, items]) => (
            <ChangelogCategory key={key} title={key} items={items} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}