'use client'

import { useState } from 'react'
import { X, Copy, RefreshCw, Check, Users } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { userId } = useCurrentUser()
  const [copied, setCopied] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const inviteCode = useQuery(api.auth.getInviteCode, userId ? { userId } : "skip")
  const regenerateInviteCode = useMutation(api.auth.regenerateInviteCode)

  const handleCopy = async () => {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRegenerate = async () => {
    if (!userId) return
    setIsRegenerating(true)
    try {
      await regenerateInviteCode({ userId })
    } catch (error) {
      console.error('Failed to regenerate invite code:', error)
    } finally {
      setIsRegenerating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                Invite Family Member
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Share this invite code with family members. They can sign up through the app and enter this code to join your family.
              </p>

              {/* Invite Code Display */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Family Invite Code
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-white border border-gray-300 rounded-md px-4 py-3 text-center">
                    <span className="text-2xl font-mono font-bold tracking-widest text-gray-900">
                      {inviteCode ?? '...'}
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy invite code"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Share the invite code with your family member</li>
                  <li>They sign up for an account on the app</li>
                  <li>They enter the invite code to join your family</li>
                  <li>They get access to your shared pantry</li>
                </ol>
              </div>

              {/* Regenerate Button */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-500">
                  Regenerating will invalidate the current code
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Regenerating...' : 'Regenerate Code'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
