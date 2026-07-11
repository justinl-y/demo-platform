import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { App, Alert, Button, Input, Table, Tooltip, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

import type { TableProps } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import type { Role } from '#shared/types';
import type { DrawerState } from '../features/roles/RoleDrawer.tsx';

import { httpErrorMessage } from '../lib/api-client.ts';
import { PERMISSIONS } from '../lib/permissions.ts';
import { useAuth } from '../features/auth/use-auth.ts';
import { buildColumns } from '../features/roles/columns.tsx';
import { rolesQueryOptions } from '../features/roles/queries.ts';
import { RoleDrawer } from '../features/roles/RoleDrawer.tsx';
import { useDeleteRole } from '../features/roles/use-delete-role.ts';
import { useFitTable } from '../hooks/use-fit-table.ts';

// Adding/editing a role requires this permission; without it the Edit/Delete/Add buttons are disabled.
const ROLES_WRITE = PERMISSIONS.INTERNAL_ROLES_WRITE;

// Shared width cap so the toolbar (search + Add New) lines up with the table's right edge.
const TABLE_MAX_WIDTH = 1070;

const {
  Title,
} = Typography;

export default function RolesPage() {
  // Server-driven list state. `search` updates on submit (button/Enter); `order` toggles the name
  // sort; `page` is the 1-based current page. Changing search or sort resets to the first page.
  const [search, setSearch] = useState('');
  const [order, setOrder] = useState<'ASC' | 'DESC' | undefined>(undefined);
  const [page, setPage] = useState(1);

  const tableRef = useRef<HTMLDivElement>(null);
  // The API page size, mirrored from the viewport measurement below. It lives in its own state (rather
  // than being read straight from useFitTable) to break the cycle: pageSize feeds the query, and the
  // query's row count is what useFitTable re-measures against.
  const [pageSize, setPageSize] = useState(8);

  const {
    data, isFetching, isError,
  } = useQuery(rolesQueryOptions({ page,
    perPage: pageSize,
    search,
    order }));
  const roles = data?.data ?? [];
  const total = data?.pagination.count_total ?? 0;
  // The pager's page size must match the rows actually shown, not the just-measured value: on a resize
  // `keepPreviousData` holds the previous (larger) page while the smaller size is re-fetched, and antd
  // warns if dataSource is longer than pagination.pageSize. Sourcing it from the response avoids that.
  const shownPageSize = data?.pagination.per_page ?? pageSize;

  // Measure the fit (re-running only when the data settles), then feed the measured page size back into
  // the query. Adjusting state during render with a bail-out (React's recommended pattern) avoids an
  // effect and doesn't loop, since it no-ops once pageSize matches the measurement.
  const {
    bodyHeight, pageSize: fitPageSize,
  } = useFitTable(tableRef, [roles.length, isFetching]);
  if (fitPageSize !== pageSize) setPageSize(fitPageSize);

  const {
    user,
  } = useAuth();
  const canEdit = user?.permissions.includes(ROLES_WRITE) ?? false;

  const {
    message, modal,
  } = App.useApp();
  // One delete mutation for the whole page (not one per row); the confirm is a single on-demand modal
  // rather than a Popconfirm mounted on every row — far cheaper to render a page of rows.
  const {
    mutateAsync: deleteRole,
  } = useDeleteRole();

  // Drives the create/edit drawer (null = closed). `drawerMounted` lazy-mounts it: nothing is created
  // until it's first opened (keeps the /roles page mount cheap), after which it stays mounted so
  // closing still animates.
  const [drawer, setDrawer] = useState<DrawerState | null>(null);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const openDrawer = useCallback((next: DrawerState) => {
    setDrawerMounted(true);
    setDrawer(next);
  }, []);

  // Stable row-action handlers so the memoized columns don't rebuild every render.
  const openEdit = useCallback((role: Role) => openDrawer({ mode: 'edit',
    role }), [openDrawer]);

  const confirmDelete = useCallback((role: Role) => {
    modal.confirm({
      title: 'Delete role',
      content: `Delete "${role.name}"? This can't be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: () => deleteRole(role.role_id)
        .then(() => message.success(`Deleted role "${role.name}"`))
        .catch((error: unknown) => message.error(
          `Delete aborted: ${httpErrorMessage(error, 'Please try again')}`,
        )),
    });
  }, [modal, message, deleteRole]);

  const sortOrder: SortOrder = order === 'ASC' ? 'ascend' : order === 'DESC' ? 'descend' : null;

  const columns = useMemo(
    () => buildColumns(canEdit, sortOrder, openEdit, confirmDelete),
    [canEdit, sortOrder, openEdit, confirmDelete],
  );

  // Keep `page` in range as the page size grows (resize) or the total drops (deleting the last row on
  // the last page), so the user is never stranded on an empty page. Adjusting state during render (with
  // a bail-out) is React's recommended pattern for reconciling state with changed data — no effect.
  if (total > 0) {
    const lastPage = Math.ceil(total / pageSize);
    if (page > lastPage) setPage(lastPage);
  }

  const onTableChange: TableProps<Role>['onChange'] = (_pagination, _filters, sorter, extra) => {
    if (extra.action === 'sort') {
      const next = Array.isArray(sorter) ? sorter[0] : sorter;
      setOrder(next?.order === 'ascend' ? 'ASC' : next?.order === 'descend' ? 'DESC' : undefined);
      setPage(1);
    }
    else if (extra.action === 'paginate') {
      setPage(_pagination.current ?? 1);
    }
  };

  const onSearch = (value: string) => {
    setSearch(value.trim());
    setPage(1);
  };

  // The span carries the toolbar's right-alignment and lets the tooltip work over a disabled button.
  const addButton = (
    <span style={{ marginInlineStart: 'auto' }}>
      <Button
        type='primary'
        icon={<PlusOutlined />}
        disabled={!canEdit}
        onClick={() => openDrawer({ mode: 'create' })}
      >
        Add New
      </Button>
    </span>
  );

  return (
    <>
      <Title
        level={3}
        style={{ flex: 'none',
          margin: '0 0 16px' }}
      >
        Roles
      </Title>

      <div style={{ flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
        maxWidth: TABLE_MAX_WIDTH }}
      >
        <Input.Search
          placeholder='Search roles by name'
          allowClear
          enterButton
          onSearch={onSearch}
          style={{ flex: '0 1 400px' }}
        />
        {/* Only wrap in a Tooltip when disabled — avoids mounting an inert tooltip when it's usable. */}
        {canEdit
          ? addButton
          : <Tooltip title={`Requires ${ROLES_WRITE}`}>{addButton}</Tooltip>}
      </div>

      {isError && <Alert type='error' showIcon title='Failed to load roles' style={{ maxWidth: 640 }} />}

      {!isError && (
        <div
          ref={tableRef}
          style={{ flex: 1,
            minHeight: 0,
            overflow: 'hidden' }}
        >
          <Table
            rowKey='role_id'
            columns={columns}
            dataSource={roles}
            loading={isFetching}
            scroll={{ y: bodyHeight }}
            onChange={onTableChange}
            pagination={{ current: page,
              pageSize: shownPageSize,
              total,
              showSizeChanger: false,
              hideOnSinglePage: false }}
            style={{ maxWidth: TABLE_MAX_WIDTH }}
          />
        </div>
      )}

      {drawerMounted && <RoleDrawer state={drawer} onClose={() => setDrawer(null)} />}
    </>
  );
}
