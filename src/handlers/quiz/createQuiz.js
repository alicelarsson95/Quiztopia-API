import middy from "@middy/core"
import httpJsonBodyParser from "@middy/http-json-body-parser"
import { PutItemCommand } from "@aws-sdk/client-dynamodb"
import { v4 as uuidv4 } from "uuid"
import db from "../../utils/db.js"
import { authMiddleware } from "../../middleware/authMiddleware.js"
import { success, error } from "../../utils/responses.js"

const createQuiz = async (event) => {
  const { title } = event.body

  if (!title) {
    return error("Title is required", 400)
  }

  const quizId = uuidv4()
  const user = event.user 

  const newQuiz = new PutItemCommand({
    TableName: process.env.QUIZ_TABLE,
    Item: {
      quizId: { S: quizId },
      title: { S: title },
      createdBy: { S: user.userId },   
      createdByName: { S: user.username }, 
      type: { S: "QUIZ" },            
    },
  })

  try {
    await db.send(newQuiz)
    return success(
      {
        message: "Quiz created",
        quizId,
        title,
        createdBy: user.userId,
        createdByName: user.username,
      },
      201
    )
  } catch (err) {
    console.log("CreateQuiz error:", err)
    return error("Could not create quiz", 500)
  }
}

export const handler = middy(createQuiz)
  .use(httpJsonBodyParser())
  .use(authMiddleware())
