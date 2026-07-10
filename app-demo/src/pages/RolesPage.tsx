import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { App, Alert, Button, Drawer, Form, Input, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

import type { ReactNode } from 'react';

import type { TableProps } from 'antd';
import type { ColumnsType, SortOrder } from 'antd/es/table/interface';
import type { Role, RoleInput } from '#shared/types';

import { httpErrorMessage } from '../lib/api-client.ts';
import { useAuth } from '../features/auth/use-auth.ts';
import { rolesQueryOptions } from '../features/roles/queries.ts';
import { useCreateRole } from '../features/roles/use-create-role.ts';
import { useDeleteRole } from '../features/roles/use-delete-role.ts';
import { useUpdateRole } from '../features/roles/use-update-role.ts';

// Editing a role requires this permission; without it the row's Edit button is disabled.
const ROLES_WRITE = 'INTERNAL_ROLES_WRITE';

// Shared width cap so the toolbar (search + Add New) lines up with the table's right edge.
const TABLE_MAX_WIDTH = 1070;

const {
  Title,
} = Typography;

// Fallbacks used only until the table has painted and real heights can be measured.
const FALLBACK_ROW = 55;
const FALLBACK_PAGER = 32;
// antd pagination has `margin: 16px 0`; getBoundingClientRect misses that, so add it back.
const PAGER_MARGIN = 32;
// A few px kept clear so sub-pixel rounding never pushes the pager under the box's clip edge.
const SAFETY = 4;

const pxHeight = (el: Element | null): number => (el ? el.getBoundingClientRect().height : 0);

// Fits the table to its own flex region rather than to the window: `ref` wraps the table in a flex:1
// box whose height is whatever the shell leaves below the toolbar. We measure that box, subtract the
// real header + pager heights, and size the scroll body to fill exactly the rest — so the pager is
// always pinned just inside the bottom (never clipped, no large gap). pageSize is the whole rows that
// fit in that body; it becomes the API page size, so the remainder paginates server-side.
//
// The ResizeObserver is created once per element; `deps` (data settling) re-run the measurement
// through the stored compute, so it only reads layout on resize or when the data changes — never on
// every render.
const useFitTable = (
  ref: React.RefObject<HTMLDivElement | null>,
  deps: unknown[],
) => {
  const [dims, setDims] = useState({ bodyHeight: 400,
    pageSize: 8 });
  const computeRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const region = el.clientHeight;
      if (region === 0) return;

      const rowHeight = pxHeight(el.querySelector('.ant-table-row')) || FALLBACK_ROW;
      const headerHeight = pxHeight(el.querySelector('.ant-table-thead'));
      const pager = (pxHeight(el.querySelector('.ant-pagination')) || FALLBACK_PAGER) + PAGER_MARGIN;

      const bodyHeight = Math.max(rowHeight, region - headerHeight - pager - SAFETY);
      const pageSize = Math.max(1, Math.floor(bodyHeight / rowHeight));

      // Functional bail-out: identical dims return the same object, so this never re-renders in a loop.
      setDims((prev) => (prev.bodyHeight === bodyHeight && prev.pageSize === pageSize
        ? prev
        : {
            bodyHeight,
            pageSize,
          }));
    };

    computeRef.current = compute;

    const observer = new ResizeObserver(compute);
    observer.observe(el);
    compute();

    return () => observer.disconnect();
  }, [ref]);

  // Re-measure when the data settles (rows appear / heights change) without recreating the observer.
  useLayoutEffect(() => {
    computeRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return dims;
};

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

// Which role the drawer is acting on: 'create' for a new role, or 'edit' with the target row.
type DrawerState =
  | { mode: 'create' }
  | {
    mode: 'edit';
    role: Role;
  };

// Right-side drawer holding the create/edit form. Open state is driven by `state` (null = closed). In
// edit mode the form is pre-filled and PUTs; in create mode it starts empty and POSTs. The form is
// re-keyed per target so reopening on a different role (or switching create<->edit) resets the fields.
function RoleDrawer({
  state,
  onClose,
}: {
  state: DrawerState | null;
  onClose: () => void;
}) {
  const {
    message,
  } = App.useApp();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const pending = createRole.isPending || updateRole.isPending;

  const submit = (values: RoleInput) => {
    if (!state) return;

    if (state.mode === 'edit') {
      updateRole.mutate(
        { roleId: state.role.role_id,
          body: values },
        {
          onSuccess: () => {
            message.success(`Updated role "${values.name}"`);
            onClose();
          },
          onError: (error) => message.error(
            `Update failed: ${httpErrorMessage(error, 'Please try again')}`,
          ),
        },
      );

      return;
    }

    createRole.mutate(values, {
      onSuccess: () => {
        message.success(`Created role "${values.name}"`);
        onClose();
      },
      onError: (error) => message.error(`Create failed: ${httpErrorMessage(error, 'Please try again')}`),
    });
  };

  const isEdit = state?.mode === 'edit';
  const initialValues: RoleInput = state?.mode === 'edit'
    ? { name: state.role.name,
        description: state.role.description }
    : { name: '',
        description: '' };

  return (
    <Drawer
      title={isEdit ? 'Edit role' : 'Add new role'}
      placement='right'
      size={420}
      open={!!state}
      onClose={onClose}
    >
      {state && (
        <Form<RoleInput>
          key={state.mode === 'edit' ? state.role.role_id : 'create'}
          layout='vertical'
          initialValues={initialValues}
          onFinish={submit}
        >
          <Form.Item
            name='name'
            label='Name'
            rules={[{ required: true,
              whitespace: true,
              message: 'Name is required' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='description'
            label='Description'
            rules={[{ required: true,
              whitespace: true,
              message: 'Description is required' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type='primary'
              htmlType='submit'
              loading={pending}
            >
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </Space>
        </Form>
      )}
    </Drawer>
  );
}

const buildColumns = (
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

  // Drives the create/edit drawer (null = closed).
  const [drawer, setDrawer] = useState<DrawerState | null>(null);

  // Stable row-action handlers so the memoized columns don't rebuild every render.
  const openEdit = useCallback((role: Role) => setDrawer({ mode: 'edit',
    role }), []);

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
        <Tooltip title={canEdit ? '' : `Requires ${ROLES_WRITE}`}>
          {/* Wrap so the tooltip still shows while the button is disabled (disabled buttons swallow hover). */}
          <span style={{ marginInlineStart: 'auto' }}>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              disabled={!canEdit}
              onClick={() => setDrawer({ mode: 'create' })}
            >
              Add New
            </Button>
          </span>
        </Tooltip>
      </div>

      {isError && <Alert type='error' showIcon message='Failed to load roles' style={{ maxWidth: 640 }} />}

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

      <RoleDrawer state={drawer} onClose={() => setDrawer(null)} />
    </>
  );
}
