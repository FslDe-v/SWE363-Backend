# SWE363 Backend Project

This is the backend service for the SWE363 project, providing APIs for user authentication, profile management, event handling, and user listing (for staff).

## Features

*   User Sign Up & Sign In (JWT Authentication)
*   Profile Management (View & Update)
*   Event Listing & Enrollment
*   Staff-only User Listing
*   MongoDB Integration with Mongoose

## Prerequisites

*   Node.js (v14 or later recommended)
*   npm or yarn
*   MongoDB instance (local or cloud-based like MongoDB Atlas)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/FslDe-v/SWE363-Backend
    cd SWE363-Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variables:
    ```env
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret_key>
    ```
    *   `MONGO_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A strong secret key for signing JWT tokens.

4.  **Start the server:**
    ```bash
    npm start
    ```
    The server will typically run on `http://localhost:54321` (or the port specified in `server.js` if changed).

## API Documentation

The base URL for all API endpoints is `/api`. Authentication is handled via JWT Bearer tokens sent in the `Authorization` header.

### Health Check

*   **GET /health**
    *   **Description:** Checks if the server is running.
    *   **Auth:** Public
    *   **Response:**
        ```json
        {
          "status": "ok",
          "timestamp": 1678886400000
        }
        ```

### Authentication (`/api/auth`)

*   **POST /signup**
    *   **Description:** Registers a new user.
    *   **Auth:** Public
    *   **Request Body:**
        ```json
        {
          "fullName": "Test User",
          "email": "test@example.com",
          "studentId": "s202012345",
          "password": "password123",
          "accountType": "student" // or "staff"
        }
        ```
    *   **Response (Success 201):**
        ```json
        {
          "message": "User created successfully"
        }
        ```
    *   **Response (Error 400/500):**
        ```json
        {
          "message": "Email or Student ID already exists" // or other error messages
        }
        ```

*   **POST /signin**
    *   **Description:** Logs in a user and returns a JWT token.
    *   **Auth:** Public
    *   **Request Body:**
        ```json
        {
          "email": "test@example.com",
          "password": "password123"
        }
        ```
    *   **Response (Success 200):**
        ```json
        {
          "message": "Login successful",
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "accountType": "student",
          "fullName": "Test User",
          "email": "test@example.com",
          "studentId": "s202012345",
          "interests": { "category1": 5, "category2": 3 } // Example interests
        }
        ```
    *   **Response (Error 400):**
        ```json
        {
          "message": "Invalid email or password"
        }
        ```

### Profile (`/api/profile`)

*   **GET /**
    *   **Description:** Gets the profile details of the currently logged-in user.
    *   **Auth:** Private (Requires Bearer Token)
    *   **Response (Success 200):**
        ```json
        {
          "_id": "605c72...",
          "fullName": "Test User",
          "email": "test@example.com",
          "studentId": "s202012345",
          "accountType": "student",
          "interests": { "category1": 5, "category2": 3 }
        }
        ```
    *   **Response (Error 401/404):**
        ```json
        { "message": "Not authorized, token failed" } // or "User not found"
        ```

*   **PUT /update**
    *   **Description:** Updates the profile details of the currently logged-in user.
    *   **Auth:** Private (Requires Bearer Token)
    *   **Request Body (Include only fields to update):**
        ```json
        {
          "name": "Updated Test User",
          "email": "updated.test@example.com", // Optional
          "studentId": "s202098765", // Optional
          "interestRatings": { "category1": 4, "category3": 5 } // Optional
        }
        ```
    *   **Response (Success 200):**
        ```json
        {
          "_id": "605c72...",
          "fullName": "Updated Test User",
          "email": "updated.test@example.com",
          "studentId": "s202098765",
          "accountType": "student",
          "interests": { "category1": 4, "category3": 5 }
        }
        ```
    *   **Response (Error 400/401/404/500):**
        ```json
        { "message": "Email already exists" } // or other error messages
        ```

### Events (`/api/events`)

*   **GET /**
    *   **Description:** Gets a list of all available events.
    *   **Auth:** Public
    *   **Response (Success 200):**
        ```json
        [
          {
            "_id": "605c73...",
            "title": "Tech Talk",
            "date": "2024-12-01",
            "time": "14:00",
            "location": "Building 59",
            "participants": 15,
            "imageUrl": "http://example.com/image.jpg",
            "tags": ["tech", "seminar"],
            "enrolled": ["605c72...", "605c74..."] // Array of User ObjectIds
          },
          // ... more events
        ]
        ```

*   **GET /enrolled**
    *   **Description:** Gets a list of events the currently logged-in user is enrolled in.
    *   **Auth:** Private (Requires Bearer Token)
    *   **Response (Success 200):** (Similar structure to `GET /`, but filtered)
        ```json
        [
          {
            "_id": "605c73...",
            "title": "Tech Talk",
            // ... other event details
            "enrolled": ["605c72...", "605c74..."]
          }
          // ... only events the user is enrolled in
        ]
        ```
    *   **Response (Error 401):**
        ```json
        { "message": "Not authorized, no token" } // or "Invalid token"
        ```

*   **POST /:id/enroll**
    *   **Description:** Toggles the enrollment status (enrolls if not enrolled, unenrolls if enrolled) for the specified event for the currently logged-in user. `:id` is the Event ObjectId.
    *   **Auth:** Private (Requires Bearer Token)
    *   **Response (Success 200):**
        ```json
        {
          "enrolled": true // true if the user is now enrolled, false if unenrolled
        }
        ```
    *   **Response (Error 401/404):**
        ```json
        { "message": "Not authorized, no token" } // or "Event not found"
        ```

### Users (`/api/users`)

*   **GET /**
    *   **Description:** Gets a list of all users (excluding passwords).
    *   **Auth:** Private / Staff Only (Requires Bearer Token from a user with `accountType: 'staff'`)
    *   **Response (Success 200):**
        ```json
        [
          {
            "_id": "605c72...",
            "fullName": "Test User",
            "email": "test@example.com",
            "studentId": "s202012345",
            "accountType": "student",
            "interests": { "category1": 5 }
          },
          {
            "_id": "605c75...",
            "fullName": "Staff Member",
            "email": "staff@example.com",
            "studentId": "staff001",
            "accountType": "staff",
            "interests": {}
          }
          // ... more users
        ]
        ```
    *   **Response (Error 401/403/500):**
        ```json
        { "message": "Not authorized, staff only" } // or other auth/server errors
        ```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE) <!-- Optional: Add a LICENSE file if applicable -->
