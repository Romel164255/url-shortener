URL Shortener Web Application

A full-stack web application that converts long URLs into short, shareable links.
The system generates unique short codes for URLs and stores them in a database. When users access the short link, the server retrieves the original URL and redirects them automatically.

This project demonstrates backend API development, server-side routing, database integration, and HTTP redirection using Node.js and Express.

Live Demo

Frontend
https://url-shortener-taupe-gamma.vercel.app

Repository
https://github.com/Romel164255/url-shortener

Features

Convert long URLs into short links

Automatic redirection to the original URL

Unique short code generation

Database storage for URL mapping

REST API for URL creation and retrieval

Clean and simple user interface

Tech Stack
Frontend

HTML

CSS

JavaScript

EJS (server-side rendering)

Backend

Node.js

Express.js

REST APIs

Database

PostgreSQL

Tools

Git

GitHub

Vercel (deployment)

Project Structure
url-shortener
│
├── controllers
├── routes
├── models
├── views
├── public
├── database
├── server.js
└── README.md
Installation
1 Clone the Repository
git clone https://github.com/Romel164255/url-shortener.git
cd url-shortener
2 Install Dependencies
npm install
3 Environment Variables

Create a .env file in the project root.

Example:

PORT=5000
DATABASE_URL=your_postgresql_connection
Run the Application

Start the server

npm start

The application will run at

http://localhost:5000
API Endpoints
Create Short URL
POST /api/shorten

Request body

{
"url": "https://example.com/very/long/url"
}

Response

{
"shortUrl": "http://localhost:5000/abc123"
}
Redirect to Original URL
GET /:shortCode

Example

GET /abc123

The server will redirect to the stored original URL.

Get All URLs
GET /api/urls

Returns a list of all shortened URLs stored in the database.

Delete URL
DELETE /api/urls/:id

Deletes a shortened URL from the database.

Example Workflow

User enters a long URL in the application.

Server generates a unique short code.

Short code and original URL are stored in the database.

User receives a shortened link.

When the link is accessed, the server redirects to the original URL.

Future Improvements

Custom short URLs

Click analytics

QR code generation

User authentication

Link expiration feature

Author

Romel Augustine Fernandez

GitHub
https://github.com/Romel164255

LinkedIn
https://linkedin.com/in/romel-augustine-fernandez-775a643aa
