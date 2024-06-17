import { getDataByFile, generateScript } from '../utils/index.js';

export const loadDataRtaRateRules = async (fileName) => {
    const data = await getDataByFile(fileName);
    const rulesTotal = data.map((row, index) => {

        const montoCCA = row['MONTO CCA'] === 'ANYVALUE' ? 'ANY' : (row['MONTO CCA'].toLowerCase().toString().indexOf('between') !== -1) ? 'BETWEEN' : '>=';
        const operatorPlazo = row['PLAZO'] === 'ANYVALUE' ? 'ANY' : (row['PLAZO'].toString().indexOf('<') !== -1) ? '<' : (row['PLAZO'].toString().indexOf('>=') !== -1) ? '>=' : (row['PLAZO'].toString().indexOf('<=') !== -1) ? '<=' : '>';
        if (montoCCA === 'ANY') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'AGENCIA', operator: row['AGENCIA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['AGENCIA'] === 'ANYVALUE' ? 0 : Number(row['AGENCIA']) },
                    { name: 'MONTO_CCA', operator: montoCCA, value: 0 },
                    { name: 'PLAZO', operator: operatorPlazo, value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO'].toString().match(/\d+(\.\d+)?/g)[0]) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                ],
                results: [
                    { name: 'TASA_INTERES', value: Number(row['TASA INTERES']) }
                ]
            }
        } else if (montoCCA === 'BETWEEN') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'AGENCIA', operator: row['AGENCIA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['AGENCIA'] === 'ANYVALUE' ? 0 : Number(row['AGENCIA']) },
                    { name: 'MONTO_CCA', operator: montoCCA, begin: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0]), end: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[1]) },
                    { name: 'PLAZO', operator: operatorPlazo, value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO'].toString().match(/\d+(\.\d+)?/g)[0]) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                ],
                results: [
                    { name: 'TASA_INTERES', value: Number(row['TASA INTERES']) }
                ]
            }
        } else if (montoCCA === '>=') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CCA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'AGENCIA', operator: row['AGENCIA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['AGENCIA'] === 'ANYVALUE' ? 0 : Number(row['AGENCIA']) },
                    { name: 'MONTO_CCA', operator: montoCCA, value: Number((row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0]) },
                    { name: 'PLAZO', operator: operatorPlazo, value: row['PLAZO'] === 'ANYVALUE' ? 0 : Number(row['PLAZO'].toString().match(/\d+(\.\d+)?/g)[0]) },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] === 'ANYVALUE' ? '' : row['RIESGO'] },
                ],
                results: [
                    { name: 'TASA_INTERES', value: Number(row['TASA INTERES']) }
                ]
            }
        }
    });

    const resultArray = {
        name: 'RuleRta',
        description: 'Reglas de RTA',
        variables: [
            { name: 'PRODUCTO_CCA', description: 'Producto CCA', type: 'CHR', isOutput: false },
            { name: 'AGENCIA', description: 'Zona', type: 'INT', isOutput: false },
            { name: 'MONTO_CCA', description: 'Monto CCA', type: 'FLT', isOutput: false },
            { name: 'PLAZO', description: 'Plazo', type: 'INT', isOutput: false },
            { name: 'RIESGO', description: 'Riesgo', type: 'CHR', isOutput: false },
            { name: 'TASA_INTERES', description: 'Tasa interes', type: 'FLT', isOutput: true },
        ],
        rules: rulesTotal
    }

    const jsonData = JSON.stringify(resultArray, null, 2);

    await generateScript(fileName, jsonData);

    return resultArray;
};
