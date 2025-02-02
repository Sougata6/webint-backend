import { ulid } from "ulid";

export const sendResponse = (res, statusCode, success, message, data) => {
  res.status(statusCode).json({ success, message, ...(data && { data }) });
};

export const getEpochTime = () => {
  return Math.floor(new Date().getTime());
};

export const generateUniqueUserID = ( email, mobileNumber) => {
	return ( email.slice(0,3) + mobileNumber.slice(-3) + Math.floor(Math.random()*(99999-10000+1)+100)).toUpperCase();
}

export const getUniqueId = () => ulid();