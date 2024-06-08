import { IValidate } from "./types/validationTypes";
//global validation function

import _ from "lodash";

export const fieldValidation = (data: IValidate) => {
    const {name, value, required} = data;

    let isValid: boolean;
    let emailPattern: RegExp;
    let passwordPattern: RegExp;

    if (required && !value) {
        return { isValid: false, message: "Required", fieldName: name }
    }

    switch (name) {
        case "email":
            emailPattern = /[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?/i;
            isValid = emailPattern.test(value)
            return { isValid, message: isValid ? '' : "Please enter a valid email", fieldName: name }

        case "newPassword":
            if (value.length < 8 || value.length > 64) {length
                return { isValid: false, message: "", fieldName: name }
            }
            passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).*$/;
            isValid = passwordPattern.test(value)
            return { isValid, message:"", fieldName: name }
    }

    return {isValid: true, message: "", fieldName: name}
}

export const validateFormOnSubmit = (requiredArr: string[], data ) : [any, boolean] => {

    const trackErrorList = [];
    const errorObject: any = {};

    _.forEach(requiredArr, (key) => {
        data[key];
        const formGroup = {name: key, value: data[key], required: true }
        const isValid = fieldValidation(formGroup);
        errorObject[key] = {valid: isValid.isValid, message: isValid.message};
        trackErrorList.push(isValid);
    });

    const isSubmissionInValid = _.some(trackErrorList, (validEntity) => validEntity.isValid === false);

    return [errorObject, isSubmissionInValid];

};
