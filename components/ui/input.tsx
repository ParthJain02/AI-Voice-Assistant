import { cn } from "@/lib/utils/cn";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900",
        props.className,
      )}
    />
  );
}
