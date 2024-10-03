provider "aws" {
  region = "us-east-1"  # Mude para sua região preferida
}

# Criar chave SSH
resource "aws_key_pair" "my_key" {
  key_name   = "ed-key-tf"  # Nome da chave no AWS
  public_key = file("~/.ssh/id_rsa.pub")  # Caminho da chave pública gerada
}

# Instância EC2
resource "aws_instance" "ed-ec2-linux" {
  ami           = "ami-0ebfd941bbafe70c6"  # Amazon Linux 2 na região us-east-1
  instance_type = "t2.micro"

  # Referência à chave SSH criada acima
  key_name = aws_key_pair.my_key.key_name

  # Grupo de segurança que permite SSH e HTTP
  vpc_security_group_ids = [aws_security_group.allow_ssh_and_http.id]

  tags = {
    Name = "MinhaInstanciaWebEC2"
  }
}

# Grupo de segurança para permitir SSH (porta 22) e HTTP (porta 80)
resource "aws_security_group" "allow_ssh_and_http" {
  name_prefix = "allow_ssh_and_http"

  # Permitir SSH (porta 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Permitir SSH de qualquer IP
  }

  # Permitir HTTP (porta 80)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Permitir HTTP de qualquer IP
  }

  # Regras de saída padrão
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

