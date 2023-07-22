import { useState } from 'react';
import './App.css';
import { getJSONResponse } from './utilities/apiHelpers';
import _ from 'lodash';

function App() {

  const [apiData, setApiData] = useState('');
  const [buttonText, setButtonText] = useState('beep');

  const requestHandler = async () => {

    if (!apiData) {
      const response = await getJSONResponse({ endpoint: "/api/server/testmsg" });
      const text = _.get(response, 'data', '');
      setApiData(text);
      setButtonText('Quick! Hide the message!');
    } else {
      setButtonText('Click me for a secret message!');
      setApiData('');
    }

  }


  return (
    <>
      <button onClick={requestHandler}>{buttonText}</button>
      <div>
        {apiData ? apiData : null}
      </div>
    </>
  )
}

export default App
