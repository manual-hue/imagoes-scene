export interface EvidencePhoto {
  id: string;
  sessionId: string;
  roomId: string;
  roomName: string;
  capturedAt: number;
  memo: string;
  playerUid: string | null;
  localThumbnail?: string;
  storageUrl?: string;
  storagePath?: string;
  synced: boolean;
  syncStatus: 'local' | 'syncing' | 'synced' | 'error';
  syncError?: string | null;
}
