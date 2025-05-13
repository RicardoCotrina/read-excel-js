import { getDataByFile, generateScript, buildNumericCondition, buildTextCondition } from '../utils/index.js';

export const mergeRules = (rules) => {
    const merged = [];

    rules.forEach(rule => {
        const existingRule = merged.find(r =>
            JSON.stringify(r.conditions) === JSON.stringify(rule.conditions) // Compara las condiciones
        );

        if (existingRule) {
            // Si ya existe una regla con esas condiciones, agregamos los resultados
            existingRule.results.push(...rule.results);
        } else {
            // Si no existe, agregamos una nueva regla
            merged.push({ ...rule });
        }
    });

    return merged;
};

export const insuranceRateRules = async (fileName) => {
    const data = await getDataByFile(fileName);

    const rules = data.map((row, index) => {
        const conditions = [
            buildTextCondition('ESTADO_CIVIL', row['ESTADO CIVIL']),
            buildNumericCondition('RESULTADO_CMA', row['RESULTADO CMA']),
            buildTextCondition('RIESGO', row['RIESGO']),
            buildNumericCondition('DEUDA_DIRECTA', row['DEUDA DIRECTA']),
            buildNumericCondition('PLAZO_MINIMO', row['PLAZO MINIMO']),
            buildNumericCondition('PLAZO_MAXIMO', row['PLAZO MAXIMO']),
            buildTextCondition('PRODUCTO_CCA', row['PRODUCTO CCA']),
        ];

        const results = [
            { name: 'SEGURO', value: row['SEGURO'] }
        ];

        return { conditions, results };
    });

    const mergedRules = mergeRules(rules);

    const resultArray = {
        name: 'RuleInsuranceRate',
        description: 'Regla de seguros',
        variables: [
            { name: 'ESTADO_CIVIL', description: 'Estado civil', type: 'CHR', isOutput: false },
            { name: 'RESULTADO_CMA', description: 'Resultado CMA', type: 'INT', isOutput: false },
            { name: 'RIESGO', description: 'Riesgo', type: 'CHR', isOutput: false },
            { name: 'DEUDA_DIRECTA', description: 'Deuda directa', type: 'FLT', isOutput: false },
            { name: 'PLAZO_MINIMO', description: 'Plazo mínimo', type: 'FLT', isOutput: false },
            { name: 'PLAZO_MAXIMO', description: 'Plazo máximo', type: 'FLT', isOutput: false },
            { name: 'PRODUCTO_CCA', description: 'Producto CCA', type: 'CHR', isOutput: false },
            { name: 'SEGURO', description: 'Seguro', type: 'CHR', isOutput: true }
        ],
        rules: mergedRules
    };

    await generateScript(fileName, JSON.stringify(resultArray, null, 2));

    return resultArray;
};
