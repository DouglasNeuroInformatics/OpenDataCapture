import React, { useState } from 'react';

import { AlertDialog, Button, Dialog, DropdownMenu, Label, Switch } from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore } from '@douglasneuroinformatics/libui/hooks';
import { EllipsisIcon } from 'lucide-react';

export const PresetActions = () => {
  const [open, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { addNotification } = useNotificationsStore();

  return (
    <React.Fragment>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <span className="sr-only">Actions</span>
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Item onSelect={() => setIsOpen(true)}>Content filter preferences</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item className="text-red-600" onSelect={() => setShowDeleteDialog(true)}>
            Delete preset
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setIsOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Content filter preferences</Dialog.Title>
            <Dialog.Description>
              The content filter flags text that may violate our content policy. It&apos;s powered by our moderation
              endpoint which is free to use to moderate your OpenAI API traffic. Learn more.
            </Dialog.Description>
          </Dialog.Header>
          <div className="py-6">
            <h4 className="text-muted-foreground text-sm">Playground Warnings</h4>
            <div className="flex items-start justify-between space-x-4 pt-3">
              <Switch defaultChecked={true} id="show" name="show" />
              <Label className="grid gap-1 font-normal" htmlFor="show">
                <span className="font-semibold">Show a warning when content is flagged</span>
                <span className="text-muted-foreground text-sm">
                  A warning will be shown when sexual, hateful, violent or self-harm content is detected.
                </span>
              </Label>
            </div>
          </div>
          <Dialog.Footer>
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
            <AlertDialog.Description>
              This action cannot be undone. This preset will no longer be accessible by you or others you&apos;ve shared
              it with.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <Button
              variant="danger"
              onClick={() => {
                setShowDeleteDialog(false);
                addNotification({ message: 'This preset has been deleted', type: 'success' });
              }}
            >
              Delete
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </React.Fragment>
  );
};
