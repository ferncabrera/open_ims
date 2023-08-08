import { IValidate } from "./types/validationTypes";
//global validation function
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

// export const validateFormOnSubmit = (data)