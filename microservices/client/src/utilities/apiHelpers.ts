import { apiCall } from "./apiCall";
import { IGetResponse, IPostRequest } from "./types/types"

export const getJSONResponse = async (props: IGetResponse) => {
    const
        {
            endpoint,
            params,
        } = props;
        
    console.log(import.meta.env.MODE);
    console.log(import.meta.env.VITE_HOST_PROD);
    console.log(import.meta.env.VITE_HOST_DEV);
    // console.log("import.meta\u200b.env.VITE_HOST_DEV -> ", 'import.meta\u200b.env.VITE_HOST_DEV');
    // console.log("import.meta\u200b.env.VITE_HOST_DEV -> ", import.meta.env.VITE_HOST_PROD);

    // console.log("--------------------------")
    // console.log(`import.meta.env.MODE -> ${import.meta.env.MODE}`);
    // console.log(`import.meta.env.VITE_HOST_PROD -> ${import.meta.env.VITE_HOST_PROD}`);
    // console.log(`import.meta.env.VITE_HOST_DEV -> ${import.meta.env.VITE_HOST_DEV}`);

    const url = `http://${import.meta.env.DEV?import.meta.env.VITE_HOST_DEV:import.meta.env.VITE_HOST_PROD}${endpoint}`;
    const parameters = params ? params : {}; //can add default headers here in the future.

    // will always expect this to be a JSON object
    const response : object = await apiCall(
        {
            url,
            method: "GET",
            parameters
        });

    return response;

}

export const sendPostRequest = async (props: IPostRequest ) => {
    const {
        endpoint,
        headers,
        data
    } = props;

    const url = `http://${import.meta.env.DEV?import.meta.env.VITE_HOST_DEV:import.meta.env.VITE_HOST_PROD}${endpoint}`;

    const response : object = await apiCall(
        {
            url,
            method: "POST",
            headers,
            data,
        }
    )
    return response;
}