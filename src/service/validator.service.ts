import emailValidator from 'email-validator';

export default class ValidatorService {

    public static isEmail(email: string): boolean {
        return emailValidator.validate(email);
    }

    public static isPassword(password: string): boolean {
        return password.length > 8;
    }
}