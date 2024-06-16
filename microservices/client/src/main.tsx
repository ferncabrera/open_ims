import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/general/index.scss'


import Routes from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { DebugAtoms } from './atoms/debugger';
import { Provider } from 'jotai';

const router = createBrowserRouter(Routes, {
    future: {
        // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
        v7_normalizeFormMethod: true,
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
    <div className='open-ims-styling'>
        <Provider>
            <DebugAtoms />
            <RouterProvider
                router={router}
                fallbackElement={<><p>Need a spinner here or something</p></>}
            />
        </Provider>
    </div>

    // </React.StrictMode>,
)
