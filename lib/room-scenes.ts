import type { RoomScene } from '@/types/room';

const FALLBACK_THUMBNAILS = {
  bathroom: '/evidence/bathroom-clues.svg',
  'living-room': '/evidence/living-room-clues.svg',
  bedroom: '/evidence/bedroom-clues.svg',
} as const;

const ROOM_SCENES: Record<string, RoomScene> = {
  bathroom: {
    roomId: 'bathroom',
    clues: [
      {
        id: 'bath-mirror-fracture',
        title: 'Mirror fracture pattern',
        type: 'image',
        content: 'The mirror is fractured from a low-angle impact. Bright textile fibers are still lodged in the main crack.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bathroom,
        tags: ['mirror', 'impact', 'fiber'],
      },
      {
        id: 'bath-sink-print',
        title: 'Sink edge fingerprint',
        type: 'image',
        content: 'A partial print sits on the sink edge as if someone braced themselves while pivoting away from the basin.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bathroom,
        tags: ['sink', 'fingerprint'],
      },
      {
        id: 'bath-drain-hair',
        title: 'Drain hair sample',
        type: 'image',
        content: 'Several long strands are caught in the drain cover. Their texture does not match the victim record.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bathroom,
        tags: ['drain', 'hair'],
      },
      {
        id: 'bath-floor-button',
        title: 'Loose uniform button',
        type: 'document',
        content: 'A detached button rests beside the bath mat. The thread remnants suggest it was torn during a struggle.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bathroom,
        tags: ['floor', 'button', 'struggle'],
      },
    ],
    hotspots: [
      { id: 'bathroom-hotspot-1', clueId: 'bath-mirror-fracture', label: 'MIRROR', x: 21, y: 13, width: 27, height: 24 },
      { id: 'bathroom-hotspot-2', clueId: 'bath-sink-print', label: 'SINK', x: 50, y: 38, width: 18, height: 16 },
      { id: 'bathroom-hotspot-3', clueId: 'bath-drain-hair', label: 'DRAIN', x: 43, y: 63, width: 14, height: 12 },
      { id: 'bathroom-hotspot-4', clueId: 'bath-floor-button', label: 'FLOOR', x: 66, y: 70, width: 14, height: 14 },
    ],
  },
  'living-room': {
    roomId: 'living-room',
    clues: [
      {
        id: 'living-glass-stain',
        title: 'Spilled glass residue',
        type: 'image',
        content: 'Wine residue dried along the table edge, but the splash direction points away from the victim seat.',
        thumbnailUrl: FALLBACK_THUMBNAILS['living-room'],
        tags: ['table', 'glass', 'spill'],
      },
      {
        id: 'living-clock-stop',
        title: 'Stopped wall clock',
        type: 'image',
        content: 'The wall clock stopped at 8:17. The casing damage appears one-sided rather than from a full drop.',
        thumbnailUrl: FALLBACK_THUMBNAILS['living-room'],
        tags: ['clock', 'time'],
      },
      {
        id: 'living-sofa-key',
        title: 'Key under the sofa seam',
        type: 'text',
        content: 'A small brass key is wedged into the sofa seam, likely hidden in a rush rather than dropped by accident.',
        thumbnailUrl: FALLBACK_THUMBNAILS['living-room'],
        tags: ['sofa', 'key'],
      },
      {
        id: 'living-photo-smudge',
        title: 'Smudged family frame',
        type: 'image',
        content: 'One face on the family photo has been wiped more than the others, leaving a deliberate smear pattern.',
        thumbnailUrl: FALLBACK_THUMBNAILS['living-room'],
        tags: ['frame', 'fingerprint'],
      },
    ],
    hotspots: [
      { id: 'living-hotspot-1', clueId: 'living-glass-stain', label: 'TABLE', x: 37, y: 53, width: 20, height: 14 },
      { id: 'living-hotspot-2', clueId: 'living-clock-stop', label: 'CLOCK', x: 67, y: 18, width: 13, height: 14 },
      { id: 'living-hotspot-3', clueId: 'living-sofa-key', label: 'SOFA', x: 16, y: 50, width: 31, height: 22 },
      { id: 'living-hotspot-4', clueId: 'living-photo-smudge', label: 'FRAME', x: 13, y: 19, width: 16, height: 18 },
    ],
  },
  bedroom: {
    roomId: 'bedroom',
    clues: [
      {
        id: 'bed-drawer-search',
        title: 'Forced drawer search',
        type: 'text',
        content: 'The top drawer is half-open and disturbed in a pattern that suggests a targeted search rather than panic.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bedroom,
        tags: ['drawer', 'search'],
      },
      {
        id: 'bedframe-dust-trail',
        title: 'Dust trail under bedframe',
        type: 'image',
        content: 'A fresh drag mark cuts through the dust under the bed, as if something was removed moments before the scene froze.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bedroom,
        tags: ['bed', 'drag'],
      },
      {
        id: 'desk-login-log',
        title: 'Laptop login failures',
        type: 'document',
        content: 'The desk laptop shows repeated failed password attempts shortly before the incident window.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bedroom,
        tags: ['desk', 'laptop', 'timeline'],
      },
      {
        id: 'window-latch-scratch',
        title: 'Window latch scratch',
        type: 'image',
        content: 'The latch has a fresh metal score, but there is no matching debris outside. The forced entry may be staged.',
        thumbnailUrl: FALLBACK_THUMBNAILS.bedroom,
        tags: ['window', 'forced-entry'],
      },
    ],
    hotspots: [
      { id: 'bed-hotspot-1', clueId: 'bed-drawer-search', label: 'DRAWER', x: 63, y: 44, width: 16, height: 19 },
      { id: 'bed-hotspot-2', clueId: 'bedframe-dust-trail', label: 'BED', x: 25, y: 58, width: 28, height: 17 },
      { id: 'bed-hotspot-3', clueId: 'desk-login-log', label: 'DESK', x: 58, y: 23, width: 20, height: 17 },
      { id: 'bed-hotspot-4', clueId: 'window-latch-scratch', label: 'WINDOW', x: 16, y: 19, width: 15, height: 24 },
    ],
  },
};

export function getRoomScene(roomId: string) {
  return ROOM_SCENES[roomId] ?? null;
}
