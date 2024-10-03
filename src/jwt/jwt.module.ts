import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoleInterceptor } from './interceptors/role.interceptors';

@Module({
  imports: [
    JwtModule.register({
      secret: 'ed', // Substitua pela sua chave secreta
      signOptions: { expiresIn: '1h' }, // Tempo de expiração do token
    }),
  ],
  providers: [RoleInterceptor],
  exports: [JwtModule, RoleInterceptor],
})
export class JwtConfigModule {}
