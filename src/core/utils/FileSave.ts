import fs from 'fs';

export function saveFile(fileName: string, body: any) {
    const safeFileName = fileName.replace(/(\.)+$/, '');
    fs.writeFileSync(safeFileName, body, {});
}

export function provideDir(dirPath: string) {
    fs.mkdirSync(dirPath, { recursive: true });
}

export function safeSaveFile(dir: string, fileName: string, body: any) {
    provideDir(dir);
    saveFile(`${dir}/${fileName}`, body);
}