"use client";

import React, { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import { IconButton } from "@zellforce/ui/components/button";
import { Avatar, AvatarFallback } from "@zellforce/ui/components/avatar";
import { Drawer } from "@zellforce/ui/components/sheet";
import type { AuthenticatedUser } from "@zellforce/contracts";
import type { AppLocale } from "../i18n/config";
import { authClient } from "../auth/auth-client";
import { getCurrentActor } from "../auth/api";
import { getProtectedViewState } from "../auth/auth-flow";
import { visibleAppNavItems } from "../navigation/app-nav";
import { listWhatsAppInbox } from "../app/(app)/_workspace/api";
import { LocaleControls } from "./app-shell/locale-controls";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@zellforce/ui/components/dropdown-menu";

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
  const [urgentCount, setUrgentCount] = useState(0);
  const state = getProtectedViewState(sessionPending, hasSession ? { session: true } : null);

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

  // Surface the count of urgent WhatsApp messages as a sidebar badge so an
  // emergency interrupts wherever the manager is. Re-fetched on navigation so it
  // clears once they visit the inbox and the urgent items are handled.
  useEffect(() => {
    if (state !== "authenticated") return;
    let active = true;
    void listWhatsAppInbox()
      .then((messages) => {
        if (active) {
          setUrgentCount(messages.filter((message) => message.isEmergency).length);
        }
      })
      .catch(() => {
        if (active) setUrgentCount(0);
      });
    return () => {
      active = false;
    };
  }, [state, pathname]);

  if (state !== "authenticated" || actorPending || !actor) {
    return (
      <main className="center-state">
        <section className="screen-state">
          <div className="screen-state__spinner" aria-hidden />
          <h2>{t("loading")}</h2>
        </section>
      </main>
    );
  }

  const navItems = visibleAppNavItems(actor.role);
  // A nav item owns the current page when the path equals its href or sits below
  // it (e.g. /candidates/interviews -> Candidates, /settings/users -> Settings).
  // "/" is excluded from the prefix check so it doesn't swallow every route.
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ||
    (href === "/settings/general" && pathname.startsWith("/settings"));
  const nav = (
    <nav className="app-nav" aria-label="Primary">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            onClick={() => setNavOpen(false)}
          >
            <Icon size={18} aria-hidden />
            <span>{t(item.labelKey.replace("app.", ""))}</span>
            {item.id === "messages" && urgentCount > 0 ? (
              <span className="app-nav__badge" aria-label={`${urgentCount} urgent`}>{urgentCount}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
  const activeNavItem = navItems.find((item) => isActive(item.href)) ?? navItems[0];
  const pageTitle = activeNavItem ? t(activeNavItem.labelKey.replace("app.", "")) : t("main");
  const signOut = () =>
    void authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.replace("/login")
      }
    });

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
          <h1 className="shell-page-title">{pageTitle}</h1>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="shell-profile-trigger" type="button" aria-label={`${actor.fullName} profile menu`}>
                <Avatar className="profile-avatar">
                  <AvatarFallback>{getInitials(actor.fullName)}</AvatarFallback>
                </Avatar>
                <span>{actor.fullName}</span>
                <ChevronDown size={16} aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <span>{actor.fullName}</span>
                <span dir="ltr">{actor.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="profile-menu-locale">
                <LocaleControls locale={locale} />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={signOut}>
                <LogOut size={16} aria-hidden />
                <span>{t("signOut")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="app-content">{children}</div>
      </section>
      <Drawer open={navOpen} title={t("brand")} onOpenChange={setNavOpen}>
        {nav}
      </Drawer>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
