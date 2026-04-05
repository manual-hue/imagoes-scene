import { TimerWidget } from '@/components/timer/TimerWidget';
import { SirenOverlay } from '@/components/timer/SirenOverlay';

interface ObjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    sessionId: string;
    objectId: string;
  }>;
}

export default async function ObjectLayout({ children, params }: ObjectLayoutProps) {
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
