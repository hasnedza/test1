import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const reportEntryApi = vi.hoisted(() => ({
  list: vi.fn(async () => []),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('@/lib/report-entry-api', () => ({ reportEntryApi }));

import App from '@/App';
import { AuthContext, type AuthContextValue } from '@/hooks/auth.context';
import { REPORT_DIRECTORY_ADMIN_EMAIL } from '@rayfin-app/shared';

function renderApp(email: string) {
  const auth: AuthContextValue = {
    session: {
      user: { id: 'test-user', email },
      isAuthenticated: true,
      isAnonymous: false,
    },
    isAuthenticated: true,
    isLoading: false,
    canSignIn: false,
    signIn: async () => {},
    isSigningIn: false,
    signInError: null,
    config: { kind: 'ready' },
    error: null,
  };

  return render(
    <AuthContext.Provider value={auth}>
      <App />
    </AuthContext.Provider>
  );
}

describe('Report directory app', () => {
  beforeEach(() => {
    reportEntryApi.list.mockResolvedValue([]);
  });

  it('renders the directory and its empty state for signed-in viewers', async () => {
    renderApp('viewer@example.com');

    expect(
      await screen.findByText('The directory is ready for its first report')
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Find the report.' })
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Add report' })
    ).toBeNull();
  });

  it('shows catalog management to the configured directory writer', async () => {
    renderApp(REPORT_DIRECTORY_ADMIN_EMAIL);

    await screen.findByText('The directory is ready for its first report');
    expect(
      screen.getByRole('button', { name: 'Add report' })
    ).toBeVisible();
  });
});
