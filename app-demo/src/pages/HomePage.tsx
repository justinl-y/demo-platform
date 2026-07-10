import { Descriptions, Typography } from 'antd';

import PermissionsList from '../components/PermissionsList.tsx';
import { useAuth } from '../features/auth/use-auth.ts';

const {
  Title,
} = Typography;

// Rendered inside the authenticated layout route's AppShell (via <Outlet>), so this returns page
// content only.
export default function HomePage() {
  const {
    user,
  } = useAuth();

  return (
    <>
      <Title level={3}>
        Welcome
        {user?.known_as ? `, ${user.known_as}` : ''}
      </Title>

      <Descriptions
        bordered
        column={1}
        style={{ maxWidth: 640 }}
        items={[
          { key: 'name',
            label: 'Name',
            children: user?.full_name },
          { key: 'email',
            label: 'Email',
            children: user?.email },
          { key: 'permissions',
            label: 'Permissions',
            children: <PermissionsList permissions={user?.permissions ?? []} /> },
        ]}
      />
    </>
  );
}
