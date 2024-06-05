import { Server, CustomTransportStrategy } from '@nestjs/microservices';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ZEEBE_CONNECTION_PROVIDER } from '../zeebe.constans';
import { ZBClient, ZBWorkerTaskHandler } from 'zeebe-node';
import * as process from 'process';
import { ZeebeWorkerProperties } from '../zeebe.interfaces';

function isKeyZeebeWorker(obj: any): obj is ZeebeWorkerProperties {
  return 'type' in obj && !('rpc' in obj);
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

    for (const [key, handler] of handlers.entries()) {
      if (typeof key === 'string' && key.trim().startsWith('{')) {
        // See if it's a json, if so use it's data
        try {
          const jsonKey = JSON.parse(key) as ZeebeWorkerProperties;

          if (!isKeyZeebeWorker(jsonKey)) {
            continue;
          }

          const workerOptions = {
            id: '',
            taskType: jsonKey.type,
            handler: ((job: any, worker: any, complete: any) =>
              handler(job, { complete, worker }) as any) as ZBWorkerTaskHandler,
            options: jsonKey.options || {},
            onConnectionError: undefined
          };

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
    }
  }
}
