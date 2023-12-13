import React from 'react'
import { useRouteError } from 'react-router-dom'

interface IError  {
    statusText: string;
    message: string;
}

const Error = () => {

    const error  = useRouteError() as IError;
    console.log(error);

    return (
        <>
            <h1>Oops! Looks like we need a better error screen! LOL</h1>
            <p>Sorry, an unexpected error has occured.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </>
    )
}

export default Error