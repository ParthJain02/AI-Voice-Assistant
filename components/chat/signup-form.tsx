"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, email, password }),
    });

    if (!response.ok) {
      const json = await response.json();
      setError(json.error || "Unable to sign up");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <form onSubmit={submit} className="space-y-3">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" required />
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
        <Input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password (8+ characters)"
          type="password"
          required
          minLength={8}
        />
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </Card>
  );
}
