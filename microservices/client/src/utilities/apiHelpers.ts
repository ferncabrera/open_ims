import { apiCall } from "./apiCall";
import { IGetResponse } from "./types/types"

export const getJSONResponse = async (props: IGetResponse) => {
    const
        {
            endpoint,
            params,
        } = props;

    const url = `http://${import.meta.env.DEV?import.meta.env.VITE_HOST_DEV:import.meta.env.VITE_HOST_PROD}${endpoint}`;
    const parameters = params ? params : {}; //can add default headers here in the future.

    // will always expect this to be a JSON object
    const response : object = await apiCall(
        {
            url,
            method: "GET"
        });

    return response;

}