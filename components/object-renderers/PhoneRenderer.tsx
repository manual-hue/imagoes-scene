'use client';

import { PhoneDevice } from '@/components/phones/PhoneDevice';
import { getMockPhone } from '@/lib/mock-phones';
import type { PhoneContent } from '@/types/scene-object';

interface PhoneRendererProps {
  objectId: string;
  content: PhoneContent;
}

export function PhoneRenderer({ objectId, content }: PhoneRendererProps) {
  const phoneDataId = (content as PhoneContent & { phoneDataId?: string }).phoneDataId ?? objectId;
  const phone = getMockPhone(phoneDataId);

  if (!phone) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-primary">
        <p className="font-mono text-sm text-accent-red">PHONE DATA NOT FOUND</p>
      </div>
    );
  }

  return <PhoneDevice phone={phone} />;
}
