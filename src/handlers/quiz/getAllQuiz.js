import middy from "@middy/core"
import { QueryCommand } from "@aws-sdk/client-dynamodb"
import db from "../../utils/db.js"
import { success, error } from "../../utils/responses.js"

const getAllQuiz = async (event) => {
  const username = event.queryStringParameters?.username
  if (!username) return error("Username is required", 400)

  try {
    const command = new QueryCommand({
      TableName: process.env.QUIZ_TABLE,
      IndexName: "CreatedByIndex",
      KeyConditionExpression: "createdBy = :u",
      ExpressionAttributeValues: {
        ":u": { S: username },
      },
    })

    const result = await db.send(command)

    const quizzes = (result.Items ?? []).map(item => ({
      quizId: item.quizId.S,
      title: item.title.S,
      createdBy: item.createdBy.S,
    }))

    return success(quizzes, 200)
  } catch (err) {
    console.log("GetAllQuiz error:", err)
    return error("Could not fetch quizzes", 500)
  }
}

export const handler = middy(getAllQuiz)
