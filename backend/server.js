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

// Rota para debug - listar todas as rotas
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  res.json({ routes });
});

// Rota para listar todos os funcionários
app.get('/funcionarios', (req, res) => {
  console.log('Buscando todos os funcionários...');
  
  const query = `
    SELECT 
      id, nome, Nome, email, NomeCompleto, nomeCompleto, senha, 
      Telefone, telefone, Cargo, cargo, Departamento, departamento,
      DataAdmissao, dataAdmissao
    FROM funcionarios
  `;
  
  req.dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao consultar funcionários:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar funcionários',
        details: err.message
      });
    }
    
    console.log(`Encontrados ${results.length} funcionários`);
    
    res.json({
      success: true,
      funcionarios: results
    });
  });
});

// Rota para buscar funcionário por ID
app.get('/funcionario/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`Buscando funcionário com ID: ${id}`);
  
  const query = `
    SELECT 
      id, nome, Nome, NomeCompleto, nomeCompleto, email, senha,
      Telefone, telefone, Cargo, cargo, Departamento, departamento,
      DataAdmissao, dataAdmissao, created_at, updated_at
    FROM funcionarios 
    WHERE id = ?
  `;
  
  req.dbConnection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionário:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar funcionário',
        details: err.message
      });
    }
    
    if (results.length === 0) {
      console.log(`Funcionário com ID ${id} não encontrado`);
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado'
      });
    }
    
    const funcionario = results[0];
    console.log('Funcionário encontrado:', funcionario);
    
    // Normalizar dados para compatibilidade
    const funcionarioNormalizado = {
      id: funcionario.id,
      nome: funcionario.nome || funcionario.Nome || '',
      Nome: funcionario.nome || funcionario.Nome || '',
      nomeCompleto: funcionario.NomeCompleto || funcionario.nomeCompleto || '',
      NomeCompleto: funcionario.NomeCompleto || funcionario.nomeCompleto || '',
      email: funcionario.email || '',
      senha: funcionario.senha || '',
      telefone: funcionario.Telefone || funcionario.telefone || '',
      Telefone: funcionario.Telefone || funcionario.telefone || '',
      cargo: funcionario.Cargo || funcionario.cargo || '',
      Cargo: funcionario.Cargo || funcionario.cargo || '',
      departamento: funcionario.Departamento || funcionario.departamento || '',
      Departamento: funcionario.Departamento || funcionario.departamento || '',
      dataAdmissao: funcionario.DataAdmissao || funcionario.dataAdmissao || '',
      DataAdmissao: funcionario.DataAdmissao || funcionario.dataAdmissao || '',
      created_at: funcionario.created_at,
      updated_at: funcionario.updated_at
    };
    
    res.json({
      success: true,
      funcionario: funcionarioNormalizado
    });
  });
});

