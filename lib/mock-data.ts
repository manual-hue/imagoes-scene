import mockCase from '@/data/mock-case.json';
import type { Room } from '@/types/room';

interface MockSessionData {
  id: string;
  name: string;
  sessionCode: string;
}

interface MockRoomData extends Omit<Room, 'createdAt' | 'clues'> {
  createdAt: string;
}

interface MockPhoneRef {
  id: string;
  name: string;
  owner: string;
  device: string;
}

interface MockCaseData {
  session: MockSessionData;
  rooms: MockRoomData[];
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

export function getLocalRoom(sessionId: string, roomId: string) {
  if (!isLocalSessionId(sessionId)) {
    return null;
  }

  const room = localCase.rooms.find((item) => item.id === roomId);
  if (!room) {
    return null;
  }

  return {
    room,
  };
}

export function resolveLocalRoomByCode(sessionCode: string, roomCode: string) {
  if (!isLocalSessionCode(sessionCode)) {
    return null;
  }

  const room = localCase.rooms.find(
    (item) => item.shortCode.trim().toUpperCase() === roomCode.trim().toUpperCase(),
  );

  if (!room) {
    return null;
  }

  return {
    sessionId: localCase.session.id,
    roomId: room.id,
    sessionCode: localCase.session.sessionCode,
    roomCode: room.shortCode,
  };
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
    rooms: localCase.rooms
      .map((room) => ({
        id: room.id,
        name: room.name,
        shortCode: room.shortCode,
        order: room.order,
      }))
      .sort((a, b) => a.order - b.order),
  };
}
