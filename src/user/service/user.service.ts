import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/auth/service/auth.service';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../model/user.entity';
import { User, UserRole } from '../model/user.interface';

@Injectable()
export class UserService {
  constructor(
    //Inyectar el repositorio de users de la BBDD
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.email = user.email;
        newUser.password = passwordHash;

        if (process.env.CONTROL === 'prod' || process.env.CONTROL === 'dev') {
          newUser.role = UserRole.USER;
        }

        if (
          user.email === 'admin@gmail.com' &&
          process.env.CONTROL !== 'prod'
        ) {
          newUser.role = UserRole.ADMIN;
          console.log('REGISTRANDO ADMIN');
        }

        return from(this.userRepository.save(newUser)).pipe(
          map((user: User) => {
            const { password, ...result } = user;
            return result;
          }),
          catchError((err) => throwError(() => err)),
        );
      }),
    );
  }

  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate<User>(this.userRepository, options)).pipe(
      map((usersPageable: Pagination<User>) => {
        usersPageable.items.forEach((user) => {
          delete user.password;
        });
        console.log('## usersPageable: ', usersPageable);
        return usersPageable;
      }),
    );
  }

  paginateByName(
    options: IPaginationOptions,
    user: User,
  ): Observable<Pagination<User>> {
    return from(
      this.userRepository.findAndCount({
        skip: Number(options.page) * Number(options.limit) || 0,
        take: Number(options.limit) || 10,
        order: {
          id: 'ASC',
        },
        select: ['id', 'name', 'email', 'role'],
        where: { name: Like(`%${user.name}%`) },
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        const usersPageable: Pagination<User> = {
          items: users,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous: options.route + `?limit=${options.limit}`,
            next:
              options.route +
              `?limit=${options.limit}&page=${Number(options.page) + 1}`,
            last:
              options.route +
              `?limit=${options.limit}&page=${Math.ceil(totalUsers / Number(options.limit))}`,
          },
          meta: {
            totalItems: totalUsers,
            itemCount: users.length,
            itemsPerPage: users.length,
            totalPages: Math.ceil(totalUsers / Number(options.limit)),
            currentPage: Number(options.limit),
          },
        };
        return usersPageable;
      }),
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach((user) => {
          ///delete user.password;
        });
        return users;
      }),
    );
  }

  findOne(id: number): Observable<User> {
    return from(
      this.userRepository.findOne({
        where: { id },
      }),
    ).pipe(
      map((user: User) => {
        if (user) {
          ///delete user.password;
          return user;
        } else {
          return null;
        }
      }),
    );
  }

  updateOne(id: number, user: User): Observable<any> {
    //Props que no se pueden actualizar
    delete user.id;
    delete user.email;
    delete user.password;
    delete user.role;

    //En este caso primero actualizamos y luego debemos esperar para devolverlo acutalizado, primero update y luego findOne
    return from(this.userRepository.update(Number(id), user)).pipe(
      switchMap(() => {
        return this.findOne(id);
      }),
    );
  }

  updatePassword(id: number, user: User): Observable<any> {
    delete user.id;
    delete user.email;
    delete user.name;
    delete user.role;
    return this.authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = new UserEntity();
        newUser.password = passwordHash;

        return from(this.userRepository.update(Number(id), newUser)).pipe(
          switchMap(() => this.findOne(id)),
        );
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  findOneByEmail(user: User): Observable<User> {
    return from(
      this.userRepository.findOne({
        select: ['id', 'name', 'email', 'role'],
        where: { email: user.email },
      }),
    );
  }

  updateRoleOfUser(id: number, user: User): Observable<any> {
    if (!user.role || !Object.values(UserRole).includes(user.role)) {
      throw new BadRequestException('Role is not valid');
    }
    delete user.email;
    delete user.password;
    delete user.name;

    return from(this.userRepository.update(id, user));
  }

  emailExist(user: User): Observable<boolean> {
    return from(
      this.userRepository
        .findOne({ where: { email: user.email } })
        .then((resp) => {
          if (resp !== null) {
            return true;
          } else {
            return false;
          }
        }),
    );
  }
}
