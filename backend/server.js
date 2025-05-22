const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
<<<<<<< HEAD
=======

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',  // Endereço do servidor MySQL
  user: 'root',       // Usuário padrão do XAMPP
  password: '',       // Senha padrão do XAMPP (vazia)
  database: 'estoque' // Nome do banco de dados
};
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22

const app = express();
const PORT = 3000;

<<<<<<< HEAD
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'estoque'
};

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
=======
// Middleware
app.use(cors({
  origin: '*', // Permite requisições de qualquer origem
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Criar pool de conexões para melhor performance e estabilidade
const pool = mysql.createPool(dbConfig);

// Middleware para verificar conexão com o banco
app.use((req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Erro ao obter conexão do pool:', err);
      return res.status(500).json({ 
        error: 'Erro de conexão com o banco de dados',
        details: err.message
      });
    }
    
    // Tornar a conexão disponível para as rotas
    req.dbConnection = connection;
    
    // Middleware para liberar a conexão quando a resposta for enviada
    res.on('finish', () => {
      connection.release();
    });
    
    next();
  });
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando corretamente!' });
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22
});

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('API funcionando');
});


app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  
  // Validação de dados
  if (!email || !senha) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email e senha são obrigatórios' 
    });
  }
  
  const query = 'SELECT * FROM funcionarios WHERE email = ? AND senha = ?';
<<<<<<< HEAD
  connection.query(query, [email, senha], (err, results) => {
=======
  
  req.dbConnection.query(query, [email, senha], (err, results) => {
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22
    if (err) {
      console.error('Erro ao consultar o banco:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno no servidor',
        details: err.message
      });
    }
    
    if (results.length > 0) {
<<<<<<< HEAD
      res.status(200).json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
=======
      // Usuário encontrado - login bem-sucedido
      const user = { ...results[0] };
      
      // Não enviar a senha na resposta por segurança
      delete user.senha;
      
      res.status(200).json({ 
        success: true, 
        message: 'Login realizado com sucesso',
        user: user
      });
    } else {
      // Usuário não encontrado ou credenciais inválidas
      res.status(401).json({ 
        success: false, 
        message: 'Email ou senha inválidos' 
      });
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22
    }
  });
});

<<<<<<< HEAD
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
=======
// Tratamento de erros para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://192.168.1.112:${PORT}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
});

// Encerrar conexões ao finalizar o servidor
process.on('SIGINT', () => {
  pool.end(err => {
    if (err) console.error('Erro ao encerrar conexões do pool:', err);
    console.log('Conexões com o banco de dados encerradas');
    process.exit(0);
  });
});
>>>>>>> dd65a1025b52df6e111bdb49343ae933a116cc22
