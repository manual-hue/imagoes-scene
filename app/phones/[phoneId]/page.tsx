import { notFound } from 'next/navigation';
import { PhoneDevice } from '@/components/phones/PhoneDevice';
import { PhoneVisitTracker } from '@/components/phones/PhoneVisitTracker';
import { getMockPhone, mockPhones } from '@/lib/mock-phones';

interface PhonePageProps {
  params: Promise<{
    phoneId: string;
  }>;
}

export function generateStaticParams() {
  return mockPhones.map((phone) => ({
    phoneId: phone.id,
  }));
}

export default async function PhonePage({ params }: PhonePageProps) {
  const { phoneId } = await params;
  const phone = getMockPhone(phoneId);

  if (!phone) {
    notFound();
  }

  return (
    <>
      <PhoneVisitTracker phoneId={phoneId} />
      <PhoneDevice phone={phone} />
    </>
  );
}
