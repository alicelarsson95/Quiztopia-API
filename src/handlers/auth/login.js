import middy from "@middy/core";
import bcrypt from "bcryptjs";
import db from "../../utils/db.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { success, error } from "../../utils/responses.js";
import { loginSchema } from "../../utils/validationSchemas.js";
import { signToken } from "../../utils/jwt.js";

const login = async (event) => {
  const { username, password } = event.body;

  const queryUser = new QueryCommand({
    TableName: process.env.USERS_TABLE,
    IndexName: "UsernameIndex",
    KeyConditionExpression: "username = :u",
    ExpressionAttributeValues: {
      ":u": { S: username },
    },
  });

  const result = await db.send(queryUser);
  if (result.Count === 0) {
    return error("Invalid username or password", 401);
  }

  const user = result.Items[0];
  const passwordHash = user.passwordHash.S;

  const validPassword = await bcrypt.compare(password, passwordHash);
  if (!validPassword) {
    return error("Invalid username or password", 401);
  }

  const token = signToken({
    userId: user.userId.S,
    username: user.username.S,
  });

  return success({
    success: true,
    message: "Login successful",
    token,
  });
};

export const handler = middy(login)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(loginSchema) }));
