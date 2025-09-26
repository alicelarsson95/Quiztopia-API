import middy from "@middy/core";
import bcrypt from "bcryptjs";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile"
import db from "../utils/db.js"
import { PutItemCommand } from "@aws-sdk/client-dynamodb";

const signup = async (event) => {
  const { username, password } = event.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const createNewUser = new PutItemCommand({
    TableName: process.env.USERS_TABLE,
    Item: {
      username: { S: username },
      passwordHash: { S: passwordHash },
    },
    // Se till att användarnamnet inte redan finns
    ConditionExpression: "attribute_not_exists(username)",
  });

  // Skicka till DynamoDB
 try {
    await db.send(createNewUser)
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User created", username })
    }
  } catch (error) {
    console.log("DynamoDB error:", error) 

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: "Username already exists" })
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, name: error.name })
    }
  }
}


// Schema för validering
const schema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["username", "password"],
      properties: {
        username: { type: "string", minLength: 3 },
        password: { type: "string", minLength: 6 },
      },
    },
  },
};

// Exportera handler med middy
export const handler = middy(signup)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(schema) }));
