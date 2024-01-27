import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, map, switchMap } from 'rxjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../model/user.entity';
import { User } from '../model/user.interface';

@Injectable()
export class UserService {
  constructor(
    //Inyectar el repositorio de users de la BBDD
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(user: User): Observable<User> {
    return from(this.userRepository.save(user));
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
    delete user.email;

    //En este caso primero actualizamos y luego debemos esperar para devolverlo acutalizado, primero update y luego findOne
    return from(this.userRepository.update(Number(id), user)).pipe(
      switchMap(() => {
        return this.findOne(id);
      }),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
}
