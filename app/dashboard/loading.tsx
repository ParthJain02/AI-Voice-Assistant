export default function DashboardLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}
