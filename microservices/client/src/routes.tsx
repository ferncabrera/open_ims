import React from "react";

import { Authentication } from "./containers/auth";
import { ServerPing } from "./containers/ServerPing";
import Error from "./containers/Error";
import { MainContainer } from "./containers/MainContainer";
import { ForgotPass } from "./containers/auth/ResetPass";

const Routes = [
    {
        path: '/',
        element: <Authentication />,
        errorElement: <Error />
    },
    {
        path: '/register',
        element: <Authentication isLogin={false} />,
    },
    {
        path: '/forgot_pass',
        element: <ForgotPass />,
    },
    // Just want some placeholder api call to backend for now
    // for testing purposes
    {
        path: '/serverping',
        element: <ServerPing />,
        errorElement: <Error />
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