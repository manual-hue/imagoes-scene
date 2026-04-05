import type { CaseData, SceneObject } from '@/types/scene-object';

const memoryCache = new Map<string, CaseData>();
const STORAGE_PREFIX = 'csz_case_';

function storageKey(caseId: string) {
  return `${STORAGE_PREFIX}${caseId}`;
}

export function setCaseInCache(caseData: CaseData) {
  memoryCache.set(caseData.caseId, caseData);
  try {
    localStorage.setItem(storageKey(caseData.caseId), JSON.stringify(caseData));
  } catch {
    // localStorage full — memory cache still works
  }
}

export function getCaseFromCache(caseId: string): CaseData | null {
  const mem = memoryCache.get(caseId);
  if (mem) return mem;

  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(caseId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CaseData;
    memoryCache.set(caseId, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function getObject(caseId: string, objectId: string): SceneObject | null {
  const c = getCaseFromCache(caseId);
  return c?.objects.find((o) => o.id === objectId) ?? null;
}

export function getObjectByCode(caseId: string, shortCode: string): SceneObject | null {
  const c = getCaseFromCache(caseId);
  const code = shortCode.trim().toUpperCase();
  return c?.objects.find((o) => o.shortCode.toUpperCase() === code) ?? null;
}

export function getAllObjects(caseId: string): SceneObject[] {
  const c = getCaseFromCache(caseId);
  return c?.objects ?? [];
}
