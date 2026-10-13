import jwt from "jsonwebtoken";
import errorHandler from "../utils/errorHandler.js";

const auth = async(req, res, next) => {
  try {
    

    var token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];

    if(!token) {
      token = req.query.token;
    }

    if(!token) {
      return next(errorHandler("401", "Provide token"));
    }

    const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

    if(!decode) {
      return next(errorHandler("401","unauthorized access"));
    }

    req.userId = decode.id;

    next();

  } catch(err) {
    next(errorHandler("500", "You have not login"));
  }
}

export default auth;