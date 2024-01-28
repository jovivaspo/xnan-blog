import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/model/user.entity';
import { UserService } from 'src/user/service/user.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './controller/auth.controller';
import { JwtStrategy } from './guards/jst-strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserIsUserGuard } from './guards/userIsUser.guard';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    forwardRef(() => UserModule), //forwardRef indica que hay referencias circulares entre ambos módulos
    //Configurar el JWT token//
    JwtModule.registerAsync({
      imports: [ConfigModule], //Para leer los datos del archivo .env
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ defaultStrategy: 'bearer' }),
  ],
  providers: [
    AuthService,
    RolesGuard,
    JwtAuthGuard,
    JwtStrategy,
    UserService,
    UserIsUserGuard,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
