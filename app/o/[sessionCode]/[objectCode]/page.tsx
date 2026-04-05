import { notFound, redirect } from 'next/navigation';
import { resolveObjectByCode } from '@/lib/resolve-object';

interface RedirectPageProps {
  params: Promise<{
    sessionCode: string;
    objectCode: string;
  }>;
}

export default async function ObjectRedirectPage({ params }: RedirectPageProps) {
  const { sessionCode, objectCode } = await params;
  const resolved = await resolveObjectByCode(sessionCode, objectCode);

  if (!resolved) {
    notFound();
  }

  redirect(`/object/${resolved.sessionId}/${resolved.objectId}`);
}
