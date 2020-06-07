import request from 'axios';

export default {
    download,
}

async function download(url: string): Promise<string> {
    return request(url)
        .then(response => response.data);
}