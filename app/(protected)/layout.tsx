import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionByToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect('/admin/login');
  const session = await getSessionByToken(token);
  if (!session) redirect('/admin/login');
  return children;
}
