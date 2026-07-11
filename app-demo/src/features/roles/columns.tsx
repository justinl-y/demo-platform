import { Button, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import type { ReactNode } from 'react';
import type { ColumnsType, SortOrder } from 'antd/es/table/interface';
import type { Role } from '#shared/types';

import { PERMISSIONS } from '../../lib/permissions.ts';

// Editing a role requires this permission; without it the row buttons are disabled.
const ROLES_WRITE = PERMISSIONS.INTERNAL_ROLES_WRITE;

interface ActionButton {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}

// A row-action button, disabled (with an explanatory tooltip) when the user lacks write access. The
// disabled antd Button swallows hover events, so the tooltip wraps it in a span.
const actionButton = (
  canEdit: boolean,
  {
    icon,
    label,
    danger,
    onClick,
  }: ActionButton,
) => {
  const button = (
    <Button
      size='small'
      danger={danger}
      icon={icon}
      disabled={!canEdit}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  return canEdit
    ? button
    : <Tooltip title={`Requires ${ROLES_WRITE}`}><span>{button}</span></Tooltip>;
};

// The roles table columns. `sortOrder` reflects the page's controlled sort; `onEdit`/`onDelete` open
// the drawer / confirm dialog for a row.
export const buildColumns = (
  canEdit: boolean,
  sortOrder: SortOrder,
  onEdit: (role: Role) => void,
  onDelete: (role: Role) => void,
): ColumnsType<Role> => [
  {
    title: 'Role',
    dataIndex: 'name',
    key: 'name',
    width: 280,
    // Clip rather than overflow into the description if a role name is unusually long.
    ellipsis: true,
    // Server-side sort: `sorter: true` reports clicks via the table's onChange; `sortOrder` reflects
    // our controlled state. Toggles ascending <-> descending only (no "unsorted" state).
    sorter: true,
    sortDirections: ['ascend', 'descend'],
    sortOrder,
    render: (name: string) => <Tag color='blue'>{name}</Tag>,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    // Keep every row one line tall so row height is uniform and the fit math is exact.
    ellipsis: true,
  },
  {
    title: '',
    key: 'actions',
    width: 190,
    align: 'right',
    render: (_, role) => (
      <Space size='small'>
        {actionButton(canEdit, { icon: <EditOutlined />,
          label: 'Edit',
          onClick: () => onEdit(role) })}
        {actionButton(canEdit, { icon: <DeleteOutlined />,
          label: 'Delete',
          danger: true,
          onClick: () => onDelete(role) })}
      </Space>
    ),
  },
];
