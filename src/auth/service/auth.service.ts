import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Observable, from, map, switchMap } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { User } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';
@Injectable()
export class AuthService {
  constructor(
    //Inyectar el repositorio de users de la BBDD
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  validateUser(email: string, password: string): Observable<User> {
    return from(
      this.findByEmail(email).pipe(
        switchMap((user: User) => {
          return this.comparePasswords(password, user.password).pipe(
            map((match: boolean) => {
              if (match) {
                const { password, ...result } = user;
                return result;
              } else {
                throw new UnauthorizedException('Wrong password');
              }
            }),
          );
        }),
      ),
    );
  }

  private comparePasswords(
    password: string,
    storedPasswordHash: string,
  ): Observable<any> {
    const match = bcrypt.compare(password, storedPasswordHash);
    return from<any | boolean>(match);
  }

  private findByEmail(email: string): Observable<User> {
    return from(
      this.userRepository
        .findOne({
          where: { email: email.toLocaleLowerCase() },
          select: ['id', 'name', 'email', 'password'],
        })
        .then((user: User) => {
          if (user) {
            return user;
          } else {
            throw new NotFoundException('User not found');
          }
        }),
    );
  }

  private generateJWT(user: User): Observable<string> {
    return from(this.jwtService.signAsync({ user }));
  }

  hashPassword(password: string): Observable<string> {
    return from<string>(bcrypt.hash(password, 12));
  }

  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        return this.generateJWT(user).pipe(map((jwt: string) => jwt));
      }),
    );
  }
}
