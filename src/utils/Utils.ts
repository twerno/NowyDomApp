import { spawn } from 'child_process';

export default {
    startFile,
}

async function startFile(file: string) {

    spawn('start', [file], { shell: true, detached: true });

}


