// index.js
const express = require('express');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const rules = require('./models/rules');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/db-surgir')
    .then(() => {
        console.log('Conectado a la base de datos');
        // Cargar datos desde el archivo Excel e insertar en MongoDB
        
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos:', error);
    });

// Middleware para manejar el cuerpo de las solicitudes JSON
app.use(express.json());

app.post('/api/rules', async(req, res) => {
    try {
        await cargarDatosDesdeExcel('files/rules.xlsx');;
        res.json({
            status: true,
            data: []
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
