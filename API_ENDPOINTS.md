# 📋 Endpoints da API - Blog EDC

**Base URL:** `http://localhost:3001/api` ou `http://127.0.0.1:3001/api`

---

## 🔍 Health Check

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/api/health` | ❌ Pública | Verifica se a API está funcionando |

---

## 👤 Usuários (`/api/users`)

### Rotas Públicas

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/users/register` | ❌ Pública | Registrar novo usuário |
| POST | `/api/users/login` | ❌ Pública | Login do usuário |

### Rotas Protegidas (Requer Token)

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/api/users/profile` | ✅ Token | Obter perfil do usuário logado |
| PUT | `/api/users/profile` | ✅ Token | Atualizar perfil do usuário logado |
| PUT | `/api/users/password` | ✅ Token | Alterar senha do usuário logado |
| GET | `/api/users/:id` | ✅ Token | Buscar usuário por ID (dados públicos) |

### Rotas Administrativas (Requer Token + Admin)

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/api/users` | ✅ Token + Admin | Listar todos os usuários |
| PUT | `/api/users/:id` | ✅ Token + Admin | Atualizar usuário |
| DELETE | `/api/users/:id` | ✅ Token + Admin | Deletar usuário (com cascata) |

---

## 📝 Posts (`/api/posts`)

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/api/posts` | ⚪ Opcional | Listar todos os posts |
| GET | `/api/posts/:id` | ⚪ Opcional | Buscar post por ID |
| GET | `/api/posts/user/:userId` | ✅ Token | Buscar posts de um usuário específico |
| POST | `/api/posts` | ✅ Token | Criar novo post (com upload de imagem) |
| PUT | `/api/posts/:id` | ✅ Token | Atualizar post (com upload de imagem) |
| DELETE | `/api/posts/:id` | ✅ Token | Deletar post |
| PUT | `/api/posts/:id/like` | ✅ Token | Curtir/descurtir post |

---

## 💬 Comentários (`/api/comments`)

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/comments` | ✅ Token | Criar comentário em um post |
| GET | `/api/comments/post/:postId` | ⚪ Opcional | Buscar comentários de um post |
| PUT | `/api/comments/:id` | ✅ Token | Atualizar comentário |
| DELETE | `/api/comments/:id` | ✅ Token | Deletar comentário |
| PUT | `/api/comments/:id/like` | ✅ Token | Curtir/descurtir comentário |

---

## 📤 Upload (`/api/upload`)

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/upload/image` | ✅ Token | Upload de uma imagem |
| POST | `/api/upload/images` | ✅ Token | Upload de múltiplas imagens |
| DELETE | `/api/upload/image/:filename` | ✅ Token | Deletar imagem |
| GET | `/api/upload/images` | ✅ Token | Listar imagens |

---

## 📁 Arquivos Estáticos

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| GET | `/uploads/*` | ❌ Pública | Servir arquivos estáticos (imagens) |

---

## 🔐 Legenda de Autenticação

- ❌ **Pública**: Não requer autenticação
- ⚪ **Opcional**: Funciona com ou sem token (comportamento pode variar)
- ✅ **Token**: Requer token JWT no header `Authorization: Bearer <token>`
- ✅ **Token + Admin**: Requer token JWT e usuário deve ser administrador
- ✅ **Token + Professor**: Requer token JWT e usuário deve ser professor

---

## 📝 Notas Importantes

1. **Ordem das rotas**: A rota `/api/posts/user/:userId` deve vir ANTES de `/api/posts/:id` para evitar conflitos
2. **Delete em cascata**: Ao deletar um usuário, todos os seus posts, comentários e likes são deletados automaticamente
3. **Upload de imagens**: Os endpoints de criação/atualização de posts suportam upload de imagem via `multipart/form-data`
4. **CORS**: Em desenvolvimento, todas as origens são permitidas. Em produção, apenas origens configuradas são permitidas.


