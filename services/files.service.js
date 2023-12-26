// Función para cargar datos desde el archivo Excel e insertar en MongoDB
export const cargarDatosDesdeExcel = async (rutaArchivo) => {
    const workbook = XLSX.readFile(rutaArchivo);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`data = ${JSON.stringify(data)}`);

    const rulesTotal = data.map(row => {
        const montoCCA = row['MONTO CCA'] === 'ANYVALUE' ? 'ANY' : (row['MONTO CCA'].toString().indexOf('between') !== -1) ? 'BETWEEN' : '>=';
        console.log(`montoCCA = ${montoCCA}`);
        if (montoCCA === 'ANY') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CAA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA', operator: row['ZONA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA'] },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: 'ANY', value: row['MONTO CCA'] },
                    { name: 'PLAZO', operator: 'ANY', value: row['PLAZO'] }
                ],
                results: [
                    { name: 'TASA_MINIMA', value: parseFloat(row['TASA MINIMA']) },
                    { name: 'TASA_PROMEDIO', value: parseFloat(row['TASA PROMEDIO']) },
                    { name: 'TASA_MAXIMA', value: parseFloat(row['TASA MÁXIMA']) }
                ]
            }
        } else if (montoCCA === 'BETWEEN') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CAA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA', operator: row['ZONA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA'] },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: 'BETWEEN', begin: (row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0], end: (row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[1] },
                    { name: 'PLAZO', operator: 'ANY', value: row['PLAZO'] }
                ],
                results: [
                    { name: 'TASA_MINIMA', value: parseFloat(row['TASA MINIMA']) },
                    { name: 'TASA_PROMEDIO', value: parseFloat(row['TASA PROMEDIO']) },
                    { name: 'TASA_MAXIMA', value: parseFloat(row['TASA MÁXIMA']) }
                ]
            }
        } else if (montoCCA === '>=') {
            return {
                conditions: [
                    { name: 'PRODUCTO_CAA', operator: '=', value: row['PRODUCTO CCA'] },
                    { name: 'ZONA', operator: row['ZONA'] === 'ANYVALUE' ? 'ANY' : '=', value: row['ZONA'] },
                    { name: 'RIESGO', operator: row['RIESGO'] === 'ANYVALUE' ? 'ANY' : '=', value: row['RIESGO'] },
                    { name: 'MONTO_CCA', operator: '>=', value: (row['MONTO CCA'].toString().match(/\d+(\.\d+)?/g))[0] },
                    { name: 'PLAZO', operator: 'ANY', value: row['PLAZO'] }
                ],
                results: [
                    { name: 'TASA_MINIMA', value: parseFloat(row['TASA MINIMA']) },
                    { name: 'TASA_PROMEDIO', value: parseFloat(row['TASA PROMEDIO']) },
                    { name: 'TASA_MAXIMA', value: parseFloat(row['TASA MÁXIMA']) }
                ]
            }
        }
    });

    const resultArray = {
        name: 'RuleTasaRango',
        description: 'Reglas de rango de tasas',
        variables: [
            { name: 'PRODUCTO_CAA', type: 'CHR', isOutput: false },
            { name: 'ZONA', type: 'INT', isOutput: false },
            { name: 'RIESGO', type: 'CHR', isOutput: false },
            { name: 'MONTO_CCA', type: 'FLT', isOutput: false },
            { name: 'PLAZO', type: 'INT', isOutput: false },
            { name: 'TASA_MINIMA', type: 'FLT', isOutput: true },
            { name: 'TASA_PROMEDIO', type: 'FLT', isOutput: true },
            { name: 'TASA_MAXIMA', type: 'FLT', isOutput: true }
        ],
        rules: rulesTotal
    }

    const jsonData = JSON.stringify(resultArray, null, 2);
    fs.writeFileSync('output/scriptInsertRuleTasaRango.json', jsonData);

    // Insertar los datos en la colección de MongoDB
    rules.insertMany(resultArray)
        .then(() => {
            console.log('Datos insertados correctamente en la colección');
        })
        .catch(error => {
            console.error('Error al insertar datos en MongoDB:', error);
        });
}
