const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// No Render, o ideal é usar um disco persistente (Persistent Disk), mas este arquivo local servirá perfeitamente para iniciar.
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identificador TEXT UNIQUE,
        senha TEXT,
        nome TEXT,
        perfil TEXT
    )`);

    // Tabela de Chamados
    db.run(`CREATE TABLE IF NOT EXISTS chamados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT,
        categoria TEXT,
        urgencia TEXT,
        descricaoInicial TEXT,
        nomeSolicitante TEXT,
        turno TEXT,
        telefone TEXT,
        email TEXT,
        criador TEXT,
        status TEXT,
        dataCriacao TEXT,
        mensagens TEXT
    )`);

    // Inserir usuários padrão caso o banco esteja vazio
    db.get("SELECT * FROM usuarios WHERE identificador = 'admin'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO usuarios (identificador, senha, nome, perfil) VALUES ('admin', 'admin123', 'Administrador TI', 'admin')");
            db.run("INSERT INTO usuarios (identificador, senha, nome, perfil) VALUES ('user', 'user123', 'Usuário Comum', 'user')");
        }
    });
});

module.exports = db;