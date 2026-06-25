import { createFileRoute } from '@tanstack/react-router';

import { LoginPageEditor } from '@/components/LoginPageEditor';

export const Route = createFileRoute('/_app/admin/branding/login-page')({
  component: LoginPageEditor
});
