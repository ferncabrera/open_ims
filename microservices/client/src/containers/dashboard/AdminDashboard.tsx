import React, { useEffect, useState } from 'react'
import { getJSONResponse } from '../../utilities/apiHelpers';
import { isUserAuth } from '../../utilities/helpers/functions';
import { CCGChart } from '../../components/charts/CCGChart';
import _ from 'lodash';

export const AdminDashboard = () => {
    const [userInfo, setUserInfo] = useState({ firstName: null, email: null, permission: null });

    useEffect(() => {
        isUserAuth().then((response: any) => {
            console.log("this is response --> ", response);
            setUserInfo({ firstName: response.firstName, email: response.email, permission: response.permission });
        }).catch((error) => {
            return
        })
    }, []);

    return (
        <div className={`pt-3 px-3 h-100 w-100 mx-3`}>
            {userInfo.firstName !== null &&

                <div className='my-3 pb-1'>
                    <p className='font-30 dark-text'>Welcome back, {userInfo.firstName}.</p>
                </div>
            }

            <CCGChart />
            
        </div>
    )
}
