import middy from "@middy/core";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import db from "../../utils/db.js";
import { success, error } from "../../utils/responses.js";

const getAllQuiz = async (event) => {
  try {
    const command = new QueryCommand({
      TableName: process.env.QUIZ_TABLE,
      IndexName: "TypeIndex",
      KeyConditionExpression: "#t = :t",
      ExpressionAttributeNames: {
        "#t": "type",
      },
      ExpressionAttributeValues: {
        ":t": { S: "QUIZ" },
      },
    });

    const result = await db.send(command);

    const quizzes = (result.Items ?? []).map((item) => ({
      quizId: item.quizId.S,
      title: item.title.S,
      createdBy: item.createdBy.S,
      createdByName: item.createdByName.S,
    }));

    return success(quizzes, 200);
  } catch (err) {
    console.error("GetAllQuiz error:", JSON.stringify(err, null, 2));
    return error(err.message || "Could not fetch quizzes", 500);
  }
};

export const handler = middy(getAllQuiz);