// Rota para atualizar funcionário
app.put('/funcionario/:id', (req, res) => {
  const { id } = req.params;
  const { nome, nomeCompleto, email, senha, telefone, cargo, departamento } = req.body;
  
  console.log(`=== ATUALIZANDO FUNCIONÁRIO ID: ${id} ===`);
  console.log('Dados recebidos:', {
    nome,
    nomeCompleto,
    email,
    senha: senha ? '***' : 'não informada',
    telefone,
    cargo,
    departamento
  });
  
  // Verificar se o funcionário existe
  const checkQuery = 'SELECT id FROM funcionarios WHERE id = ?';
  
  req.dbConnection.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Erro ao verificar funcionário:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar funcionário',
        details: err.message
      });
    }
    
    if (results.length === 0) {
      console.log(`Funcionário com ID ${id} não encontrado`);
      return res.status(404).json({
        success: false,
        message: 'Funcionário não encontrado'
      });
    }
    
    console.log('Funcionário existe, prosseguindo com atualização...');
    
    // Construir query de update dinamicamente
    const fieldsToUpdate = [];
    const values = [];
    
    if (nome !== undefined && nome.trim() !== '') {
      console.log('Atualizando nome:', nome.trim());
      fieldsToUpdate.push('nome = ?', 'Nome = ?');
      values.push(nome.trim(), nome.trim());
    }
    
    if (nomeCompleto !== undefined && nomeCompleto.trim() !== '') {
      console.log('Atualizando nome completo:', nomeCompleto.trim());
      fieldsToUpdate.push('NomeCompleto = ?', 'nomeCompleto = ?');
      values.push(nomeCompleto.trim(), nomeCompleto.trim());
    }
    
    if (email !== undefined && email.trim() !== '') {
      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        console.log('Email inválido:', email);
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }
      console.log('Atualizando email:', email.trim());
      fieldsToUpdate.push('email = ?');
      values.push(email.trim());
    }
    
    if (senha !== undefined && senha.trim() !== '') {
      console.log('Atualizando senha');
      fieldsToUpdate.push('senha = ?');
      values.push(senha.trim());
    }
    
    if (telefone !== undefined) {
      console.log('Atualizando telefone:', telefone.trim());
      fieldsToUpdate.push('Telefone = ?', 'telefone = ?');
      values.push(telefone.trim(), telefone.trim());
    }
    
    if (cargo !== undefined) {
      console.log('Atualizando cargo:', cargo.trim());
      fieldsToUpdate.push('Cargo = ?', 'cargo = ?');
      values.push(cargo.trim(), cargo.trim());
    }
    
    if (departamento !== undefined) {
      console.log('Atualizando departamento:', departamento.trim());
      fieldsToUpdate.push('Departamento = ?', 'departamento = ?');
      values.push(departamento.trim(), departamento.trim());
    }
    
    if (fieldsToUpdate.length === 0) {
      console.log('Nenhum campo para atualizar');
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo válido para atualizar'
      });
    }
    
    values.push(id); // Para o WHERE
    
    const updateQuery = `UPDATE funcionarios SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
    
    console.log('Query de update:', updateQuery);
    console.log('Valores:', values.map((v, i) => i === values.length - 1 ? v : (typeof v === 'string' && v.includes('@') ? v : (v.length > 10 ? '***' : v))));
    
    req.dbConnection.query(updateQuery, values, (err, results) => {
      if (err) {
        console.error('Erro ao atualizar funcionário:', err);
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar funcionário',
          details: err.message
        });
      }
      
      console.log('Resultado da atualização:', results);
      
      if (results.affectedRows === 0) {
        console.log('Nenhuma linha afetada');
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado ou nenhuma alteração realizada'
        });
      }
      
      console.log('Funcionário atualizado com sucesso!');
      
      // Buscar os dados atualizados para retornar
      const selectQuery = `
        SELECT 
          id, nome, Nome, NomeCompleto, nomeCompleto, email, 
          Telefone, telefone, Cargo, cargo, Departamento, departamento,
          DataAdmissao, dataAdmissao, created_at, updated_at
        FROM funcionarios 
        WHERE id = ?
      `;
      
      req.dbConnection.query(selectQuery, [id], (err, results) => {
        if (err) {
          console.error('Erro ao buscar dados atualizados:', err);
          return res.json({
            success: true,
            message: 'Funcionário atualizado com sucesso'
          });
        }
        
        const funcionario = results[0];
        const funcionarioNormalizado = {
          id: funcionario.id,
          nome: funcionario.nome || funcionario.Nome || '',
          Nome: funcionario.nome || funcionario.Nome || '',
          nomeCompleto: funcionario.NomeCompleto || funcionario.nomeCompleto || '',
          NomeCompleto: funcionario.NomeCompleto || funcionario.nomeCompleto || '',
          email: funcionario.email || '',
          telefone: funcionario.Telefone || funcionario.telefone || '',
          Telefone: funcionario.Telefone || funcionario.telefone || '',
          cargo: funcionario.Cargo || funcionario.cargo || '',
          Cargo: funcionario.Cargo || funcionario.cargo || '',
          departamento: funcionario.Departamento || funcionario.departamento || '',
          Departamento: funcionario.Departamento || funcionario.departamento || '',
          dataAdmissao: funcionario.DataAdmissao || funcionario.dataAdmissao || '',
          DataAdmissao: funcionario.DataAdmissao || funcionario.dataAdmissao || '',
          created_at: funcionario.created_at,
          updated_at: funcionario.updated_at
        };
        
        console.log('Dados atualizados retornados:', funcionarioNormalizado);
        
        res.json({
          success: true,
          message: 'Funcionário atualizado com sucesso',
          funcionario: funcionarioNormalizado
        });
      });
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
  
  const query = 'SELECT * FROM funcionarios WHERE email = ? AND senha = ?';
  
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

// Rota para verificar se email já existe
app.post('/check-email', (req, res) => {
  const { email, excludeId } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }
  
  let query = 'SELECT id FROM funcionarios WHERE email = ?';
  let params = [email];
  
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  
  req.dbConnection.query(query, params, (err, results) => {
    if (err) {
      console.error('Erro ao verificar email:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao verificar email',
        details: err.message
      });
    }
    
    res.json({
      success: true,
      exists: results.length > 0
    });
  });
});

// Rota não encontrada
app.use((req, res) => {
  console.log(`ROTA NÃO ENCONTRADA: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada',
    method: req.method,
    url: req.originalUrl
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
  console.log(`• GET    /debug/routes - Lista todas as rotas`);
  console.log(`• GET    /funcionarios - Lista todos os funcionários`);
  console.log(`• GET    /funcionario/:id - Busca funcionário por ID`);
  console.log(`• PUT    /funcionario/:id - Atualiza funcionário`);
  console.log(`• POST   /login - Login de usuário`);
  console.log(`• POST   /check-email - Verifica se email existe`);
  console.log('=================================');
});

// Tratamento de erros
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