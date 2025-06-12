require('dotenv').config();
const express = require('express');
const requisicoesRouter = require('./routes/requisicoes');
const mysql = require('mysql');
const cors = require('cors');
const os = require('os');


function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // fallback
}

const LOCAL_IP = getLocalIP();
const HOST = '0.0.0.0'; // escuta em todas as interfaces
const PORT = process.env.PORT || 3000;

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


// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Aumentar limite do JSON para comportar imagens base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para log de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    // Log especial para uploads de foto (não mostrar base64 completo)
    if (req.body.fotoPerfil) {
      console.log('Body:', {
        ...req.body,
        fotoPerfil: req.body.fotoPerfil ? `${req.body.fotoPerfil.substring(0, 50)}... (${req.body.fotoPerfil.length} chars)` : null
      });
    } else {
      console.log('Body:', JSON.stringify(req.body, null, 2));
    }
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
    
    // Verificar se a coluna fotoPerfil existe, se não existir, criar
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'estoque' 
      AND TABLE_NAME = 'funcionarios' 
      AND COLUMN_NAME = 'fotoPerfil'
    `;
    
    connection.query(checkColumnQuery, (err, results) => {
      if (err) {
        console.error('Erro ao verificar coluna fotoPerfil:', err);
      } else if (results.length === 0) {
        console.log('Coluna fotoPerfil não existe. Criando...');
        
        const addColumnQuery = `
          ALTER TABLE funcionarios 
          ADD COLUMN fotoPerfil LONGTEXT NULL,
          ADD COLUMN FotoPerfil LONGTEXT NULL
        `;
        
        connection.query(addColumnQuery, (err) => {
          if (err) {
            console.error('Erro ao criar coluna fotoPerfil:', err);
          } else {
            console.log('Coluna fotoPerfil criada com sucesso!');
          }
        });
      } else {
        console.log('Coluna fotoPerfil já existe no banco de dados.');
      }
    });
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
      DataAdmissao, dataAdmissao, fotoPerfil, FotoPerfil
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
      DataAdmissao, dataAdmissao, fotoPerfil, FotoPerfil, created_at, updated_at
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
    console.log('Funcionário encontrado (sem foto):', {
      ...funcionario,
      fotoPerfil: funcionario.fotoPerfil ? 'Foto presente' : 'Sem foto',
      FotoPerfil: funcionario.FotoPerfil ? 'Foto presente' : 'Sem foto'
    });
    
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
      fotoPerfil: funcionario.fotoPerfil || funcionario.FotoPerfil || null,
      FotoPerfil: funcionario.fotoPerfil || funcionario.FotoPerfil || null,
      created_at: funcionario.created_at,
      updated_at: funcionario.updated_at
    };
    
    res.json({
      success: true,
      funcionario: funcionarioNormalizado
    });
  });
});


app.get('/check-tables', (req, res) => {
  const query = `
    SELECT COUNT(*) as exists_flag
    FROM information_schema.tables 
    WHERE table_schema = 'estoque' 
    AND table_name = 'requisicoes'
  `;
  
  req.db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao verificar tabelas',
        details: err.message 
      });
    }
    
    const exists = results[0].exists_flag > 0;
    res.json({ 
      success: true,
      tables: {
        requisicoes: exists
      }
    });
  });
});


// NOVA ROTA: Atualizar foto de perfil
app.put('/funcionario/:id/foto', (req, res) => {
  const { id } = req.params;
  const { fotoPerfil } = req.body;
  
  console.log(`=== ATUALIZANDO FOTO DO FUNCIONÁRIO ID: ${id} ===`);
  console.log('Tamanho da imagem recebida:', fotoPerfil ? fotoPerfil.length : 0);
  
  if (!fotoPerfil) {
    return res.status(400).json({
      success: false,
      message: 'Foto de perfil é obrigatória'
    });
  }
  
  // Verificar se é uma imagem base64 válida
  if (!fotoPerfil.startsWith('data:image/')) {
    return res.status(400).json({
      success: false,
      message: 'Formato de imagem inválido. Use base64.'
    });
  }
  
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
    
    console.log('Funcionário existe, atualizando foto...');
    
    // Atualizar foto no banco
    const updateQuery = `
      UPDATE funcionarios 
      SET fotoPerfil = ?, FotoPerfil = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    
    req.dbConnection.query(updateQuery, [fotoPerfil, fotoPerfil, id], (err, results) => {
      if (err) {
        console.error('Erro ao atualizar foto:', err);
        return res.status(500).json({
          success: false,
          error: 'Erro ao atualizar foto de perfil',
          details: err.message
        });
      }
      
      console.log('Resultado da atualização da foto:', results);
      
      if (results.affectedRows === 0) {
        console.log('Nenhuma linha afetada na atualização da foto');
        return res.status(404).json({
          success: false,
          message: 'Funcionário não encontrado ou foto não foi atualizada'
        });
      }
      
      console.log('Foto de perfil atualizada com sucesso!');
      
      res.json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso',
        funcionarioId: id
      });
    });
  });
});

