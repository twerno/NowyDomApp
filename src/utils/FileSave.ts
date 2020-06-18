import fs from 'fs';

export function saveFile(fileName: string, body: any) {
    fs.writeFileSync(fileName, body, {});
}

export function provideDir(dirPath: string) {
    fs.mkdirSync(dirPath, { recursive: true });
}