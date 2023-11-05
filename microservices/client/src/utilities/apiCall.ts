// This is our basic reusable api call function for the front end.
// It can be used for any sort of put, get, or post call. Please refer to apiHelpers for editing and creating specific case functions.
import fetch from "cross-fetch";

interface apiCallProps {
  url: string;
  method: TMethod;
  headers?: object;
  parameters?: object;
  data?: object;
}

export const apiCall = async <T>(props: apiCallProps): Promise<T> => {
  //this definitely needs to be more fleshed out in props, but for now we only need url and method for testing purposes.
  const { headers, data, parameters } = props;
  try {
    const response = await fetch(props.url, {
      method: props.method,
      mode: "cors",
      headers: {
        "content-type": "application/json",
        ...headers,
        ...parameters,
      },
      body: JSON.stringify(data),
    });
    if (response.status) {
      let resposneWithStatus = await response.json();
      resposneWithStatus.status = response.status;
      return resposneWithStatus;
    } else {
      return await response.json();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return

    return Promise.reject(error);
  }
};
