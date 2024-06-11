const express = require('express');
const { createServer } = require('http'); // Gunakan 'http' bukan 'node:http'
const { join, dirname } = require('path'); // Gunakan 'path' bukan 'node:path'
const { fileURLToPath } = require('url'); // Gunakan 'url' bukan 'node:url'
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite3'); 
const app = express();
const server = createServer(app);
const io = new Server(server);

async function main() {
    const db = await open({
        filename: 'chat.db',
        driver: sqlite3.Database // Perbaikan penulisan
    });
    await db.exec('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, client_offset TEXT UNIQUE, content TEXT);'); // Tambahkan tanda titik koma di akhir perintah SQL
}

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Hapus route berikut karena tidak diperlukan
// app.get('/', (req, res) => {
//     res.sendFile('<h1>Hello World</h1>');
// });

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

io.on('connection', async (socket) => {
    console.log('a user connected');
    socket.on('chat massage', async (msg) => {
        let result;
        try{
            result = await db.run('INSERT INTO messages (content) VALUES (?)', msg);
        } catch (e) {
            return;
        }
        io.emit('chat message', msg, result.lastID);
    })
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
