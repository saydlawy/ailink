import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const parseLinkedInData = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (file.name.endsWith('.csv')) {
          Papa.parse(file as any, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              resolve({ CSVData: results.data });
            },
            error: (error) => reject(error)
          });
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const result: Record<string, any[]> = {};
          
          workbook.SheetNames.forEach(sheetName => {
            const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (roa.length) result[sheetName] = roa;
          });
          
          resolve(result);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};
