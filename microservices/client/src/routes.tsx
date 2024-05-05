import React from "react";

import { Authentication } from "./containers/auth";
import Error from "./containers/Error";
import { ForgotPass } from "./containers/auth/ResetPass";
import { MainContainer } from "./containers/main/MainContainer";
import { DefaultCustomers } from "./containers/customers/DefaultCustomers";
import { DefaultVendors } from "./containers/vendors/DefaultVendors";
import { AdminDashboard } from "./containers/dashboard/AdminDashboard";
import { OperationController } from "./containers/operationController/OperationController";

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
        //? Note that all of the nested children components/containers/pages are embedded into the MainContainers <Col></Col>
        //? so you may style all of your components/containers/pages using the Bootstrap 5 Grid system
        children: [
            {
                path: '/ccg/dashboard',
                element: <AdminDashboard/>
            },
            {
                path:'/ccg/customers',
                element: <DefaultCustomers/>
            },
            {
                path: '/ccg/vendors',
                element: <DefaultVendors/>
            },
            {
                path: '/ccg/:category/:action/:id',
                element: <OperationController/>
            }
        ]
    }
];

export default Routes