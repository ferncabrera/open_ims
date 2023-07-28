import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/general/index.scss'

import Routes from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(Routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className='open-ims-styling'>
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
)
