import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

dotenv.config();

const secret = process.env.SECRET || 'secret';

export const getHashedText = (plainText) => {
	return bcrypt.hashSync(plainText, 10);
}

export const compareHash = (plainText, hash) => {
	return bcrypt.compareSync(plainText, hash);
}

export const generateSalt = () => {
	return bcrypt.genSaltSync();
}

export const encryptData = (message, key = '') => {
	let keyArray = CryptoJS.enc.Utf8.parse( key!='' ? key : secret );
	return CryptoJS.AES.encrypt(message, keyArray, {mode: CryptoJS.mode.ECB}).toString();
}

export const decryptData = (cipher, key = '') => {
	let keyArray = CryptoJS.enc.Utf8.parse( key!='' ? key : secret );
	let bytes  = CryptoJS.AES.decrypt(cipher.toString(), keyArray, {mode: CryptoJS.mode.ECB});
    let originalText = bytes.toString(CryptoJS.enc.Utf8);

	return originalText;
}

