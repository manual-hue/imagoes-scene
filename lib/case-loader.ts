import type { CaseData } from '@/types/scene-object';
import { getCaseFromCache, setCaseInCache } from '@/lib/case-cache';

type ProgressCallback = (percent: number, label: string) => void;

export async function loadCase(
  caseId: string,
  onProgress?: ProgressCallback,
): Promise<CaseData> {
  const cached = getCaseFromCache(caseId);
  if (cached) {
    onProgress?.(100, 'complete');
    return cached;
  }

  onProgress?.(10, 'fetching');

  // For local/demo: dynamic import from bundled JSON
  const mod = await import('@/data/cases/case-zero.json');
  const raw = mod.default as CaseData;

  onProgress?.(60, 'parsing');

  const caseData: CaseData = {
    caseId: raw.caseId,
    caseName: raw.caseName,
    sessionCode: raw.sessionCode,
    sessionId: raw.sessionId,
    objects: raw.objects,
  };

  onProgress?.(90, 'indexing');

  setCaseInCache(caseData);

  onProgress?.(100, 'complete');

  return caseData;
}
