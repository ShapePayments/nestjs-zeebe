import { MessagePattern, PatternMetadata } from '@nestjs/microservices';
import { ZeebeWorkerProperties } from './zeebe.interfaces';
import { ZBWorkerOptions } from 'zeebe-node/dist/lib/interfaces';

export const ZeebeWorker =  (type: string, options?: ZBWorkerOptions) => {
    return MessagePattern({ type, options: options || null });
};