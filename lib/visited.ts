interface LastVisited {
  objectId: string;
  objectName: string;
  objectType: string;
}

interface VisitedData {
  rooms: string[];
  phones: string[];
  objects: string[];
  lastRoom?: { roomId: string; roomName: string };
  lastVisited?: LastVisited;
}

const STORAGE_PREFIX = 'csz_visited_';
const ACTIVE_SESSION_KEY = 'csz_active_session';

function getKey(sessionId: string) {
  return `${STORAGE_PREFIX}${sessionId}`;
}

export function getVisited(sessionId: string): VisitedData {
  if (typeof window === 'undefined') {
    return { rooms: [], phones: [], objects: [] };
  }
  try {
    const raw = localStorage.getItem(getKey(sessionId));
    if (!raw) return { rooms: [], phones: [], objects: [] };
    const parsed = JSON.parse(raw) as Partial<VisitedData>;
    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      phones: Array.isArray(parsed.phones) ? parsed.phones : [],
      objects: Array.isArray(parsed.objects) ? parsed.objects : [],
      lastRoom: parsed.lastRoom,
      lastVisited: parsed.lastVisited,
    };
  } catch {
    return { rooms: [], phones: [], objects: [] };
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

export function markObjectVisited(sessionId: string, objectId: string, objectName: string, objectType: string) {
  setActiveSession(sessionId);
  const data = getVisited(sessionId);

  if (!data.objects.includes(objectId)) {
    data.objects.push(objectId);
  }

  // Sync with legacy arrays for backwards compat
  if (objectType === 'room' && !data.rooms.includes(objectId)) {
    data.rooms.push(objectId);
    data.lastRoom = { roomId: objectId, roomName: objectName };
  }
  if (objectType === 'phone' && !data.phones.includes(objectId)) {
    data.phones.push(objectId);
  }

  data.lastVisited = { objectId, objectName, objectType };
  save(sessionId, data);
}

export function getLastVisited(sessionId: string): LastVisited | null {
  const data = getVisited(sessionId);
  return data.lastVisited ?? null;
}