// Rota para atualizar funcionário
app.put('/funcionario/:id', (req, res) => {
  const { id } = req.params;
  const { nome, nomeCompleto, email, senha, telefone, cargo, departamento, fotoPerfil } = req.body;
  
  console.log(`=== ATUALIZANDO FUNCIONÁRIO ID: ${id} ===`);
  console.log('Dados recebidos:', {
    nome,
    nomeCompleto,
    email,
    senha: senha ? '***' : 'não informada',
    telefone,
    cargo,
    departamento,
    fotoPerfil: fotoPerfil ? `Foto presente (${fotoPerfil.length} chars)` : 'não informada'
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
    
    // ADICIONADO: Suporte para atualizar foto de perfil na rota geral
    if (fotoPerfil !== undefined && fotoPerfil.trim() !== '') {
      console.log('Atualizando foto de perfil na rota geral');
      fieldsToUpdate.push('fotoPerfil = ?', 'FotoPerfil = ?');
      values.push(fotoPerfil.trim(), fotoPerfil.trim());
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
    console.log('Valores (sem foto):', values.map((v, i) => {
      if (i === values.length - 1) return v; // ID
      if (typeof v === 'string' && v.startsWith('data:image/')) return 'FOTO_BASE64';
      if (typeof v === 'string' && v.includes('@')) return v;
      return v.length > 10 ? '***' : v;
    }));
    
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
          DataAdmissao, dataAdmissao, fotoPerfil, FotoPerfil, created_at, updated_at
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
          fotoPerfil: funcionario.fotoPerfil || funcionario.FotoPerfil || null,
          FotoPerfil: funcionario.fotoPerfil || funcionario.FotoPerfil || null,
          created_at: funcionario.created_at,
          updated_at: funcionario.updated_at
        };
        
        console.log('Dados atualizados retornados (sem foto):', {
          ...funcionarioNormalizado,
          fotoPerfil: funcionarioNormalizado.fotoPerfil ? 'Foto presente' : null,
          FotoPerfil: funcionarioNormalizado.FotoPerfil ? 'Foto presente' : null
        });
        
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



app.get('/produto', (req, res) => {
  console.log('Buscando todos os produtos...');
  
  const query = `
    SELECT 
      id, nome, descricao, categoria, preco, quantidade, 
      minimo, fornecedor, status, created_at, updated_at
    FROM produto
    WHERE status = 'ativo'
    ORDER BY nome ASC
  `;
  
  req.dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao consultar produtos:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar produtos',
        details: err.message
      });
    }
    
    console.log(`Encontrados ${results.length} produtos`);
    
    // Formatar preços para exibição
    const produtosFormatados = results.map(produto => ({
      ...produto,
      preco: parseFloat(produto.preco),
      precoFormatado: `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`,
      estoqueStatus: produto.quantidade <= produto.minimo ? 'baixo' : 'normal',
      created_at: produto.created_at,
      updated_at: produto.updated_at
    }));
    
    res.json({
      success: true,
      produto: produtosFormatados, // Mudança aqui: usando 'produto' em vez de 'produtos'
      total: produtosFormatados.length
    });
  });
});

