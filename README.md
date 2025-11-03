# Blog Education API

# 📘 Blog Education API — Documentação da Aplicação

## Introdução

O Blog Education API é o backend para uma plataforma de blog educacional. O projeto foi criado para permitir que professores da rede pública de educação compartilhem conteúdos de forma simples, centralizada e funcional.

### Objetivo

Facilitar a comunicação entre professores e alunos da rede pública por meio de uma plataforma de blogging educacional que permita a publicação e o acesso a conteúdos escolares, como textos e atividades.

### Público-alvo

Pessoas da rede pública de educação, mais especificamente dois agentes:

- **Professores**: responsáveis pela criação, atualização, edição e exclusão de postagens.
- **Alunos**: usuários que podem visualizar e ler as postagens.

### Equipe

| Nome | E-mail |
| --- | --- |
| Lucas Piran | [lucas13piran@gmail.com](mailto:lucas13piran@gmail.com) |
| Felipe Ragne Silveira | [frsilveira01@outlook.com](mailto:frsilveira01@outlook.com) |
| Lais Taine de Oliveira | [lais.taine@gmail.com](mailto:lais.taine@gmail.com) |
| Pedro Juliano Quimelo | [pedrojulianoquimelo@outlook.com](mailto:pedrojulianoquimelo@outlook.com) |



## Deploy Público

A API está online e acessível publicamente, a partir do Render:

