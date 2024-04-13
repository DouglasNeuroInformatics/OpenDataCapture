import React from 'react';

import { Button, Dialog, Input, Label } from '@douglasneuroinformatics/libui/components';
import { SaveIcon } from 'lucide-react';

export const SaveButton = () => {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button className="h-9 w-9" size="icon" variant="outline">
          <SaveIcon />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-[475px]">
        <Dialog.Header>
          <Dialog.Title>Save preset</Dialog.Title>
          <Dialog.Description>
            This will save the current playground state as a preset which you can access later or share with others.
          </Dialog.Description>
        </Dialog.Header>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" />
          </div>
        </div>
        <Dialog.Footer>
          <Button type="submit">Save</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
