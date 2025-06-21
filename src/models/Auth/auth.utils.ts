import Jwt from 'jsonwebtoken';

export const createToken = (JWTPayload: {
    name: string;
    email: string;
}, secret: string, expiresIn: string | number) => {
    const options = { expiresIn: expiresIn as Jwt.SignOptions['expiresIn'] }
    return Jwt.sign(JWTPayload, secret, options)
};