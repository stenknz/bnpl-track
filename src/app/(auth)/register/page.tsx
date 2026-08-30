"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-5 shadow-lg shadow-brand-500/20">DF</div>
        <h1 className="font-display text-3xl font-bold text-white">Create an account</h1>
        <p className="text-brand-300 mt-2">Track your payments with ease</p>
      </div>

      <div className="bg-white dark:bg-[#1E1410] rounded-2xl p-8 border border-white/10 shadow-2xl shadow-black/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-brand-200">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-brand-200">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-brand-200">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors text-slate-900 dark:text-white"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-colors"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-brand-300 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-500 dark:text-brand-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
