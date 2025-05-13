import { getDataByFile, generateScript } from '../utils/index.js';

export const loadDataRangeRateRules = async (fileName) => {
    const data = await getDataByFile(fileName);
    const rulesTotal = data.map((row, index) => {
        console.log('Row document => ', index, JSON.stringify(row));
        const montoCCA = row['MONTO CCA'] === 'ANYVALUE' ? 'ANY' : (row['MONTO CCA'].toString().indexOf('between') !== -1) ? 'BETWEEN' : '>=';
        const operatorPlazo = row['PLAZO'] === 'ANYVALUE' ? 'ANY' : (row['PLAZO'].toString().indexOf('<') !== -1) ? '<' : (row['PLAZO'].toString().indexOf('>=') !== -1) ? '>=' : (row['PLAZO'].toString().indexOf('<=') !== -1) ? '<=' : '>';

        if (montoCCA === 'ANY') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA', operator: row['ZONA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA'] === 'ANYVALUE' ? 0 : Number(row['ZONA']) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: 'ANY', value: 0 },
                    { name: 'PLAZO', operator: operatorPlazo, value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO'].toString().match(/\d+(\.\d+)?/g)[0]) }
                ],
                results: [
                    { name: 'TASA_MINIMA', value: Number((row['TASA MINIMA'] ?? row[' TASA MINIMA ']).toFixed(2)) },
                    { name: 'TASA_PROMEDIO', value: Number((row['TASA PROMEDIO'] ?? row[' TASA PROMEDIO ']).toFixed(2)) },
                    { name: 'TASA_MAXIMA', value: Number((row['TASA MÁXIMA'] ?? row[' TASA MÁXIMA ']).toFixed(2)) }
                ]
            }
        } else if (montoCCA === 'BETWEEN') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA', operator: row['ZONA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA'] === 'ANYVALUE' ? 0 : Number(row['ZONA']) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: 'BETWEEN', begin: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0]), end: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[1]) },
                    { name: 'PLAZO', operator: operatorPlazo, value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO'].toString().match(/\d+(\.\d+)?/g)[0]) }
                ],
                results: [
                    { name: 'TASA_MINIMA', value: Number((row['TASA MINIMA'] ?? row[' TASA MINIMA ']).toFixed(2)) },
                    { name: 'TASA_PROMEDIO', value: Number((row['TASA PROMEDIO'] ?? row[' TASA PROMEDIO ']).toFixed(2)) },
                    { name: 'TASA_MAXIMA', value: Number((row['TASA MÁXIMA'] ?? row[' TASA MÁXIMA ']).toFixed(2)) }
                ]
            }
        } else if (montoCCA === '>=') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA', operator: row['ZONA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA'] === 'ANYVALUE' ? 0 : Number(row['ZONA']) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: '>=', value: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0]) },
                    { name: 'PLAZO', operator: operatorPlazo, value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO'].toString().match(/\d+(\.\d+)?/g)[0]) }
                ],
                results: [
                    { name: 'TASA_MINIMA', value: Number((row['TASA MINIMA'] ?? row[' TASA MINIMA ']).toFixed(2)) },
                    { name: 'TASA_PROMEDIO', value: Number((row['TASA PROMEDIO'] ?? row[' TASA PROMEDIO ']).toFixed(2)) },
                    { name: 'TASA_MAXIMA', value: Number((row['TASA MÁXIMA'] ?? row[' TASA MÁXIMA ']).toFixed(2)) }
                ]
            }
        }
    });

    const resultArray = {
        name: 'RuleTasaRango',
        description: 'Reglas de rango de tasas',
        variables: [
            { name: 'PRODUCTO_CCA', description: 'Producto CCA', type: 'CHR', isOutput: false },
            { name: 'ZONA', description: 'Zona', type: 'INT', isOutput: false },
            { name: 'RIESGO', description: 'Riesgo', type: 'CHR', isOutput: false },
            { name: 'MONTO_CCA', description: 'Monto CCA', type: 'FLT', isOutput: false },
            { name: 'PLAZO', description: 'Plazo', type: 'INT', isOutput: false },
            { name: 'TASA_MINIMA', description: 'Tasa minima', type: 'FLT', isOutput: true },
            { name: 'TASA_PROMEDIO', description: 'Tasa promedio', type: 'FLT', isOutput: true },
            { name: 'TASA_MAXIMA', description: 'Tasa maxima', type: 'FLT', isOutput: true }
        ],
        rules: rulesTotal
    }

    const jsonData = JSON.stringify(resultArray, null, 2);

    await generateScript(fileName, jsonData);

    return resultArray;
};
