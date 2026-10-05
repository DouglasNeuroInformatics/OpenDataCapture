import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { unilingualFormInstrument } from '@opendatacapture/instrument-stubs/forms';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Route } from '@/routes/_app/upload/$instrumentId';
import { UploadError } from '@/utils/upload';

import '@/services/i18n';

type SearchError = {
  description?: { en?: string; es?: string; fr?: string };
  title: { en: string; es: string; fr: string };
};

type StoreUser = { groups: { id: string; name: string }[]; username: string };

const mocks = vi.hoisted(() => ({
  createUploadTemplateCSV: vi.fn(),
  download: vi.fn(),
  instrument: null as null | object,
  mutateAsync: vi.fn(),
  navigate: vi.fn<(options: { search?: { error: SearchError }; to: string }) => void>(),
  processInstrumentCSV: vi.fn(),
  reformatInstrumentData: vi.fn(),
  search: {},
  store: {
    currentGroup: null as null | { id: string; name: string },
    currentUser: null as null | StoreUser
  },
  useInstrument: vi.fn(),
  useUsersQuery: vi.fn()
}));

vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  createFileRoute: () => (options: object) => ({
    options,
    useNavigate: () => mocks.navigate,
    useParams: () => ({ instrumentId: 'instrument-1' }),
    useSearch: () => mocks.search
  })
}));
vi.mock('@douglasneuroinformatics/libui/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@douglasneuroinformatics/libui/hooks')>()),
  useDownload: () => mocks.download
}));
vi.mock('@/hooks/useInstrument', () => ({
  useInstrument: (id: string) => {
    mocks.useInstrument(id);
    return mocks.instrument;
  }
}));
vi.mock('@/hooks/useUploadInstrumentRecordsMutation', () => ({
  useUploadInstrumentRecordsMutation: () => ({ mutateAsync: mocks.mutateAsync })
}));
vi.mock('@/hooks/useUsersQuery', () => ({
  useUsersQuery: (options: unknown) => {
    mocks.useUsersQuery(options);
    return { data: [{ username: 'alice' }, { username: 'bob' }] };
  }
}));
vi.mock('@/store', () => ({
  useAppStore: (selector: (store: typeof mocks.store) => unknown) => selector(mocks.store)
}));
vi.mock('@/utils/upload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/upload')>()),
  createUploadTemplateCSV: mocks.createUploadTemplateCSV,
  processInstrumentCSV: mocks.processInstrumentCSV,
  reformatInstrumentData: mocks.reformatInstrumentData
}));

const instrument = unilingualFormInstrument.instance;
const group = { id: 'group-1', name: 'Group One' };
const csvFile = new File(['subjectID,date\n'], 'records.csv', { type: 'text/csv' });
const uploadError = new UploadError({ en: 'Column favoriteNumber is missing' });

const renderPage = () => {
  const Component = Route.options.component!;
  return render(<Component />);
};

const chooseFile = async () => {
  fireEvent.change(screen.getByTestId('dropzone').querySelector('input')!, { target: { files: [csvFile] } });
  await screen.findByText('records.csv');
};

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

/** Opens a select from the keyboard, since happy-dom dispatches no pointer capture. */
const choose = (select: 'group' | 'username', option: string) => {
  const triggers = screen.getAllByRole('combobox');
  fireEvent.keyDown(select === 'group' ? triggers[0]! : triggers.at(-1)!, { key: 'Enter' });
  fireEvent.click(screen.getByRole('option', { name: option }));
};

const lastNavigatedError = () => mocks.navigate.mock.lastCall?.[0].search?.error;

