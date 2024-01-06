import React, {useEffect, useState} from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';

export const RenderEdit = () => {

  const [data, setData] = useState({});

  useEffect(() => {
    console.log('rendered edit screen')
  }, [])

  return (
    <div>RenderEdit</div>
  )
}
