const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { authenticateToken, SECRET_KEY } = require('./auth');

const app = express();

// Permite requisições do seu frontend hospedado no Netlify
app.use(cors());
// Aumenta o limite para envio de arquivos base64 no chat
app.use(express.json({ limit: '10mb' }));

// ========================
// ROTA: LOGIN
// ========================
app.post('/api/login', (req, res) => {
    const { identificador, senha } = req.body;
    db.get('SELECT * FROM usuarios WHERE identificador = ? AND senha = ?', [identificador, senha], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro interno no servidor' });
        if (!row) return res.status(401).json({ erro: 'Credenciais inválidas' });

        const usuario = { id: row.id, nome: row.nome, perfil: row.perfil };
        const token = jwt.sign(usuario, SECRET_KEY, { expiresIn: '12h' });
        
        res.json({ token, usuario });
    });
});

// ========================
// ROTA: OBTER CHAMADOS
// ========================
app.get('/api/chamados', authenticateToken, (req, res) => {
    db.all('SELECT * FROM chamados', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar chamados' });
        
        // Transforma a string de mensagens de volta para JSON/Array
        const chamados = rows.map(r => ({
            ...r,
            mensagens: JSON.parse(r.mensagens || '[]')
        }));
        
        res.json(chamados);
    });
});

// ========================
// ROTA: CRIAR CHAMADO
// ========================
app.post('/api/chamados', authenticateToken, (req, res) => {
    const c = req.body;
    const mensagensStr = JSON.stringify(c.mensagens || []);
    const dataCriacao = new Date().toISOString();
    
    const query = `INSERT INTO chamados (titulo, categoria, urgencia, descricaoInicial, nomeSolicitante, turno, telefone, email, criador, status, dataCriacao, mensagens)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [c.titulo, c.categoria, c.urgencia, c.descricaoInicial, c.nomeSolicitante, c.turno, c.telefone, c.email, c.criador, c.status, dataCriacao, mensagensStr], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao registrar chamado' });
        
        res.json({ id: this.lastID, ...c, dataCriacao, mensagens: c.mensagens || [] });
    });
});

// ========================
// ROTA: ADICIONAR MENSAGEM
// ========================
app.post('/api/chamados/:id/mensagens', authenticateToken, (req, res) => {
    const id = req.params.id;
    const novaMensagem = req.body;

    db.get('SELECT mensagens FROM chamados WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).json({ erro: 'Chamado não encontrado' });
        
        const mensagens = JSON.parse(row.mensagens || '[]');
        mensagens.push(novaMensagem);
        
        db.run('UPDATE chamados SET mensagens = ? WHERE id = ?', [JSON.stringify(mensagens), id], (err2) => {
            if (err2) return res.status(500).json({ erro: 'Erro ao salvar mensagem' });
            res.json({ sucesso: true });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor RS Serviços rodando na porta ${PORT}`);
});