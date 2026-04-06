import 'server-only';

import caseZero from '@/data/cases/case-zero.json';

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

  const local = resolveLocal(sessionCode, normalizedCode);
  if (local) return local;

  return null;
}
