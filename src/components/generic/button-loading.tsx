import { Button } from "@/components/ui/button";

type ButtonLoadingProps = {
  type: "submit" | "reset" | "button" | undefined;
	loading: boolean;
  text: string;
  loadingText: string;
  className?: string;
};

export function ButtonLoading({type, loading, text, loadingText, className} : ButtonLoadingProps) {
  return (
    <Button type={type} className={`transition-all duration-150 ${className}`} disabled={loading }>
      {loading && (
        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
      )}
      {loading ? loadingText : text}
    </Button>
  )
}