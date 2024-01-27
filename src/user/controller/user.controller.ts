import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Observable, catchError, map, of } from 'rxjs';
import { User } from '../model/user.interface';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController {
  constructor(private UserService: UserService) {}

  @Post()
  create(@Body() user: User): Observable<User | { error: any }> {
    return this.UserService.create(user).pipe(
      map((user: User) => user),
      catchError((err) => of({ error: err.message })),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<User> {
    return this.UserService.findOne(id);
  }

  @Put(':id')
  updateOne(@Param('id') id: number, @Body() user: User): Observable<any> {
    return this.UserService.updateOne(id, user);
  }

  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.UserService.deleteOne(id);
  }

  @Get()
  findAll(): Observable<User[]> {
    return this.UserService.findAll();
  }
}
