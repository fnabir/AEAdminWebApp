import { Button } from '@/components/ui/button';
export type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

type ButtonLoadingProps = ButtonProps & {
  loading?: boolean;
  loadingText?: string;
};

export function ButtonLoading({
  loading = false,
  loadingText = 'Loading...',
  children,
  ...props
}: ButtonLoadingProps) {
  return (
    <Button
      className={`transition-all duration-150`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
      )}
      {loading ? loadingText : children}
    </Button>
  );
}
