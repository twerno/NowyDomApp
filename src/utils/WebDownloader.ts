import request from 'axios';

export default {
    download,
}

async function download(url: string): Promise<string> {
    console.log(`pobieranie ${url}`);
    return request(url)
        .then(response => response.data);
}