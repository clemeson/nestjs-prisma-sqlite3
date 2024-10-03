import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // Verifica se o cabeçalho Authorization existe
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Separa o token do Bearer
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      // Decodifica e valida o token JWT
      const decoded = this.jwtService.verify(token);

      // Insere as informações do payload (id, role) no request
      request.user = {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return next.handle();
  }
}
