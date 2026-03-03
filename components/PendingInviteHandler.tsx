'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const PENDING_INVITE_KEY = 'pantree_pending_invite'

export default function PendingInviteHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const { user: clerkUser, isSignedIn, isLoaded } = useUser()
  const { user: convexUser } = useCurrentUser()
  const joinFamily = useMutation(api.auth.joinFamily)
  const joinAttempted = useRef(false)

  useEffect(() => {
    // Skip if we're already on the /join page — JoinFamilyClient handles it there
    if (pathname.startsWith('/join/')) return
    if (!isLoaded || !isSignedIn || !clerkUser || !convexUser) return
    if (joinAttempted.current) return

    const pendingCode = sessionStorage.getItem(PENDING_INVITE_KEY)
    if (!pendingCode) return

    joinAttempted.current = true

    joinFamily({ clerkId: clerkUser.id, inviteCode: pendingCode })
      .then(() => {
        sessionStorage.removeItem(PENDING_INVITE_KEY)
        router.push('/dashboard')
      })
      .catch(() => {
        // Clear the code so we don't retry forever on irrecoverable errors
        sessionStorage.removeItem(PENDING_INVITE_KEY)
        joinAttempted.current = false
      })
  }, [pathname, isLoaded, isSignedIn, clerkUser, convexUser, joinFamily, router])

  return null
}
