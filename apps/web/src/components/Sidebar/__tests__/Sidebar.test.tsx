import type { Session } from '@opendatacapture/schemas/session';
import type { Subject } from '@opendatacapture/schemas/subject';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ClipboardListIcon, DatabaseIcon, LayersIcon, UsersIcon } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

import type { NavItem } from '@/hooks/useNavItems';
import type { GroupSwitcherPosition } from '@/store/types';

import { Sidebar } from '../Sidebar';

import '@/services/i18n';

type MockStore = {
  currentSession: null | Session;
  endSession: () => void;
  groupSwitcherPosition: GroupSwitcherPosition;
};

type Mocks = {
  isGroupSwitcherVisible: boolean;
  navigate: Mock;
  navItems: NavItem[][];
  store: MockStore;
};

const mocks = vi.hoisted((): Mocks => {
  const store: MockStore = { currentSession: null, endSession: vi.fn(), groupSwitcherPosition: 'sidebar' };
  return { isGroupSwitcherVisible: false, navigate: vi.fn(), navItems: [], store };
});

vi.mock('@tanstack/react-router', () => ({
  useLocation: () => ({ pathname: window.location.pathname }),
  useNavigate: () => mocks.navigate
}));

vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));

vi.mock('@/hooks/useNavItems', () => ({ useNavItems: () => mocks.navItems }));
vi.mock('@/hooks/useSetupStateQuery', () => ({
  useSetupStateQuery: () => ({ data: { activeLanguages: ['en', 'fr'] } })
}));
vi.mock('@/components/GroupSwitcher', () => ({
  GroupSwitcher: () => <div data-testid="group-switcher" />,
  useIsGroupSwitcherVisible: () => mocks.isGroupSwitcherVisible
}));
vi.mock('@/components/UserDropup', () => ({ UserDropup: () => <div data-testid="user-dropup" /> }));

const globalItems: NavItem[] = [
  { icon: DatabaseIcon, label: 'Data Hub', url: '/datahub' },
  {
    children: [{ icon: UsersIcon, label: 'Users', url: '/admin/users' }],
    icon: LayersIcon,
    label: 'Administration'
  }
];

const sessionItems: NavItem[] = [
  { disabled: true, icon: ClipboardListIcon, label: 'Instruments', url: '/instruments/accessible-instruments' }
];

const subject = (personalInfo: Partial<Subject>): Subject => ({
  createdAt: new Date('2026-01-01'),
  groupIds: ['group-1'],
  id: 'Group_One$abc',
  updatedAt: new Date('2026-01-01'),
  ...personalInfo
});

const sessionFor = (sessionSubject: Subject): Session => ({
  createdAt: new Date('2026-01-01'),
  date: new Date('2026-01-01'),
  groupId: 'group-1',
  id: 'session-1',
  subject: sessionSubject,
  subjectId: sessionSubject.id,
  type: 'IN_PERSON',
  updatedAt: new Date('2026-01-01')
});

const navButton = (url: string) => screen.getByTestId(`nav-button-${url}`);
const endSessionButton = () => screen.getByTestId('nav-button-#');
const sessionInfo = () => screen.getByTestId('current-session-info').textContent;

const openEndSessionDialog = () => {
  mocks.store.currentSession = sessionFor(subject({}));
  render(<Sidebar />);
  fireEvent.click(endSessionButton());
};

