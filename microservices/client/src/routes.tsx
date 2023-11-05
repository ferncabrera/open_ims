import React from "react";

import { Authentication } from "./containers/auth";
import Error from "./containers/Error";
import { ForgotPass } from "./containers/auth/ResetPass";
import { MainContainer } from "./containers/main/MainContainer";

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
    {
        path: '/ccg',
        element: <MainContainer/>, // this main container will handle our breadcrumbs https://reactrouter.com/en/main/hooks/use-matches
        children: [
            {
                path: '/ccg/dashboard',
                element: <div>This is a good burger!</div>
            }
        ]
    }
];

export default Routes