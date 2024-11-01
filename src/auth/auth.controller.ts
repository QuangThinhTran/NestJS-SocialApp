import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BaseController } from 'src/util/BaseController';
import { User } from 'src/user/entities/user.entity';
import { LoggerService } from 'src/services/logger.service';
import { Response } from 'express';
import { Messages } from 'src/common/constants/constant';
import { Auth } from './entities/auth.entity';
import { UserService } from 'src/user/user.service';
import { UpdatePassword } from './entities/updatePassword.entity';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    readonly logger: LoggerService,
  ) {
    super(logger);
    this.logger.setContext('AuthService');
  }

  @Post('/register')
  async register(@Body() user: User, @Res() res: Response): Promise<void> {
    try {
      const data = await this.authService.register(user);
      this.responseWithData(Messages.REGISTER_SUCCESS, data, res);
    } catch (e) {
      this.responseException(e);
    }
  }

  @Post('login')
  async login(@Body() data: Auth, @Res() res: Response): Promise<void> {
    try {
      const user = await this.userService.findByUsername(data.username);
      if (!user) {
        this.responseOK(Messages.LOGIN_FAILED_USERNAME, res);
        return;
      }

      const auth = await this.authService.login(data, user);
      if (!auth) {
        this.responseOK(Messages.LOGIN_FAILED_PASSWORD, res);
        return;
      }

      this.responseWithData(Messages.LOGIN_SUCCESS, auth, res);
    } catch (e) {
      this.responseException(e);
    }
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() data: UpdatePassword,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const user = await this.userService.findByUsername(data.username);
      const verify = await this.authService.verifyPassword(
        data.oldPassword,
        user,
      );
      if (!verify) {
        this.responseOK(Messages.VERIFY_PASSWORD, res);
        return;
      }

      await this.authService.updatePassword(data.newPassword);
      this.responseOK(Messages.UPDATE_SUCCESS, res);
    } catch (e) {
      this.responseException(e);
    }
  }
}
