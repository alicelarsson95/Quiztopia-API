import middy from "@middy/core";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { DeleteItemCommand, GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import db from "../../utils/db.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { success, error } from "../../utils/responses.js";
import { deleteQuizSchema } from "../../utils/validationSchemas.js";

const deleteQuiz = async (event) => {
  const { quizId } = event.pathParameters;

  try {
    const quizCheck = new GetItemCommand({
      TableName: process.env.QUIZ_TABLE,
      Key: { quizId: { S: quizId } },
    });
    const quizResult = await db.send(quizCheck);

    if (!quizResult.Item) {
      return error("Quiz not found", 404);
    }

    if (quizResult.Item.createdBy.S !== event.user.userId) {
      return error("Forbidden: You do not own this quiz", 403);
    }

    const questionsResult = await db.send(
      new QueryCommand({
        TableName: process.env.QUESTIONS_TABLE,
        KeyConditionExpression: "quizId = :q",
        ExpressionAttributeValues: { ":q": { S: quizId } },
      })
    );

    if (questionsResult.Items) {
      for (const q of questionsResult.Items) {
        await db.send(
          new DeleteItemCommand({
            TableName: process.env.QUESTIONS_TABLE,
            Key: {
              quizId: { S: q.quizId.S },
              questionId: { S: q.questionId.S },
            },
          })
        );
      }
    }

    await db.send(
      new DeleteItemCommand({
        TableName: process.env.QUIZ_TABLE,
        Key: { quizId: { S: quizId } },
      })
    );

    return success({ message: "Quiz and related questions deleted" });
  } catch (err) {
    console.error("DeleteQuiz error:", err);
    return error("Could not delete quiz", 500);
  }
};

export const handler = middy(deleteQuiz)
  .use(authMiddleware())
  .use(validator({ eventSchema: transpileSchema(deleteQuizSchema) }));
