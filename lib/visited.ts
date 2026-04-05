interface VisitedData {
  rooms: string[];
  phones: string[];
  lastRoom?: { roomId: string; roomName: string };
}

const STORAGE_PREFIX = 'csz_visited_';
const ACTIVE_SESSION_KEY = 'csz_active_session';

function getKey(sessionId: string) {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function getVisited(sessionId: string): VisitedData {
  if (typeof window === 'undefined') {
    return { rooms: [], phones: [] };
  }
  try {
    const raw = localStorage.getItem(getKey(sessionId));
    if (!raw) return { rooms: [], phones: [] };
    const parsed = JSON.parse(raw) as Partial<VisitedData>;
    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      phones: Array.isArray(parsed.phones) ? parsed.phones : [],
    };
  } catch {
    return { rooms: [], phones: [] };
  }
}

function save(sessionId: string, data: VisitedData) {
  try {
    localStorage.setItem(getKey(sessionId), JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function setActiveSession(sessionId: string) {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
  } catch {
    // silently fail
  }
}

export function getActiveSession(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function markRoomVisited(sessionId: string, roomId: string, roomName?: string) {
  setActiveSession(sessionId);
  const data = getVisited(sessionId);
  if (!data.rooms.includes(roomId)) {
    data.rooms.push(roomId);
  }
  if (roomName) {
    data.lastRoom = { roomId, roomName };
  }
  save(sessionId, data);
}

export function getLastVisitedRoom(sessionId: string): { roomId: string; roomName: string } | null {
  const data = getVisited(sessionId);
  return data.lastRoom ?? null;
}

export function markPhoneVisited(sessionId: string, phoneId: string) {
  const data = getVisited(sessionId);
  if (!data.phones.includes(phoneId)) {
    data.phones.push(phoneId);
    save(sessionId, data);
  }
}
