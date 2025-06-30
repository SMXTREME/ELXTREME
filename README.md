# ELXTREME - Expense Tracking Application

ELXTREME is a web-based expense tracking application built with Node.js that helps users manage both one-time and recurring expenses efficiently.

## Features

-   🔐 User Authentication (Sign up/Sign in)
-   💰 Track One-Time Expenses
-   🔄 Manage Recurring Expenses
-   📊 Dashboard View
-   🗓️ Smart Expense Date Tracking
-   🔒 Secure Password Encryption
-   📱 Responsive Web Interface

## Tech Stack

-   **Backend**: Node.js with Express.js
-   **Frontend**: EJS templating engine
-   **Database**: MongoDB (with Mongoose ODM)
-   **Caching**: Redis
-   **Session Management**: Express-session with MongoDB store
-   **Authentication**: JWT (JSON Web Tokens)
-   **Security**: Cookie Parser for secure cookie handling

## Prerequisites

Before running this application, make sure you have:

-   Node.js installed
-   MongoDB instance running
-   Redis server running
-   Environment variables configured

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
JWT_SECRET=your_jwt_secret
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/SMXTREME/ELXTREME
cd ELXTREME
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
node index.js
```

The application will be available at `http://localhost:3000` (or your configured PORT).

## Project Structure

```
├── controllers/          # Business logic
│   ├── getNextExpenseDate.js
│   ├── JWT.js
│   └── passwordEncription.js
├── middleware/          # Express middleware
│   └── isLogin.js
├── models/             # MongoDB models
│   ├── OneTimeExpense.js
│   ├── RecurringExpense.js
│   └── User.js
├── routes/             # Express routes
│   ├── dashboard.js
│   ├── index.js
│   ├── oneTimeExpense.js
│   ├── recurringExpense.js
│   ├── signin.js
│   └── signup.js
├── views/              # EJS templates
│   ├── dashboard.ejs
│   ├── home.ejs
│   ├── signin.ejs
│   ├── signup.ejs
│   └── viewExpense.ejs
├── public/            # Static files
├── index.js          # Application entry point
├── redis.js          # Redis configuration
└── vercel.json       # Vercel deployment configuration
```

## Features

### User Management

-   Secure user registration and authentication
-   Password encryption for security
-   JWT-based session management

### Expense Management

-   Add and manage one-time expenses
-   Set up recurring expenses with flexible intervals
-   View and track all expenses in a dashboard
-   Smart date calculation for recurring expenses

### Technical Features

-   MongoDB integration for data persistence
-   Redis caching for improved performance
-   Session management with MongoDB store
-   EJS templating for server-side rendering
-   Responsive design for mobile compatibility

## Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration file.

## License

ISC License

## Author

SMXTREME

---

For more information or support, please open an issue in the repository.
