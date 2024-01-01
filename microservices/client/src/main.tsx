import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/general/index.scss'

import { RecoilRoot} from 'recoil';
import { DebugObserver } from './atoms/debugger';


import Routes from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(Routes, {
    future: {
        // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
        v7_normalizeFormMethod: true,
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
        <div className='open-ims-styling'>
            <RecoilRoot>
                <DebugObserver/>
                <RouterProvider
                    router={router}
                    fallbackElement={<><p>Need a spinner here or something</p></>}
                />
            </RecoilRoot>
        </div>

    // </React.StrictMode>,
)
