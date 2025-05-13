import { writeFileSync } from 'fs';

export const generateScript = async (fileName, data) => {
    writeFileSync(`output/script_${fileName}.json`, data);
}

const getOperator = (value) => {
    if (value === 'ANYVALUE') return 'ANY';
    const valStr = value.toString().toLowerCase();
    if (valStr.includes('between')) return 'BETWEEN';
    if (valStr.includes('<>')) return '<>';
    if (valStr.includes('<')) return '<';
    if (valStr.includes('>')) return '>';
    return '=';
};

const getNumericValues = (str) => str.toString().match(/\d+(\.\d+)?/g)?.map(Number) || [];

export const buildNumericCondition = (name, rawValue) => {
    const operator = getOperator(rawValue);
    const values = getNumericValues(rawValue);

    if (operator === 'ANY') {
        return { name, operator, value: 0 };
    }

    if (operator === 'BETWEEN') {
        return { name, operator, begin: values[0], end: values[1] };
    }

    return { name, operator, value: values[0] };
};

export const buildTextCondition = (name, rawValue) => {
    const operator = rawValue === 'ANYVALUE' ? 'ANY' : rawValue.includes('<>') ? '<>' : '=';
    const value = rawValue === 'ANYVALUE' ? '' : rawValue.replace('<>', '').trim();
    return { name, operator, value };
};
