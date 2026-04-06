'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadCase } from '@/lib/case-loader';
import { getObject } from '@/lib/case-cache';
import { markObjectVisited } from '@/lib/visited';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { RoomRenderer } from '@/components/object-renderers/RoomRenderer';
import { PhoneRenderer } from '@/components/object-renderers/PhoneRenderer';
import type { SceneObject, RoomContent, PhoneContent } from '@/types/scene-object';

export default function ObjectPage() {
  const params = useParams<{ sessionId: string; objectId: string }>();
  const { sessionId, objectId } = params;
  const [obj, setObj] = useState<SceneObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await loadCase('case-zero');
        if (cancelled) return;
        const found = getObject('case-zero', objectId);
        if (!found) {
          setError('Object not found');
        } else {
          setObj(found);
          markObjectVisited(sessionId, found.id, found.name, found.type);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load case');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId, objectId]);

  if (loading) {
    return (
      <div className="full-screen flex items-center justify-center bg-bg-primary">
        <p className="font-mono text-text-mono text-sm tracking-widest terminal-glow">
          LOADING...
        </p>
      </div>
    );
  }

  if (error || !obj) {
    return (
      <div className="full-screen flex flex-col items-center justify-center gap-4 bg-bg-primary px-8">
        <p className="font-mono text-sm tracking-widest text-accent-red">ERROR</p>
        <p className="text-center font-body text-sm text-text-secondary">
          {error ?? 'Object not found.'}
        </p>
      </div>
    );
  }

  return (
    <>
      {obj.type === 'room' ? (
        <>
          <RoomRenderer
            objectId={obj.id}
            content={obj.content as RoomContent}
            name={obj.name}
            shortCode={obj.shortCode}
            order={obj.order}
          />
          <BottomTabBar sessionId={sessionId} roomId={obj.id} />
        </>
      ) : obj.type === 'phone' ? (
        <PhoneRenderer objectId={obj.id} content={obj.content as PhoneContent} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-sm text-white/40">UNSUPPORTED OBJECT TYPE</p>
        </div>
      )}
    </>
  );
}
