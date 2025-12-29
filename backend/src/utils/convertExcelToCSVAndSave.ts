import fsp from "fs/promises";
import XLSX from "xlsx";

export async function convertExcelToCSVAndSave(inputFile: string, outputFile: string) {
    try {
        await fsp.access(outputFile)
        fsp.unlink(outputFile);
    }catch(err) {}

    const workBook = XLSX.readFile(inputFile);
    await XLSX.writeFileAsync(outputFile, workBook, { bookType: "csv" }, () => {
        console.log(`Converted ${inputFile} to ${outputFile}`);
    });
}

export async function convertCSVToExcelAndSave(inputFile: string, outputFile: string) {
    try {
        await fsp.access(outputFile)
        fsp.unlink(outputFile);
    }catch(err) {}

    const workBook = XLSX.readFile(inputFile);
    await XLSX.writeFileAsync(outputFile, workBook, { bookType: "xlsx" }, () => {
        console.log(`Converted ${inputFile} to ${outputFile}`);
    });
}
