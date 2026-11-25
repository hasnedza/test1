import { useCallback, useEffect, useRef, useState } from 'react';

export interface Identified {
  id: string;
}

export interface CrudApi<T extends Identified> {
  list(): Promise<T[]>;
  create(input: Omit<T, 'id'>): Promise<T>;
  update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<Partial<T>>;
  remove(id: string): Promise<void>;
}

export type CrudStatus = 'loading' | 'ready' | 'error';

export interface UseCrudResult<T extends Identified> {
  readonly items: readonly T[];
  readonly status: CrudStatus;
  readonly error: string | null;
  readonly pending: boolean;
  create(input: Omit<T, 'id'>): Promise<boolean>;
  update(id: string, patch: Partial<Omit<T, 'id'>>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  refresh(): Promise<void>;
  clearError(): void;
}

export function useCrud<T extends Identified>(
  api: CrudApi<T>
): UseCrudResult<T> {
  const [items, setItems] = useState<readonly T[]>([]);
  const [status, setStatus] = useState<CrudStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const alive = useRef(true);
  const apiRef = useRef(api);

  useEffect(() => {
    alive.current = true;
    apiRef.current = api;
    return () => {
      alive.current = false;
    };
  }, [api]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const next = await apiRef.current.list();
      if (!alive.current) return;
      setItems(next);
      setStatus('ready');
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      setStatus('error');
      setError(message(e));
    }
  }, []);

  useEffect(() => {
    // This is a one-time initial fetch keyed to a stable callback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: Omit<T, 'id'>) => {
    const optimistic = { ...input, id: `pending-${crypto.randomUUID()}` } as T;
    setItems((prev) => [optimistic, ...prev]);
    setPending(true);
    try {
      const saved = await apiRef.current.create(input);
      if (!alive.current) return false;
      setItems((prev) => prev.map((item) => (item.id === optimistic.id ? saved : item)));
      setError(null);
      return true;
    } catch (e) {
      if (!alive.current) return false;
      setItems((prev) => prev.filter((item) => item.id !== optimistic.id));
      setError(message(e));
      return false;
    } finally {
      if (alive.current) setPending(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<Omit<T, 'id'>>) => {
      let previous: T | undefined;
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          previous = item;
          return { ...item, ...patch };
        })
      );
      setPending(true);
      try {
        const saved = await apiRef.current.update(id, patch);
        if (!alive.current) return false;
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...saved } : item))
        );
        setError(null);
        return true;
      } catch (e) {
        if (!alive.current) return false;
        if (previous) {
          setItems((prev) =>
            prev.map((item) => (item.id === id ? previous! : item))
          );
        }
        setError(message(e));
        return false;
      } finally {
        if (alive.current) setPending(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    let previous: readonly T[] = [];
    setItems((prev) => {
      previous = prev;
      return prev.filter((item) => item.id !== id);
    });
    setPending(true);
    try {
      await apiRef.current.remove(id);
      if (!alive.current) return false;
      setError(null);
      return true;
    } catch (e) {
      if (!alive.current) return false;
      setItems(previous);
      setError(message(e));
      return false;
    } finally {
      if (alive.current) setPending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    items,
    status,
    error,
    pending,
    create,
    update,
    remove,
    refresh,
    clearError,
  };
}

function message(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}
