import { TimerWidget } from '@/components/timer/TimerWidget';
import { SirenOverlay } from '@/components/timer/SirenOverlay';

interface RoomLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    sessionId: string;
    roomId: string;
  }>;
}

export default async function RoomLayout({
  children,
  params,
}: RoomLayoutProps) {
  const { sessionId } = await params;

  return (
    <div className="room-layout">
      <div className="room-shell">
        <TimerWidget sessionId={sessionId} />
        {children}
      </div>
      <SirenOverlay sessionId={sessionId} />
    </div>
  );
}
