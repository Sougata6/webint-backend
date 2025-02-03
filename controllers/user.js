import { Messages } from "../constants/message.js";
import dbService from "../lib/database.js";
import { USERS_COLL } from "../constants/collections.js";
import { sendResponse } from "../lib/utils.js";
import { uploadFile } from "../services/aws.service.js";


class UserController {
  getUserDetails = async (req, res) => {
    try {
      if (!req.tokenData) {
        return sendResponse(res, 400, false, Messages.NO_TOKEN_FOUND);
      }
      const { userId, email } = req.tokenData;
      if (!(userId && email)) {
        return sendResponse(res, 400, false, Messages.NO_USER_DETAILS_FOUND);
      }
  
      const client = await dbService.getClient();
  
      const findBy = {
        "$or": [
          { userId },
          { email }
        ],
        isActive: true
      }
  
      const userDetails = await client.collection(USERS_COLL).findOne(findBy);
  
      return sendResponse(res, 200, true, Messages.FETCH_USER_DATA, userDetails);
    } catch (error) {
      console.log(error.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }
  };
  
  updateUserDetails = async (req, res) => {
    
    const { userId } = req.tokenData;
  
    if (!userId) {
      return sendResponse(res, 400, false, Messages.MANDATORY_FIELD_MISSING)
    }
    
    const { name, email, mobileNumber, addressDetails } = req.body;
    const profilePicture = req.file ? req.file.path : undefined;
  
    try {
  
      const updatedData = { name, email, mobileNumber, addressDetails };
  
      if (profilePicture) {
        const uploadedFile = await uploadFile(req, res);
        updatedData.profilePicture = uploadedFile.url;
      }
  
      const client = await dbService.getClient();
      await client.collection(USERS_COLL).findByIdAndUpdate(userId, updatedData, {upsert: false});
  
      return sendResponse(res, 200, true, Messages.DATA_SAVE_SUCCESS);
  
    } catch (error) {
      console.log(error.toString());
      return sendResponse(res, 500, false, Messages.INTERNAL_SERVER_ERROR);
    }
  };
}

export default UserController;