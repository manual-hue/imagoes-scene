import mockCase from '@/data/mock-case.json';

interface MockSessionData {
  id: string;
  name: string;
  sessionCode: string;
}

interface MockPhoneRef {
  id: string;
  name: string;
  owner: string;
  device: string;
}

interface MockRoomRef {
  id: string;
  name: string;
  shortCode: string;
  order: number;
}

interface MockCaseData {
  session: MockSessionData;
  rooms: MockRoomRef[];
  phones?: MockPhoneRef[];
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

export function getLocalRooms(sessionId: string) {
  if (!isLocalSessionId(sessionId)) return [];
  return localCase.rooms.map((room) => ({
    id: room.id,
    name: room.name,
    shortCode: room.shortCode,
    order: room.order,
  }));
}

export function getLocalPhones(sessionId: string): MockPhoneRef[] {
  if (!isLocalSessionId(sessionId)) return [];
  return (localCase.phones ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    owner: p.owner,
    device: p.device,
  }));
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
