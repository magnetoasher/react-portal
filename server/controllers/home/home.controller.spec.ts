/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
// #endregion
// #region Imports Local
import { NextService } from '../../next/next.service';
import { HomeController } from './home.controller';
import { LoggerService } from '../../logger/logger.service';
import { LoggerServiceMock } from '../../../__mocks__/logger.service.mock';
import { NextServiceMock } from '../../../__mocks__/next.service.mock';
// #endregion

describe('Home Controller', () => {
  let controller: HomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        { provide: NextService, useClass: NextServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
