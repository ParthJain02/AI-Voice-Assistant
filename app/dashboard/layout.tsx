import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
