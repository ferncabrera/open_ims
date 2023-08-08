import { apiCall } from "./apiCall";
import { IGetResponse } from "./types/types"
console.log("process.env.HOST -> ", process.env.HOST);
process.env.HOST = process.env.HOST?process.env.HOST:"localhost";

export const getJSONResponse = async (props: IGetResponse) => {
    const
        {
            endpoint,
            params,
        } = props;

    const url = `http://${process.env.HOST}${endpoint}`;
    const parameters = params ? params : {}; //can add default headers here in the future.

    // will always expect this to be a JSON object
    const response : object = await apiCall(
        {
            url,
            method: "GET"
        });

    return response;

}