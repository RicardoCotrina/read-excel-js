import XLSX from 'xlsx';

export const getDataByFile = async (fileName) => {
    const pathFile = `files/${fileName}.xlsx`
    const workbook = XLSX.readFile(pathFile);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
}
