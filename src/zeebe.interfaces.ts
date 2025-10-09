import { Zeebe } from '@camunda8/sdk';
import {
  IZBJobWorker,
  ZBWorkerConfig,
  IInputVariables,
  JSON as ZeebeJson
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

// Reexport types

export { ZeebeJob } from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

export type ZBWorkerOptions<INPUT, HEADER, OUTPUT> = Zeebe.ZBWorker<INPUT, HEADER, OUTPUT>;

export type ZeebeJobWorker = IZBJobWorker;

export type ZeebeClient = Zeebe.ZeebeGrpcClient;

export type ZBClient = Zeebe.ZeebeGrpcClient;

export const Duration = Zeebe.Duration;

// New types needed for own implementation

/**
 *
 *
 * @export
 * @interface ZeebeWorkerProperties
 */
export interface ZeebeWorkerProperties<I, H, O> {
  type: string;
  options?: ZBWorkerOptions<I, H, O>;
}

export interface ZeebeWorkerConfig<I, H, O> extends ZBWorkerConfig<I, H, O> {
  id: string;
}

/**
 *
 *
 * @export
 * @interface ZeebeClientOptions
 */
export interface ZeebeClientOptions<I = any, H = any, O = any> {
  gatewayAddress: string;
  options?: ZBWorkerOptions<I, H, O>;
}

/**
 *
 *
 * @export
 * @interface ZeebeAsyncOptions
 */
export interface ZeebeAsyncOptions<I, H, O> {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<ZeebeClientOptions<I, H, O>> | ZeebeClientOptions<I, H, O>;
}

type ZeebeJsonWeak = ZeebeJson | undefined;

export type CastVars<T> = Record<keyof T, ZeebeJson>;
