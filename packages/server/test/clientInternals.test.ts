/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable no-native-reassign */
import { getFetch } from '../../client/src';
import { getAbortController } from '../../client/src/internals/fetchHelpers';

describe('getAbortController() from..', () => {
  test('passed', () => {
    const sym: any = Symbol('test');
    expect(getAbortController(sym)).toBe(sym);
  });
  test('window', () => {
    const sym: any = Symbol('test');

    (globalThis as any).AbortController = undefined;
    (globalThis as any).window = {};
    (globalThis as any).window = AbortController = sym;
    expect(getAbortController()).toBe(sym);
  });
  test('global', () => {
    const sym: any = Symbol('test');

    (globalThis as any).AbortController = sym;
    delete (globalThis as any).window;
    expect(getAbortController()).toBe(sym);
  });
  test('neither', () => {
    (globalThis as any).AbortController = undefined;
    (globalThis as any).window = undefined;
    expect(getAbortController()).toBe(null);
  });
});

describe('getFetch() from...', () => {
  test('passed', () => {
    const sym: any = Symbol('test');
    expect(getFetch(sym)).toBe(sym);
  });
  test('window', () => {
    const sym: any = Symbol('test');

    (globalThis as any).fetch = undefined;
    (globalThis as any).window = {};
    (globalThis as any).window.fetch = sym;
    expect(getFetch()).toBe(sym);
  });
  test('global', () => {
    const sym: any = Symbol('test');

    (globalThis as any).fetch = sym;
    delete (globalThis as any).window;
    expect(getFetch()).toBe(sym);
  });
  test('neither -> throws', () => {
    (globalThis as any).fetch = undefined;
    (globalThis as any).window = undefined;
    expect(() => getFetch()).toThrowError();
  });
});
