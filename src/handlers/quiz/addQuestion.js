import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import db from "../../utils/db.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { success, error } from "../../utils/responses.js";

const addQuestion = async (event) => {
  const { quizId, question, answer, lat, long } = event.body;

  if (!quizId || !question || !answer || !lat || !long) {
    return error("All fields are required", 400);
  }

  const questionId = uuidv4();

  const createQuestionItem = new PutItemCommand({
    TableName: process.env.QUESTIONS_TABLE,
    Item: {
      quizId: { S: quizId },
      questionId: { S: questionId },
      question: { S: question },
      answer: { S: answer },
      lat: { S: lat },
      long: { S: long },
    },
  });

  try {
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
      },
      201
    );
  } catch (err) {
    console.log("AddQuestion error:", err);
    return error("Could not add question", 500);
  }
};

export const handler = middy(addQuestion).use(httpJsonBodyParser()).use(authMiddleware());
