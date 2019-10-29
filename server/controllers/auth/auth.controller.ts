/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { NextResponse } from 'nest-next-module';
import { SessionGuard } from '../../guards/session.guard';
// #endregion
// #region Imports Local
// #endregion

// @ApiUseTags('auth')
@Controller('auth')
export class AuthController {
  @Get('login')
  public async login(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/auth/login');
  }

  @Get('logout')
  @UseGuards(SessionGuard)
  public async logout(@Res() res: NextResponse): Promise<void> {
    return res.nextRender('/auth/logout');
  }
}
