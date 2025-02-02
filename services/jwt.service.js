import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { storeRefreshToken, storeAccessToken } from './token.service.js';

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACC_TOKEN_SECRET || 'topSecret';
const REFRESH_TOKEN_SECRET = process.env.REF_TOKEN_SECRET || 'refreshTopSecret';
const TOKEN_ISSUER = process.env.TOKEN_ISSUER || "watchman.sougata6.com";
const ACCESS_TOKEN_VALIDITY = process.env.ACCESS_TOKEN_VALIDITY || '30d';
const REFRESH_TOKEN_VALIDITY = process.env.REFRESH_TOKEN_VALIDITY || '180d';


export const getAccessToken = async (payload, accessTokenValidity) => {

	try {
		const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
			expiresIn: ACCESS_TOKEN_VALIDITY,
			subject: payload.userId,
			issuer: TOKEN_ISSUER
		})

		const isTokenStored = await storeAccessToken(
			accessToken,
			payload.userId,
		);

		if(!isTokenStored) return false;

		return accessToken;

	} catch (err) {
		console.log('Access Token', err.toString())
		return null;
	}
}

export const getRefreshToken = async(payload) => {

	try {
		const refreshToken = jwt.sign(payload,
			REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_VALIDITY,
			subject: payload.userId,
			issuer: TOKEN_ISSUER
		})

		await storeRefreshToken(
			refreshToken,
			payload.userId,
		);

		return refreshToken;

	} catch (err) {
		console.log('Refresh token', err.toString())
		return null;
	}
}

export const getTokenData = (token) => {
	try {
		return jwt.decode(token);
	} catch (err) {
		return null;
	}
}

export const getVerifiedRFTokenData = (token) => {
	try {
		return jwt.verify(token, REFRESH_TOKEN_SECRET, { issuer: TOKEN_ISSUER });
	} catch (err) {
		return null;
	}
}

export const getVerifiedACTokenData = (token) => {
	try {
		return jwt.verify(token, ACCESS_TOKEN_SECRET, { issuer: TOKEN_ISSUER });
	} catch (err) {
		console.log(err);
		return null;
	}
}