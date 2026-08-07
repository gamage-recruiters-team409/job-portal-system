import SupportMessage from '../models/SupportMessage.js';

export const createSupport = async (data) => {
  const supportMessage = await SupportMessage.create(data);

  return supportMessage;
};
