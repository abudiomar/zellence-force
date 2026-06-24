"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  side = "end",
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "start" | "end" | "top" | "bottom" }) {
  const sideClass =
    side === "start"
      ? "inset-y-0 start-0 h-full w-[min(88vw,360px)]"
      : side === "end"
        ? "inset-y-0 end-0 h-full w-[min(88vw,420px)]"
        : side === "top"
          ? "inset-x-0 top-0"
          : "inset-x-0 bottom-0";
  // Slide direction follows the panel edge; start/end are RTL-aware (start = right in RTL).
  const sideAnim =
    side === "start"
      ? "ltr:data-[state=open]:slide-in-from-left ltr:data-[state=closed]:slide-out-to-left rtl:data-[state=open]:slide-in-from-right rtl:data-[state=closed]:slide-out-to-right"
      : side === "end"
        ? "ltr:data-[state=open]:slide-in-from-right ltr:data-[state=closed]:slide-out-to-right rtl:data-[state=open]:slide-in-from-left rtl:data-[state=closed]:slide-out-to-left"
        : side === "top"
          ? "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top"
          : "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom";
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#171513]/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 overflow-auto border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-[hsl(var(--foreground))] shadow-xl ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-300 data-[state=closed]:duration-200",
          sideClass,
          sideAnim,
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute end-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]">
          <X className="size-4" />
          <span className="zf-sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export function Drawer({ open, title, children, onOpenChange }: { open: boolean; title: string; children: React.ReactNode; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="start">
        <SheetTitle className="mb-4 text-lg font-semibold">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
