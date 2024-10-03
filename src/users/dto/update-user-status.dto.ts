import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '../user-status.enum'; // Certifique-se que o caminho está correto

export class UpdateUserStatusDto {
  @IsEnum(UserStatus, {
    message: `O status deve ser ${UserStatus.ACTIVE} ou ${UserStatus.INACTIVE}`,
  })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  status: UserStatus;

}
