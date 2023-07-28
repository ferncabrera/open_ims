import React from "react";

import { ServerPing } from "./containers/ServerPing";
import { Login } from "./containers/auth/Login";
import { Register } from "./containers/auth/Register";
import Error from "./containers/Error";
import { MainContainer } from "./containers/MainContainer";

const Routes = [
    {
        path: '/',
        element: <Login />,
        errorElement: <Error />
    },
    // Just want some placeholder api call to backend for now
    // for testing purposes
    {
        path: '/serverping',
        element: <ServerPing />,
        errorElement: <Error />
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/home',
        element: <MainContainer />, // this main container will handle our breadcrumbs https://reactrouter.com/en/main/hooks/use-matches
        children: [
            {
                path: '/home/burger',
                element: <div>This is a good burger!</div>
            }
        ]
    }
];

export default Routes