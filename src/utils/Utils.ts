import { spawn } from 'child_process';

export default {
    startFile,
    isSameDay
}

async function startFile(file: string) {

    spawn('start', [file], { shell: true, detached: true });

}

function isSameDay(timestamp1: number | undefined, timestamp2: number | undefined): boolean {
    if (timestamp1 === undefined || timestamp2 === undefined) {
        return false;
    }
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate();
}
