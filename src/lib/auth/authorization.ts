import { getSession } from "@/lib/auth/session";

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
