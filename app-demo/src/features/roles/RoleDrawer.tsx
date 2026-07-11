import { App, Button, Drawer, Form, Input, Space } from 'antd';

import type { Role, RoleInput } from '#shared/types';

import { httpErrorMessage } from '../../lib/api-client.ts';
import { useCreateRole } from './use-create-role.ts';
import { useUpdateRole } from './use-update-role.ts';

// Which role the drawer is acting on: 'create' for a new role, or 'edit' with the target row.
export type DrawerState =
  | { mode: 'create' }
  | {
    mode: 'edit';
    role: Role;
  };

// Right-side drawer holding the create/edit form. Open state is driven by `state` (null = closed). In
// edit mode the form is pre-filled and PUTs; in create mode it starts empty and POSTs. The form is
// re-keyed per target so reopening on a different role (or switching create<->edit) resets the fields.
export function RoleDrawer({
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
