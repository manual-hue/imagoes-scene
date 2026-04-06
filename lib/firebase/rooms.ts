import 'server-only';

import { getLocalSessionQRPayload } from '@/lib/mock-data';
import caseZero from '@/data/cases/case-zero.json';
import type { Session } from '@/types/session';

export interface QRPrintableObject {
  id: string;
  name: string;
  shortCode: string;
  order: number;
  type: string;
}

export interface SessionQRPayload {
  sessionId: string;
  sessionName: string;
  sessionCode: string;
  objects: QRPrintableObject[];
}

function getLocalObjects(sessionId: string): QRPrintableObject[] {
  const caseData = caseZero as { sessionId: string; objects: Array<{ id: string; name: string; shortCode: string; order: number; type: string }> };
  if (caseData.sessionId !== sessionId) return [];
  return caseData.objects.map((o) => ({
    id: o.id,
    name: o.name,
    shortCode: o.shortCode,
    order: o.order,
    type: o.type,
  }));
}

export async function getSessionQRPayload(sessionId: string): Promise<SessionQRPayload | null> {
  const localPayload = getLocalSessionQRPayload(sessionId);
  if (localPayload) {
    return {
      sessionId: localPayload.sessionId,
      sessionName: localPayload.sessionName,
      sessionCode: localPayload.sessionCode,
      objects: getLocalObjects(sessionId),
    };
  }

  const { adminFirestore } = await import('@/lib/firebase-admin');
  const sessionDoc = await adminFirestore.collection('sessions').doc(sessionId).get();

  if (!sessionDoc.exists) {
    return null;
  }

  const session = sessionDoc.data() as Session;

  return {
    sessionId: sessionDoc.id,
    sessionName: session.name,
    sessionCode: session.sessionCode,
    objects: getLocalObjects(sessionId),
  };
}
