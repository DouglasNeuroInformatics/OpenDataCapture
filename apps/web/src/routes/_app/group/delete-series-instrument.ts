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
    // The mutation presents the API error as a notification.
  } finally {
    onClose();
  }
}
