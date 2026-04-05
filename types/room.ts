import { Timestamp } from 'firebase/firestore';

export interface BackgroundImage {
  url: string;
  blur?: string;
  alt: string;
  credit?: string;
}

export interface Room {
  id: string;
  sessionId: string;
  name: string;
  shortCode: string;
  description: string;
  backgroundImage: BackgroundImage;
  clues?: Clue[];
  order: number;
  isAccessible: boolean;
  visitCount: number;
  createdAt: Timestamp;
}

export interface Clue {
  id: string;
  roomId: string;
  title: string;
  type: 'text' | 'image' | 'document' | 'audio';
  content: string;
  thumbnailUrl?: string;
  isHidden: boolean;
  displayOrder: number;
  tags: string[];
}

export interface RoomSceneClue {
  id: string;
  title: string;
  type: Clue['type'];
  content: string;
  thumbnailUrl?: string;
  tags: string[];
}

export interface RoomSceneHotspot {
  id: string;
  clueId: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoomScene {
  roomId: string;
  clues: RoomSceneClue[];
  hotspots: RoomSceneHotspot[];
}
