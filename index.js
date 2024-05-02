// index.js
const express = require('express');
const mongoose = require('mongoose');
const rules = require('./models/rules');
const loadDataRangeRate = require('./services/rangeRate.service');
const loadDataAutonomyRate = require('./services/autonomyRate.service');
const loadDataRtaRateRules = require('./services/rtaRate.service');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/db-surgir')
    .then(() => {
        console.log('Conectado a la base de datos');
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos:', error);
    });

// Middleware para manejar el cuerpo de las solicitudes JSON
app.use(express.json());

app.post('/api/rules', async (req, res) => {
    try {
        const { body } = req;
        const { fileName } = body;
        let response = {};
        if (fileName === 'rangeRateRules-v11') {
            response = await loadDataRangeRate(`files/${fileName}.xlsx`);
        } else if (fileName === 'autonomyRateRules-v14') {
            response = await loadDataAutonomyRate(`files/${fileName}.xlsx`);
        } else if (fileName === 'rtasRate-v10') {
            response = await loadDataRtaRateRules(`files/${fileName}.xlsx`);
        }
        res.json({
            status: true,
            data: response
        });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Rutas
app.get('/api/rules/find', async (req, res) => {
    try {
        const tasas = await rules.find();
        res.json({
            status: true,
            data: tasas
        });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
