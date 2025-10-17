import { act } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import * as zustand from 'zustand';
import type { StateCreator, StoreApi, UseBoundStore } from 'zustand';

const { create: zCreate, createStore: zCreateStore } = await vi.importActual<typeof zustand>('zustand');

// a variable to hold reset functions for all stores declared in the app
const STORE_RESET_FUNCTIONS = new Set<() => void>();

function createUncurried<T>(stateCreator: StateCreator<T>): UseBoundStore<StoreApi<T>> {
  const store = zCreate(stateCreator);
  const initialState = store.getInitialState();
  STORE_RESET_FUNCTIONS.add(() => {
    store.setState(initialState, true);
  });
  return store;
}

function createStoreUncurried<T>(stateCreator: StateCreator<T>): StoreApi<T> {
  const store = zCreateStore(stateCreator);
  const initialState = store.getInitialState();
  STORE_RESET_FUNCTIONS.add(() => {
    store.setState(initialState, true);
  });
  return store;
}

afterEach(() => {
  act(() => {
    STORE_RESET_FUNCTIONS.forEach((resetFn) => {
      resetFn();
    });
    STORE_RESET_FUNCTIONS.clear();
  });
});

export function create<T>(stateCreator: StateCreator<T>): UseBoundStore<StoreApi<T>> {
  if (typeof stateCreator === 'function') {
    return createUncurried(stateCreator);
  }
  return createUncurried as unknown as UseBoundStore<StoreApi<T>>;
}

export function createStore<T>(stateCreator: StateCreator<T>): StoreApi<T> {
  if (typeof stateCreator === 'function') {
    return createStoreUncurried(stateCreator);
  }
  return createStoreUncurried as unknown as StoreApi<T>;
}
