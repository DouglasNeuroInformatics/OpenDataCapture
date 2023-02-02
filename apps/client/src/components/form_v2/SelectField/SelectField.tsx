import React, { useMemo, useState } from 'react';

export interface SelectFieldProps {
  name: string;
  options: readonly string[];
  autocompleteValues?: {
    [key: string]: string[];
  };
}

export const SelectField = ({ name }: SelectFieldProps) => {
  return (
    <div>
      <input className="input" name={name} type="text" />
    </div>
  );
};

/*
import { Combobox } from '@headlessui/react';

import { ErrorBox } from '../ErrorBox';

export interface SelectFieldOption {
  name: string;
  altNames?: string[];
}

export interface SelectFieldProps {
  name: string;
  options: SelectFieldOption[];
}

export const SelectField = ({ name, options }: SelectFieldProps) => {
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');

  const filteredOptions: SelectFieldOption[] = useMemo(() => {
    if (!query) {
      return options;
    }

    const q = query.toUpperCase();
    return options.filter(({ name, altNames }) => {
      return name.toUpperCase().startsWith(q) || altNames?.find((value) => value.toUpperCase().startsWith(q));
    });
  }, [options, query]);

  return (
    <div>
      <Combobox nullable name={name} value={inputValue} onChange={setInputValue}>
        {({ open }) => (
          <React.Fragment>
            <Combobox.Input className="input" onChange={(event) => setQuery(event.target.value)} />
            {open && (
              <Combobox.Options static>
                {filteredOptions.map((option) => (
                  <Combobox.Option
                    className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
                    key={option.name}
                    value={option.name}
                  >
                    {option.name}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </React.Fragment>
        )}
      </Combobox>
    </div>
  );

  /*

  return (
    <div>
      <Combobox nullable name={name} value={inputValue} onChange={setInputValue}>
        
        <Combobox.Input
          className="input"
          onChange={(event) => setQuery(event.target.value)}
        />
        <Combobox.Options>
          {filteredOptions.map((option) => (
            <Combobox.Option
              className="ui-active:bg-blue-500 ui-active:text-white ui-not-active:bg-white ui-not-active:text-black"
              key={option.name}
              value={option.name}
            >
              {option.name}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox>
      <ErrorBox message="Foo" />
    </div>
  );

};
*/
