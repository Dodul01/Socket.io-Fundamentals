export const generateOTP = (length: number) : number => {
	return Number(Math.floor(100000 + Math.random() * 900000).toString().slice(0, length));
}