import { IFileService } from "../service/IFileService";

export default {
    safeUrl,
    saveHtml
}

function safeUrl(url: string): string {
    return url.replace(/[^\w]/g, '_');
}

async function saveHtml(data: { html: string | null, url: string }, path: string, fileService: IFileService) {
    return fileService.writeFile(path, safeUrl(data.url) + '.html', data.html);
}