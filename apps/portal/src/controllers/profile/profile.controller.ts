/** @format */

// #region Imports NPM
import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { RenderableResponse } from 'nest-next-2';
// #endregion
// #region Imports Local
import { SessionGuard } from '@app/portal/guards/session.guard';
// #endregion

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(SessionGuard)
  public async profile(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile');
  }

  @Get('edit')
  @UseGuards(SessionGuard)
  public async editMe(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/edit');
  }

  @Get('edit/:id')
  @UseGuards(SessionGuard)
  public async editProfile(@Res() res: RenderableResponse, @Param('id') id: string): Promise<void> {
    return res.render('profile/edit', { id });
  }

  @Get('ticket/:id/:type')
  @UseGuards(SessionGuard)
  public async ticket(
    @Res() res: RenderableResponse,
    @Param('id') id: string,
    @Param('type') type: string,
  ): Promise<void> {
    return res.render('profile/ticket', { id, type });
  }

  @Get('equipment')
  @UseGuards(SessionGuard)
  public async equipment(@Res() res: RenderableResponse): Promise<void> {
    return res.render('profile/equipment');
  }
}
