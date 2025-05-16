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

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const query = 'SELECT * FROM funcionarios WHERE email = ? AND senha = ?';

  connection.query(query, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco:', err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }

    if (results.length > 0) {
      // Usuário encontrado
      res.status(200).json({ success: true, user: results[0] });
    } else {
      // Usuário não encontrado
      res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
    }
  });
});
