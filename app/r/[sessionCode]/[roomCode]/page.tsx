import { notFound, redirect } from 'next/navigation';
import { resolveRoomByCode } from '@/lib/firebase/rooms';

interface RedirectPageProps {
  params: Promise<{
    sessionCode: string;
    roomCode: string;
  }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { sessionCode, roomCode } = await params;
  const resolvedRoom = await resolveRoomByCode(sessionCode, roomCode);

  if (!resolvedRoom) {
    notFound();
  }

  redirect(`/room/${resolvedRoom.sessionId}/${resolvedRoom.roomId}`);
}
