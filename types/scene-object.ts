import type { BackgroundImage, Clue, RoomScene } from '@/types/room';
import type { MockPhone } from '@/types/phone';

export type SceneObjectType = 'room' | 'phone' | 'laptop' | 'document';

export interface BaseSceneObject {
  id: string;
  type: SceneObjectType;
  name: string;
  shortCode: string;
  order: number;
}

export interface RoomContent {
  description: string;
  backgroundImage: BackgroundImage;
  clues: Clue[];
  scene: RoomScene | null;
  isAccessible: boolean;
  visitCount: number;
}

export interface PhoneContent {
  owner: string;
  device: string;
  phone: MockPhone;
}

export type SceneObjectContent = RoomContent | PhoneContent;

export interface SceneObject<T extends SceneObjectContent = SceneObjectContent> extends BaseSceneObject {
  content: T;
}

export type RoomObject = SceneObject<RoomContent>;
export type PhoneObject = SceneObject<PhoneContent>;

export interface CaseData {
  caseId: string;
  caseName: string;
  sessionCode: string;
  sessionId: string;
  objects: SceneObject[];
}
