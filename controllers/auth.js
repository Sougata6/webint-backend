import { Messages } from "../constants/message.js";
import dbService from "../lib/database.js";
import { USERS_COLL, PASSWORD_COLL } from "../constants/collections.js";
import { compareHash, getHashedText } from "../services/crypto.service.js";
import { getAccessToken, getRefreshToken } from "../services/jwt.service.js";
import {
  sendResponse,
  generateUniqueUserID,
  getEpochTime,
} from "../lib/utils.js";

class AuthController {
  loginUsingPassword = async (req, res) => {
    try {
      const client = await dbService.getClient();
  
      const { email, password } = req.body;
  
      let findBy = {
        email,
        isActive: true,
      };
  
      if (!email || !password) {
        return sendResponse(
          res,
          400,
          false,
          Messages.EMAIL_PASSWORD_MISSING_ERROR
        );
      }
  
      const existingUser = await client
        .collection(USERS_COLL)
        .findOne(findBy);
  
      if (!existingUser) {
        return sendResponse(res, 400, false, Messages.INVALID_EMAIL_ERROR);
      }
  
      findBy["userId"] = existingUser.userId;
      const userPassword = await client.collection(PASSWORD_COLL).findOne(findBy);
  
      if (!compareHash(password, userPassword.password)) {
        return sendResponse(res, 400, false, Messages.INVALID_PASSWORD_ERROR);
      }
  
      const userTokenPayload = {
        userId: userPassword.userId,
        name: userPassword.name,
        email
      };
  
      const accessToken = await getAccessToken(userTokenPayload);
  
      const refreshToken = await getRefreshToken(userTokenPayload);
  
      if (!accessToken || !refreshToken) {
        return sendResponse(res, 500, false, Messages.TOKEN_GENERATION_ERROR);
      }
  
      return sendResponse(res, 200, true, Messages.LOGIN_SUCCESS, {
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log(error.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }
  };
  
  register = async (req, res) => {
  
    if (
      !(
        req.body.email &&
        req.body.password &&
        req.body.name &&
        req.body.mobileNumber
      )
    ) {
      return sendResponse(res, 400, false, Messages.MANDATORY_FIELD_MISSING);
    }
  
    try {
      const client = await dbService.getClient();
      const result = await client.collection(USERS_COLL).findOne({
        email: req.body.email,
        isActive: true,
      });
  
      if (result) {
        return sendResponse(res, 409, false, Messages.CONFLICT_USER_EXISTS);
      }
  
  
      let userPayload = {
        userId: generateUniqueUserID(req.body.email, req.body.mobileNumber),
        name: req.body.name.trim(),
        email: req.body.email.trim(),
        mobileNumber: req.body.mobileNumber.trim(),
        isActive: true,
        createdAt: getEpochTime(),
        addressDetails: req.body.addressDetails || {},
      };
  
      const passwordPayload = {
        userId: userPayload.userId,
        email: req.body.email,
        password: getHashedText(req.body.password),
        isActive: true,
        createdAt: getEpochTime(),
      };
  
      await client.collection(USERS_COLL).insertOne(userPayload);
  
      await client.collection(PASSWORD_COLL).insertOne(passwordPayload);
  
      return sendResponse(res, 200, true, Messages.REGISTER_SUCCESS);
    } catch (err) {
      console.log(err.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }
  };
  
  resetPassword = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return sendResponse(res, 400, false, Messages.MANDATORY_FIELD_MISSING);
      }
  
      const client = await dbService.getClient();
  
      const userData = await client.collection(USERS_COLL).findOne(findBy);
  
      if (!userData) {
        return sendResponse(res, 400, false, Messages.INVALID_EMAIL_ERROR);
      }
  
      const findBy = {
        userId: userData.userId,
        email,
        isActive: true,
      };
  
      const passwordPayload = {
        userId: userData.userId,
        email: userData.email,
        password: getHashedText(req.body.password),
        isActive: true,
        createdAt: getEpochTime(),
      };
  
      await client
        .collection(PASSWORD_COLL)
        .findOneAndUpdate(
          findBy,
          {
            $set: {
              isActive: false,
              updatedAt: getEpochTime(),
            },
          },
          {
            upsert: false,
          }
        );
  
      await client
        .collection(PASSWORD_COLL)
        .insertOne(passwordPayload);
  
      return sendResponse(res, 200, true, Messages.RESET_PASSWORD_SUCCESS);
    } catch (error) {
      console.log(error.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }
  };
}

export default AuthController;