import {type ErrorDescription, parseError} from "@/lib/errors";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyFunction = (...args: any[]) => any;
type AttemptCallback = () => any;
type AwaitedReturnType<F extends AnyFunction> = Awaited<ReturnType<F>>;
type IsPromise<T> = T extends Promise<any> ? true : false;

/**
 * Representa un resultado fallido.
 */
export type Failure<E = unknown> = {
  success: false;
  error: E;
};

/**
 * Representa un resultado exitoso.
 */
export type Success<T = void> = {
  success: true;
  data: T;
};

/**
 * Representa un resultado que puede ser exitoso o fallido,
 * con utilidades adicionales (`unwrap`, `or`).
 */
export type Result<T = void, E = unknown> = (Failure<E> | Success<T>) & {
  unwrap(): T;
  or(defaultValue: T): T;
};

/**
 * Versión asíncrona de {@link Result}.
 */
export type AwaitResult<T = void, E = unknown> = Promise<Result<T, E>> & {
  unwrap(): Promise<T>;
  or(defaultValue: T): Promise<T>;
};

/**
 * Construye un resultado exitoso sin datos.
 */
export function succeed(): Success;
/**
 * Construye un resultado exitoso con datos.
 */
export function succeed<T>(data: T): Success<T>;
export function succeed<T>(data?: T): Success<T | undefined> {
  return {success: true, data};
}

/**
 * Construye un resultado fallido con un error.
 */
export function fail<E = unknown>(error: E): Failure<E> {
  return {success: false, error};
}

/**
 * Convierte un {@link Success} o {@link Failure} en un {@link Result} enriquecido.
 */
export function asResult<T, E>(result: Failure<E> | Success<T>): Result<T, E> {
  return Object.assign(result, {
    unwrap: () => unwrap(result),
    or: (defaultValue: T) => or(result, defaultValue),
  });
}

/**
 * Extrae el dato de un resultado o lanza el error si es fallo.
 */
export function unwrap<T, E>(result: Failure<E> | Success<T>): T {
  if (result.success) return result.data;
  throw result.error;
}

/**
 * Extrae el dato de un resultado o devuelve un valor por defecto si es fallo.
 */
export function or<T, E>(result: Failure<E> | Success<T>, defaultValue: T): T {
  return result.success ? result.data : defaultValue;
}

/**
 * Ejecuta un callback y devuelve un {@link Result} o {@link AwaitResult}.
 * Usa {@link parseError} para normalizar errores.
 */
export function tryGet<F extends AttemptCallback>(
  callback: F
): IsPromise<ReturnType<F>> extends true
  ? AwaitResult<AwaitedReturnType<F>, ErrorDescription>
  : Result<ReturnType<F>, ErrorDescription>;

/**
 * Ejecuta un callback y devuelve un {@link Result} o {@link AwaitResult}.
 * Usa un parser personalizado para normalizar errores.
 */
export function tryGet<F extends AttemptCallback, E>(
  callback: F,
  parser: (error: unknown) => E
): IsPromise<ReturnType<F>> extends true
  ? AwaitResult<AwaitedReturnType<F>, E>
  : Result<ReturnType<F>, E>;

export function tryGet<F extends AttemptCallback, E>(
  callback: F,
  parser: (error: unknown) => E = parseError as (error: unknown) => E
): Result<ReturnType<F>, E> | AwaitResult<AwaitedReturnType<F>, E> {
  const result = callback();
  if (result instanceof Promise) {
    const promise = result
    .then(data => asResult<AwaitedReturnType<F>, E>(succeed(data)))
    .catch(error => asResult<AwaitedReturnType<F>, E>(fail(parser(error))));
    
    return Object.assign(promise, {
      unwrap: () => promise.then(res => res.unwrap()),
      or: (defaultValue: AwaitedReturnType<F>) => promise.then(res => res.or(defaultValue)),
    });
  }
  try {
    return asResult<ReturnType<F>, E>(succeed(result));
  } catch (error) {
    return asResult<ReturnType<F>, E>(fail(parser(error)));
  }
}

/**
 * Envuelve una función en una versión segura que devuelve {@link Result} o {@link AwaitResult}.
 * Usa {@link parseError} para normalizar errores.
 */
export function attempt<F extends AnyFunction>(
  callback: F
): IsPromise<ReturnType<F>> extends true
  ? (...args: Parameters<F>) => AwaitResult<AwaitedReturnType<F>, ErrorDescription>
  : (...args: Parameters<F>) => Result<ReturnType<F>, ErrorDescription>;

/**
 * Envuelve una función en una versión segura que devuelve {@link Result} o {@link AwaitResult}.
 * Usa un parser personalizado para normalizar errores.
 */
export function attempt<F extends AnyFunction, E>(
  callback: F,
  parser: (error: unknown) => E
): IsPromise<ReturnType<F>> extends true
  ? (...args: Parameters<F>) => AwaitResult<AwaitedReturnType<F>, E>
  : (...args: Parameters<F>) => Result<ReturnType<F>, E>;

export function attempt<F extends AnyFunction, E>(
  callback: F,
  parser: (error: unknown) => E = parseError as (error: unknown) => E
) {
  return (...args: Parameters<F>) => tryGet(() => callback(...args), parser);
}
