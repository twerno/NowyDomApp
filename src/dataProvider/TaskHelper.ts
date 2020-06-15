export default {
    silentErrorReporter
}


function silentErrorReporter(errors: any[], props: { [key: string]: any }) {
    return (err: any) => {
        errors.push({ err: JSON.stringify(err), ...props });
        return null;
    }
}