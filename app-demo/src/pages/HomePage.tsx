import { Button, Descriptions, Layout, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

import PermissionsList from '../components/PermissionsList.tsx';
import { useAuth } from '../features/auth/use-auth.ts';
import { useLogout } from '../features/auth/use-logout.ts';

const {
  Header, Content,
} = Layout;
const {
  Title, Text,
} = Typography;

export default function HomePage() {
  const {
    user,
  } = useAuth();
  const logout = useLogout();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between' }}
      >
        <Text style={{ color: '#fff',
          fontSize: 18,
          fontWeight: 600 }}
        >
          Demo Platform
        </Text>
        <Button icon={<LogoutOutlined />} onClick={() => logout.mutate()} loading={logout.isPending}>
          Sign out
        </Button>
      </Header>

      <Content style={{ padding: 24 }}>
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
      </Content>
    </Layout>
  );
}
