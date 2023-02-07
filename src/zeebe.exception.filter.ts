import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Observable } from "rxjs";

/**
 * Throws an the exception to allow handling by node-zeebe
 *
 * @export
 * @class ZeebeExceptionFilter
 * @extends {BaseRpcExceptionFilter}
 */
@Catch()
export class ZeebeExceptionFilter extends BaseRpcExceptionFilter {

  private readonly logger = new Logger(ZeebeExceptionFilter.name)

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    this.logger.error({ message: 'Exception during zeebe worker', exception });
    throw exception;
    //return super.catch(exception, host);
  }
}
