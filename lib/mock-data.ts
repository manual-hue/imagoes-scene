import mockCase from '@/data/mock-case.json';

interface MockSessionData {
  id: string;
  name: string;
  sessionCode: string;
}

interface MockCaseData {
  session: MockSessionData;
}

const localCase = mockCase as MockCaseData;

export function isLocalSessionId(sessionId: string) {
  return sessionId === localCase.session.id;
}

export function isLocalSessionCode(sessionCode: string) {
  return sessionCode.trim().toUpperCase() === localCase.session.sessionCode;
}

export function getLocalSession() {
  return localCase.session;
}

export function getLocalSessionQRPayload(sessionId: string) {
  if (!isLocalSessionId(sessionId)) {
    return null;
  }

  return {
    sessionId: localCase.session.id,
    sessionName: localCase.session.name,
    sessionCode: localCase.session.sessionCode,
  };
}
