import { Space, Tag, Typography } from 'antd';

const {
  Text,
} = Typography;

// Renders a user's permission keys as tags, or a muted placeholder when they have none.
export default function PermissionsList({
  permissions,
}: {
  permissions: string[];
}) {
  if (permissions.length === 0) {
    return <Text type='secondary'>No permissions</Text>;
  }

  return (
    <Space size={[0, 8]} wrap>
      {permissions.map((permission) => (
        <Tag key={permission} color='blue'>{permission}</Tag>
      ))}
    </Space>
  );
}
