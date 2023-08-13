// This is our basic reusable api call function for the front end.
// It can be used for any sort of put, get, or post call. Please refer to apiHelpers for editing and creating specific case functions.

interface apiCallProps {
    url: string,
    method: TMethod,
    headers?: object,
    parameters?: object,
    data?: object,
}


export const apiCall = async <T>(props: apiCallProps) : Promise<T> => {
    //this definitely needs to be more fleshed out in props, but for now we only need url and method for testing purposes.
    const {headers, data, parameters} = props;

    try {
        const response = await fetch(props.url, {
            method: props.method,
            mode: "cors",
            headers: {
                "content-type": "application/json",
                ...headers,
                ...parameters,
            },
            body: JSON.stringify(data)
        })

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response.json();
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        console.log('An error occurred:', error);
        console.log('url', props.url)

        return Promise.reject(error);
    }
}