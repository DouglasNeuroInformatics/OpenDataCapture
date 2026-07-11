import { describe, expect, it, vi } from 'vitest';

import { deleteSeriesInstrument } from './delete-series-instrument';

describe('deleteSeriesInstrument', () => {
  it('closes and removes the instrument after successful deletion', async () => {
    const deleteInstrument = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    await deleteSeriesInstrument({ deleteInstrument, id: 'series-1', onClose, onDeleted });

    expect(onDeleted).toHaveBeenCalledWith('series-1');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes without removing the instrument after rejected deletion', async () => {
    const deleteInstrument = vi.fn().mockRejectedValue(new Error('Series has collected data'));
    const onClose = vi.fn();
    const onDeleted = vi.fn();

    await expect(deleteSeriesInstrument({ deleteInstrument, id: 'series-1', onClose, onDeleted })).resolves.toBe(
      undefined
    );

    expect(onDeleted).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
