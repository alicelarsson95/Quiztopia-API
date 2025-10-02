import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import db from "../../utils/db.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { success, error } from "../../utils/responses.js";
import { addQuestionSchema } from "../../utils/validationSchemas.js";

const addQuestion = async (event) => {
  const { quizId, question, answer, lat, long } = event.body;
  const createdAt = new Date().toISOString();

  try {
    const quizCheck = new GetItemCommand({
      TableName: process.env.QUIZ_TABLE,
      Key: { quizId: { S: quizId } },
    });
    const quizResult = await db.send(quizCheck);

    if (!quizResult.Item) return error("Quiz not found", 404);

    if (quizResult.Item.createdBy.S !== event.user.userId) {
      return error("Forbidden: You do not own this quiz", 403);
    }

    const questionId = uuidv4();
    const createQuestionItem = new PutItemCommand({
      TableName: process.env.QUESTIONS_TABLE,
      Item: {
        quizId: { S: quizId },
        questionId: { S: questionId },
        question: { S: question },
        answer: { S: answer },
        lat: { N: String(lat) },
        long: { N: String(long) },
        createdAt: { S: createdAt },
      },
    });
    await db.send(createQuestionItem);

    return success(
      {
        message: "Question added",
        quizId,
        questionId,
        question,
        answer,
        lat,
        long,
        createdAt,
      },
      201
    );
  } catch (err) {
    console.error("AddQuestion error:", err);
    return error("Could not add question", 500);
  }
};

export const handler = middy(addQuestion)
  .use(httpJsonBodyParser())
  .use(authMiddleware())
  .use(validator({ eventSchema: transpileSchema(addQuestionSchema) }));
