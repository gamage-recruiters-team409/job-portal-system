import SupportMessage from "../models/SupportMessage.js";

export const createSupport = async (data) => {
  const supportMessage = await SupportMessage.create(data);

  return supportMessage;
};


export const getSupportMessagesService = async () => {
  const messages = await SupportMessage.find()
    .sort({ createdAt: -1 });

  return messages;
};