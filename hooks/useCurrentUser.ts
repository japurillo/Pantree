'use client'
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function useCurrentUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();

  const convexUser = useQuery(
    api.auth.getUserByClerkId,
    isLoaded && isSignedIn && clerkUser
      ? { clerkId: clerkUser.id }
      : "skip"
  );

  const createUser = useMutation(api.auth.createUserFromClerk);

  // Auto-create Convex user if Clerk user exists but no Convex record
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser && convexUser === null) {
      createUser({
        clerkId: clerkUser.id,
        username: clerkUser.username || clerkUser.firstName || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
      });
    }
  }, [isLoaded, isSignedIn, clerkUser, convexUser, createUser]);

  return {
    user: convexUser,
    clerkUser,
    isLoaded: isLoaded && convexUser !== undefined,
    isSignedIn: isSignedIn ?? false,
    userId: convexUser?._id,
    role: convexUser?.role,
    username: convexUser?.username || clerkUser?.username || clerkUser?.firstName,
  };
}
