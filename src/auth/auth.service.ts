import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { BcryptService } from '../utils/bcrypt.utils'; // Importando o BcryptService
import { LoginDto } from './dto/login.dto';
import { firstValueFrom } from 'rxjs'; // Usado para converter Observable para Promise
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly httpService: HttpService,
  ) {}

  async loginUser(loginDto: LoginDto) {
    // Busca o usuário pelo email
    const user = await this.prismaService.user.findUnique({
      where: { email: loginDto.email },
    });

    // Verifica se o usuário foi encontrado e se a senha está correta
    if (
      !user ||
      !(await this.bcryptService.comparePasswords(
        loginDto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials'); // Lança exceção se as credenciais forem inválidas
    }
    // Verificar se o status do usuário é "INACTIVE"
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException(
        'Your account is inactive. Please contact support.',
      );
    }

    // Gera o payload do JWT com id e role do usuário
    const payload = { id: user.id, role: user.role };

    // Retorna o token JWT
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginWithGitHub(code: string) {
    const clientId = 'Iv23lieyachjKxuXQWV2'; // Substitua pelo seu Client ID do GitHub
    const clientSecret = 'a44ed99ee26f266b35cde11eda79947e042ecd19'; // Substitua pelo seu Client Secret do GitHub
    
    try {
      // Trocar o código de autorização pelo token de acesso
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          'https://github.com/login/oauth/access_token',
          {
            client_id: clientId,
            client_secret: clientSecret,
            code,
          },
          {
            headers: { Accept: 'application/json' },
          },
        ),
      );

    
      const accessToken = tokenResponse.data.access_token;

      if (!accessToken) {
        throw new UnauthorizedException(
          'Falha ao obter o token de acesso do GitHub',
        );
      }

      // Obter informações do usuário do GitHub (nome e id)
      const userResponse = await firstValueFrom(
        this.httpService.get('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      const { id, login } = userResponse.data;

      // Verificar se o usuário já existe no banco de dados
      let user = await this.prismaService.user.findUnique({
        where: { githubId: id.toString() }, // Buscando usuário pelo id do GitHub
      });

      if (!user) {
        // Se o usuário não existe, criar um novo usuário
        user = await this.prismaService.user.create({
          data: {
            githubId: id.toString() || 'placeholdId', // ID do GitHub
            name: login, // Nome do usuário GitHub
            password: '', // Sem senha para login via GitHub
            status: 'ACTIVE',
            role: 'USER',
            email: `github_${id}@placeholder.com`, // Email é opcional
          },
        });
      }

      // Verificar se o status do usuário é "INACTIVE"
      if (user.status === 'INACTIVE') {
        throw new UnauthorizedException(
          'Sua conta está inativa. Por favor, entre em contato com o suporte.',
        );
      }

      // Gerar o token JWT
      const payload = { id: user.id, role: user.role };
      const jwtToken = this.jwtService.sign(payload);
      
     
      return {
        access_token: jwtToken,
      };
    } catch (error) {
      console.error('Erro na autenticação com GitHub:', error);
      throw new UnauthorizedException('Autenticação com GitHub falhou');
    }
  }
}
