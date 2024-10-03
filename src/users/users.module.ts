import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BcryptService } from 'src/utils/bcrypt.utils';
import { JwtConfigModule } from '../jwt/jwt.module'; // Importa o módulo JWT separado

@Module({
  imports: [PrismaModule, JwtConfigModule],
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
  exports: [UsersService],
})
export class UsersModule {}
