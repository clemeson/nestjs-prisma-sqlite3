import { PrismaClient } from '@prisma/client';
import { BcryptService } from '../src/utils/bcrypt.utils'; // Certifique-se de que o caminho está correto

const prisma = new PrismaClient();
const bcryptService = new BcryptService(); // Instanciando o serviço manualmente

async function main() {
  // Hashear a senha antes de criar o Admin
  const hashedPassword = await bcryptService.hashPassword('admin');

  // Criar um usuário com o papel de Admin e senha hasheada
  await prisma.user.create({
    data: {
      name: 'admin',
      email: 'admin',
      password: hashedPassword, // Armazenar o hash da senha
      role: 'ADMIN', // Definir o papel de admin
    },
  });

  console.log('Admin seed criado com sucesso.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
