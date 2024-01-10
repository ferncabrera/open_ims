// Global declaration of types:

type TMethod = "GET" | "PUT" | "POST" | "DELETE" | "PATCH";


interface IErrorObject {
    valid: boolean;
    message: string;
}

interface IErrorFields {
    // passwordC?: IErrorObject;
    email?: IErrorObject | null;
    password?: IErrorObject | null;
    newPassword?: IErrorObject | null;
    firstName?: IErrorObject | null;
    lastName?: IErrorObject | null;
}

interface IResponse {
    status?: number;
    message?: string;
}

interface IEntityState {
    action: "create" | "read" | "update" | "delete" | null;
    category: string;
    path: string;
}

