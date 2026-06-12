"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@zellforce/contracts";
import { authClient } from "../auth/auth-client";
import { getCurrentActor } from "../auth/api";
import { getProtectedViewState } from "../auth/auth-flow";
import { visibleSettingsLinks } from "../auth/navigation";

export function ProtectedShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = authClient.useSession();
  const [actor, setActor] = useState<AuthenticatedUser | null>(null);
  const [actorPending, setActorPending] = useState(true);
  const state = getProtectedViewState(session.isPending, session.data);

  useEffect(() => {
    if (state === "redirect") {
      router.replace("/login");
      return;
    }
    if (state === "authenticated") {
      void getCurrentActor()
        .then((value) => {
          if (!value) {
            router.replace("/login");
            return;
          }
          setActor(value);
        })
        .finally(() => setActorPending(false));
    }
  }, [router, state]);

  if (state !== "authenticated" || actorPending || !actor) {
    return <main className="center-state">Loading...</main>;
  }

  const settingsLinks = visibleSettingsLinks(actor.role);
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <strong>Zell-force</strong>
          <span>{actor.fullName}</span>
        </div>
        <nav aria-label="Primary">
          <Link href="/">Operations</Link>
          {settingsLinks.includes("users") ? (
            <Link href="/settings/users">Users</Link>
          ) : null}
          {settingsLinks.includes("general") ? (
            <Link href="/settings/general">Settings</Link>
          ) : null}
          <button
            type="button"
            onClick={() =>
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.replace("/login")
                }
              })
            }
          >
            Sign out
          </button>
        </nav>
      </header>
      {children}
    </main>
  );
}
