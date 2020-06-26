export default {
    silentErrorReporter
}

function silentErrorReporter(errorList: any[], props: { [key: string]: any }) {
    return (err: any) => {
        const errors = { message: err.message, stack: err.stack?.split('\n') };
        errorList.push({ errors, ...props });
        return null;
    }
}