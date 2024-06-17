import { writeFileSync } from 'fs';

export const generateScript = async (fileName, data) => {
    writeFileSync(`output/script_${fileName}.json`, data);
}