/** @format */
/* eslint spaced-comment:0, max-classes-per-file:0 */

//#region Imports NPM
import { Test, TestingModule } from '@nestjs/testing';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
//#endregion
//#region Imports Local
import { ConfigService } from '@app/config';
import { UserService } from '@back/user/user.service';
import { ProfileService } from '@back/profile/profile.service';
import { FilesService } from './files.service';
//#endregion

jest.mock('nextcloud-link');
jest.mock('@app/config/config.service');

const serviceMock = jest.fn(() => ({}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        ConfigService,
        FilesService,
        {
          provide: 'PUB_SUB',
          useValue: serviceMock,
        },
        { provide: WINSTON_MODULE_PROVIDER, useValue: serviceMock },
        { provide: UserService, useValue: serviceMock },
        { provide: ProfileService, useValue: serviceMock },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
