import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySignedSessionToken } from "@/lib/auth/session";

export async function getServerAuthSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySignedSessionToken(token);
}
