import React, { useState } from 'react';

import { Button, Command, Popover } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

import type { Preset } from '../../data/presets';

type PresetSelectorProps = React.ComponentProps<typeof Popover> & {
  presets: Preset[];
};

export const PresetSelector = ({ presets, ...props }: PresetSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>();

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <Popover.Trigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Load a preset..."
          className="w-96 flex-1 justify-between"
          role="combobox"
          variant="outline"
        >
          {selectedPreset ? selectedPreset.name : 'Load a preset...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96 p-0">
        <Command>
          <Command.Input placeholder="Search presets..." />
          <Command.List>
            <Command.Empty>No results found.</Command.Empty>
            <Command.Group heading="Examples">
              {presets.map((preset) => (
                <Command.Item
                  key={preset.id}
                  onSelect={() => {
                    setSelectedPreset(preset);
                    setOpen(false);
                  }}
                >
                  {preset.name}
                  <CheckIcon
                    className={cn('ml-auto h-4 w-4', selectedPreset?.id === preset.id ? 'opacity-100' : 'opacity-0')}
                  />
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
