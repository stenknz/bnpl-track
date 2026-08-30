"use client";

import { useSession } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div>
        <h1 className="text-lg font-semibold text-brand-500 dark:text-brand-300">DueFlow</h1>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {session?.user && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {session.user.name || session.user.email}
          </span>
        )}
      </div>
    </header>
  );
}
