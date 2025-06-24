export interface TUser {
    name: string;
    email: string;
    password: string;
    isVerifyed?: boolean;
    authentifation?:{
        oneTimePassword: number;
        expireAt: Date;
    }
}