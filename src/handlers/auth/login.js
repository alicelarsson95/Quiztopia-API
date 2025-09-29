import middy from "@middy/core";
import bcrypt from "bcryptjs";
import db from "../../utils/db.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { success, error } from "../../utils/responses.js";
import { loginSchema } from "../../utils/validationSchemas.js";
import { signToken } from "../../utils/jwt.js";

const login = async (event) => {
  const { username, password } = event.body;

  try {
    const getUser = new GetItemCommand({
      TableName: process.env.USERS_TABLE,
      Key: { username: { S: username } },
    });

    const { Item } = await db.send(getUser);
    if (!Item) return error("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, Item.passwordHash.S);
    if (!valid) return error("Invalid credentials", 401);

    const token = signToken({ username });
    return success({ message: "Login successful", token }, 200);
  } catch (err) {
    console.log("Login error:", err);
    return error(err.message, 500);
  }
};

export const handler = middy(login)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(loginSchema) }));
