import type { Meta, StoryObj } from '@storybook/react-vite';

import type { BulkAssignmentEmail } from '@/hooks/useBulkAssignmentEmail';
import { withAppFrame } from '@/testing/withAppFrame';

import { EmailAllDialog } from './EmailAllDialog';

type Story = StoryObj<typeof EmailAllDialog>;

const noop = () => undefined;

const recipients = [
  { assignmentIds: ['assignment-1', 'assignment-2'], recipient: 'alice@example.org' },
  { assignmentIds: ['assignment-3'], recipient: 'bob@example.org' },
  { assignmentIds: ['assignment-4'], recipient: 'carla@example.org' }
];

/** The send controller the dialog reads, stubbed rather than run: a story sends no mail. */
const bulkEmail = (overrides: Partial<BulkAssignmentEmail> = {}): BulkAssignmentEmail => ({
  completedCount: 0,
  hasSent: false,
  isLoading: false,
  isSending: false,
  language: 'en',
  pending: recipients,
  recipients,
  selectedTemplate: '__default__',
  sendAll: () => Promise.resolve(),
  setLanguageChoice: noop,
  setTemplateChoice: noop,
  statuses: {},
  templateLanguages: ['en', 'fr'],
  templateOptions: [{ label: 'Built-in default', value: '__default__' }],
  templates: [],
  ...overrides
});

export default {
  args: {
    bulkEmail: bulkEmail()
  },
  component: EmailAllDialog,
  decorators: [withAppFrame('Remote Assignments')],
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof EmailAllDialog>;

/** A fresh batch: every subject with an address is written to once. */
export const Default: Story = {};

/** A group with templates of its own, which the dialog offers beside the built-in default. */
export const WithGroupTemplates: Story = {
  args: {
    bulkEmail: bulkEmail({
      selectedTemplate: 'tpl-1',
      templateOptions: [
        { label: 'Clinic reminder', value: 'tpl-1' },
        { label: 'Built-in default', value: '__default__' }
      ],
      templates: [
        {
          body: { en: 'Hello, your questionnaire is ready: {{url}}' },
          id: 'tpl-1',
          name: 'Clinic reminder',
          subject: { en: 'Your questionnaire' }
        }
      ]
    })
  }
};

/** Mid-send, with the trigger reporting how far through the batch it is. */
export const Sending: Story = {
  args: {
    bulkEmail: bulkEmail({ completedCount: 1, isSending: true })
  }
};

/** One address failed, so the trigger offers a retry confined to that recipient. */
export const RetryAfterFailure: Story = {
  args: {
    bulkEmail: bulkEmail({
      pending: [recipients[1]!],
      statuses: { 'assignment-1': 'sent', 'assignment-2': 'sent', 'assignment-3': 'error', 'assignment-4': 'sent' }
    })
  }
};

/** Everyone has their links, so there is nobody left to write to. */
export const AllSent: Story = {
  args: {
    bulkEmail: bulkEmail({
      hasSent: true,
      pending: [],
      statuses: { 'assignment-1': 'sent', 'assignment-2': 'sent', 'assignment-3': 'sent', 'assignment-4': 'sent' }
    })
  }
};
