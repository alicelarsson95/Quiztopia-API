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
        password: { type: "string" }
      }
    }
  }
}

