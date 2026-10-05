import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { WizardTable } from '../WizardTable';

const headLabel = 'Name';
const cellValue = 'Alice';

afterEach(cleanup);

describe('WizardTable', () => {
  it('should put the head cells in the header and the children in the body', () => {
    render(
      <WizardTable head={<th>{headLabel}</th>}>
        <tr>
          <td>{cellValue}</td>
        </tr>
      </WizardTable>
    );
    expect(screen.getByText(headLabel).closest('thead')).toBeTruthy();
    expect(screen.getByText(cellValue).closest('tbody')).toBeTruthy();
  });

  it('should merge a caller class onto the frame, so a step can adjust its spacing', () => {
    render(
      <WizardTable className="mt-4" data-testid="wizard-table" head={<th>{headLabel}</th>}>
        {null}
      </WizardTable>
    );
    expect(screen.getByTestId('wizard-table').classList.contains('mt-4')).toBe(true);
  });
});
