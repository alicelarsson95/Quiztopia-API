import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import db from "../../utils/db.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { success, error } from "../../utils/responses.js";
import { createQuizSchema } from "../../utils/validationSchemas.js";

const createQuiz = async (event) => {
  const { title } = event.body;
  const user = event.user;
  const quizId = uuidv4();
  const createdAt = new Date().toISOString();

  const newQuiz = new PutItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Item: {
      quizId: { S: quizId },
      title: { S: title },
      createdBy: { S: user.userId },
      createdByName: { S: user.username },
      type: { S: "QUIZ" },
      createdAt: { S: createdAt },
    },
  });

  try {
    await db.send(newQuiz);
    return success(
      {
        message: "Quiz created",
        quizId,
        title,
        createdBy: user.userId,
        createdByName: user.username,
        createdAt,
      },
      201
    );
  } catch (err) {
    console.error("CreateQuiz error:", err);
    return error("Could not create quiz", 500);
  }
};

export const handler = middy(createQuiz)
  .use(httpJsonBodyParser())
  .use(authMiddleware())
  .use(validator({ eventSchema: transpileSchema(createQuizSchema) }));
