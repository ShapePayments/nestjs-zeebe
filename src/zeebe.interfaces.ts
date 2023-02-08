import {
  ZBWorkerOptions,
  ZBClientOptions,
  Job,
  JobCompletionInterface,
  IOutputVariables,
  IInputVariables,
  ICustomHeaders
} from 'zeebe-node';

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

/**
 *
 *
 * @export
 * @interface ZeebeClientOptions
 */
export interface ZeebeClientOptions {
  gatewayAddress: string;
  options?: ZBWorkerOptions & ZBClientOptions;
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
 * @extends {Job<IInputVariables, ICustomHeaders>}
 * @extends {JobCompletionInterface<IOutputVariables>}
 */
export interface ZeebeJob extends Job<IInputVariables, ICustomHeaders>, JobCompletionInterface<IOutputVariables> {}
