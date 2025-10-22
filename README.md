# 🧠 String Analyzer REST API

A RESTful API service that analyzes and stores strings with computed properties such as **length**, **palindrome detection**, **unique character count**, **word count**, **hash**, and **frequency mapping**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#️-setup--installation)
- [Environment Variables](#-environment-variables)
- [Running the App](#️-running-the-app)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Deployment Notes](#-deployment-notes)
- [Author](#-author)

---

## 🧩 Overview

This API receives a string input, analyzes it, and returns its computed properties.  
It supports creating, retrieving, filtering, deleting, and querying strings via **natural language**.

Each analyzed string is stored using its **SHA-256 hash** as a unique identifier to prevent duplicates.

---

## 🚀 Features

✅ Analyze and store string properties  
✅ Check for palindrome (case-insensitive)  
✅ Count unique characters and words  
✅ Generate SHA-256 hash for identification  
✅ Build character frequency map  
✅ Retrieve strings via filters or natural language queries  
✅ Fully RESTful design  
✅ Tested with Jest + Supertest

---

## 🛠 Tech Stack

| Tool                 | Purpose                    |
| -------------------- | -------------------------- |
| **Node.js**          | Runtime environment        |
| **Express.js**       | Web framework              |
| **Crypto**           | Generate SHA-256 hash      |
| **Jest + Supertest** | Testing framework          |
| **CORS + dotenv**    | Middleware & configuration |

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/stringAnalyzer-API.git
cd stringAnalyzer-API
```

### 2️⃣ Install dependencies

```bash
npm install
```

---

## 🔐 Environment Variables

Create a .env file in the project root with:

PORT=3000

---

## ▶️ Running the App

### Development mode

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server runs on:
👉 http://localhost:3000

---

## 📡 API Endpoints

### 1. Analyze String

POST /strings

Request Body

```bash
{
  "value": "Hello world"
}
```

Response (201 Created):

```bash
{
  "id": "a7c1a92...",
  "value": "Hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "a7c1a92...",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2025-10-21T09:00:00Z"
}
```

### 2. Get Specific String

GET /strings/{string_value}

Returns analyzed properties of a stored string.

### 3. Get All Strings (with filters)

GET /strings?is_palindrome=true&min_length=5&max_length=20&contains_character=a

Returns all strings that match query parameters.

### 4. Filter by Natural Language

GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings

Supports simple natural queries like:

- all single word palindromic strings

- strings longer than 10 characters

- strings containing the letter z

### 5. Delete a String

DELETE /strings/{string_value}

Removes a string from the system.
Returns 204 No Content on success.

---

## 🧪 Testing

Run all tests

```bash
npm run test
```

### ✅ Covers:

- String analysis creation

- Palindrome detection

- Filter endpoints

- Error handling (400, 404, 409)

- Deletion

---

## 🌍 Deployment Notes

Designed for Railway, Render, or Heroku.

Exported as CommonJS (require) for Node.js v18+.

Ensure environment variables are added under project settings (not just .env).

Start command for Railway:

```bash
npm start
```

---

## 👨‍💻 Author

👤 Name: Ogo Nelson  
📧 Email: goldnlesgroup@gmail.com  
💼 LinkedIn: www.linkedin.com/in/ogonelson  
💻 GitHub: https://github.com/OgoNelson  
𝕏 (formerly Twitter): https://x.com/ogo_nelson
