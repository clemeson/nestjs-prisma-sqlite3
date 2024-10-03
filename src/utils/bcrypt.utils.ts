import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly saltRounds = 10;

  // Método para hashear (criptografar) a senha
  async hashPassword(password: string) {
    const hashedPassword = await bcrypt.hashSync(password, this.saltRounds);
    return hashedPassword;
  }

  // Método para comparar senhas
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
