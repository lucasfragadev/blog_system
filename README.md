# API for Blog

RESTful API for a blog platform, developed with Node.js, TypeScript, and Express. The project follows a layered architecture, guided by best practices, and includes a complete authentication system using JSON Web Tokens (JWT).

## Technologies Used

-   **Backend:** Node.js, Express.js
-   **Language:** TypeScript
-   **Database:** MongoDB with Mongoose (ODM)
-   **Security:**
    -   `bcryptjs` for password hashing.
    -   `jsonwebtoken` for token-based authentication.
    -   `dotenv` for environment variable management.
    -   `cors` for enabling cross-origin requests.
-   **API Documentation:** Swagger/OpenAPI

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/seu-usuario/api_blog.git](https://github.com/seu-usuario/api_blog.git)
    cd api_blog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    -   Create a `.env` file at the root of the project.
    -   Add your environment variables, such as the JWT secret key and MongoDB URI.
    ```env
    MONGO_URI=mongodb://localhost:27017/blog_api
    JWT_SECRET=your_super_secret_and_hard_to_guess_key
    ```

## How to Run

*This project uses the following scripts in `package.json`:*

-   **Development Mode (with auto-reload):**
    ```bash
    npm run dev
    ```

-   **Production Mode:**
    ```bash
    # 1. Compile TypeScript code to JavaScript
    npm run build

    # 2. Start the server from compiled files
    npm start
    ```

## API Endpoints (Current)

### Public Routes

#### General
-   **`GET /`**
    -   **Description:** Welcome route. Returns an API status message.
    -   **Response (200 OK):** `{"message": "Welcome to the Blog API!"}`

#### Users
-   **`POST /users`**
    -   **Description:** Creates a new user.
    -   **Request Body (JSON):** `{"name": "...", "email": "...", "password": "..."}`
    -   **Response (201 Created):** Returns the new user object (with hashed password).

-   **`POST /login`**
    -   **Description:** Authenticates a user and returns a JWT token.
    -   **Request Body (JSON):** `{"email": "...", "password": "..."}`
    -   **Response (200 OK):** `{"token": "your_jwt_token_here"}`

#### Posts
-   **`GET /posts`**
    -   **Description:** Returns a list of all blog posts, with the most recent first. The post author is "populated" with name and email.
    -   **Response (200 OK):**
        ```json
        [
          {
            "_id": "68694bbb703b3369646f5457",
            "title": "My First Post",
            "content": "Post content...",
            "author": {
              "_id": "6868b78875c0d20eabc5b769",
              "name": "Author Name",
              "email": "author@example.com"
            },
            "createdAt": "...",
            "__v": 0
          }
        ]
        ```

-   **`GET /posts/:id`**
    -   **Description:** Fetches and returns a single post by its ID.
    -   **URL Parameters:** `id` - The ID of the post to be fetched.
    -   **Responses:**
        -   **200 OK:** Returns the found post object, with the author populated.
        -   **404 Not Found:** `{"message": "Post not found."}`

### Private Routes (Require Authentication)

*All private routes require an `Authorization` header in the format: `Authorization: Bearer YOUR_TOKEN_HERE`*

#### User Profile
-   **`GET /profile`**
    -   **Description:** Returns information about the logged-in user (contained in the token payload).
    -   **Response (200 OK):** `{"id": "...", "name": "...", "iat": ..., "exp": ...}`

#### Posts
-   **`POST /posts`**
    -   **Description:** Creates a new post for the authenticated user.
    -   **Request Body (JSON):** `{"title": "...", "content": "..."}` (The author is inferred from the token).
    -   **Response (201 Created):** Returns the newly created post object.

-   **`PUT /posts/:id`**
    -   **Description:** Updates an existing post. The user must be the author of the post.
    -   **URL Parameters:** `id` - The ID of the post to update.
    -   **Request Body (JSON):** `{"title": "...", "content": "..."}` (Fields are optional).
    -   **Responses:**
        -   **200 OK:** Returns the updated post object.
        -   **403 Forbidden:** `{"message":"Ação não autorizada."}`
        -   **404 Not Found:** `{"message":"Post não encontrado."}`

-   **`DELETE /posts/:id`**
    -   **Description:** Deletes an existing post. The user must be the author of the post.
    -   **URL Parameters:** `id` - The ID of the post to delete.
    -   **Responses:**
        -   **204 No Content:** Indicates successful deletion with no response body.
        -   **403 Forbidden:** `{"message":"Ação não autorizada."}`
        -   **404 Not Found:** `{"message":"Post não encontrado."}`