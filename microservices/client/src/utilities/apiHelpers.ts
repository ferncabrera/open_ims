import { apiCall } from "./apiCall";
import { IGetResponse, IPostRequest } from "./types/types";

let HOST: string | undefined;

if (import.meta.env.DEV) {
  HOST = import.meta.env.VITE_HOST_DEV;
} else {
  HOST = import.meta.env.VITE_HOST_PROD;
}

export const getJSONResponse = async (props: IGetResponse) => {
  const { endpoint, params } = props;

  const url = `http://${HOST}${endpoint}`;
  const parameters = params ? params : {}; //can add default headers here in the future.

  // will always expect this to be a JSON object
  const response: object = await apiCall({
    url,
    method: "GET",
    parameters,
  });

  return response;
};

export const sendPostRequest = async (props: IPostRequest) => {
  const { endpoint, headers, data } = props;

  const url = `http://${
    import.meta.env.DEV
      ? import.meta.env.VITE_HOST_DEV
      : import.meta.env.VITE_HOST_PROD
  }${endpoint}`;

  const response: object = await apiCall({
    url,
    method: "POST",
    headers,
    data,
  });
  return response;
};

export const sendPatchRequest = async (props: IPostRequest) => {
  console.log("made it to sendPatchRequest");
  console.log("props", props);
  const { endpoint, headers, data } = props;

  const url = `http://${
    import.meta.env.DEV
      ? import.meta.env.VITE_HOST_DEV
      : import.meta.env.VITE_HOST_PROD
  }${endpoint}`;
  console.log("url", url);
  const response: object = await apiCall({
    url,
    method: "PATCH",
    headers,
    data,
  });
  console.log("response", response);
  return response;
};
