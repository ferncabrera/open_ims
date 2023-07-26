import { apiCall } from "./apiCall";
import { IGetResponse } from "./types"

export const getJSONResponse = async (props: IGetResponse) => {
    const
        {
            endpoint,
            params,
        } = props;

    // TODO:
    // localhost will definitely need to be a HOST env var lol
    const url = `http://localhost${endpoint}`;
    const parameters = params ? params : {}; //can add default headers here in the future.

    // will always expect this to be a JSON object
    const response : object = await apiCall(
        {
            url,
            method: "GET"
        });

    return response;

}