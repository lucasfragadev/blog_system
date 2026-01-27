# 🚀 Blog Fullstack - A Grande Família

Um sistema de blog completo e moderno, desenvolvido com foco em performance, segurança e experiência do usuário (Mobile First & Dark Mode).

O projeto utiliza uma arquitetura separada (Backend API + Frontend Client), garantindo escalabilidade e organização.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Funcionalidades

- **Autenticação Segura:** Login e Registro com JWT via **HttpOnly Cookies** (proteção contra XSS).
- **CRUD de Posts:** Criação, Leitura, Edição e Exclusão de conteúdos com suporte a Markdown.
- **Sistema de Comentários:** Interação em tempo real nos posts.
- **Controle de Acesso (RBAC):** Sistema de cargos (USER e ADMIN). Admins podem moderar conteúdos.
- **UI Responsiva:** Interface otimizada para Celulares e Desktop (Mobile First).
- **Dark Mode:** Detecção automática da preferência do sistema.

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **Node.js** & **Express** - Servidor e Rotas.
- **TypeScript** - Tipagem estática e segurança no código.
- **Prisma ORM** - Manipulação do banco de dados.
- **PostgreSQL** - Banco de dados relacional.
- **BCryptJS & JWT** - Criptografia e Autenticação.

### Frontend (Client)
- **Next.js 15 (App Router)** - Framework React moderno.
- **React** - Biblioteca de UI.
- **Tailwind CSS v4** - Estilização utility-first.
- **React Markdown** - Renderização de conteúdo rico.

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PostgreSQL](https://www.postgresql.org/) (ou Docker para rodar o container do banco)

---

## 🚀 Como Rodar o Projeto

### 1. Configuração do Backend

Entre na pasta do backend, instale as dependências e configure o banco de dados.

```bash
cd backend
npm install

# Crie um arquivo .env na raiz do backend com as seguintes variáveis:
# DATABASE_URL="postgresql://user:password@localhost:5432/nome_do_banco"
# JWT_SECRET="sua_chave_secreta_super_segura"
# PORT=3000

# Rode as migrações do banco para criar as tabelas
npx prisma migrate dev --name init

# Inicie o servidor
npm run dev
```
*O Backend rodará em `http://localhost:3000`*

### 2. Configuração do Frontend

Abra um novo terminal, entre na pasta do frontend e inicie a interface.

```bash
cd frontend
npm install

# (Opcional) Crie/Edite o arquivo src/config/api.ts 
# se for testar no celular (para usar o IP da rede local)

# Inicie o servidor Next.js
npm run dev
```
*O Frontend rodará em `http://localhost:3001`*

---

## 📱 Testando no Celular (Rede Local)

Para acessar via celular na mesma rede Wi-Fi, você precisa configurar o CORS e o IP:

1. **Descubra seu IP local** (ex: `192.168.1.15`).
2. **Backend (`src/app.ts`):** Adicione seu IP (`http://192.168.1.15:3001`) na lista de origens permitidas do `cors`.
3. **Frontend (`src/config/api.ts`):** Aponte a URL da API para `http://192.168.1.15:3000/api/v1`.
4. **Acesse pelo celular:** Abra o navegador e digite `http://192.168.1.15:3001`.

## 🔒 Acesso Admin (RBAC)

Para tornar um usuário Administrador e testar a moderação (excluir posts de terceiros):

1. Cadastre-se normalmente no sistema via Frontend.
2. No terminal do backend, rode: 
   ```bash
   npx prisma studio
   ```
3. O navegador abrirá o painel do banco de dados.
4. Selecione a tabela **User**.
5. Edite o registro do seu usuário, alterando o campo `role` de `USER` para `ADMIN`.
6. Salve a alteração.
7. Faça **Logout e Login** novamente no Frontend para atualizar suas permissões.

---

Desenvolvido com 💙 por **Lucas Avelino Fraga**.