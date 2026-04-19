import { requireAdminSession } from '@/lib/admin-auth';
import { NewSessionForm } from '@/components/admin/NewSessionForm';
import { createSessionAction } from './actions';

export default async function NewAdminSessionPage() {
  const adminSession = await requireAdminSession();

  return (
    <NewSessionForm
      adminEmail={adminSession.email}
      defaultAccessCode={process.env.NEXT_PUBLIC_ACCESS_CODE ?? ''}
      createAction={createSessionAction}
    />
  );
}
