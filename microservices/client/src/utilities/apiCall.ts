// This is our basic reusable api call function for the front end.
// It can be used for any sort of put, get, or post call. Please refer to apiHelpers for editing and creating specific case functions.

interface apiCallProps {
    url: string,
    method: TMethod,
    headers?: object,
    parameters?: object,
    data?: object,
    Accept?: object,

}


export const apiCall = async <T>(props: apiCallProps) : Promise<T> => {
    //this definitely needs to be more fleshed out in props, but for now we only need url and method for testing purposes.

    try {
        const response = await fetch(props.url, {
            method: props.method,
            mode: "cors",
            headers: {
                "content-type": "application/json", // this needs to be changeable oliver
            }
        })

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response.json();
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Promise.reject(error);
    }
}