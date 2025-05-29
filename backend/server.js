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

// Middleware para log de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

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

// Rota para obter estatísticas das requisições (ATUALIZADA)
app.get('/requisicoes/estatisticas', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'atendida' THEN 1 ELSE 0 END) as atendidas,
      SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
      SUM(CASE WHEN status = 'atrasada' THEN 1 ELSE 0 END) as atrasadas,
      DATE_FORMAT(data, '%Y-%m') as mes
    FROM requisicoes
    WHERE data >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY mes
    ORDER BY mes ASC
  `;

  req.dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar estatísticas:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar estatísticas',
        details: err.message
      });
    }

    res.json({
      success: true,
      estatisticas: results
    });
  });
});

// ... (mantenha o resto do seu backend existente)

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('=================================');
  console.log('SERVIDOR INICIADO COM SUCESSO!');
  console.log('=================================');
  console.log(`Porta: ${PORT}`);
  console.log(`IP Local: http://localhost:${PORT}`);
  console.log(`IP Rede: http://10.136.23.237:${PORT}`);
  console.log('');
  console.log('ROTAS DISPONÍVEIS:');
  console.log(`• GET    / - Status da API`);
  console.log(`• GET    /test-db - Teste do banco`);
  console.log(`• GET    /debug/routes - Lista todas as rotas`);
  console.log(`• GET    /funcionarios - Lista todos os funcionários`);
  console.log(`• GET    /funcionario/:id - Busca funcionário por ID`);
  console.log(`• PUT    /funcionario/:id - Atualiza funcionário`);
  console.log(`• POST   /login - Login de usuário`);
  console.log(`• POST   /check-email - Verifica se email existe`);
  console.log(`• GET    /requisicoes/estatisticas - Estatísticas de requisições`);
  console.log('=================================');
});

