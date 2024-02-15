const fs = require('fs');
const XLSX = require('xlsx');
const rules = require('../models/rules');

// Función para cargar datos desde el archivo Excel e insertar en MongoDB
const loadDataAutonomyRateRules = async (rutaArchivo) => {
    const workbook = XLSX.readFile(rutaArchivo);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`data = ${JSON.stringify(data)}`);

    const rulesTotalWithoutTasaApp = data.map((row, index) => {
        const operatorMontoCCA = row['MONTO CCA'] === 'ANYVALUE' ? 'ANY' : (row['MONTO CCA'].toString().toLowerCase().indexOf('between') !== -1) ? 'BETWEEN' : '>=';
        console.log(`Indice = ${index} - operatorMontoCCA = ${operatorMontoCCA}`);
        if (operatorMontoCCA === 'ANY') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA_COMERCIAL', operator: row['ZONA COMERCIAL'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA COMERCIAL'] === 'ANYVALUE' ? 0 : Number(row['ZONA COMERCIAL']) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: operatorMontoCCA, value: 0 },
                    { name: 'PLAZO', operator: 'ANY', value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO']) }
                ],
                results: [
                    { name: 'RESULTADO_CMA', value: Number(row['RESULTADO CMA']) }
                ]
            }
        } else if (operatorMontoCCA === 'BETWEEN') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA_COMERCIAL', operator: row['ZONA COMERCIAL'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA COMERCIAL'] === 'ANYVALUE' ? 0 : Number(row['ZONA COMERCIAL']) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: operatorMontoCCA, begin: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0]), end: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[1]) },
                    { name: 'PLAZO', operator: 'ANY', value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO']) }
                ],
                results: [
                    { name: 'RESULTADO_CMA', value: Number(row['RESULTADO CMA']) }
                ]
            }
        } else if (operatorMontoCCA === '>=') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA_COMERCIAL', operator: row['ZONA COMERCIAL'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA COMERCIAL'] === 'ANYVALUE' ? 0 : Number(row['ZONA COMERCIAL']) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: operatorMontoCCA, value: (row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0] },
                    { name: 'PLAZO', operator: 'ANY', value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO']) }
                ],
                results: [
                    { name: 'RESULTADO_CMA', value: Number(row['RESULTADO CMA']) }
                ]
            }
        }
    });

    const arrayTasaAppCondition = data.map((row, index) => {
        const operatorTasaApp = row['TASA APP'] === 'ANYVALUE' ? 'ANY' : (row['TASA APP'].toString().toLowerCase().indexOf('between') !== -1) ? 'BETWEEN' : (row['TASA APP'].toString().indexOf('<>') !== -1) ? '<>' : '=';
        let tasaAppCondition = '';
        console.log(`Indice = ${index} - tasaApp = ${operatorTasaApp}`);
        if (operatorTasaApp === 'ANY') {
            tasaAppCondition = {
                name: 'TASA_APP', operator: operatorTasaApp, value: 0
            }
        } else if (operatorTasaApp === 'BETWEEN') {
            tasaAppCondition = {
                name: 'TASA_APP', operator: operatorTasaApp, begin: Number((row['TASA APP'].toString().match(/\d+(\.\d+)?/g))[0]), end: Number((row['TASA APP'].toString().match(/\d+(\.\d+)?/g))[1])
            }
        } else if (operatorTasaApp === '<>' || operatorTasaApp === '=') {
            tasaAppCondition = {
                name: 'TASA_APP', operator: operatorTasaApp, value: Number(row['TASA APP'].toString().match(/\d+(\.\d+)?/g)[0])
            }
        }
        return tasaAppCondition;
    });

    for (let i = 0; i < rulesTotalWithoutTasaApp.length; i++) {
        const { conditions } = rulesTotalWithoutTasaApp[i];
        conditions.push(arrayTasaAppCondition[i])
    }

    const resultArray = {
        name: 'RuleAutonomiaTasa',
        description: 'Regla de autonomía de tasas',
        variables: [
            { name: 'PRODUCTO_CCA', description: 'Producto CCA', type: 'CHR', isOutput: false },
            { name: 'ZONA_COMERCIAL', description: 'Zona comercial', type: 'INT', isOutput: false },
            { name: 'RIESGO', description: 'Riesgo', type: 'CHR', isOutput: false },
            { name: 'MONTO_CCA', description: 'Monto CCA', type: 'FLT', isOutput: false },
            { name: 'PLAZO', description: 'Plazo', type: 'INT', isOutput: false },
            { name: 'TASA_APP', description: 'Tasa APP', type: 'FLT', isOutput: false },
            { name: 'RESULTADO_CMA', description: 'Resultado CMA', type: 'INT', isOutput: true }
        ],
        rules: rulesTotalWithoutTasaApp
    }

    const jsonData = JSON.stringify(resultArray, null, 2);
    fs.writeFileSync('output/scriptInsertAutonomyRateRules.json', jsonData);

    // // Insertar los datos en la colección de MongoDB
    // rules.insertMany(resultArray)
    //     .then(() => {
    //         console.log('Datos insertados correctamente en la colección');
    //     })
    //     .catch(error => {
    //         console.error('Error al insertar datos en MongoDB:', error);
    //     });
};

module.exports = loadDataAutonomyRateRules;
