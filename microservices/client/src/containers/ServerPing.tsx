import { useState, useEffect } from 'react';
import { getJSONResponse } from '../utilities/apiHelpers';
import { Button } from 'react-bootstrap'
import _ from 'lodash';


export const ServerPing = () => {

    const [timesClicked, setTimesClicked] = useState(0);

    useEffect(() => {
        void (async () => {
            // ! This will run once when the page reloads.
            const response = await getJSONResponse({ endpoint: "/api/server/getClickedNum" });
            const maxNum = _.get(response, 'maxNum');
            setTimesClicked(maxNum);


            // ! This will run once when page reload
        })();
        return (): void => {
            console.log("Component unmount!");
        }
    }, [])

    const handleRefresh = async () => {
        const response = await getJSONResponse({ endpoint: "/api/server/getClickedNum" });
        const maxNumber = _.get(response, 'maxNum');
        setTimesClicked(maxNumber);
    }

    const handleClick = async () => {
        console.log("sending add click request to server from CLIENT!")
        await getJSONResponse({ endpoint: "/api/server/addClick" });
    }

    return (
        <>
            <Button onClick={handleRefresh}>{"Refresh Count!"}</Button>
            <Button onClick={handleClick}>{"Add click to DB!"}</Button>
            <div>
                <h1>Times you have clicked: {timesClicked}</h1>
            </div>
        </>
    )
}