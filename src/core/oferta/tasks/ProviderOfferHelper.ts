import { IFileService } from "../service/IFileService";

export default {
    safeFileName,
    saveHtml
}

function safeFileName(url: string): string {
    return url.replace(/[^\w\.-\s]/g, '_');
}

async function saveHtml(data: { html: string | null, url: string }, path: string, fileService: IFileService) {
    return fileService.writeFile(path, safeFileName(data.url) + '.html', data.html);
}