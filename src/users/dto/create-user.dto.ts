import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { UserStatus } from '../user-status.enum'; // Atualize o caminho conforme sua estrutura de pastas

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  githubId: string;

  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;

  @IsNotEmpty()
  status?: UserStatus;

  @IsNotEmpty()
  @IsString()
  role?: string = 'USER'; // Campo opcional com valor padrão
}
