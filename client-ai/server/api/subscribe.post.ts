import { JsonDB } from "../utils/json_db";

export default defineEventHandler(async (event) => {
  try {
    const sessionData = await isAuthenticated(event);
    const publicKey = sessionData.user?.name;

    const db = new JsonDB("/Users/aswin/Documents/underdog-memeletter/db.json");

    if (db.readOne("subscribers").includes(publicKey)) {
      return {
        statusCode: 409,
        message: "Already subscribed to MemeLetter",
      };
    }

    db.update("subscribers", [...db.readOne("subscribers"), publicKey]);

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: `${error}`,
    };
  }
});
