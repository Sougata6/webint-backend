import { REFRESH_TOKEN_COLL, ACCESS_TOKEN_COLL } from '../constants/collections.js';
import { decryptData, encryptData } from './crypto.service.js';
import dbService from '../lib/database.js';
import { getEpochTime } from '../lib/utils.js';

export const storeRefreshToken = async (refreshToken, userId) => {

	try {
		const client = await dbService.getClient();

		await client
			.collection(REFRESH_TOKEN_COLL)
			.updateOne({
				subject: userId,
			}, {
				$set: {
					subject: userId,
					token: encryptData(refreshToken),
					createdAt: getEpochTime(),
					isActive: true
				}
			}, {
				upsert: true
			});
	} catch (err) {
		console.log(err.toString());
	}
}

export const storeAccessToken = async (accessToken, userId) => {

	try {
		const client = await dbService.getClient();

		await client
			.collection(ACCESS_TOKEN_COLL)
			.updateOne({
				subject: userId,
			}, {
				$set: {
					subject: userId,
					token: encryptData(accessToken),
					createdAt: getEpochTime(),
					isActive: true
				}
			}, {
				upsert: true
			});

		return true;
	} catch (err) {
		console.log(err.toString());
		return null;
	}
}

export const compareToken = async (token, encryptedToken) => {
	try {
		
		return token === decryptData(encryptedToken);
		
	} catch (error) {
		console.log(error.toString());
		return null;
	}
}