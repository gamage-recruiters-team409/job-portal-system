import { 
  createSupport,
  getSupportMessagesService
} from "../services/support.service.js";


export const createSupportMessage = async (req, res) => {
  try {

    const supportMessage = await createSupport(req.body);

    res.status(201).json({
      success: true,
      message: "Support message submitted successfully",
      data: supportMessage,
    });

  } catch (error) {

    console.error("Support Controller Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });

  }
};



export const getSupportMessages = async (req, res, next) => {

  try {

    const messages = await getSupportMessagesService();

    res.status(200).json({

      success: true,
      data: messages,

    });


  } catch(error){

    console.log("SUPPORT GET ERROR:", error);

    next(error);

  }

};