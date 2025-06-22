const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

let connections = [];

router.use(express.static(path.join(__dirname, 'views')));

router.get('/textureList', (req, res) => {
    const textureDir = path.join(__dirname, 'views', 'textures');

    fs.readdir(textureDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Kan bestanden niet lezen.' });
        }

        const jpgFiles = files.filter(file => path.extname(file).toLowerCase() === '.jpg');


        const textureList = jpgFiles.map(file => ({
            name: path.basename(file, '.jpg'),
            url: `/textures/` + file,
            cat: file.toString().includes('kast') ? 'kast' : 'keukenblad'
        }));

        res.json(textureList);
    });
});

router.get('/textureUpdate', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    connections.push(res);

    req.on('close', () => {
    });
});

router.get('/updateTexture', (req, res) => {
    let texture = req.query.texture;
    let cat = req.query.cat;
    let data = { texture: texture, cat: cat };

    console.log(texture, req.params.texture)
    connections.forEach(connection => {
        connection.write(`data: ${JSON.stringify(data)}\n\n`);
    });

    res.send(`texture sent`);
});

router.get('/ping', (req, res) => {
    console.log('ping');
});

module.exports = router;