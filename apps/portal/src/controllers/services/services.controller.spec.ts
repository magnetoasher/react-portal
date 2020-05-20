/** @format */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { ServicesController } from './services.controller';
//#endregion
//#region Imports Local
//#endregion

describe('Services Controller', () => {
  let controller: ServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
    }).compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
