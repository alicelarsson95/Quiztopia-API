import { verifyToken } from "../utils/jwt.js";
import { error } from "../utils/responses.js";

export const authMiddleware = () => {
  return {
    before: async (request) => {
      const authHeader = request.event.headers?.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return error("Unauthorized", 401);
      }

      const token = authHeader.split(" ")[1];

      try {
        const authUser = verifyToken(token);

        request.event.user = authUser;
      } catch (err) {
        console.log("JWT error:", err);
        return error("Unauthorized", 401);
      }
    },
  };
};
