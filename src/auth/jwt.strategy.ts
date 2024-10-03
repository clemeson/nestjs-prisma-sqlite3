import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Não ignorar a expiração do token
      secretOrKey: 'ed', // Substitua pela sua chave secreta
    });
  }

  async validate(payload: any) {
    // O payload contém os dados decodificados do token
    return { userId: payload.id, role: payload.role }; // Retorna as informações que serão anexadas ao request
  }
}
