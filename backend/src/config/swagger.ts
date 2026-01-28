export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "A Grande Família Blog API",
    description: "API RESTful completa para sistema de blog familiar com autenticação JWT (HttpOnly Cookies), controle de acesso, curtidas e comentários.",
    version: "1.2.0",
    contact: {
      name: "Lucas Avelino Fraga",
      email: "lucasfraga.dev@gmail.com"
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? "https://avelinofraga-blog.vercel.app/api/v1" 
        : "http://localhost:3000/api/v1",
      description: "Servidor Principal"
    }
  ],
  tags: [
    { name: "Authentication", description: "Registro, Login, Logout e Recuperação de Senha." },
    { name: "Posts", description: "Gerenciamento de publicações e interações (Likes)." },
    { name: "Comments", description: "Gerenciamento de comentários em postagens." }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Lucas Avelino" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["USER", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      UserCreate: {
        type: "object",
        properties: {
          name: { type: "string", example: "Lucas Avelino" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password", example: "SenhaForte123!" }
        },
        required: ["name", "email", "password"]
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          title: { type: "string", example: "Nossa viagem para Araçás" },
          content: { type: "string", example: "Conteúdo em Markdown..." },
          likeCount: { type: "integer", example: 10 },
          isLiked: { type: "boolean", example: false },
          authorId: { type: "string", format: "uuid" },
          author: { $ref: "#/components/schemas/User" },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      PostCreate: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" }
        },
        required: ["title", "content"]
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          content: { type: "string", example: "Que foto linda!" },
          author: { type: "object", properties: { name: { type: "string" } } },
          createdAt: { type: "string", format: "date-time" }
        }
      },
      CommentCreate: {
        type: "object",
        properties: {
          content: { type: "string" },
          postId: { type: "string", format: "uuid" }
        },
        required: ["content", "postId"]
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Registrar novo usuário",
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserCreate" } } }
        },
        responses: { "201": { description: "Usuário criado com sucesso" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login de usuário",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } }
        },
        responses: { "200": { description: "Login realizado e Cookie definido" } }
      }
    },
    "/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Logout",
        responses: { "200": { description: "Cookie removido" } }
      }
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Authentication"],
        summary: "Solicitar link de recuperação de senha",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" } } } } }
        },
        responses: { "200": { description: "E-mail enviado se o usuário existir" } }
      }
    },
    "/auth/reset-password": {
      post: {
        tags: ["Authentication"],
        summary: "Redefinir senha com token",
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { token: { type: "string" }, newPassword: { type: "string" } } } } }
        },
        responses: { "200": { description: "Senha alterada com sucesso" } }
      }
    },
    "/auth/profile": {
      get: {
        tags: ["Authentication"],
        summary: "Obter dados do usuário logado",
        security: [{ cookieAuth: [] }],
        responses: { "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } } }
      }
    },
    "/posts": {
      get: {
        tags: ["Posts"],
        summary: "Listar todas as postagens",
        responses: { "200": { content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Post" } } } } } }
      },
      post: {
        tags: ["Posts"],
        summary: "Criar uma nova postagem",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/PostCreate" } } }
        },
        responses: { "201": { description: "Post criado" } }
      }
    },
    "/posts/{id}": {
      get: {
        tags: ["Posts"],
        summary: "Obter detalhes de um post",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } } }
      },
      put: {
        tags: ["Posts"],
        summary: "Atualizar um post",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/PostCreate" } } }
        },
        responses: { "200": { description: "Post atualizado" } }
      },
      delete: {
        tags: ["Posts"],
        summary: "Deletar um post",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "Removido" } }
      }
    },
    "/posts/{id}/like": {
      post: {
        tags: ["Posts"],
        summary: "Alternar curtida (Like/Unlike)",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Operação realizada com sucesso" } }
      }
    },
    "/comments": {
      post: {
        tags: ["Comments"],
        summary: "Adicionar um comentário",
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: { $ref: "#/components/schemas/CommentCreate" } } }
        },
        responses: { "201": { description: "Comentário adicionado" } }
      }
    },
    "/comments/post/{postId}": {
      get: {
        tags: ["Comments"],
        summary: "Listar comentários de um post específico",
        parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Comment" } } } } } }
      }
    }
  }
};