import { useState } from 'react';
import { getJSONResponse } from '../utilities/apiHelpers';
import {Button} from 'react-bootstrap'
import _ from 'lodash';

let msg = "This is a message!";

export const ServerPing = () => {

  const [apiData, setApiData] = useState('');
  const [buttonText, setButtonText] = useState(msg);

  const requestHandler = async () => {

    if (!apiData) {
      const response = await getJSONResponse({ endpoint: "/api/server/testmsg" });
      const text = _.get(response, 'data', '');
      setApiData(text);
      setButtonText('Quick! Hide the message!');
    } else {
      setButtonText(msg);
      setApiData('');
    }

  }


  return (
    <>
      <Button onClick={requestHandler}>{buttonText}</Button>
      <div>
        {apiData ? apiData : null}
      </div>
    </>
  )
}