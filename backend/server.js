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

// Aumentar limite do JSON para suportar imagens base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware para log de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Não logar imagens base64 completas para evitar spam no console
    const bodyLog = { ...req.body };
    if (bodyLog.fotoPerfil && bodyLog.fotoPerfil.length > 100) {
      bodyLog.fotoPerfil = 'BASE64_IMAGE_DATA';
    }
    console.log('Body:', JSON.stringify(bodyLog, null, 2));
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

// ROTAS

// Rota de status
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste do banco
app.get('/test-db', (req, res) => {
  req.dbConnection.query('SELECT 1 as test', (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Erro na conexão com banco',
        details: err.message
      });
    }
    
    res.json({
      success: true,
      message: 'Banco de dados conectado!',
      test: results[0]
    });
  });
});

// Rota para atualizar foto de perfil
app.put('/funcionario/:id/foto', (req, res) => {
  try {
    const { id } = req.params;
    const { fotoPerfil } = req.body;

    console.log(`Atualizando foto do funcionário ID: ${id}`);

    if (!fotoPerfil) {
      return res.status(400).json({
        success: false,
        message: 'Foto é obrigatória'
      });
    }

    // Validar se é uma imagem base64 válida
    if (!fotoPerfil.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Formato de imagem inválido'
      });
    }

    // Atualizar no banco de dados
    const query = `UPDATE funcionarios SET FotoPerfil = ? WHERE id = ?`;
    
    req.dbConnection.query(query, [fotoPerfil, id], (err, results) => {
      if (err) {
        console.error('Erro ao atualizar foto:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro ao atualizar foto no banco de dados',
          details: err.message
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado'
        });
      }

      console.log(`Foto atualizada com sucesso para funcionário ID: ${id}`);
      
      res.json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso'
      });
    });

  } catch (error) {
    console.error('Erro ao processar atualização de foto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para buscar funcionário por ID
app.get('/funcionario/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM funcionarios WHERE id = ?';
  
  req.dbConnection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionário:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar funcionário',
        details: err.message
      });
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado'
      });
    }
    
    res.json({
      success: true,
      funcionario: results[0]
    });
  });
});

// Rota para atualizar funcionário
app.put('/funcionario/:id', (req, res) => {
  const { id } = req.params;
  const { nome, nomeCompleto, email, senha, telefone, cargo, departamento } = req.body;
  
  let query = `
    UPDATE funcionarios 
    SET nome = ?, NomeCompleto = ?, email = ?, Telefone = ?, Cargo = ?, Departamento = ?
  `;
  let params = [nome, nomeCompleto, email, telefone, cargo, departamento];
  
  // Se senha foi fornecida, incluir na atualização
  if (senha && senha !== '•••••••') {
    query += ', senha = ?';
    params.push(senha);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  req.dbConnection.query(query, params, (err, results) => {
    if (err) {
      console.error('Erro ao atualizar funcionário:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar funcionário',
        details: err.message
      });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Funcionário atualizado com sucesso'
    });
  });
});

// Rota para obter estatísticas das requisições
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
  console.log(`• GET    /funcionario/:id - Busca funcionário por ID`);
  console.log(`• PUT    /funcionario/:id - Atualiza funcionário`);
  console.log(`• PUT    /funcionario/:id/foto - Atualiza foto do funcionário`);
  console.log(`• GET    /requisicoes/estatisticas - Estatísticas de requisições`);
  console.log('=================================');
});