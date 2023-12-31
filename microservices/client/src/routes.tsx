import React from "react";

import { Authentication } from "./containers/auth";
import Error from "./containers/Error";
import { ForgotPass } from "./containers/auth/ResetPass";
import { MainContainer } from "./containers/main/MainContainer";
import { DefaultCustomers } from "./containers/customers/DefaultCustomers";
import { AdminDashboard } from "./containers/dashboard/AdminDashboard";

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
        path: '/forgot_pass/:token',
        element: <ForgotPass />,
    },
    {
        path: '/ccg',
        element: <MainContainer/>, // this main container will handle our breadcrumbs https://reactrouter.com/en/main/hooks/use-matches
        children: [
            {
                path: '/ccg/dashboard',
                element: <AdminDashboard/>
            },
            {
                path:'/ccg/customers',
                element: <DefaultCustomers/>
            }
        ]
    }
];

export default Routes