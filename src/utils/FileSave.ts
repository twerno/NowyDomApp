import fs from 'fs';

export function saveFile(fileName: string, body: any) {
    fs.writeFileSync(fileName, body, {});
}