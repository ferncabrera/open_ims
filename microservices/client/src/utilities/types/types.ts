// any function or files in utilities file that require interface can be defined here.

export interface IGetResponse {
    endpoint: string,
    params?: object,

}

export interface IPostRequest {
    endpoint: string,
    params?: object,
    data: any,
    headers?: any,
}

type DatePiece = Date | null;
export type DateRange = DatePiece | [DatePiece, DatePiece];