/**
 * useViewportHeight — DVH 3-Layer Fallback Strategy
 *
 * Mobile browsers report 100vh incorrectly (includes the address bar),
 * causing UI to be cut off. This hook implements a 3-layer fallback:
 *
 *   Layer 1 (CSS, modern): `100dvh`
 *     - Native Dynamic Viewport Height unit. Automatically tracks the
 *       visible viewport as the browser chrome appears/disappears.
 *     - Supported: Chrome 108+, Safari 15.4+, Firefox 101+.
 *
 *   Layer 2 (CSS + JS, universal): `calc(var(--vh, 1vh) * 100)`
 *     - This hook measures the real viewport via the visualViewport API
 *       (or window.innerHeight as fallback) and writes --vh to :root.
 *     - Reacts to address bar show/hide, virtual keyboard, and rotation.
 *     - Works on every browser that supports CSS custom properties.
 *
 *   Layer 3 (CSS, iOS Safari legacy): `min-height: -webkit-fill-available`
 *     - Vendor-prefixed value that Safari uses to fill the available space
 *       excluding browser chrome. Catches any edge cases Layer 2 misses
 *       on older iOS versions.
 *
 * Usage: Call once in the root layout via <ViewportHeightProvider />.
 * Then use utility classes (.full-screen, .room-layout) or Tailwind
 * values (h-screen-dvh, h-screen-vh) that reference these layers.
 */
'use client';

import { useEffect } from 'react';

export function useViewportHeight() {
  useEffect(() => {
    const setVh = () => {
      // visualViewport API preferred (handles virtual keyboard)
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
    };

    setVh();

    // Address bar show/hide, virtual keyboard, resize
    window.visualViewport?.addEventListener('resize', setVh);
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', () => {
      // Delay to let the rotation animation finish before recalculating
      setTimeout(setVh, 100);
    });

    return () => {
      window.visualViewport?.removeEventListener('resize', setVh);
      window.removeEventListener('resize', setVh);
    };
  }, []);
}
