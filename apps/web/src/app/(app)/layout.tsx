import type { ReactNode } from "react";
import { ProtectedShell } from "../../components/protected-shell";

// Shared layout for all authenticated routes. Rendering ProtectedShell here (rather
// than inside each page) keeps the sidebar/topbar mounted across navigations, so the
// session/actor fetch runs once and clicking a nav link only swaps {children}.
export default function AppLayout({ children }: { children: ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
