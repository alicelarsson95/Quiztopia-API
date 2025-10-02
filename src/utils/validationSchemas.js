export const signupSchema = {
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

export const loginSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["username", "password"],
      properties: {
        username: { type: "string" },
        password: { type: "string" },
      },
    },
  },
};

export const createQuizSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["title"],
      properties: {
        title: { type: "string", minLength: 1, maxLength: 100 },
      },
    },
  },
};

export const addQuestionSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      required: ["quizId", "question", "answer", "lat", "long"],
      properties: {
        quizId: { type: "string" },
        question: { type: "string", minLength: 1 },
        answer: { type: "string", minLength: 1 },
        lat: { type: "number", minimum: -90, maximum: 90 },
        long: { type: "number", minimum: -180, maximum: 180 },
      },
    },
  },
};

export const getByUserSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      required: ["userId", "quizId"],
      properties: {
        userId: { type: "string" },
        quizId: { type: "string" },
      },
    },
  },
};

export const deleteQuizSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      required: ["quizId"],
      properties: {
        quizId: { type: "string" },
      },
    },
  },
};
