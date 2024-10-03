import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleInterceptor } from '../jwt/interceptors/role.interceptors';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserRoleDto } from './dto/update-user-roles.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard) // Primeiro, aplique o guard para autenticação
  @UseInterceptors(RoleInterceptor)
  @Roles('ADMIN')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, 12);
  }

  @UseGuards(JwtAuthGuard, RolesGuard) // Primeiro, aplique o guard para autenticação
  @UseInterceptors(RoleInterceptor)
  @Roles('ADMIN')
  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    console.log(page);
    // Converter os parâmetros para números
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validação simples
    const validPage = !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1;
    const validLimit =
      !isNaN(limitNumber) && limitNumber > 0 ? limitNumber : 10;

    return this.usersService.findAll(validPage, validLimit);
  }

  // Outros endpoints (create, update, etc.)

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(RoleInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const jwtId = req.user.id;
    console.log(jwtId);
    return this.usersService.findOne(+id, +jwtId);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(RoleInterceptor)
  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(RoleInterceptor)
  @Roles('ADMIN')
  @Patch('disable/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.updateStatus(+id, updateUserStatusDto);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(RoleInterceptor)
  @Roles('ADMIN')
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Req() req: Request, // Importar Request de '@nestjs/common'
  ) {
    const jwtId = req.user.id;
    return this.usersService.updateRole(+id, updateUserRoleDto, jwtId);
  }



  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(RoleInterceptor)
  @Roles('ADMIN')
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(+id);
  }
}
