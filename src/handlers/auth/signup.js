import middy from "@middy/core";
import bcrypt from "bcryptjs";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { v4 as uuidv4 } from "uuid"
import db from "../../utils/db.js";
import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { success, error } from "../../utils/responses.js";
import { signupSchema } from "../../utils/validationSchemas.js";

const signup = async (event) => {
  const { username, password } = event.body;

  const userId = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10);

  const createNewUser = new PutItemCommand({
    TableName: process.env.USERS_TABLE,
    Item: {
      userId: { S: userId },
      username: { S: username },
      passwordHash: { S: passwordHash },
    },
    ConditionExpression: "attribute_not_exists(username)",
  });

  try {
    await db.send(createNewUser);
    return success({ message: "User created", username }, 201);
  } catch (err) {
    console.log("Signup error:", err);
    if (err.name === "ConditionalCheckFailedException") {
      return error("Username already exists", 409);
    }
    return error(err.message, 500);
  }
};

// Exportera handler med middy
export const handler = middy(signup)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(signupSchema) }));
