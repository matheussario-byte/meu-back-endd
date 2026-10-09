const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'chave_super_secreta_rs_servicos';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken, SECRET_KEY };