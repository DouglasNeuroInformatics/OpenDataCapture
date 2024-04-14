import React, { useState } from 'react';

import { Button, Command, Popover } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { InstrumentIcon } from '@opendatacapture/react-core';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

import { useInstrumentStore } from '@/store/instrument.store';

export const InstrumentSelector = () => {
  const [open, setOpen] = useState(false);
  const { instruments, selectedInstrument, setSelectedInstrument } = useInstrumentStore();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Load an instrument..."
          className="w-96 flex-1 justify-between"
          role="combobox"
          variant="outline"
        >
          {selectedInstrument.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96 p-0">
        <Command>
          <Command.Input placeholder="Search..." />
          <Command.List>
            <Command.Empty>No Instruments Found</Command.Empty>
            <Command.Group heading="Templates">
              {instruments.map((instrument) => (
                <Command.Item
                  key={instrument.id}
                  value={instrument.id}
                  onSelect={(id) => {
                    setSelectedInstrument(id);
                    setOpen(false);
                  }}
                >
                  <InstrumentIcon className="mr-2 h-4 w-4" kind={instrument.kind} />
                  {instrument.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      selectedInstrument.id === instrument.id ? 'opacity-100' : 'opacity-0'
                    )}
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
