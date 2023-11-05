import { getJSONResponse } from "../apiHelpers";

export const isUserAuth = async () => {
    const res = await getJSONResponse({endpoint:'/api/server/is-authenticated'});
    return res
}

//put any other simple or complex functions here that can be reused throughout our app