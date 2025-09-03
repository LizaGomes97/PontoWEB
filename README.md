# PontoFácil - Aplicação Web para Registro de Ponto

![Demonstração do PontoFácil](https://i.imgur.com/your-image-url.gif) PontoFácil é uma aplicação web full-stack desenvolvida para simplificar o registro de ponto e o gerenciamento de horas trabalhadas em empresas. O sistema possui dois painéis distintos: um para funcionários realizarem seus registros diários e outro para gestores acompanharem a frequência da equipe e gerenciarem os dados.

## ✨ Funcionalidades

### Painel do Funcionário
- **Autenticação Segura:** Login e criação de conta com senhas criptografadas.
- **Dashboard em Tempo Real:** Visualização da hora atual, localização e botões para registrar entrada e saída.
- **Registro de Ponto com Geolocalização:** Garante a precisão do local onde o ponto foi batido.
- **Histórico de Registros:** Acesso rápido aos últimos registros e um relatório mensal detalhado.
- **Configurações de Acessibilidade:** Opções para personalizar tema (claro/escuro), tamanho da fonte e contraste.

### Painel do Gestor
- **Dashboard Gerencial:** Visão geral com estatísticas da equipe, como total de funcionários, funcionários ativos no dia e horas trabalhadas.
- **Monitoramento em Tempo Real:** Acompanhamento do status de cada funcionário (Trabalhando, Finalizado, Ausente).
- **Gerenciamento de Equipe:** Adição de novos funcionários diretamente pelo painel.
- **Relatórios Detalhados:** Filtros de folha de ponto por funcionário e período.
- **Visualização Individual:** Acesso à folha de ponto detalhada de cada funcionário.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com tecnologias modernas, separando claramente o frontend do backend.

**Frontend:**
- **React com TypeScript**
- **Vite:** Ferramenta de build de alta performance.
- **Tailwind CSS:** Para estilização rápida e responsiva.
- **shadcn/ui:** Biblioteca de componentes de UI acessíveis.
- **Context API:** Para gerenciamento de estado global.
- **Sonner:** Para notificações (toasts).

**Backend:**
- **Node.js com Express** e TypeScript.
- **Prisma:** ORM para interação segura e intuitiva com o banco de dados.
- **SQLite:** Banco de dados simples e baseado em arquivo.
- **Bcrypt:** Para hashing e segurança de senhas.
- **Zod:** Para validação de esquemas e proteção das rotas da API.
- **CORS:** Para permitir a comunicação entre frontend e backend.

## ⚙️ Como Executar o Projeto

Para rodar este projeto localmente, você precisará ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) instalado.

**1. Clone o Repositório**
```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio
```

**2. Configure o Backend**
Navegue até a pasta do backend, instale as dependências e rode as migrações do banco de dados.

```bash
cd backend
npm install
npx prisma migrate dev
```

**3. Configure o Frontend**
Em um **novo terminal**, navegue até a pasta raiz do projeto (frontend) e instale as dependências.

```bash
# Se você não estiver na raiz, volte com 'cd ..'
npm install
```

**4. Crie as Variáveis de Ambiente**
O projeto precisa de dois arquivos `.env`.

* **No diretório `backend/`**, crie um arquivo `.env` com o seguinte conteúdo:
    ```
    # Define o caminho para o arquivo do banco de dados SQLite
    DATABASE_URL="file:./prisma/dev.db"
    ```
* **No diretório raiz (frontend)**, crie um arquivo `.env` com o seguinte conteúdo:
    ```
    # Define a URL base da API para o frontend
    VITE_API_BASE_URL=http://localhost:3001
    ```

**5. Rode a Aplicação!**
Você precisará de dois terminais rodando simultaneamente.

* **No terminal do backend:**
    ```bash
    npm run dev
    # O servidor backend estará rodando em http://localhost:3001
    ```
* **No terminal do frontend:**
    ```bash
    npm run dev
    # A aplicação estará disponível em http://localhost:3000
    ```

Abra `http://localhost:3000` no seu navegador e comece a usar!

---
Desenvolvido com ❤️ por [Seu Nome].