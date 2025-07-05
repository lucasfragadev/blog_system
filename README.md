# API de Blog - Projeto de Mentoria

API RESTful para uma plataforma de blog, desenvolvida com Node.js, TypeScript e Express. O projeto segue uma arquitetura em camadas, orientada a boas práticas, e inclui um sistema de autenticação completo com JSON Web Tokens (JWT).

## Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Linguagem:** TypeScript
- **Banco de Dados:** MongoDB com Mongoose (ODM)
- **Segurança:**
  - `bcryptjs` para hashing de senhas.
  - `jsonwebtoken` para autenticação baseada em token.
  - `dotenv` para gerenciamento de variáveis de ambiente.
- **Documentação da API:** Swagger/OpenAPI (a ser implementado)

## Configuração do Projeto

1. **Clonar o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/api_blog.git
    cd api_blog
    ```

2. **Instalar as dependências:**
    ```bash
    npm install
    ```

3. **Configurar Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do projeto.
    * Adicione suas variáveis de ambiente, como a chave secreta do JWT e a URI do MongoDB.
    ```env
    MONGO_URI=mongodb://localhost:27017/blog_api
    JWT_SECRET=sua_chave_super_secreta_e_dificil_de_adivinhar
    ```

## Como Executar

*Este projeto utiliza os seguintes scripts no `package.json` (a serem adicionados):*

- **Modo de Desenvolvimento (com auto-reload):**
    ```bash
    npm run dev
    ```

- **Modo de Produção:**
    ```bash
    # 1. Compilar o código TypeScript para JavaScript
    npm run build

    # 2. Iniciar o servidor a partir dos arquivos compilados
    npm start
    ```

## Endpoints da API (Atuais)

### Rotas Públicas

```http
GET /
```

**Descrição:** Rota de boas-vindas. Retorna uma mensagem de status da API.

**Resposta (200 OK):**
```json
{"message": "Bem-vindo à API do Blog!"}
```

```http
POST /users
```

**Descrição:** Cria um novo usuário.

**Corpo da Requisição (JSON):**
```json
{"name": "...", "email": "...", "password": "..."}
```

**Resposta (201 Created):**
Retorna o objeto do novo usuário (com a senha em hash).

```http
POST /login
```

**Descrição:** Autentica um usuário e retorna um token JWT.

**Corpo da Requisição (JSON):**
```json
{"email": "...", "password": "..."}
```

**Resposta (200 OK):**
```json
{"token": "seu_token_jwt_aqui"}
```

### Rotas Privadas (Requerem Autenticação)

Todas as rotas privadas exigem um cabeçalho Authorization no formato:
```http
Authorization: Bearer SEU_TOKEN_AQUI
```

```http
GET /profile
```

**Descrição:** Retorna as informações do usuário logado (contidas no payload do token).

**Resposta (200 OK):**
```json
{"id": "...", "name": "...", "iat": ..., "exp": ...}
```
