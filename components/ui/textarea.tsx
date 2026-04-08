import { cn } from "@/lib/utils/cn";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-20 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900",
        props.className,
      )}
    />
  );
}
