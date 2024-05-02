import React, { useMemo, useState } from 'react';

import { Button, Command, Popover } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { InstrumentIcon } from '@opendatacapture/react-core';
import { groupBy } from 'lodash-es';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

import type { InstrumentCategory, InstrumentRepository } from '@/models/instrument-repository.model';
import { useAppStore } from '@/store';

export const InstrumentSelector = () => {
  const [open, setOpen] = useState(false);
  const instruments = useAppStore((store) => store.instruments);
  const selectedInstrument = useAppStore((store) => store.selectedInstrument);
  const setSelectedInstrument = useAppStore((store) => store.setSelectedInstrument);

  const categorizedInstruments = useMemo(() => {
    return groupBy(instruments, (instrument) => instrument.category) as {
      [K in InstrumentCategory]: InstrumentRepository[];
    };
  }, [instruments]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Load an instrument..."
          className="w-full flex-1 justify-between"
          role="combobox"
          variant="outline"
        >
          {selectedInstrument.label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-72 p-0 lg:w-96">
        <Command>
          <Command.Input placeholder="Search..." />
          <Command.List>
            <Command.Empty>No Instruments Found</Command.Empty>
            {Object.entries(categorizedInstruments).map(([heading, instruments]) => (
              <Command.Group heading={heading} key={heading}>
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
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
