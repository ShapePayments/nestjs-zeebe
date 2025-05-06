import { JOB_ACTION_ACKNOWLEDGEMENT } from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';
import * as process from 'process';
import { Server, CustomTransportStrategy, MessageHandler } from '@nestjs/microservices';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Zeebe } from '@camunda8/sdk';

import { ZEEBE_CONNECTION_PROVIDER } from '../zeebe.constants';
import { ZeebeJob, ZeebeJobWorker, ZeebeWorkerConfig, ZeebeWorkerProperties } from '../zeebe.interfaces';

function isKeyZeebeWorker(obj: any): obj is ZeebeWorkerProperties {
  return 'type' in obj && !('rpc' in obj);
}

interface HandlerContext {
  worker: ZeebeJobWorker;
}

interface Handler extends MessageHandler<ZeebeJob, HandlerContext, JOB_ACTION_ACKNOWLEDGEMENT> {
  (job: ZeebeJob, context: HandlerContext): Promise<JOB_ACTION_ACKNOWLEDGEMENT>;
}

/**
 * A customer transport for Zeebe.
 *
 * @export
 * @class ZeebeServer
 * @extends {Server}
 * @implements {CustomTransportStrategy}
 */
@Injectable()
export class ZeebeServer extends Server implements CustomTransportStrategy {
  private workers: Map<string, Zeebe.ZBWorker<any, any, any>>;

  constructor(
    @Inject(ZEEBE_CONNECTION_PROVIDER)
    private readonly client: Zeebe.ZeebeGrpcClient
  ) {
    super();
  }

  public async listen(callback: () => void): Promise<void> {
    this.init();

    callback();
  }

  public close(): void {
    this.client.close().then(() => Logger.log('All workers closed'));
  }

  public on<EventKey, EventCallback>(event: EventKey, callback: EventCallback): any {
    throw new Error('Method not implemented.');
  }

  public unwrap<T>(): T {
    return this.client as T;
  }

  private init(): void {
    const handlers = this.getHandlers();

    for (const [key, handler] of handlers.entries()) {
      const keyData = this.parseHandlerKey(key);

      if (keyData === null) {
        continue;
      }

      if (!isKeyZeebeWorker(keyData)) {
        continue;
      }

      const workerConfig = this.createWorkerConfig(keyData, handler as Handler);

      if (!this.workers.has(workerConfig.id)) {
        const worker = this.client.createWorker(workerConfig);

        this.workers.set(workerConfig.id, worker);
      }
    }
  }

  private parseHandlerKey(key: string): ZeebeWorkerProperties | null {
    if (key.trim().startsWith('{')) {
      try {
        const jsonData = JSON.parse(key) as ZeebeWorkerProperties;

        return jsonData;
      } catch (ex: any) {
        this.logger.error('Zeebe handler parsing error:', ex);

        return null;
      }
    }

    return null;
  }

  private createWorkerConfig(properties: ZeebeWorkerProperties, handler: Handler): ZeebeWorkerConfig {
    const workerId = `${properties.type}_${process.pid}`;

    return {
      id: workerId,
      taskType: properties.type,
      taskHandler: (job: ZeebeJob, worker: ZeebeJobWorker) =>
        handler(job, { worker }) as Promise<JOB_ACTION_ACKNOWLEDGEMENT>,
      onConnectionError: undefined
    };
  }
}
