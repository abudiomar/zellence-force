"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button, Drawer, IconButton, ScreenState } from "@zellforce/ui";
import type { AuthenticatedUser } from "@zellforce/contracts";
import type { AppLocale } from "../i18n/config";
import { authClient } from "../auth/auth-client";
import { getCurrentActor } from "../auth/api";
import { getProtectedViewState } from "../auth/auth-flow";
import { visibleAppNavItems } from "../navigation/app-nav";
import { LocaleDensityControls } from "./app-shell/locale-density-controls";

export function ProtectedShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("app");
  const [sessionPending, setSessionPending] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [actor, setActor] = useState<AuthenticatedUser | null>(null);
  const [actorPending, setActorPending] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const state = getProtectedViewState(sessionPending, hasSession ? { session: true } : null);

  useEffect(() => {
    setDensity(document.documentElement.dataset.density === "compact" ? "compact" : "comfortable");
  }, []);

  useEffect(() => {
    let active = true;
    void authClient
      .getSession()
      .then((result) => {
        if (active) {
          setHasSession(Boolean(result.data));
        }
      })
      .catch(() => {
        if (active) {
          setHasSession(false);
        }
      })
      .finally(() => {
        if (active) {
          setSessionPending(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

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
    return (
      <main className="center-state">
        <ScreenState state="loading" title={t("loading")} />
      </main>
    );
  }

  const navItems = visibleAppNavItems(actor.role);
  const nav = (
    <nav className="app-nav" aria-label="Primary">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={() => setNavOpen(false)}
          >
            <Icon size={18} aria-hidden />
            <span>{t(item.labelKey.replace("app.", ""))}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <strong>{t("brand")}</strong>
          <span>{t("operations")}</span>
        </div>
        {nav}
      </aside>
      <section className="app-main">
        <header className="app-topbar">
          <IconButton className="mobile-menu" label="Open navigation" onClick={() => setNavOpen(true)}>
            <Menu size={18} aria-hidden />
          </IconButton>
          <div>
            <strong>{actor.fullName}</strong>
            <span dir="ltr">{actor.email}</span>
          </div>
          <LocaleDensityControls locale={locale} density={density} />
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.replace("/login")
                }
              })
            }
          >
            {t("signOut")}
          </Button>
        </header>
        <div className="app-content">{children}</div>
      </section>
      <Drawer open={navOpen} title={t("brand")} onOpenChange={setNavOpen}>
        {nav}
      </Drawer>
    </main>
  );
}
