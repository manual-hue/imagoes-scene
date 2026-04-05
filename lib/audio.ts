'use client';

import { Howl } from 'howler';

let sirenSound: Howl | null = null;

export function getSirenSound(): Howl {
  if (!sirenSound) {
    sirenSound = new Howl({
      src: ['/audio/siren.mp3'],
      loop: true,
      volume: 0.7,
      preload: true,
      html5: false,
      onloaderror: () => undefined,
      onplayerror: () => undefined,
    });
  }

  return sirenSound;
}

export function playSiren() {
  const sound = getSirenSound();
  if (!sound.playing()) {
    sound.play();
  }
}

export function stopSiren() {
  const sound = getSirenSound();
  if (sound.playing()) {
    sound.stop();
  }
}
