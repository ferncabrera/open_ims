import { apiCall } from "./apiCall";
import { IGetResponse, IPostRequest } from "./types/types";

const HOST: string | undefined = import.meta.env.VITE_HOST_IP;

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

  const url = `http://${HOST}${endpoint}`;

  const response: object = await apiCall({
    url,
    method: "POST",
    headers,
    data,
  });
  return response;
};

export const sendPatchRequest = async (props: IPostRequest) => {
  const { endpoint, headers, data } = props;

  const url = `http://${HOST}${endpoint}`;
  const response: object = await apiCall({
    url,
    method: "PATCH",
    headers,
    data,
  });
  return response;
};
