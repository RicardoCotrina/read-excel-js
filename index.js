// index.js
import express, { json } from 'express';
import { insuranceRateRules, loadDataAutonomyRateRules, loadDataRangeRateRules, loadDataRtaRateRules } from './services/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());

app.post('/api/rules', async (req, res) => {
    try {
        const { body } = req;
        const { fileName } = body;

        const fileNameFormat = fileName.replace('-', '_');

        let response = {};
        if (fileName.startsWith('rangeRateRules')) {
            response = await loadDataRangeRateRules(fileNameFormat);
        } else if (fileName.startsWith('autonomyRateRules')) {
            response = await loadDataAutonomyRateRules(fileNameFormat);
        } else if (fileName.startsWith('rtasRates')) {
            response = await loadDataRtaRateRules(fileNameFormat);
        } else if (fileName.startsWith('insuranceRules')) {
            response = await insuranceRateRules(fileNameFormat);
        }
        res.json({
            status: true,
            data: response
        });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
