const json = (statusCode, data) => ({
  statusCode,
  body: JSON.stringify(data),
})

export const success = (data, statusCode = 200) => json(statusCode, data)
export const error   = (message, statusCode = 500) => json(statusCode, { error: message })
