//faz tratamento de erros desconhecidos (500)

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'NotFoundError';
  }
}