describe('Sidebar', () => {
  beforeEach(() => {
    mocks.isGroupSwitcherVisible = false;
    mocks.navItems = [globalItems, sessionItems];
    mocks.store.currentSession = null;
    mocks.store.groupSwitcherPosition = 'sidebar';
    mocks.navigate.mockReset().mockResolvedValue(undefined);
    vi.mocked(mocks.store.endSession).mockReset();
    window.history.replaceState(null, '', '/');
  });

  afterEach(cleanup);

  it('should render the user menu and the language toggle in its footer', () => {
    render(<Sidebar />);
    expect(screen.getByTestId('user-dropup')).toBeTruthy();
    expect(screen.getByTestId('language-toggle')).toBeTruthy();
  });

  it('should render a group of links as a collapsible group rather than a link', () => {
    render(<Sidebar />);
    expect(screen.getByRole('button', { name: 'Administration' })).toBeTruthy();
    expect(screen.queryByTestId('nav-button-/admin/users')).toBeNull();
  });

  it('should highlight the link for the current page', () => {
    window.history.replaceState(null, '', '/datahub');
    render(<Sidebar />);
    expect([...navButton('/datahub').classList]).toContain('bg-slate-800');
  });

  it('should disable a disabled link that is not the current page', () => {
    render(<Sidebar />);
    expect(navButton('/instruments/accessible-instruments').hasAttribute('disabled')).toBe(true);
  });

  it('should keep a disabled link enabled while it is the current page, so the user is not stranded', () => {
    window.history.replaceState(null, '', '/instruments/accessible-instruments');
    render(<Sidebar />);
    expect(navButton('/instruments/accessible-instruments').hasAttribute('disabled')).toBe(false);
  });

  it('should append the end session button to the last group only', () => {
    render(<Sidebar />);
    expect(endSessionButton().parentElement!.contains(navButton('/instruments/accessible-instruments'))).toBe(true);
    expect(endSessionButton().parentElement!.contains(navButton('/datahub'))).toBe(false);
  });

  it('should disable the end session button when no session is active', () => {
    render(<Sidebar />);
    expect(endSessionButton().hasAttribute('disabled')).toBe(true);
  });

  it('should ask for confirmation before ending the session', () => {
    openEndSessionDialog();
    expect(screen.getByRole('dialog').textContent).toContain('End Session');
    expect(mocks.store.endSession).not.toHaveBeenCalled();
  });

  it('should end the session and go to the start page, bypassing any navigation blocker', () => {
    openEndSessionDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(mocks.store.endSession).toHaveBeenCalledOnce();
    expect(mocks.navigate).toHaveBeenCalledWith({ ignoreBlocker: true, to: '/session/start-session' });
  });

  it('should close the confirmation once the start page has been reached', async () => {
    openEndSessionDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('should close the confirmation without ending the session when declined', async () => {
    openEndSessionDialog();
    fireEvent.click(screen.getByRole('button', { name: 'No' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(mocks.store.endSession).not.toHaveBeenCalled();
  });

  it('should show the group switcher when it is placed in the sidebar and there is a group to switch between', () => {
    mocks.isGroupSwitcherVisible = true;
    render(<Sidebar />);
    expect(screen.getByTestId('group-switcher')).toBeTruthy();
  });

  it('should not show the group switcher when it is placed in the top bar', () => {
    mocks.isGroupSwitcherVisible = true;
    mocks.store.groupSwitcherPosition = 'topbar';
    render(<Sidebar />);
    expect(screen.queryByTestId('group-switcher')).toBeNull();
  });

  it('should not show the group switcher when there is no group to switch between', () => {
    render(<Sidebar />);
    expect(screen.queryByTestId('group-switcher')).toBeNull();
  });

  it('should show no session card while no session is active', () => {
    render(<Sidebar />);
    expect(screen.queryByTestId('current-session-info')).toBeNull();
  });

  it("should identify the session's subject by name, date of birth and sex when their personal information is known", () => {
    mocks.store.currentSession = sessionFor(
      subject({ dateOfBirth: new Date('1990-06-15'), firstName: 'Jane', lastName: 'Doe', sex: 'FEMALE' })
    );
    render(<Sidebar />);
    expect(sessionInfo()).toBe('Full Name: Jane DoeDate of Birth: 1990-06-15 Sex at Birth: Female');
  });

  it("should identify the session's subject by their unscoped id when their personal information is unknown", () => {
    mocks.store.currentSession = sessionFor(subject({ firstName: 'Jane' }));
    render(<Sidebar />);
    expect(sessionInfo()).toBe('ID: abc');
  });
});
