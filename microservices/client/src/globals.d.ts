// Global declaration of types:

type TMethod = "GET" | "PUT" | "POST" | "DELETE";


interface IErrorObject {
    valid: boolean;
    message: string;
}

interface IErrorFields {
    email?: IErrorObject | null,
    password?: IErrorObject | null,
    newPassword?: IErrorObject | null,
    username?: IErrorObject | null
}

