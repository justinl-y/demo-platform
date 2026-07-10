import { describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http as mswHttp } from 'msw';

import { API_BASE_URL } from '../../src/lib/env.ts';
import { setAuthHint } from '../../src/features/auth/session.ts';
import { http, mockUser } from '../mocks/handlers.ts';
import { server } from '../mocks/server.ts';
import { renderApp } from '../lib/render.tsx';

import type { Role, RoleInput } from '#shared/types';

const ROLES: Role[] = [
  {
    role_id: 'r1',
    name: 'ADMIN',
    description: 'Full access to all resources',
  },
  {
    role_id: 'r2',
    name: 'VIEWER',
    description: 'Read only access',
  },
];

// Stand-in for the real GET /roles: applies the server-side search/order/pagination the app now
// relies on, so tests exercise those params rather than a fixed payload. Wins over the schema-example
// baseline.
const mockRoles = (allRoles: Role[]) =>
  server.use(
    http.get('/roles', ({
      request,
      response,
    }) => {
      const url = new URL(request.url);
      const term = url.searchParams.get('search')?.toLowerCase() ?? '';
      const order = url.searchParams.get('order');
      const page = Number(url.searchParams.get('page') ?? '1');
      const perPage = Number(url.searchParams.get('per_page') ?? '10');

      const rows = term
        ? allRoles.filter((role) => role.name.toLowerCase().includes(term))
        : [...allRoles];

      if (order === 'ASC') rows.sort((a, b) => a.name.localeCompare(b.name));
      else if (order === 'DESC') rows.sort((a, b) => b.name.localeCompare(a.name));

      const total = rows.length;
      const data = rows.slice((page - 1) * perPage, page * perPage);

      return response(200).json({
        data,
        pagination: {
          page,
          per_page: perPage,
          pages: Math.max(1, Math.ceil(total / perPage)),
          count_page: data.length,
          count_total: total,
        },
      });
    }),
  );

// The /roles guard hydrates the session via the mocked /me when the login hint is present; without it
// the guard redirects to /login. Set it, then render straight at /roles.
const renderRolesPage = () => {
  setAuthHint();

  return renderApp('/roles');
};

// userEvent's default pointer-events check calls getComputedStyle with pseudo-elements, which jsdom
// can't do — it hangs when clicking buttons inside the table's scroll body. Disabling it is safe here
// since the app never sets pointer-events: none on these controls.
const setupUser = () => userEvent.setup({
  delay: null,
  pointerEventsCheck: 0,
});

// Reach a button through its visible label. `getByRole` with a name is pathologically slow in jsdom
// once antd popover/tooltip DOM (rc-trigger) is on the page, so text queries are used for the
// popconfirm and the permission-gated (tooltip-wrapped) buttons.
const buttonForLabel = (label: HTMLElement): HTMLElement => {
  const button = label.closest('button');
  if (!button) throw new Error('expected a <button> ancestor');

  return button;
};

