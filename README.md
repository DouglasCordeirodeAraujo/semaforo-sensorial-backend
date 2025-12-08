# Semáforo Sensorial Backend

Backend do sistema **Semáforo Sensorial**, responsável pelo gerenciamento de escolas, salas, usuários e leituras de ruído.

---

## Índice

- [Descrição](#descrição)  
- [URL do Repositório](#url-do-repositório)  
- [Instalação](#instalação)  
- [Scripts](#scripts)  
- [Dependências](#dependências)  
- [Variáveis de Ambiente](#variáveis-de-ambiente)  
- [Tecnologias](#tecnologias)  
- [Configuração do Banco de Dados](#configuração-do-banco-de-dados)  
- [Rotas](#rotas) 

---

## Descrição

O backend gerencia:  
- Cadastro e listagem de escolas e salas de aula.  
- Gestão de usuários (criação, atualização, login e recuperação de senha).  
- Recebimento de leituras de ruído (manual e via ESP).  
- Estatísticas de leituras por sala.

---

## URL do Repositório

[https://github.com/DouglasCordeirodeAraujo/semaforo-sensorial-backend](https://github.com/DouglasCordeirodeAraujo/semaforo-sensorial-backend)

---

## Instalação

1. Clonar o repositório:
```bash
git clone https://github.com/DouglasCordeirodeAraujo/semaforo-sensorial-backend.git
cd semaforo-sensorial-backend
```

2. Inicializar o projeto Node.js:
```bash
npm init -y
```

3. Instalar dependências:
```bash
npm install express mysql2 dotenv cors
npm install bcrypt jsonwebtoken
npm install crypto
npm install --save-dev nodemon
npm install morgan helmet nodemailer axios
```

4. Criar o arquivo `.env` com as seguintes variáveis:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=semaforo_app
DB_PORT=3306
PORT=3000

EMAIL_USER="seu-email-do-projeto@gmail.com"
EMAIL_PASS="senha-do-email-do-projeto"

JWT_SECRET=seu_segredo_super_secreto
API_KEY_ESP=seutokeninterno
```

---

## Scripts

No `package.json`, adicione:
```json
"scripts": {
  "dev": "nodemon server.js"
}
```

Rodar o projeto em modo de desenvolvimento:
```bash
npm run dev
```

---

## Dependências

- express  
- mysql2  
- dotenv  
- cors  
- bcrypt  
- jsonwebtoken  
- crypto  
- nodemon (dev)  
- morgan  
- helmet  
- nodemailer  
- axios

---

## Tecnologias

- Node.js  
- MySQL (XAMPP)  
- Express

---

## Configuração do Banco de Dados

Script SQL para criar banco e tabelas:
```sql
CREATE DATABASE IF NOT EXISTS semaforo_app;
USE semaforo_app;

CREATE TABLE IF NOT EXISTS escola (
    id_escola INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome_escola VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS sala_de_aula (
    id_sala INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cor_sala VARCHAR(255) NOT NULL,
    nome_sala VARCHAR(255) NOT NULL,
    id_escola INT(11) NOT NULL,
    FOREIGN KEY (id_escola) REFERENCES escola(id_escola)
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_usuario VARCHAR(255) NOT NULL UNIQUE,
    senha_usuario VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    id_escola INT(11) NOT NULL,
    FOREIGN KEY (id_escola) REFERENCES escola(id_escola)
);

CREATE TABLE IF NOT EXISTS leitura_ruido (
    id_decibeis INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    decibeis DECIMAL(5,2) NOT NULL,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_sala INT(11) NOT NULL,
    FOREIGN KEY (id_sala) REFERENCES sala_de_aula(id_sala)
);
```

---

## Rotas

### Escolas
- **POST** `/escolas/criar-escola/` — cadastra nova escola  
```json
{ "nome_escola": "ETE - TESTE" }
```
- **GET** `/escolas/listar-escolas/` — lista todas as escolas

### Salas
- **GET** `/salas/listar-salas/` — lista todas as salas  
- **POST** `/salas/criar-sala/` — cria nova sala  
```json
{ "cor_sala": "blue", "nome_sala": "teste", "id_escola": "2" }
```
- **GET** `/salas/listar-sala/:id` — lista sala por ID  
- **PUT** `/salas/atualizar-sala/:id` — atualiza sala  
```json
{ "cor_sala": "blue", "nome_sala": "test", "id_escola": "2" }
```
- **DELETE** `/salas/deletar-sala/:id` — deleta sala por ID

### Usuários
- **GET** `/usuarios/listar-usuarios/` — lista todos usuários  
- **POST** `/usuarios/criar-usuario/` — cria usuário  
```json
{
  "email": "douglascordeiro789@gmail.com",
  "nome_usuario": "andreza",
  "senha_usuario":"0987654321",
  "id_escola": "2"
}
```
- **GET** `/usuarios/listar-usuario/:id` — lista usuário por ID  
- **PUT** `/usuarios/atualizar-usuario/:id` — atualiza usuário  
```json
{ "email": "douglascordeiro789@gmail.com", "nome_usuario": "andreza araujo", "id_escola": 1 }
```
- **DELETE** `/usuarios/deletar-usuario/:id` — deleta usuário por ID  
- **POST** `/usuarios/login/` — login de usuário  
- **POST** `/usuarios/forgot-password/` — inicia recuperação de senha  
- **POST** `/usuarios/reset-password/` — redefine senha

### Leituras de Ruído
- **POST** `/leituras/esp/` — recebe dados da ESP  
```json
{ "decibeis": "56.96", "id_sala": 10 }
```
- **POST** `/leituras/criar-leitura` — cria leitura manual  
```json
{ "decibeis": "34.57", "id_sala": 9 }
```
- **GET** `/leituras/listar-leitura-escola` — lista leituras por escola  
- **GET** `/leituras/:id_decibeis` — busca leitura por ID

### Estatísticas
- **GET** `/estatisticas/ultima/:id_sala` — última leitura por sala  
- **GET** `/estatisticas/sala/:id_sala/ultimas` — últimas leituras X horas  
- **GET** `/estatisticas/salas` — estatísticas resumo por sala  
- **GET** `/estatisticas/sala/:id_sala/por-hora` — média por dia  
- **GET** `/estatisticas/sala/:id_sala/ultimos-dias/` — média últimos N dias  
- **GET** `/estatisticas/ultimas-por-sala/` — última leitura de todas as salas

---