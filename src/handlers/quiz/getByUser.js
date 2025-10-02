import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import db from "../../utils/db.js";
import { success, error } from "../../utils/responses.js";
import { getByUserSchema } from "../../utils/validationSchemas.js";

const getByUser = async (event) => {
  const { userId, quizId } = event.pathParameters;

  try {
    const getQuiz = new GetItemCommand({
      TableName: process.env.QUIZ_TABLE,
      Key: { quizId: { S: quizId } },
    });
    const quizResult = await db.send(getQuiz);

    if (!quizResult.Item) return error("Quiz not found", 404);

    if (quizResult.Item.createdBy.S !== userId) {
      return error("This quiz does not belong to the specified user", 400);
    }

    const getQuestions = new QueryCommand({
      TableName: process.env.QUESTIONS_TABLE,
      KeyConditionExpression: "quizId = :q",
      ExpressionAttributeValues: { ":q": { S: quizId } },
    });
    const questionsResult = await db.send(getQuestions);

    const questions = (questionsResult.Items ?? []).map((q) => ({
      question: q.question.S,
      answer: q.answer.S,
      location: {
        latitude: q.lat.N || q.lat.S,
        longitude: q.long.N || q.long.S,
      },
      createdAt: q.createdAt?.S,
    }));

    return success({
      quiz: {
        quizId: quizResult.Item.quizId.S,
        title: quizResult.Item.title.S,
        createdBy: quizResult.Item.createdBy.S,
        createdByName: quizResult.Item.createdByName.S,
        createdAt: quizResult.Item.createdAt?.S,
        questions,
      },
    });
  } catch (err) {
    console.error("getByUser error:", err);
    return error("Could not fetch quiz/questions", 500);
  }
};

export const handler = middy(getByUser)
  .use(httpJsonBodyParser())
  .use(validator({ eventSchema: transpileSchema(getByUserSchema) }));
