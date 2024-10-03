import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptService } from '../utils/bcrypt.utils';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { JwtConfigModule } from '../jwt/jwt.module'; // Importa o módulo JWT separado
import { RolesGuard } from './guards/roles.guard';
import { HttpModule } from '@nestjs/axios'; // Importe o HttpModule aqui

@Module({
  imports: [
    PassportModule,
    JwtConfigModule, // Importa o módulo JWT
    UsersModule,
    PrismaModule,
    HttpModule,
  ],

  controllers: [AuthController],
  providers: [AuthService, BcryptService, JwtStrategy, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
