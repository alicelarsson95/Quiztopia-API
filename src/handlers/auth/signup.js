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

  // kolla först om username redan finns (via GSI)
  const checkUser = new QueryCommand({
    TableName: process.env.USERS_TABLE,
    IndexName: "UsernameIndex", // måste finnas i YML
    KeyConditionExpression: "username = :u",
    ExpressionAttributeValues: {
      ":u": { S: username },
    },
  });

  const checkResult = await db.send(checkUser);
  if (checkResult.Count > 0) {
    return error("Username already exists", 409);
  }

  // skapa user
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);

  const createNewUser = new PutItemCommand({
    TableName: process.env.USERS_TABLE,
    Item: {
      userId: { S: userId },
      username: { S: username },
      passwordHash: { S: passwordHash },
    },
  });

  try {
    await db.send(createNewUser);
    return success({ message: "User created", userId, username }, 201);
  } catch (err) {
    console.log("Signup error:", err);
    return error(err.message, 500);
  }
};

export const handler = middy(signup)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(signupSchema) }));