**Base URL:** [https://backend-blog-education.onrender.com/](https://backend-blog-education.onrender.com/)


## Tecnologias Utilizadas 
A API foi construída utilizando as seguintes tecnologias e bibliotecas:

**Runtime**: Node.js

**Framework**: Express.js

**Banco de Dados**: MongoDB (com Mongoose como ODM - Object Data Modeling)

**Autenticação**: JSON Web Tokens (JWT) para proteger rotas e gerenciar sessões.

**Segurança**:

- bcryptjs para hashing de senhas.
- helmet para adicionar cabeçalhos de segurança HTTP.
- cors para gerenciar o Cross-Origin Resource Sharing.

**Upload de Arquivos**: multer para o upload de imagens.

**Validação de Dados**: express-validator para validar os dados de entrada nas requisições.

**Logging**: morgan para registrar os logs de requisições HTTP.

**Variáveis de Ambiente**: dotenv para gerenciar as configurações do ambiente.

**Desenvolvimento**: nodemon para reiniciar o servidor automaticamente durante o desenvolvimento.

**Render (Deploy):** hospeda a API para acesso público, permitindo também a automatização de entrega contínua.

**Conteinerização:** o Docker é utilizado para criar um ambiente padronizado e isolado para a aplicação e o banco de dados, garantindo consistência entre os ambientes de desenvolvimento e produção.

**CI/CD (Integração e Entrega Contínuas):** configurado com GitHub Actions para automatizar o processo de testes a cada nova alteração no código, garantindo a qualidade e integridade contínuas.


## **Setup e Instalação**

Siga os passos abaixo para executar o projeto em seu ambiente local.

#### Pré-requisitos:

- Node.js (v18 ou superior)  
- Git  
- MongoDB  
- Editor de código (ex: VS Code)

#### Passos:

1. **Conecte-se ao Banco de Dados**  
   Certifique-se de que o MongoDB esteja rodando localmente em:  
   `mongodb://localhost:27017`  
   Você pode usar interfaces como o MongoDB Compass para facilitar a visualização.

2. **Clone o repositório:**
   ```bash
   git clone https://github.com/techchallenge-fiap-2025/backend-techchalenge
   cd backend
   ```

3. **Configure o arquivo `.env`**  
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   JWT_SECRET=SEGREDO_PARA_TESTE_12345
   MONGO_URI=mongodb://localhost:27017/backend-techchalenge
   PORT=3010
   ```

4. **Instale as dependências:**
   ```bash
   npm install
   ```

5. **Execute a aplicação:**
    ```bash
     npm run start
     ```

6. **Acesse a API localmente:**
   - **Status da API:** [http://localhost:3010](http://localhost:3010)  


### Em Ambiente de Produção (Docker)

#### Pré-requisitos:

- Git  
- Docker Desktop  
- Editor de código (ex: VS Code)

#### Passos:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/techchallenge-fiap-2025/backend-techchalenge
   cd backend
   ```

2. **Configure o arquivo `.env`**  
   ```env
   JWT_SECRET=SEGREDO_PARA_TESTE_12345
   MONGO_URI=mongodb://localhost:27017/backend-techchalenge
   PORT=3010
   ```

3. **Construa e rode os contêineres:**
   ```bash
   docker-compose up --build
   ```

   Isso irá:
   - Construir as imagens Docker com base no `Dockerfile`  
   - Subir a aplicação e conectar ao banco de dados  
   - Disponibilizar os endpoints localmente

4. **Acesse a API em produção local:**
   - [http://localhost:3010](http://localhost:3010)  

5. **Deploy automatizado com GitHub Actions:**  
   Ao rodar:
   ```bash
   git push origin main
   ```
   É disparado um fluxo de CI/CD que:
   - Constrói a imagem Docker  
   - Executa testes automatizados  
   - Publica a imagem no ambiente de produção  
   - Realiza o deploy automaticamente na plataforma Render

6. **Verifique o deploy online em:**  
   [https://backend-blog-education.onrender.com/](https://backend-blog-education.onrender.com/)


## 4. Endpoints da API 🌐

A API está organizada em 4 grupos de rotas principais, todos prefixados com `/api`. Rotas que exigem autenticação devem receber o token JWT no cabeçalho `Authorization: Bearer <token>`.

### Autenticação e Usuários (`/api/users`)

Endpoints para registro, login e gerenciamento de perfis de usuários.

| Funcionalidade | Método | Endpoint | Autenticação | Descrição / Corpo (Body) |
| :--- | :--- | :--- | :--- | :--- |
| **Registrar Usuário** | `POST` | `/register` | Não | Cria um novo usuário. Requer `name`, `email`, `password`, `school`, `age`, `userType`. Se `userType` for "aluno", requer também `guardian` e `class`. |
| **Login de Usuário** | `POST` | `/login` | Não | Autentica um usuário e retorna um token JWT. Requer `email` e `password`. |
| **Obter Perfil** | `GET` | `/profile` | Sim (Qualquer usuário) | Retorna os dados do usuário autenticado. |
| **Atualizar Perfil** | `PUT` | `/profile` | Sim (Qualquer usuário) | Atualiza os dados do usuário autenticado. Pode receber `name`, `email`, `school`, etc. |
| **Alterar Senha** | `PUT` | `/password` | Sim (Qualquer usuário) | Altera a senha do usuário autenticado. Requer `currentPassword` e `newPassword`. |
| **Listar Todos os Usuários** | `GET` | `/` | Sim (**Professor**) | Retorna uma lista com todos os usuários cadastrados. |
| **Obter Usuário por ID** | `GET` | `/:id` | Sim (Qualquer usuário) | Retorna os dados públicos de um usuário específico. |
| **Atualizar Usuário por ID** | `PUT` | `/:id` | Sim (**Professor**) | Atualiza os dados de um usuário específico. |
| **Deletar Usuário** | `DELETE` | `/:id` | Sim (**Professor**) | Remove um usuário do sistema. |

---

### Posts (`/api/posts`)

Endpoints para gerenciar as postagens do blog.

| Funcionalidade | Método | Endpoint | Autenticação | Descrição / Corpo (Body) |
| :--- | :--- | :--- | :--- | :--- |
| **Listar Todos os Posts** | `GET` | `/` | Não (Pública) | Retorna uma lista de todas as postagens. Aceita queries para busca, paginação e ordenação. |
| **Obter Post por ID** | `GET` | `/:id` | Não (Pública) | Retorna os detalhes de uma postagem específica. |
| **Criar Novo Post** | `POST` | `/` | Sim (Qualquer usuário) | Cria uma nova postagem. A requisição deve ser `multipart/form-data` com os campos do post (`title`, `excerpt`, `content`) e um arquivo de imagem. |
| **Atualizar Post** | `PUT` | `/:id` | Sim (Qualquer usuário) | Atualiza uma postagem existente. Também pode receber `multipart/form-data` para trocar a imagem. |
| **Deletar Post** | `DELETE` | `/:id` | Sim (Qualquer usuário) | Remove uma postagem. |
| **Curtir/Descurtir Post** | `PUT` | `/:id/like` | Sim (Qualquer usuário) | Adiciona ou remove a curtida do usuário autenticado no post. |

---

### Comentários (`/api/comments`)

Endpoints para gerenciar os comentários nas postagens.

| Funcionalidade | Método | Endpoint | Autenticação | Descrição / Corpo (Body) |
| :--- | :--- | :--- | :--- | :--- |
| **Criar Comentário** | `POST` | `/` | Sim (Qualquer usuário) | Adiciona um novo comentário a um post. Requer `content`, `postId`, e opcionalmente `parentCommentId` para respostas. |
| **Obter Comentários de um Post** | `GET` | `/post/:postId` | Não (Pública) | Retorna todos os comentários (e suas respostas) de uma postagem específica. |
| **Atualizar Comentário** | `PUT` | `/:id` | Sim (Dono do comentário) | Edita o conteúdo de um comentário existente. |
| **Deletar Comentário** | `DELETE` | `/:id` | Sim (Dono do comentário) | Remove um comentário. |
| **Curtir/Descurtir Comentário** | `PUT` | `/:id/like` | Sim (Qualquer usuário) | Adiciona ou remove a curtida do usuário autenticado no comentário. |

---

### Upload de Imagens (`/api/uploads`)

Endpoints dedicados para o gerenciamento de arquivos de imagem.

| Funcionalidade | Método | Endpoint | Autenticação | Descrição / Corpo (Body) |
| :--- | :--- | :--- | :--- | :--- |
| **Upload de Imagem Única** | `POST` | `/image` | Sim (Qualquer usuário) | Faz o upload de um único arquivo de imagem. Requisição do tipo `multipart/form-data`. |
| **Upload de Múltiplas Imagens** | `POST` | `/images` | Sim (Qualquer usuário) | Faz o upload de múltiplos arquivos de imagem. Requisição do tipo `multipart/form-data`. |
| **Listar Imagens** | `GET` | `/images` | Sim (Qualquer usuário) | Retorna a lista de imagens enviadas pelo usuário. |
| **Deletar Imagem** | `DELETE` | `/image/:filename`| Sim (Qualquer usuário) | Remove um arquivo de imagem específico pelo seu nome. |


## Relato de Experiências, Desafios e Melhorias

Durante o desenvolvimento da API, a equipe enfrentou desafios que se converteram em grandes contribuições e geração de boas ideias, enriquecendo o aprendizado.

Muito se deve à metodologia praticada pela equipe, utilizada desde o módulo anterior, que consiste em todos desenvolverem sua própria API, com arquitetura específica escolhida a partir de frameworks, bibliotecas e tecnologias que tenham mais familiaridade.

Em seguida, é escolhida uma proposta (não finalizada) para que todos atuem em conjunto, discutindo novas ideias, com otimização e aperfeiçoamento do projeto. Esse formato de trabalho torna a API mais robusta, com uma equipe amadurecida para avaliar, sugerir, discutir e acrescentar novos processos ao projeto final.

### Desafios

**Docker**: trabalhar com Docker foi um dos principais desafios pela inexperiência entre os membros da equipe. Criar um contêiner próprio, usando o Dockerfile, pareceu tecnicamente simples, mas com potencial de resultado muito grande ao conciliar com o banco de dados.

**GitHub Actions**: aprender a configurar e implementar os recursos do GitHub Actions não era uma prática comum entre todos os integrantes da equipe, o que torna um desafio maior em comparação a outras ferramentas utilizadas. A implementação Contínua e Entrega Contínua (CI/CD) geram uma segurança maior para o compartilhamento e entrega entre os membros da equipe.

Outros desafios foram encontrados, cada membro dentro de suas especificidades, como desde frameworks e linguagem utilizada até banco de dados escolhido para, esses foram solucionados com mais confiança de forma própria ou em conjunto.

### Melhorias

É válido ressaltar que a API não está finalizada e pode ser aprimorada com algumas melhorias para se tornar mais robusta, como:

**Página de registro de usuário**: Uma página administrativa com acesso restrito para que seja feito o cadastro, edição e exclusão de usuários.

**Testes de segurança**: aumentar a cobertura de testes para tornar o projeto mais seguro.


## Considerações Finais

O projeto possibilitou aplicar os conceitos aprendidos na Fase 2 - BackEnd e Qualidade de Software, da pós Tech Full Stack Development, da FIAP, unindo teoria e prática. 

O processo colaborativo e o uso de ferramentas de apoio foram fundamentais para superar desafios técnicos e entregar uma solução funcional e com propósito social.



# Contatos


[lucas13piran@gmail.com](mailto:lucas13piran@gmail.com)


[frsilveira01@outlook.com](mailto:frsilveira01@outlook.com)


[lais.taine@gmail.com](mailto:lais.taine@gmail.com)


[pedrojulianoquimelo@outlook.com](mailto:pedrojulianoquimelo@outlook.com)


---

