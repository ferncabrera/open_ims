interface ICustomErrorProps {
    message: string,
    code: string | number,
}

class customError extends Error {
    code: string | number; 

    constructor({message, code} : ICustomErrorProps) {
        super(message);
        this.code = code;
    }
}

export default customError