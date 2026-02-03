# A Grande Família Blog

Esta é a API RESTful do projeto "A Grande Família Blog", um espaço dedicado ao compartilhamento de momentos e memórias familiares. Desenvolvida com Node.js, TypeScript e Express, a API utiliza uma arquitetura em camadas (Controller, Service, Repository) e segue as melhores práticas de segurança e escalabilidade.

## 🚀 Tecnologias e Ferramentas

- **Runtime:** Node.js com Express.js
- **Linguagem:** TypeScript para tipagem estática e segurança de código
- **ORM:** Prisma (Type-safe Database Client)
- **Banco de Dados:** PostgreSQL (Hospedado via Neon.tech)
- **Segurança:**
  - `bcrypt` para hashing de senhas com validação de complexidade (mínimo 6 caracteres e símbolos).
  - `jsonwebtoken` (JWT) para autenticação segura via Cookies HttpOnly.
  - Proteção de rotas privadas e lógica de propriedade (Ownership) de posts.
- **Comunicação:** Nodemailer para disparos de e-mail (Boas-vindas e Recuperação de Senha via SMTP Gmail).
- **Hospedagem:** Vercel (Serverless Functions).

## 🛠️ Configuração do Ambiente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Variáveis de Ambiente (.env):**
   Crie um arquivo `.env` na raiz do projeto backend com as seguintes chaves:
   ```env
   # Banco de Dados (Neon/PostgreSQL)
   DATABASE_URL="postgres://usuario:senha@host/db?sslmode=require"

   # Autenticação (Chave secreta de alta entropia)
   # Gere uma nova chave usando: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   JWT_SECRET="insira_sua_chave_secreta_aqui"

   # Configurações de E-mail (SMTP Gmail)
   MAIL_HOST="smtp.gmail.com"
   MAIL_PORT=465
   MAIL_USER="seu-email@gmail.com"
   MAIL_PASS="sua_senha_de_app_de_16_digitos"
   ```

3. **Prisma e Banco de Dados:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## 📡 Endpoints da API (v1)

### Autenticação & Usuários (`/api/v1/auth`)
- **POST `/register`**: Cria novo usuário e envia e-mail de boas-vindas.
- **POST `/login`**: Authentica o usuário e define o Cookie HttpOnly `token`.
- **POST `/logout`**: Realiza o logout limpando o cookie de autenticação.
- **POST `/forgot-password`**: Gera token de recuperação e envia link por e-mail.
- **POST `/reset-password`**: Define uma nova senha utilizando o token recebido.
- **GET `/profile`**: Retorna os dados do perfil do usuário autenticado.

### Postagens (`/api/v1/posts`)
- **GET `/`**: Lista todos os posts (mais recentes primeiro). Inclui `likeCount` e `isLiked`.
- **GET `/:id`**: Detalhes de uma postagem específica.
- **POST `/`**: Cria uma nova postagem (Requer autenticação).
- **PUT `/:id`**: Atualiza um post existente (Apenas o autor original).
- **DELETE `/:id`**: Remove um post do banco de dados (Autor ou ADMIN).

## 🏗️ Arquitetura do Projeto
O projeto segue o padrão de **Camadas**:
1. **Routes:** Define os caminhos da API e aplica middlewares de autenticação.
2. **Controllers:** Gerencia o fluxo de entrada (request) e saída (response) HTTP.
3. **Services:** Contém as regras de negócio e integrações externas (E-mail).
4. **Repositories:** Abstrai o acesso ao banco de dados utilizando o Prisma Client.

---
Desenvolvido por [**Lucas Avelino Fraga**](https://fraga.vercel.app/) - 2026
