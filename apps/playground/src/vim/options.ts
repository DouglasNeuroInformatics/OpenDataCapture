/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import EditorAdapter from './adapter';

import type { VimState } from './types';

export type OptionCallback = (
  value?: boolean | number | string,
  adapter?: EditorAdapter
) => Error | boolean | number | string;

export type OptionConfig = {
  append?: boolean;
  commas?: boolean;
  flags?: boolean;
  remove?: boolean;
  scope?: 'global' | 'local';
};

type Option = {
  callback?: OptionCallback;
  defaultValue: boolean | number | string | undefined;
  setConfig?: OptionConfig;
  type: 'boolean' | 'number' | 'string';
  value?: boolean | number | string;
};

const options = new Map<string, Option>();

export function defineOption(
  name: string,
  defaultValue: boolean | number | string | undefined,
  type: 'boolean' | 'number' | 'string',
  aliases?: string[],
  callback?: OptionCallback,
  setConfig?: OptionConfig
): void {
  if (defaultValue === undefined && !callback) {
    throw Error('defaultValue is required unless callback is provided');
  }
  if (!type) {
    type = 'string';
  }
  const option: Option = {
    callback: callback,
    defaultValue: defaultValue,
    setConfig: setConfig,
    type: type
  };
  options.set(name, option);
  if (aliases) {
    aliases.forEach((a) => options.set(a, option));
  }
  if (defaultValue) {
    setOption(name, defaultValue);
  }
}

export function setOption(name: string, value: boolean | number | string, adapter?: EditorAdapter, cfg?: OptionConfig) {
  const option = options.get(name);
  if (!option) {
    return new Error(`Unknown option: ${name}`);
  }

  cfg = cfg || {};
  if (option.setConfig) {
    cfg = { ...option.setConfig, ...cfg };
  }
  const scope = cfg.scope;
  if (option.type == 'boolean') {
    if (value && value !== true) {
      return new Error(`Invalid argument: ${name}=${value}`);
    } else if (value !== false) {
      // Boolean options are set to true if value is not defined.
      value = true;
    }
  }
  if (option.type === 'boolean' && (cfg.append || cfg.remove)) {
    return new Error(`Cannot ${cfg.append ? 'append to' : 'remove from'} ${name}`);
  }

  const optionValue = getOption(name, adapter, cfg);

  if (option.type === 'number') {
    const numeric = Number(value);
    if (isNaN(numeric)) {
      return new Error(`Invalid argument: ${name}=${value}`);
    }
    if (cfg.append) {
      value = numeric + (optionValue as number);
    } else if (cfg.remove) {
      value = (optionValue as number) - numeric;
    } else {
      value = numeric;
    }
  } else if (option.type === 'string') {
    value = value.toString();
    const prior = optionValue ? optionValue.toString() : '';
    if (cfg.commas) {
      const existing = prior.split(',');
      const specified = value.split(',');
      if (cfg.append) {
        existing.push(...specified.filter((el) => !existing.includes(el)));
        value = existing.join(',');
      } else if (cfg.remove) {
        value = existing.filter((el) => !specified.includes(el)).join(',');
      }
    } else if (cfg.flags && cfg.append) {
      const newFlags = value
        .split('')
        .filter((f) => !prior.includes(f))
        .join('');
      if (newFlags.length) {
        value = `${prior}${newFlags}`;
      } else {
        return;
      }
    } else {
      if (cfg.append) {
        value = `${prior}${value}`;
      }
      if (cfg.remove) {
        const offset = prior.indexOf(value);
        if (offset >= 0) {
          value = `${prior.substring(0, offset)}${prior.substring(offset + value.length)}`;
        } else {
          return;
        }
      } else {
        // value is as provided
      }
    }
  }

  if (option.callback) {
    if (scope !== 'local') {
      const res = option.callback(value, undefined);
      if (res instanceof Error) {
        return res;
      }
    }
    if (scope !== 'global' && adapter) {
      const res = option.callback(value, adapter);
      if (res instanceof Error) {
        return res;
      }
    }
  } else {
    if (scope !== 'local') {
      option.value = option.type == 'boolean' ? !!value : value;
    }
    if (scope !== 'global' && adapter) {
      (adapter.state.vim as VimState).options[name] = { value: value };
    }
  }
  return;
}

export function getOption(name: string, adapter?: EditorAdapter, cfg?: OptionConfig) {
  const option = options.get(name);
  cfg = cfg || {};
  const scope = cfg.scope;
  if (!option) {
    return new Error('Unknown option: ' + name);
  }
  if (option.callback) {
    const local = adapter && option.callback(undefined, adapter);
    if (scope !== 'global' && local !== undefined) {
      return local;
    }
    if (scope !== 'local') {
      return option.callback();
    }
    return;
  } else {
    const local = scope !== 'global' && adapter && (adapter.state.vim as VimState).options[name];
    return (local || (scope !== 'local' && option) || {}).value;
  }
}

export const resetOptions = () => {
  for (const optionName in options) {
    const option = options.get(optionName)!;
    option.value = option.defaultValue;
  }
};

export const getOptionType = (name: string): 'boolean' | 'number' | 'string' | 'unknown' => {
  const option = options.get(name);
  if (option) {
    return option.type;
  }
  return 'unknown';
};
