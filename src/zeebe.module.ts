import { Module, OnModuleDestroy, DynamicModule, Provider, Logger } from '@nestjs/common';
import { Camunda8, Zeebe } from '@camunda8/sdk';

import { ZEEBE_OPTIONS_PROVIDER, ZEEBE_CONNECTION_PROVIDER } from './zeebe.constants';
import { ZeebeClientOptions, ZeebeAsyncOptions } from './zeebe.interfaces';

@Module({})
export class ZeebeModule implements OnModuleDestroy {
  public static forRoot(options: ZeebeClientOptions): DynamicModule {
    const optionsProviders: Provider[] = [];
    const connectionProviders: Provider[] = [];

    optionsProviders.push(this.createOptionsProvider(options));

    connectionProviders.push(this.createConnectionProvider());

    return {
      global: true,
      module: ZeebeModule,
      providers: [...optionsProviders, ...connectionProviders],
      exports: connectionProviders
    };
  }

  public static forRootAsync(options: ZeebeAsyncOptions): DynamicModule {
    const connectionProviders: Provider[] = [];
    connectionProviders.push(this.createConnectionProvider());

    return {
      global: true,
      module: ZeebeModule,
      imports: options.imports || [],
      providers: [
        {
          provide: ZEEBE_OPTIONS_PROVIDER,
          useFactory: options.useFactory,
          inject: options.inject || []
        },
        ...connectionProviders
      ],
      exports: connectionProviders
    };
  }

  public static forFeature(): DynamicModule {
    return {
      module: ZeebeModule
    };
  }

  private static createOptionsProvider(options: ZeebeClientOptions): Provider {
    return {
      provide: ZEEBE_OPTIONS_PROVIDER,
      useValue: options
    };
  }

  private static createConnectionProvider(): Provider {
    return {
      provide: ZEEBE_CONNECTION_PROVIDER,
      useFactory: async (config: ZeebeClientOptions): Promise<Zeebe.ZeebeGrpcClient> => {
        const camunda = new Camunda8();

        return camunda.getZeebeGrpcApiClient();
      },
      inject: [ZEEBE_OPTIONS_PROVIDER]
    };
  }

  onModuleDestroy(): void {
    Logger.log('Zeebe Module destroyed');
  }
}
