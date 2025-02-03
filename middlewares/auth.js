import { Messages } from "../constants/message.js";
import { getVerifiedACTokenData } from "../services/jwt.service.js";
import dbService from "../lib/database.js";
import { ACCESS_TOKEN_COLL } from "../constants/collections.js";
import { compareToken } from "../services/token.service.js";
import { sendResponse } from "../lib/utils.js";

const verifyAccessToken = async (req, res, next) => {

	try {
		let authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];

		if (!token)
			return sendResponse(res, 400, false, Messages.NO_TOKEN_FOUND);

		const tokenData = getVerifiedACTokenData(token);

		if (!tokenData)
			return sendResponse(res, 401, false, Messages.INVALID_EXPIRED_TOKEN);

		const client = await dbService.getClient();

		const activeAccessToken = await client
			.collection(ACCESS_TOKEN_COLL)
			.findOne({
				subject: tokenData.sub,
				isActive: true
			});

		if (!activeAccessToken)
			return sendResponse(res, 401, false, Messages.INVALID_EXPIRED_TOKEN);

		if (! await compareToken(token, activeAccessToken.token))
			return sendResponse(res, 401, false, Messages.INVALID_EXPIRED_TOKEN);

		req['tokenData'] = tokenData;

		next();

	} catch (err) {
		return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
	}
}

export default {
    verifyAccessToken
}