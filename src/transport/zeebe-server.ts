import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ZEEBE_CONNECTION_PROVIDER } from '../zeebe.constans';
import { ZBClient, ZBWorkerTaskHandler } from 'zeebe-node';
import * as process from 'process';
import { ZeebeWorkerProperties } from '../zeebe.interfaces';

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
  constructor(@Inject(ZEEBE_CONNECTION_PROVIDER) private readonly client: ZBClient) {
    super();
  }

  public async listen(callback: () => void): Promise<void> {
    this.init();
    callback();
  }

  public close(): void {
    this.client.close().then(() => Logger.log('All workers closed'));
  }

  private init(): void {
    const handlers = this.getHandlers();
    handlers.forEach((value, key: any) => {
      if (typeof key === 'string' && key.includes('{')) {
        const workerOptions = {
          id: '',
          taskType: '',
          handler: ((job: any, worker: any, complete: any) =>
            value(job, { complete, worker }) as any) as ZBWorkerTaskHandler,
          options: {},
          onConnectionError: undefined
        };
        // See if it's a json, if so use it's data
        try {
          const jsonKey = JSON.parse(key) as ZeebeWorkerProperties;
          workerOptions.taskType = jsonKey.type;
          workerOptions.options = jsonKey.options || {};

          workerOptions.id = `${workerOptions.taskType}_${process.pid}`;
          //workerOptions.id, workerOptions.taskType, workerOptions.handler, workerOptions.options
          this.client.createWorker({
            id: workerOptions.id,
            taskHandler: workerOptions.handler, // as ZBWorkerTaskHandler<IInputVariables, ICustomHeaders, IOutputVariables>,
            taskType: workerOptions.taskType,
            ...workerOptions.options
          });
        } catch (ex) {
          this.logger.error('Zeebe error:', ex);
        }
      }
    });
  }
}
