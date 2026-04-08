import Link from "next/link";
import { SignupForm } from "@/components/chat/signup-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <SignupForm />
        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link className="text-emerald-600" href="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
