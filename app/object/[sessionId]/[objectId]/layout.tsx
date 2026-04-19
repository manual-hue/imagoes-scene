import { TimerWidget } from '@/components/timer/TimerWidget';
import { SirenOverlay } from '@/components/timer/SirenOverlay';
import { ScreenshotButton } from '@/components/evidence/ScreenshotButton';

interface ObjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    sessionId: string;
    objectId: string;
  }>;
}

export default async function ObjectLayout({ children, params }: ObjectLayoutProps) {
  const { sessionId, objectId } = await params;

  return (
    <div className="room-layout">
      <div className="room-shell">
        <div className="pointer-events-auto absolute right-3 top-3 z-[60] flex items-start gap-2">
          <ScreenshotButton sessionId={sessionId} objectId={objectId} />
          <TimerWidget sessionId={sessionId} />
        </div>
        {children}
      </div>
      <SirenOverlay sessionId={sessionId} />
    </div>
  );
}
