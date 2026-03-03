'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useUser, SignInButton } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { Users, Loader2, AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

const PENDING_INVITE_KEY = 'pantree_pending_invite'

interface JoinFamilyClientProps {
  inviteCode: string
}

export default function JoinFamilyClient({ inviteCode }: JoinFamilyClientProps) {
  const router = useRouter()
  const { isLoaded: clerkLoaded, isSignedIn, user: clerkUser } = useUser()
  const { user: convexUser } = useCurrentUser()
  const [error, setError] = useState<string | null>(null)
  const joinAttempted = useRef(false)

  const familyInfo = useQuery(api.auth.getFamilyByInviteCode, { inviteCode })
  const joinFamily = useMutation(api.auth.joinFamily)

  // Persist invite code so it survives redirects away from this page
  useEffect(() => {
    sessionStorage.setItem(PENDING_INVITE_KEY, inviteCode)
  }, [inviteCode])

  // Auto-join as soon as Convex user is ready
  useEffect(() => {
    if (!convexUser || !clerkUser || !familyInfo || joinAttempted.current) return
    joinAttempted.current = true

    joinFamily({ clerkId: clerkUser.id, inviteCode })
      .then(() => {
        sessionStorage.removeItem(PENDING_INVITE_KEY)
        router.push('/dashboard')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to join family')
        joinAttempted.current = false
      })
  }, [convexUser, clerkUser, familyInfo, joinFamily, inviteCode, router])

  // Still loading Clerk or family info
  if (!clerkLoaded || familyInfo === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Invalid invite code
  if (familyInfo === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invite Link</h1>
            <p className="text-gray-600 mb-6">
              This invite link is invalid or has expired. Please ask your family admin for a new link.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Join {familyInfo.name}
            </h1>
            <p className="text-gray-600 mb-1">
              You&apos;ve been invited to join a family on PanTree.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {familyInfo.memberCount} {familyInfo.memberCount === 1 ? 'member' : 'members'}
            </p>
            <SignInButton
              mode="modal"
              forceRedirectUrl={`/join/${inviteCode}`}
              signUpForceRedirectUrl={`/join/${inviteCode}`}
            >
              <button className="w-full px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium">
                Sign In to Join
              </button>
            </SignInButton>
            <p className="text-xs text-gray-500 mt-4">
              Don&apos;t have an account? You can sign up after clicking the button above.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated — show error if join failed, otherwise show joining state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Unable to Join</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated — waiting for Convex user creation + auto-join
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-500">
          {convexUser ? `Joining ${familyInfo.name}...` : 'Setting up your account...'}
        </p>
      </div>
    </div>
  )
}
