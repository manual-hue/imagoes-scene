import 'server-only';

import caseZero from '@/data/cases/case-zero.json';
import { resolveRoomByCode } from '@/lib/firebase/rooms';

interface ResolvedObject {
  sessionId: string;
  objectId: string;
  sessionCode: string;
  objectCode: string;
}

interface CaseJsonObject {
  id: string;
  type: string;
  shortCode: string;
}

interface CaseJson {
  sessionCode: string;
  sessionId: string;
  objects: CaseJsonObject[];
}

const localCase = caseZero as CaseJson;

function resolveLocal(sessionCode: string, objectCode: string): ResolvedObject | null {
  if (sessionCode.toUpperCase() !== localCase.sessionCode.toUpperCase()) return null;

  const obj = localCase.objects.find(
    (o) => o.shortCode.toUpperCase() === objectCode.toUpperCase(),
  );
  if (!obj) return null;

  return {
    sessionId: localCase.sessionId,
    objectId: obj.id,
    sessionCode: localCase.sessionCode,
    objectCode: obj.shortCode,
  };
}

export async function resolveObjectByCode(
  sessionCode: string,
  objectCode: string,
): Promise<ResolvedObject | null> {
  const normalizedCode = objectCode.trim().toUpperCase();

  // Try local case first
  const local = resolveLocal(sessionCode, normalizedCode);
  if (local) return local;

  // For room-type codes (R##), fall back to existing Firebase resolver
  if (/^R\d{2}$/.test(normalizedCode)) {
    const resolved = await resolveRoomByCode(sessionCode, normalizedCode);
    if (resolved) {
      return {
        sessionId: resolved.sessionId,
        objectId: resolved.roomId,
        sessionCode: resolved.sessionCode,
        objectCode: resolved.roomCode,
      };
    }
  }

  return null;
}
