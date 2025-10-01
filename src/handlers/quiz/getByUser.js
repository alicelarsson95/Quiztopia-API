import middy from "@middy/core";
import { GetItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import db from "../../utils/db.js";
import { success, error } from "../../utils/responses.js";
import { authMiddleware } from "../../middleware/authMiddleware.js";

const getByUser = async (event) => {
  const { userId, quizId } = event.pathParameters;

 
  if (event.user.userId !== userId) {
  return error("Forbidden", 403);
}

  try {
   
    const quizCmd = new GetItemCommand({
      TableName: process.env.QUIZ_TABLE,
      Key: { quizId: { S: quizId } },
    });
    const quizResult = await db.send(quizCmd);
    if (!quizResult.Item) return error("Quiz not found", 404);

 
    const questionsCmd = new QueryCommand({
      TableName: process.env.QUESTIONS_TABLE,
      KeyConditionExpression: "quizId = :q",
      ExpressionAttributeValues: { ":q": { S: quizId } },
    });
    const questionsResult = await db.send(questionsCmd);

    const questions = (questionsResult.Items ?? []).map((q) => ({
      question: q.question.S,
      answer: q.answer.S,
      location: {
        longitude: q.long.S,
        latitude: q.lat.S,
      },
    }));

  
    return success({
      success: true,
      quiz: {
        quizId: quizResult.Item.quizId.S,
        title: quizResult.Item.title.S,
        userId: quizResult.Item.createdBy.S,
        questions,
      },
    });
  } catch (err) {
    console.log("getByUser error:", err);
    return error("Could not fetch quiz/questions", 500);
  }
};

export const handler = middy(getByUser)
.use(authMiddleware());
