"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { Button } from "./button";
import { cn } from "../lib/utils";

export const AlertDialogRoot = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export function AlertDialogContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45" />
      <AlertDialogPrimitive.Content className={cn("fixed left-1/2 top-1/2 z-50 grid w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl", className)} {...props} />
    </AlertDialogPrimitive.Portal>
  );
}

export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;

export function AlertDialog({ open, title, description, actionLabel, cancelLabel, onAction, onOpenChange }: {
  open: boolean;
  title: string;
  description: string;
  actionLabel: string;
  cancelLabel: string;
  onAction: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialogRoot open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-[hsl(var(--muted-foreground))]">{description}</AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel asChild><Button variant="secondary">{cancelLabel}</Button></AlertDialogCancel>
          <AlertDialogAction asChild><Button variant="danger" onClick={onAction}>{actionLabel}</Button></AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}
