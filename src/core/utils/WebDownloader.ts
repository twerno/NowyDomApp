import request from 'axios';

export default {
    download,
}

async function download(url: string): Promise<string> {
    // console.log(`pobieranie ${url}`);
    return Promise.race([
        request(url)
            .then(response => response.data),
        new Promise<string>((resolve, reject) => setTimeout(
            () => reject(`Timeout pobierania: ${url}`), 1000 * 30))
    ]);
}