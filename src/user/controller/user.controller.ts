import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable, catchError, map, of } from 'rxjs';
import { hasRoles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserIsUserGuard } from 'src/auth/guards/userIsUser.guard';
import { User, UserRole } from '../model/user.interface';
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

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id')
  updateOne(@Param('id') id: number, @Body() user: User): Observable<any> {
    return this.UserService.updateOne(id, user);
  }

  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Put(':id/password')
  updatePassword(@Param('id') id: string, @Body() user: User): Observable<any> {
    // TODO condiciones especiales, forgot password?, etc.
    return this.UserService.updatePassword(Number(id), user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.UserService.deleteOne(id);
  }

  // @hasRoles(UserRole.ADMIN)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get()
  // findAll(): Observable<User[]> {
  //   return this.UserService.findAll();
  // }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  index(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Observable<Pagination<User>> {
    limit = limit > 100 ? 100 : limit;

    const route = `${process.env.API_URL}:${process.env.API_PORT}/user`;
    return this.UserService.paginate({
      page: Number(page),
      limit: Number(limit),
      route,
    });
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('email')
  findOneByEmail(@Body() user: User): Observable<User> {
    return this.UserService.findOneByEmail(user);
  }

  @hasRoles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  updateRoleOfUser(
    @Param('id') id: number,
    @Body() user: User,
  ): Observable<User> {
    return this.UserService.updateRoleOfUser(id, user);
  }

  @Post('exist')
  emailExist(@Body() user: User): Observable<boolean> {
    return this.UserService.emailExist(user);
  }
}
