const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// Configuração do banco de dados diretamente no server.js
const dbConfig = {
  host: 'localhost',  // Endereço do servidor MySQL
  user: 'root',       // Usuário padrão do XAMPP
  password: '',       // Senha padrão do XAMPP (vazia)
  database: 'estoque'  // Nome do banco de dados que criamos
};

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Criar conexão com o banco de dados
const connection = mysql.createConnection(dbConfig);

// Conectar ao banco de dados
connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

