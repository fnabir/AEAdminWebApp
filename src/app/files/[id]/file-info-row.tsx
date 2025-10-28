type Props = {
  title: string;
  value: string | number | undefined;
  className?: string;
};

export const FileInfoRow: React.FC<Props> = ({ title, value, className }) => {
  if (value === undefined || value === null || value === '' || value === 0)
    return null;
  return (
    <div className={`flex text-sm md:text-base ${className}`}>
      <div className="flex-wrap">{title}</div>
      <pre className="flex-auto text-right whitespace-pre-wrap wrap-break-word">
        {value}
      </pre>
    </div>
  );
};
