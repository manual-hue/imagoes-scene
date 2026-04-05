'use client';

import crt from '@/styles/crt.module.css';

export function CRTOverlay() {
  return (
    <>
      <div className={crt.crtOverlay} aria-hidden="true" />
      <div className={crt.noiseLayer} aria-hidden="true" />
    </>
  );
}
