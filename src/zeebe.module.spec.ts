import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Zeebe } from '@camunda8/sdk';

import { ZeebeModule } from './zeebe.module';
import { ZEEBE_CONNECTION_PROVIDER } from './zeebe.constants';

describe('Zeebe module', () => {
  it('boots successfully', async () => {
    const rootModule = await Test.createTestingModule({
      imports: [ZeebeModule.forRoot({ gatewayAddress: 'localhost:26500' })]
    }).compile();

    expect(rootModule.get(ZEEBE_CONNECTION_PROVIDER)).toBeInstanceOf(Zeebe.ZeebeGrpcClient);
  });

  it('boots successfully asynchronously', async () => {
    @Injectable()
    class ConfigService {
      public zeebeOptions = { gatewayAddress: 'localhost:26500' };
    }

    @Module({
      providers: [ConfigService],
      exports: [ConfigService]
    })
    class FeatureModule {}

    const rootModule = await Test.createTestingModule({
      imports: [
        ZeebeModule.forRootAsync({
          imports: [FeatureModule],
          useFactory: (cfg: ConfigService) => {
            return cfg.zeebeOptions;
          },
          inject: [ConfigService]
        })
      ]
    }).compile();

    const app = rootModule.createNestApplication();
    await app.init();

    expect(rootModule.get(ZEEBE_CONNECTION_PROVIDER)).toBeInstanceOf(Zeebe.ZeebeGrpcClient);
  });
});
