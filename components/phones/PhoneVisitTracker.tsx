'use client';

import { useEffect } from 'react';
import { getActiveSession, markPhoneVisited } from '@/lib/visited';

export function PhoneVisitTracker({ phoneId }: { phoneId: string }) {
  useEffect(() => {
    const sessionId = getActiveSession();
    if (sessionId) {
      markPhoneVisited(sessionId, phoneId);
    }
  }, [phoneId]);

  return null;
}
