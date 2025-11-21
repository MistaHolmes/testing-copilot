# Copilot-Testing

This project is a basic Express server built with TypeScript. It includes health check endpoints and implements graceful shutdown functionality.

## Project Structure

```
Copilot-Testing
├── src
│   ├── app.ts                # Initializes the Express application and sets up middleware
│   ├── server.ts             # Entry point for starting the server
│   ├── routes
│   │   └── health.ts         # Defines health check routes
│   ├── controllers
│   │   └── healthController.ts # Contains logic for health status responses
│   ├── middlewares
│   │   └── errorHandler.ts    # Middleware for error handling
│   ├── utils
│   │   └── shutdown.ts        # Handles graceful shutdown of the server
│   └── types
│       └── index.d.ts        # Custom types and interfaces
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
├── .gitignore                 # Files and directories to ignore by Git
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd Copilot-Testing
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Compile TypeScript**:
   ```
   npm run build
   ```

4. **Run the server**:
   ```
   npm start
   ```

## Usage

- The server will start and listen on the specified port.
- Health check endpoint can be accessed at `/health`.

## Graceful Shutdown

The server is configured to handle graceful shutdowns, ensuring that all connections are properly closed when the server is terminated.