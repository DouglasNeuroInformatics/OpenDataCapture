type DeleteSeriesInstrumentOptions = {
  deleteInstrument: (input: { id: string }) => Promise<unknown>;
  id: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
};

export async function deleteSeriesInstrument({
  deleteInstrument,
  id,
  onClose,
  onDeleted
}: DeleteSeriesInstrumentOptions): Promise<void> {
  try {
    await deleteInstrument({ id });
    onDeleted(id);
  } catch {
    // The mutation presents the API error as a notification. Close intentionally even on rejection so a
    // protected, already-used series does not leave its confirmation dialog open after the user is notified.
  } finally {
    onClose();
  }
}
