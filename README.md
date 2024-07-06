Zania Project Overview

## Project Structure

Frontend: Contains the user interface components and assets.
Backend: Contains the fastAPI APIs

To Run with Docker:

```sh
docker-compose up --build
```

## Setup Steps

1. Clone the Repository
   Clone the project repository from the Git repository.

2. Frontend Setup
   Navigate to the frontend directory.

Install dependencies:

```js
npm install
```

Start the frontend server:

```js
npm start
```

Access the frontend application at http://localhost:3000.

3. Backend Setup
   Navigate to the backend directory.

Install dependencies:

```py
pip3 install -r requirements.txt
```

Delete the existing db.sqlite3 file (if necessary):

```
rm db.sqlite3
```

Load the seed data into the database:

```py
python3 setup.py
```

Start the backend server:

```py
python3 -m uvicorn main:app --reload
```

This will run the app at the base URL (http://127.0.0.1:8000/)

Vist the API docs:
Swagger UI: http://127.0.0.1:8000/docs

4. Using the Application
   Interact with the frontend application to view and manage documents.
   Things to try on the frontend:

- Drag and drop the cards to rearrange them
- Click on a card to view the image in an overlay
- Close the overlay by clicking outside the image or pressing the ESC key
- Refresh the page to see the changes reflected in the frontend and the
- Check the backend APIs for CRUD operations on documents and to see how the cat positions are updated:

## Architectural Design Decisions:

Frotnend: The frontend is built using React and React Sortable.

I made the sure cards were dragaable only horizontally and vertically.
The useEffect hook also has a clean up function that runs when the component unmounts
Organised the code in a more modular way to make it easier to maintain and extend the frontend

Backend: The backend is built using FastAPI and Tortoise ORM. The following design decisions were made:

Database Layer: SQLite is used as the database layer becuase of how lightwieight and easy it is to scale SQLite these days

Pydantic Models: used for data validation and serialization primarly to reduce type errors and improve data integrity.

On data integerity
API Design Endpoints:

GET /v1/documents: Fetches all documents. This endpoint allows clients to retrieve a list of all documents.
GET /v1/documents/{document_id}: Fetches a single document by ID. This endpoint is used to retrieve specific documents by their unique identifier.
POST /documents: Creates a new document. This endpoint accepts document data and creates a new record in the database.
POST /v1/documents/bulk: Updates documents in bulk. This endpoint accepts a list of documents, deletes existing records with the same titles, and inserts the new data in a SINGLE transaction to ensure atomicity and rollback in case of integrity issues.

Oher possible crud endpoints:

GET /v1/documents/search: Searches for documents based on a search query. This endpoint allows clients to search for documents by title or type all which can be in the`query parameters` as so `?title=mytitle&type=mytype`
DELETE /v1/documents/{document_id}: Deletes a document by its unique ID, an example will be `DELETE /v1/documents/31`
PUT /v1/documents/{document_id}: Updates a document by its unique ID. An example will be `PUT /v1/documents/31 with the payload {"title": "newtitle"}`

Transaction Management:
In-Transaction Updates: The bulk update endpoint utilizes transactions to ensure that all updates are applied atomically. If any part of the update fails, the entire transaction is rolled back, maintaining data consistency and integrity.

HTTP Exceptions: Proper HTTP exceptions are raised for error conditions, such as 404 Not Found for non-existent documents. This ensures that clients receive meaningful error messages and can handle them appropriately.
Response Structure:

JSON Responses: All responses are formatted as JSON, making it easy for clients to parse and use the data

Comments on Specific Design Choices
Bulk Update Logic:
The initial approach to bulk updates involved deleting records and then inserting new ones. However, this approach was refined to handle unique constraints more effectively by performing deletions and insertions within a single transaction.

Error Handling for Unique Constraints: On the model I enforced unique constraints on the `position` field to make sure we don't have duplicate records using the same position.
