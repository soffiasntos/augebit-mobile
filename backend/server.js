const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'estoque',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Pool de conexões
const pool = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Teste de conexão na inicialização
pool.getConnection((err, connection) => {
  if (err) {
    console.error('ERRO: Não foi possível conectar ao banco de dados!');
    console.error('Detalhes:', err.message);
    console.log('VERIFICAÇÕES NECESSÁRIAS:');
    console.log('1. XAMPP está rodando?');
    console.log('2. MySQL está ativo no XAMPP?');
    console.log('3. Banco "estoque" existe?');
    console.log('4. Tabela "funcionarios" existe?');
  } else {
    console.log('Conexão com banco de dados estabelecida!');
    connection.release();
  }
});

// Middleware de conexão
app.use((req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Erro ao obter conexão:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro de conexão com o banco de dados',
        details: err.message
      });
    }
    
    req.dbConnection = connection;
    res.on('finish', () => connection.release());
    next();
  });
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API funcionando corretamente!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste do banco
app.get('/test-db', (req, res) => {
  const query = 'SELECT COUNT(*) as total FROM funcionarios';
  
  req.dbConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar banco',
        details: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'Conexão com banco OK!',
      totalFuncionarios: results[0].total
    });
  });
});

// Rota para listar todos os funcionários (para debug)
app.get('/funcionarios', (req, res) => {
  const query = 'SELECT id, nome, email, NomeCompleto FROM funcionarios';
  
  req.dbConnection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar funcionários',
        details: err.message
      });
    }
    
    res.json({
      success: true,
      funcionarios: results
    });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  console.log('Tentativa de login recebida:', { email: req.body.email });
  
  const { email, senha } = req.body;
  
  if (!email || !senha) {
    console.log('Dados incompletos');
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }
  
  // Incluir NomeCompleto na consulta
  const query = 'SELECT id, nome, email, NomeCompleto FROM funcionarios WHERE email = ? AND senha = ?';
  
  req.dbConnection.query(query, [email, senha], (err, results) => {
    if (err) {
      console.error('Erro no banco:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro interno no servidor',
        details: err.message
      });
    }
    
    console.log(`Consulta executada. Resultados encontrados: ${results.length}`);
    
    if (results.length > 0) {
      const user = { ...results[0] };
      
      console.log('Login bem-sucedido para:', email);
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: user
      });
    } else {
      console.log('Credenciais inválidas para:', email);
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }
  });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('SERVIDOR INICIADO COM SUCESSO!');
  console.log(`Porta: ${PORT}`);
  console.log(`IP Local: http://localhost:${PORT}`);
  console.log(`IP Rede: http://10.136.23.237:${PORT}`);
  console.log('TESTES DISPONÍVEIS:');
  console.log(`• API Status: http://10.136.23.237:${PORT}/`);
  console.log(`• Teste DB: http://10.136.23.237:${PORT}/test-db`);
  console.log(`• Funcionários: http://10.136.23.237:${PORT}/funcionários`);
});

process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
});

process.on('SIGINT', () => {
  console.log('Encerrando servidor...');
  pool.end(err => {
    if (err) console.error('Erro ao encerrar pool:', err);
    console.log('Servidor encerrado');
    process.exit(0);
  });
});