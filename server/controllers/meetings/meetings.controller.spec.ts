/** @format */

// #region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
// #endregion
// #region Imports Local
// #endregion

describe('Meetings Controller', () => {
  let controller: MeetingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
    }).compile();

    controller = module.get<MeetingsController>(MeetingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
