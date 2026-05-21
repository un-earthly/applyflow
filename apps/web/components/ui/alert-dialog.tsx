"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

function AlertDialog(props: React.ComponentProps<typeof Dialog>): React.ReactElement {
  return <Dialog {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof DialogTrigger>): React.ReactElement {
  return <DialogTrigger {...props} />
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof DialogContent>): React.ReactElement {
  return (
    <DialogContent
      showCloseButton={false}
      className={cn("sm:max-w-md", className)}
      {...props}
    />
  )
}

function AlertDialogHeader(props: React.ComponentProps<typeof DialogHeader>): React.ReactElement {
  return <DialogHeader {...props} />
}

function AlertDialogFooter(props: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end", props.className)}
      {...props}
    />
  )
}

function AlertDialogTitle(props: React.ComponentProps<typeof DialogTitle>): React.ReactElement {
  return <DialogTitle {...props} />
}

function AlertDialogDescription(props: React.ComponentProps<typeof DialogDescription>): React.ReactElement {
  return <DialogDescription {...props} />
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  return (
    <Button
      className={className}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  return (
    <Button
      variant="outline"
      className={className}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
}
