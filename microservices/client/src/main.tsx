import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/general/index.scss'

import Routes from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(Routes, {
    future: {
        // Normalize `useNavigation()`/`useFetcher()` `formMethod` to uppercase
        v7_normalizeFormMethod: true,
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <div className='open-ims-styling'>
      <RouterProvider
            router={router}
            fallbackElement={<><p>Spinner here lol</p></>}
        />
      </div>
        
    </React.StrictMode>,
)
