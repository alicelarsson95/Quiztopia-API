# Quiztopia API

## Instruktioner

Detta projekt är ett serverless API byggt med **AWS Lambda**, **DynamoDB** och **Serverless Framework**.  
Syftet är att skapa ett quizsystem där användare kan registrera sig, logga in och hantera sina quiz.

Swagger: http://quiztopia-api-documentation.s3-website.eu-north-1.amazonaws.com/#/
Postman collection: https://bold-comet-596367.postman.co/workspace/Alice-workspace~8c349ba3-f3ac-4d9e-82fc-c37198d4b448/collection/43237590-389153db-b824-4663-9e45-d2069d12d0e2?action=share&source=copy-link&creator=43237590

## Kravspecifikation

- Det går att skapa konto och logga in.
- Det går att se alla quiz, vad quiz:et heter samt vem som skapat det.
- Det går att välja ett specifikt quiz och få alla frågor.

### Funktionalitet (per användare)

- Det går att skapa ett quiz.
- Det går att lägga till frågor på ett skapat quiz.
  - En fråga innehåller: **frågan**, **svaret** samt **koordinater** (longitud och latitud).
- Det går att ta bort ett quiz.
  - Du kan endast ta bort dina egna quiz, inte någon annans.

---

## Databasdesign

### users

- **userId** (PK)
- username
- passwordHash

### quiz

- **quizId** (PK)
- title
- createdBy (userId)
- createdByName (username)
- type (alltid `"QUIZ"`)

### questions

- **quizId** (PK)
- **questionId** (SK)
- question
- answer
- lat
- long

---

## Endpoints

### Auth

- `POST /auth/signup` → Skapar ett nytt konto.
- `POST /auth/login` → Loggar in och returnerar JWT-token (giltig i 60 min).

### Quiz

- `GET /quiz` → Hämtar alla quiz.
- `POST /quiz` → Skapar ett nytt quiz (kräver inloggning).
- `POST /quiz/question` → Lägger till en fråga på ett quiz (kräver inloggning).
- `GET /quiz/{userId}/{quizId}` → Hämtar ett specifikt quiz med dess frågor (kräver inloggning).
- `DELETE /quiz/{quizId}` → Tar bort ett quiz och tillhörande frågor (kräver inloggning).

---

## Teknisk stack

- **Node.js 18.x**
- **Serverless Framework**
- **AWS Lambda**
- **DynamoDB**
- **JWT** för autentisering
- **Middy** som middleware

---

## Installation

1. Klona repot:
   ```bash
   git clone <repo-url>
   cd quiztopia-api
   ```
