import {
  Controller,
  Post,
  Request,
  Get,
  Query,
  Res,
  Redirect,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express'; // Corrigir a importação do tipo Response

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rota para login de usuários
  @Post('login')
  async loginUser(@Request() req) {
    
    return this.authService.loginUser(req.body);
  }

  @Post('github')
  async loginWithGitHub(@Request() req) {
    const code = req.body.code;
    console.log(code);
    try {
      const jwt = await this.authService.loginWithGitHub(code);
      return jwt;
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
