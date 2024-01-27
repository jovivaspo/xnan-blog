import { Body, Controller, Post } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { User } from 'src/user/model/user.interface';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('login')
  login(@Body() user: User): Observable<{ access_token: string }> {
    return this.AuthService.login(user).pipe(
      map((jwt: string) => {
        return { access_token: jwt };
      }),
    );
  }
}
