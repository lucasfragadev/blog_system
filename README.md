# API de Blog - Projeto de Mentoria

API RESTful para uma plataforma de blog, desenvolvida com Node.js, TypeScript e Express. O projeto segue uma arquitetura em camadas, orientada a boas práticas e escalabilidade.

## Tecnologias Utilizadas

- **Backend:** Node.js, Express.js
- **Linguagem:** TypeScript
- **Banco de Dados:** MongoDB com Mongoose (ODM)
- **Segurança:** bcryptjs (para hashing de senhas), JSON Web Token (JWT) (a ser implementado)
- **Documentação da API:** Swagger/OpenAPI (a ser implementado)

## Configuração do Projeto

1.  **Clonar o repositório (exemplo):**
    ```bash
    git clone [https://github.com/seu-usuario/api_blog.git](https://github.com/seu-usuario/api_blog.git)
    cd api_blog
    ```

2.  **Instalar as dependências:**
    ```bash
    npm install
    ```

3.  **Configurar Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do projeto e adicione a URI de conexão do seu MongoDB.
    ```env
    MONGO_URI=mongodb://localhost:27017/blog_api
    ```

## Como Executar

- **Modo de Desenvolvimento (com auto-reload):**
  ```bash
  npm run dev

  Modo de Produção:

Bash

# 1. Compilar o código TypeScript para JavaScript
npm run build

# 2. Iniciar o servidor
npm start
Endpoints da API (Atuais)
Geral
GET /

Descrição: Rota de boas-vindas. Retorna uma mensagem de status da API.

Resposta (200 OK):

JSON

{
  "message": "Bem-vindo à API do Blog!"
}
Usuários
POST /users

Descrição: Cria um novo usuário.

Corpo da Requisição (JSON):

JSON

{
  "name": "Seu Nome",
  "email": "seu_email@exemplo.com",
  "password": "sua_senha"
}
Respostas:

201 Created: Usuário criado com sucesso. Retorna o objeto do novo usuário.

409 Conflict: O e-mail fornecido já está em uso.

400 Bad Request: Dados obrigatórios (nome, email, senha) não foram fornecidos.