import { useState } from 'react';

import type { PermissionSetRule } from '@opendatacapture/schemas/permission-set';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { createRuleDraft } from '@/utils/permission-set-rules';
import type { PermissionSetRuleDraft } from '@/utils/permission-set-rules';

import { PermissionSetRulesEditor } from './PermissionSetRulesEditor';

type Story = StoryObj<typeof PermissionSetRulesEditor>;

const RULES: PermissionSetRule[] = [
  { action: 'read', scope: 'HOLDER_GROUPS', subject: 'Subject' },
  { action: 'read', scope: 'HOLDER_GROUPS', subject: 'InstrumentRecord' },
  { action: 'read', scope: 'ALL_GROUPS', subject: 'Instrument' }
];

const EditableRules = ({ rules }: { rules: PermissionSetRule[] }) => {
  const [currentRules, setRules] = useState(rules);
  const [drafts, setDrafts] = useState<PermissionSetRuleDraft[]>([createRuleDraft()]);
  return (
    <PermissionSetRulesEditor
      drafts={drafts}
      rules={currentRules}
      onDraftsChange={setDrafts}
      onRulesChange={setRules}
    />
  );
};

export default {
  component: PermissionSetRulesEditor,
  decorators: [
    (Story) => (
      <div className="w-[720px]">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: 'centered'
  }
} as Meta<typeof PermissionSetRulesEditor>;

/** A new set: nothing saved yet, one row ready to fill in. */
export const Empty: Story = {
  render: () => <EditableRules rules={[]} />
};

/** A set being edited, with rules on both scopes. */
export const Editing: Story = {
  render: () => <EditableRules rules={RULES} />
};

/** How a user's page shows the set they hold. */
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    rules: RULES
  }
};
