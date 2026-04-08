import Link from "next/link";
import { LoginForm } from "@/components/chat/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />
        <p className="text-center text-sm text-zinc-500">
          New here? <Link className="text-emerald-600" href="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
