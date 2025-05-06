import { Zeebe } from '@camunda8/sdk';
import {
  IZBJobWorker,
  ZBWorkerConfig,
  ZeebeJob as OriginalZeebeJob
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

export type ZBWorkerOptions = Zeebe.ZBWorker<any, any, any>;

/**
 *
 *
 * @export
 * @interface ZeebeWorkerProperties
 */
export interface ZeebeWorkerProperties {
  type: string;
  options?: ZBWorkerOptions;
}

export interface ZeebeWorkerConfig extends ZBWorkerConfig<any, any, any> {
  id: string;
}

/**
 *
 *
 * @export
 * @interface ZeebeClientOptions
 */
export interface ZeebeClientOptions {
  gatewayAddress: string;
  options?: ZBWorkerOptions;
}

/**
 *
 *
 * @export
 * @interface ZeebeAsyncOptions
 */
export interface ZeebeAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<ZeebeClientOptions> | ZeebeClientOptions;
}

/**
 *
 *
 * @export
 * @interface ZeebeJob
 * @extends {OriginalZeebeJob}
 */
export type ZeebeJob = OriginalZeebeJob;

export type ZeebeJobWorker = IZBJobWorker;