describe('RolesPage', () => {
  describe('List', () => {
    test('renders the roles returned by the API', async () => {
      mockRoles(ROLES);
      renderRolesPage();

      expect(await screen.findByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText('VIEWER')).toBeInTheDocument();
      expect(screen.getByText('Full access to all resources')).toBeInTheDocument();
    });

    test('an unauthenticated visit redirects to /login', async () => {
      // No login hint → the guard sends the user to the form without hitting the API.
      renderApp('/roles');

      expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    test('submitting a term sends it to the API and filters the list', async () => {
      // The mock filters server-side by the `search` param, so the list narrowing proves it was sent.
      mockRoles(ROLES);
      renderRolesPage();
      await screen.findByText('VIEWER');

      const user = setupUser();
      await user.type(screen.getByPlaceholderText('Search roles by name'), 'admin{Enter}');

      expect(await screen.findByText('ADMIN')).toBeInTheDocument();
      await waitFor(() => expect(screen.queryByText('VIEWER')).not.toBeInTheDocument());
    });
  });

  describe('Sort', () => {
    test('clicking the Role header toggles ascending then descending order', async () => {
      mockRoles([
        {
          role_id: 'b',
          name: 'BETA',
          description: 'b',
        },
        {
          role_id: 'a',
          name: 'ALPHA',
          description: 'a',
        },
      ]);
      renderRolesPage();
      await screen.findByText('BETA');

      const user = setupUser();
      const before = (screen.getByText('ALPHA').compareDocumentPosition(screen.getByText('BETA')));
      // Sanity: returned unsorted (BETA before ALPHA), so ALPHA follows BETA in the DOM.
      expect(before & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();

      // Ascending: ALPHA now precedes BETA.
      await user.click(screen.getAllByText('Role')[0]);
      await waitFor(() => {
        const position = screen.getByText('ALPHA').compareDocumentPosition(screen.getByText('BETA'));
        expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      });

      // Descending: BETA precedes ALPHA again.
      await user.click(screen.getAllByText('Role')[0]);
      await waitFor(() => {
        const position = screen.getByText('BETA').compareDocumentPosition(screen.getByText('ALPHA'));
        expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      });
    });
  });

  describe('Create', () => {
    test('creates a role via the drawer and posts the entered values', async () => {
      mockRoles(ROLES);

      let sent: RoleInput | undefined;
      server.use(
        http.post('/roles', async ({
          request,
          response,
        }) => {
          const body = await request.json();
          sent = body;

          return response(201).json({
            role_id: 'r-new',
            name: body.name,
            description: body.description,
          });
        }),
      );

      renderRolesPage();
      await screen.findByText('ADMIN');

      const user = setupUser();
      await user.click(buttonForLabel(screen.getByText('Add New')));

      await screen.findByText('Add new role');
      await user.type(screen.getByLabelText('Name'), 'EDITOR');
      await user.type(screen.getByLabelText('Description'), 'Can edit');
      await user.click(buttonForLabel(screen.getByText('Create')));

      expect(await screen.findByText(/Created role "EDITOR"/)).toBeInTheDocument();
      expect(sent).toEqual({
        name: 'EDITOR',
        description: 'Can edit',
      });
    });

    test('surfaces the API reason when create fails', async () => {
      mockRoles(ROLES);
      // 400 is an undocumented error path, so use plain MSW.
      server.use(
        mswHttp.post(`${API_BASE_URL}/roles`, () =>
          HttpResponse.json({ message: 'Supplied role name is not unique' }, { status: 400 })),
      );

      renderRolesPage();
      await screen.findByText('ADMIN');

      const user = setupUser();
      await user.click(buttonForLabel(screen.getByText('Add New')));
      await screen.findByText('Add new role');
      await user.type(screen.getByLabelText('Name'), 'ADMIN');
      await user.type(screen.getByLabelText('Description'), 'dupe');
      await user.click(buttonForLabel(screen.getByText('Create')));

      expect(await screen.findByText('Create failed: Supplied role name is not unique')).toBeInTheDocument();
    });
  });

  describe('Edit', () => {
    test('pre-fills the drawer and updates the role', async () => {
      mockRoles([ROLES[0]]);

      let sentId: string | undefined;
      let sentBody: RoleInput | undefined;
      server.use(
        http.put('/roles/{role_id}', async ({
          request,
          params,
          response,
        }) => {
          const body = await request.json();
          sentId = params.role_id;
          sentBody = body;

          return response(200).json({
            role_id: params.role_id,
            name: body.name,
            description: body.description,
          });
        }),
      );

      renderRolesPage();
      await screen.findByText('ADMIN');

      const user = setupUser();
      await user.click(buttonForLabel(screen.getByText('Edit')));

      await screen.findByText('Edit role');
      expect(screen.getByLabelText('Name')).toHaveValue('ADMIN');
      expect(screen.getByLabelText('Description')).toHaveValue('Full access to all resources');

      await user.clear(screen.getByLabelText('Description'));
      await user.type(screen.getByLabelText('Description'), 'Updated description');
      await user.click(buttonForLabel(screen.getByText('Save')));

      expect(await screen.findByText(/Updated role "ADMIN"/)).toBeInTheDocument();
      expect(sentId).toBe('r1');
      expect(sentBody).toEqual({
        name: 'ADMIN',
        description: 'Updated description',
      });
    });
  });

  describe('Delete', () => {
    test('deletes a role after confirming', async () => {
      mockRoles([ROLES[0]]);

      let deletedId: string | undefined;
      server.use(
        http.delete('/roles/{role_id}', ({
          params,
          response,
        }) => {
          deletedId = params.role_id;

          return response(204).empty();
        }),
      );

      renderRolesPage();
      await screen.findByText('ADMIN');

      const user = setupUser();
      await user.click(buttonForLabel(screen.getByText('Delete')));

      // The popconfirm's OK button adds a second "Delete" label (in a portal after the row's).
      await waitFor(() => expect(screen.getAllByText('Delete')).toHaveLength(2));
      await user.click(buttonForLabel(screen.getAllByText('Delete')[1]));

      expect(await screen.findByText(/Deleted role "ADMIN"/)).toBeInTheDocument();
      expect(deletedId).toBe('r1');
    });

    test('surfaces the API reason when delete is blocked', async () => {
      mockRoles([ROLES[0]]);
      server.use(
        mswHttp.delete(`${API_BASE_URL}/roles/r1`, () =>
          HttpResponse.json({ message: 'Role is assigned to one or more users' }, { status: 400 })),
      );

      renderRolesPage();
      await screen.findByText('ADMIN');

      const user = setupUser();
      await user.click(buttonForLabel(screen.getByText('Delete')));
      await waitFor(() => expect(screen.getAllByText('Delete')).toHaveLength(2));
      await user.click(buttonForLabel(screen.getAllByText('Delete')[1]));

      expect(
        await screen.findByText('Delete aborted: Role is assigned to one or more users'),
      ).toBeInTheDocument();
    });
  });

  describe('Permissions', () => {
    test('without INTERNAL_ROLES_WRITE the write actions are disabled', async () => {
      // A user missing the write permission: the guard still hydrates, but edit/delete/add are gated.
      server.use(
        http.get('/me', ({
          response,
        }) => response(200).json({
          ...mockUser,
          permissions: mockUser.permissions.filter((permission) => permission !== 'INTERNAL_ROLES_WRITE'),
        })),
      );
      mockRoles([ROLES[0]]);

      renderRolesPage();
      await screen.findByText('ADMIN');

      expect(buttonForLabel(screen.getByText('Add New'))).toBeDisabled();
      expect(buttonForLabel(screen.getByText('Edit'))).toBeDisabled();
      expect(buttonForLabel(screen.getByText('Delete'))).toBeDisabled();
    });
  });
});
