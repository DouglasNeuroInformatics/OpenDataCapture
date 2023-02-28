import React from 'react';

import { composeStories } from '@storybook/testing-react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

import * as stories from './Form.stories';

const { DemoForm } = composeStories(stories);

describe('Form', () => {
  it('renders two headings', async () => {
    // 1 - Render the component
    render(<DemoForm />);

    // 2 - Manipulate the component or find an element in it
    const headings = await screen.findAllByRole('heading');

    // 3 - Assert that the component is doing what is expected
    expect(headings).toHaveLength(3);
  });
});
