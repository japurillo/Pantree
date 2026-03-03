'use client'

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react"
import { ReactNode } from "react"
import PendingInviteHandler from "@/components/PendingInviteHandler"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function ConvexProvider({ children }: { children: ReactNode }) {
  return (
    <BaseConvexProvider client={convex}>
      <PendingInviteHandler />
      {children}
    </BaseConvexProvider>
  )
}