// Rota para buscar produto por ID
app.get('/produto/:id', (req, res) => {
  const { id } = req.params;
  
  console.log(`Buscando produto com ID: ${id}`);
  
  const query = `
    SELECT 
      id, nome, descricao, categoria, preco, quantidade, 
      minimo, fornecedor, status, created_at, updated_at
    FROM produto
    WHERE id = ? AND status = 'ativo'
  `;
  
  req.dbConnection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produto:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar produto',
        details: err.message
      });
    }
    
    if (results.length === 0) {
      console.log(`Produto com ID ${id} não encontrado`);
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado'
      });
    }
    
    const produto = results[0];
    const produtoFormatado = {
      ...produto,
      preco: parseFloat(produto.preco),
      precoFormatado: `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`,
      estoqueStatus: produto.quantidade <= produto.minimo ? 'baixo' : 'normal'
    };
    
    console.log('Produto encontrado:', produtoFormatado.nome);
    
    res.json({
      success: true,
      produto: produtoFormatado
    });
  });
});

// Rota para buscar produtos por categoria
app.get('/produto/categoria/:categoria', (req, res) => {
  const { categoria } = req.params;
  
  console.log(`Buscando produtos da categoria: ${categoria}`);
  
  const query = `
    SELECT 
      id, nome, descricao, categoria, preco, quantidade, 
      minimo, fornecedor, status, created_at, updated_at
    FROM produto
    WHERE categoria = ? AND status = 'ativo'
    ORDER BY nome ASC
  `;
  
  req.dbConnection.query(query, [categoria], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos por categoria:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar produtos',
        details: err.message
      });
    }
    
    const produtosFormatados = results.map(produto => ({
      ...produto,
      preco: parseFloat(produto.preco),
      precoFormatado: `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`,
      estoqueStatus: produto.quantidade <= produto.minimo ? 'baixo' : 'normal'
    }));
    
    console.log(`Encontrados ${results.length} produtos na categoria ${categoria}`);
    
    res.json({
      success: true,
      produto: produtosFormatados, // Usando 'produto' para consistência
      categoria: categoria,
      total: produtosFormatados.length
    });
  });
});

// Rota para buscar categorias disponíveis (corrigida)
app.get('/categorias', (req, res) => {
  console.log('Buscando categorias disponíveis...');
  
  const query = `
    SELECT DISTINCT categoria, COUNT(*) as total_produto
    FROM produto
    WHERE status = 'ativo' AND categoria IS NOT NULL AND categoria != ''
    GROUP BY categoria
    ORDER BY categoria ASC
  `;
  
  req.dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar categorias',
        details: err.message
      });
    }
    
    console.log(`Encontradas ${results.length} categorias`);
    
    res.json({
      success: true,
      categorias: results
    });
  });
});

// Rota adicional para buscar produtos com estoque baixo
app.get('/produto/estoque/baixo', (req, res) => {
  console.log('Buscando produtos com estoque baixo...');
  
  const query = `
    SELECT 
      id, nome, descricao, categoria, preco, quantidade, 
      minimo, fornecedor, status, created_at, updated_at
    FROM produto
    WHERE quantidade <= minimo AND status = 'ativo'
    ORDER BY quantidade ASC
  `;
  
  req.dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos com estoque baixo:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro ao consultar produtos',
        details: err.message
      });
    }
    
    const produtosFormatados = results.map(produto => ({
      ...produto,
      preco: parseFloat(produto.preco),
      precoFormatado: `R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`,
      estoqueStatus: 'baixo'
    }));
    
    console.log(`Encontrados ${results.length} produtos com estoque baixo`);
    
    res.json({
      success: true,
      produto: produtosFormatados,
      total: produtosFormatados.length
    });
  });
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log('=================================');
  console.log('SERVIDOR INICIADO COM SUCESSO!');
  console.log('=================================');
  console.log(`Porta: ${PORT}`);
  console.log(`IP Local: http://localhost:${PORT}`);
  console.log(`IP Rede: http://${LOCAL_IP}:${PORT}`);
  console.log('');
  console.log('ROTAS DISPONÍVEIS:');
  console.log(`• GET    / - Status da API`);
  console.log(`• GET    /test-db - Teste do banco`);
  console.log(`• GET    /debug/routes - Lista todas as rotas`);
  console.log(`• GET    /funcionarios - Lista todos os funcionários`);
  console.log(`• GET    /funcionario/:id - Busca funcionário por ID`);
  console.log(`• PUT    /funcionario/:id - Atualiza funcionário`);
  console.log(`• PUT    /funcionario/:id/foto - Atualiza foto de perfil`);
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