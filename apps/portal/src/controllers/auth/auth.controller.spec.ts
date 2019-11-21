/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
// #endregion
// #region Imports Local
import { ConfigService } from '@app/config';
import { AuthController } from './auth.controller';
// #endregion

jest.mock('@app/config');
jest.mock('@app/logger');

describe('Auth Controller', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'local', session: true })],
      controllers: [AuthController],
      providers: [ConfigService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
