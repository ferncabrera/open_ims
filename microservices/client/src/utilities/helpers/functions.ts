import { getJSONResponse } from "../apiHelpers";

export const isUserAuth = async () => {
    const res = await getJSONResponse({ endpoint: '/api/server/is-authenticated' });
    return res
}

//put any other simple or complex functions here that can be reused throughout our app

function intlFormat(num: number) {
    return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
};

export const makeFriendlyDollarAmount = function (num: number) {
    let isNeg = false;
    if (num < 0) {
        isNeg = true;
        num = Math.abs(num);
    };

    if (num >= 1000000000000)
        return !isNeg ? intlFormat(num / 1000000000000) + 'T' : '-' + intlFormat(num / 1000000000000) + 'T';
    if (num >= 1000000000)
        return !isNeg ? intlFormat(num / 1000000000) + 'B' : '-' + intlFormat(num / 1000000000) + 'B';
    if (num >= 1000000)
        return !isNeg ? intlFormat(num / 1000000) + 'M' : '-' + intlFormat(num / 1000000) + 'M';
    if (num > 1000)
        return !isNeg ? intlFormat(num / 1000) + 'k' : '-' + intlFormat(num / 1000) + 'k';
    return !isNeg ? intlFormat(num) + '$' : '-' + intlFormat(num) + '$';

};

export const hasEmptyKeys = (obj) => {
    `Checks if a particular object has values with empty keys, returns true of false`;
    return Object.values(obj).every(value => !value);
}

export const convertDateISO = (isoDate, format: 0 | 1) => {
    "Will convert to a DD Month YYYY format"
    const formatDate = new Date(isoDate)

    const monthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = formatDate.getMonth()

    const month = monthList[monthIndex]
    const day = String(formatDate.getDate()).padStart(2, "0");
    const year = formatDate.getFullYear();

    if (format) {
        return (`${month} ${day}, ${year}`)
    } else {
        return (`${day} ${month}, ${year}`)
    }
};