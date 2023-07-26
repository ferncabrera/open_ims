import React from 'react'
import { Outlet } from 'react-router-dom'

export const MainContainer = () => {
  return (
    <div>
      MainContainer here
      <Outlet />
    </div>
  )
}
