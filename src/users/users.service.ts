import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { BcryptService } from '../utils/bcrypt.utils';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  // Atualiza o status do usuário com validação da senha do administrador
  async updateStatus(
    id: number,
    updateUserStatusDto: UpdateUserStatusDto
  ) {
    try {
      // Busca o usuário que vai ter o status atualizado
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found.`);
      }

      // Verificar se o status já é o desejado
      if (user.status === updateUserStatusDto.status) {
        throw new BadRequestException(
          `User is already ${updateUserStatusDto.status}.`,
        );
      }

      // Atualizar o status do usuário
      return await this.prismaService.user.update({
        where: { id },
        data: {
          status: updateUserStatusDto.status,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'An unexpected error occurred while updating the user status.',
      );
    }
  }

  async updateRole(
    id: number,
    updateUserRoleDto: UpdateUserRoleDto,
    jwtId: string,
  ) {
    try {
      // Busca o usuário que terá o papel alterado
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found.`);
      }

      // Verifica se o papel já é o desejado
      if (user.role === updateUserRoleDto.role) {
        throw new BadRequestException(
          `User already has the role ${updateUserRoleDto.role}.`,
        );
      }

      // Buscar o administrador que está realizando a operação
      const admin = await this.prismaService.user.findUnique({
        where: { id: +jwtId },
      });

      if (!admin) {
        throw new ForbiddenException('Administrator not found.');
      }

      // Verificar se a senha do admin está correta
      const isPasswordValid = await this.bcryptService.comparePasswords(
        updateUserRoleDto.password,
        admin.password, // Senha armazenada no banco de dados (hashed)
      );

      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid administrator password.');
      }

      // Atualizar o papel do usuário
      return await this.prismaService.user.update({
        where: { id },
        data: {
          role: updateUserRoleDto.role,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'An unexpected error occurred while updating the user role.',
      );
    }
  }

  // Atualiza um usuário existente no banco de dados
  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      // Busca o usuário no banco de dados
      const user = await this.prismaService.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found.`);
      }

      // Atualiza o usuário com os dados fornecidos no DTO
      return await this.prismaService.user.update({
        where: { id },
        data: {
          ...updateUserDto,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found.`);
      }
      throw new BadRequestException(
        'An unexpected error occurred while updating the user.',
      );
    }
  }

  // Busca um usuário com base no ID, garantindo que o usuário só acesse seus próprios dados
  async findOne(id: number, jwtId: number) {
    console.log(id, jwtId);
    try {
      // Verifica se o usuário autenticado (jwtId) está tentando acessar seus próprios dados
      if (id !== jwtId) {
        throw new ForbiddenException(
          'You do not have permission to access this user.',
        );
      }

      // Busca o usuário no banco de dados
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { id },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found.`);
      }

      throw new Error('An unexpected error occurred while fetching the user.');
    }
  }

  // Cria um novo usuário no banco de dados
  async create(createUserDto: any, adminId: number) {
    try {
      // Gera o hash da senha
      const hashedPassword = await this.bcryptService.hashPassword(
        createUserDto.password,
      );
      console.log(createUserDto);
      // Cria o usuário no banco de dados com a senha hasheada
      const newUser = await this.prismaService.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword, // Define a senha hasheada
          adminId, // Relaciona o usuário criado com o administrador que fez a criação
        },
      });

      // Remove a senha do retorno
      const { password, ...result } = newUser;
      return result;
    } catch (error) {
      throw new BadRequestException(
        'An unexpected error occurred while creating the user.',
      );
    }
  }

  // Lista todos os usuários
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    // Executa duas consultas paralelas: uma para obter os usuários e outra para contar o total
    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        skip,
        take: limit,
        orderBy: {
          id: 'asc', // Ordenação opcional
        },
      }),
      this.prismaService.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        total,
        totalPages,
        currentPage: page,
      },
    };
  }

  async remove(id: number) {
    try {
      return await this.prismaService.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
  }
}
