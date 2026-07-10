import { useState } from 'react';
import { Button, Layout, Menu, Typography } from 'antd';
import { HomeOutlined, LogoutOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate, useRouterState } from '@tanstack/react-router';

import type { MenuProps } from 'antd';
import type { ReactNode } from 'react';

import { useLogout } from '../features/auth/use-logout.ts';
import { APP_TITLE } from '../lib/env.ts';

const {
  Header, Content, Sider,
} = Layout;
const {
  Text,
} = Typography;

// Left-nav hierarchy. Leaves that map to a route in ROUTE_BY_KEY navigate; the rest are
// placeholders until their pages exist. Top-level items carry icons so they stay meaningful when
// the sider is collapsed to icons.
const navItems: MenuProps['items'] = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: 'Home',
  },
  {
    key: 'internal-users',
    icon: <TeamOutlined />,
    label: 'Internal Users',
    children: [
      {
        key: 'users',
        label: 'Users',
        children: [
          { key: 'manage-users',
            label: 'Manage Users' },
        ],
      },
      {
        key: 'roles-permissions',
        label: 'Roles & Permissions',
        children: [
          { key: 'roles',
            label: 'Roles' },
          { key: 'permissions',
            label: 'Permissions' },
          { key: 'role-permissions',
            label: 'Role Permissions' },
        ],
      },
    ],
  },
];

// Menu key -> route. Only navigable items appear here.
const ROUTE_BY_KEY: Record<string, string> = {
  home: '/home',
  roles: '/roles',
};

// Each page renders its own AppShell, so navigating remounts it. Persist the sider's collapsed state
// so selecting a menu item (which changes route) keeps the menu at its current size. Defaults to
// collapsed until the user explicitly expands it.
const NAV_COLLAPSED_KEY = 'demo.navCollapsed';
const readCollapsed = (): boolean => localStorage.getItem(NAV_COLLAPSED_KEY) !== 'false';

// App chrome shared by the authenticated pages: top bar (title + sign out) and the left nav.
// Pages render their content as children.
export default function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const logout = useLogout();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
    localStorage.setItem(NAV_COLLAPSED_KEY, String(value));
  };

  const selectedKeys = Object.entries(ROUTE_BY_KEY)
    .filter(([, path]) => path === pathname)
    .map(([key]) => key);

  const onMenuClick: MenuProps['onClick'] = ({
    key,
  }) => {
    const to = ROUTE_BY_KEY[key];

    if (to) void navigate({ to });
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between' }}
      >
        <Text style={{ color: '#fff',
          fontSize: 18,
          fontWeight: 600 }}
        >
          {APP_TITLE}
        </Text>
        <Button icon={<LogoutOutlined />} onClick={() => logout.mutate()} loading={logout.isPending}>
          Sign out
        </Button>
      </Header>

      <Layout style={{ minHeight: 0 }}>
        <Sider
          width={240}
          theme='light'
          collapsible
          collapsed={collapsed}
          onCollapse={handleCollapse}
        >
          {/* Inside a collapsible Sider the Menu switches to icon-only inline-collapsed automatically;
              submenus open as flyout popups on hover. */}
          <Menu
            mode='inline'
            items={navItems}
            selectedKeys={selectedKeys}
            defaultOpenKeys={['internal-users', 'users', 'roles-permissions']}
            onClick={onMenuClick}
            style={{ height: '100%',
              borderInlineEnd: 0 }}
          />
        </Sider>

        {/* Fixed-height (100vh) shell that doesn't scroll; the content column fills the space so a
            page can flex a child (e.g. a table) to the exact remaining height. */}
        <Content style={{ padding: 24,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'auto' }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