describe('upload instrument records page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationsStore.setState({ notifications: [] });
    mocks.instrument = instrument;
    mocks.search = {};
    mocks.store.currentGroup = group;
    mocks.store.currentUser = { groups: [group, { id: 'group-2', name: 'Group Two' }], username: 'jane' };
    mocks.processInstrumentCSV.mockResolvedValue([{ subjectID: 'S1' }]);
    mocks.reformatInstrumentData.mockReturnValue({ instrumentId: instrument.id, records: [{}] });
    mocks.mutateAsync.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('when the search carries an error', () => {
    beforeEach(() => {
      mocks.search = {
        error: {
          description: { en: 'Column favoriteNumber is missing' },
          title: { en: 'Upload Failed', es: 'Carga fallida', fr: 'Échec du téléversement' }
        }
      };
    });

    it('should show the error title and description instead of the upload form', () => {
      renderPage();
      expect(screen.getByText('Upload Failed')).toBeTruthy();
      expect(screen.getByText('Column favoriteNumber is missing')).toBeTruthy();
      expect(screen.queryByTestId('dropzone')).toBeNull();
    });

    it('should omit the description paragraph when the error has none', () => {
      mocks.search = { error: { title: { en: 'Upload Failed', es: 'Carga fallida', fr: 'Échec' } } };
      const { container } = renderPage();
      expect(container.querySelector('p')).toBeNull();
    });

    it('should download the serialized error as a report', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Error Report' }));
      expect(mocks.download).toHaveBeenCalledWith('error.json', expect.stringContaining('"Upload Failed"'));
    });

    it('should clear the error from the search when trying again', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
      expect(mocks.navigate).toHaveBeenCalledWith({ to: '.' });
    });
  });

  it('should load the instrument named by the route parameter', () => {
    renderPage();
    expect(mocks.useInstrument).toHaveBeenCalledWith('instrument-1');
  });

  it('should render nothing until the instrument has loaded', () => {
    mocks.instrument = null;
    const { container } = renderPage();
    expect(container.innerHTML).toBe('');
  });

  it('should name the instrument in the page heading', () => {
    renderPage();
    expect(screen.getByText('Upload Data For Unilingual Form')).toBeTruthy();
  });

  it('should keep submit disabled until a file has been chosen', async () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Submit' }).hasAttribute('disabled')).toBe(true);
    await chooseFile();
    expect(screen.getByRole('button', { name: 'Submit' }).hasAttribute('disabled')).toBe(false);
  });

  it('should upload the processed records under the current group and user', async () => {
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() =>
      expect(mocks.mutateAsync).toHaveBeenCalledWith(mocks.reformatInstrumentData.mock.results[0]!.value)
    );
    expect(mocks.processInstrumentCSV).toHaveBeenCalledWith(csvFile, instrument);
    expect(mocks.reformatInstrumentData).toHaveBeenCalledWith({
      currentGroup: group,
      currentUsername: 'jane',
      data: [{ subjectID: 'S1' }],
      instrument
    });
  });

  it('should clear the chosen file once the upload succeeds, so it cannot be submitted twice', async () => {
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() => expect(screen.queryByText('records.csv')).toBeNull());
    expect(screen.getByRole('button', { name: 'Submit' }).hasAttribute('disabled')).toBe(true);
  });

  it('should show a spinner in place of the form while the upload is in flight', async () => {
    mocks.mutateAsync.mockReturnValue(new Promise(() => undefined));
    renderPage();
    await chooseFile();
    submit();
    expect(await screen.findByText('Data currently uploading...')).toBeTruthy();
    expect(screen.queryByTestId('dropzone')).toBeNull();
  });

  it('should warn that a very large upload will take a while', async () => {
    mocks.reformatInstrumentData.mockReturnValue({ records: Array.from({ length: 1001 }, () => ({})) });
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(useNotificationsStore.getState().notifications).toMatchObject([
      { message: 'Lots of entries loading, please wait...', type: 'info' }
    ]);
  });

  it('should not warn about an upload of ordinary size', async () => {
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalled());
    expect(useNotificationsStore.getState().notifications).toEqual([]);
  });

  it('should attribute the records to the username chosen in the select', async () => {
    renderPage();
    choose('username', 'bob');
    await chooseFile();
    submit();
    await waitFor(() =>
      expect(mocks.reformatInstrumentData).toHaveBeenCalledWith(expect.objectContaining({ currentUsername: 'bob' }))
    );
  });

  it('should attribute the records to no user when N/A is chosen', async () => {
    renderPage();
    choose('username', 'N/A');
    await chooseFile();
    submit();
    await waitFor(() => expect(mocks.reformatInstrumentData).toHaveBeenCalled());
    expect(mocks.reformatInstrumentData.mock.lastCall?.[0]).toMatchObject({ currentUsername: undefined });
  });

  it('should attribute the records to no user when nobody is signed in', async () => {
    mocks.store.currentUser = null;
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() => expect(mocks.reformatInstrumentData).toHaveBeenCalled());
    expect(mocks.reformatInstrumentData.mock.lastCall?.[0]).toMatchObject({ currentUsername: undefined });
  });

  it('should list the users of the current group, plus N/A, as candidates', () => {
    renderPage();
    fireEvent.keyDown(screen.getAllByRole('combobox').at(-1)!, { key: 'Enter' });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['alice', 'bob', 'N/A']);
    expect(mocks.useUsersQuery).toHaveBeenCalledWith({ params: { groupId: 'group-1' } });
  });

  it('should query users without a group filter when no group is selected', () => {
    mocks.store.currentGroup = null;
    renderPage();
    expect(mocks.useUsersQuery).toHaveBeenCalledWith({ params: { groupId: undefined } });
  });

  it('should hide the group filter from a user who belongs to no group', () => {
    mocks.store.currentUser = { groups: [], username: 'jane' };
    renderPage();
    expect(screen.queryByText('Filter users by group.')).toBeNull();
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
  });

  it('should hide the group filter when nobody is signed in', () => {
    mocks.store.currentUser = null;
    renderPage();
    expect(screen.queryByText('Filter users by group.')).toBeNull();
  });

  it('should requery users for the chosen group and drop a username picked from the previous one', async () => {
    renderPage();
    choose('username', 'bob');
    choose('group', 'Group Two');
    expect(mocks.useUsersQuery).toHaveBeenLastCalledWith({ params: { groupId: 'group-2' } });
    await chooseFile();
    submit();
    await waitFor(() =>
      expect(mocks.reformatInstrumentData).toHaveBeenCalledWith(expect.objectContaining({ currentUsername: 'jane' }))
    );
  });

  it('should report an upload error with its description in the search', async () => {
    mocks.processInstrumentCSV.mockRejectedValue(uploadError);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(lastNavigatedError()).toMatchObject({
      description: { en: 'Column favoriteNumber is missing' },
      title: { en: 'An error has happened within the request' }
    });
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it('should report an unexpected upload failure without a description', async () => {
    mocks.mutateAsync.mockRejectedValue(new Error('Network Error'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPage();
    await chooseFile();
    submit();
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalled());
    expect(lastNavigatedError()?.description).toBeUndefined();
  });

  it('should download a template CSV for the instrument', () => {
    mocks.createUploadTemplateCSV.mockReturnValue({ content: 'subjectID,date', filename: 'template.csv' });
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Template' }));
    expect(mocks.createUploadTemplateCSV).toHaveBeenCalledWith(instrument);
    expect(mocks.download).toHaveBeenCalledWith('template.csv', 'subjectID,date');
  });

  it('should report a template that cannot be generated with its description in the search', () => {
    mocks.createUploadTemplateCSV.mockImplementation(() => {
      throw uploadError;
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Template' }));
    expect(lastNavigatedError()).toMatchObject({
      description: { en: 'Column favoriteNumber is missing' },
      title: { en: 'Error Occurred Downloading Sample Template' }
    });
  });

  it('should report an unexpected template failure without a description', () => {
    mocks.createUploadTemplateCSV.mockImplementation(() => {
      throw new TypeError('Unsupported schema');
    });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Template' }));
    expect(lastNavigatedError()?.description).toBeUndefined();
  });

  it('should open the upload guide in a new window', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(open).toHaveBeenCalledWith('https://opendatacapture.org/en/docs/guides/how-to-upload-data/');
  });
});
