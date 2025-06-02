# dynamic-web-final-project
Final Project for dynamic web programming class


FlyTicket

FlyTicket is a full‐stack flight ticket booking system built with an Express/Node.js backend (SQLite database, JWT authentication) and a Next.js/Bootstrap frontend. Users can search flights, select seats, and book tickets, while administrators can manage flights (create, update, delete) via a protected dashboard.

⸻

Features
•	User-Facing
•	Search flights by origin, destination, and date
•	View flight details (departure, arrival, price, seats available)
•	Select a seat and complete booking with passenger information
•	Receive on-screen confirmation with Ticket ID and flight summary
•	Admin-Facing
•	Secure login (JWT-based) for administrators
•	Dashboard listing all flights
•	Create new flights (automatic seat generation)
•	Edit existing flights (with scheduling and seat-count checks)
•	Delete flights (cascading removal of related seats and tickets)
•	Data Integrity & Security
•	SQLite with foreign keys and ON DELETE CASCADE rules
•	Business rules enforced in backend (no overlapping departure/arrival hours, no overbooking)
•	Passwords hashed with bcrypt
•	JWT authentication middleware protecting admin routes

⸻

Prerequisites
•	Node.js >= 18.x and npm >= 9.x
•	Git (≥ 2.x)
•	(Optional) A code editor (Visual Studio Code, WebStorm, etc.)

⸻

Installation
1.	Clone the repository

git clone https://github.com/okancaglar/dynamic-web-final-project.git
cd dynamic-web-final-project


	2.	Install dependencies
All backend and frontend packages are listed in package.json. To install them, run:

npm install


	3.	Environment Variables
No additional environment variables are required for this demo—all secrets (e.g., the admin seed password) are handled in code.
•	If you want to change the default admin credentials or JWT secret, you can modify src/helpers/auth.js (or wherever the JWT secret is defined) before starting the server.
4.	Database Initialization & Seeding
On first startup, the SQLite database file (FlightTicket.sqlite) will be created automatically, and migrations will run to create all tables (City, Flight, Seat, Ticket, User).
•	The 81 Turkish cities are seeded into City.
•	A default administrator is seeded with:
•	Email: admin@test.com
•	Password: admin123
•	You do not need to run any manual seeding steps; this happens on server start.

⸻

Running the Application
1.	Start the Backend & Frontend
In the project root, execute:

npm run dev

	•	This concurrently starts:
	•	An Express server (on http://localhost:4000 by default) handling all API endpoints and JWT authentication.
	•	A Next.js development server (on http://localhost:3000) serving the frontend SPA.
	•	If you need to run them separately, see the scripts below.

	2.	Available npm Scripts
	•	npm run dev
	•	Launches the development environment: Express backend + Next.js frontend.
	•	npm run start
	•	Builds the Next.js app (next build) and starts the production server (next start), assuming you have already seeded the database.
	•	npm run build
	•	Builds the Next.js frontend for production.
	•	npm run lint
	•	Runs ESLint across the codebase (both frontend and backend).
	3.	Access the App
	•	Frontend (Next.js): http://localhost:3000
	•	User search and booking flows
	•	Admin login and dashboard
	•	Backend (Express API): http://localhost:4000/api/...
	•	Example endpoints:
	•	GET /api/cities
	•	GET /api/flights
	•	POST /api/users/login
	•	POST /api/tickets
	•	etc.
	4.	Default Admin Login
	•	Go to http://localhost:3000/admin/login
	•	Use:
	•	Email: admin@test.com
	•	Password: admin123

⸻

Dependencies

Below is the list of production‐ and development‐dependencies used by FlyTicket. The backend packages power the Express server, authentication, and SQLite database; the frontend packages power the Next.js application and styling.

Backend Dependencies
•	bcryptjs 3.0.2
Hashing passwords securely for user authentication.
•	cookie-parser 1.4.7
Parsing HTTP cookies (used to read JWT from an HTTP-only cookie).
•	cors 2.8.5
Enabling Cross-Origin Resource Sharing (CORS) for API calls from Next.js.
•	express 5.1.0
The web framework that powers RESTful API endpoints.
•	jsonwebtoken 9.0.2
Creating and verifying JWT tokens for stateless authentication.
•	nodemailer 7.0.3
(Optional) Sending transactional emails (e.g., future e-ticket emails).
•	sqlite3 5.1.7
A file-based SQL database for lightweight persistence (city, flight, seat, ticket, user tables).

Frontend Dependencies
•	next 15.3.3
The React-based framework for server-rendered and statically generated pages (App/Pages Router).
•	react 19.1.0
UI library used by Next.js to build components.
•	react-dom 19.1.0
Rendering React components to the browser DOM.
•	bootstrap 5.3.6
CSS framework for responsive, mobile-first styling.

Dev & Linter Dependencies
•	eslint 9.27.0
JavaScript linter to enforce code style and catch errors early.
•	eslint-config-next 15.3.3
Next.js–specific ESLint rules and configurations.
•	@eslint/eslintrc 3.3.1
Core ESLint configuration package.
•	jose 6.0.11
(Optional) Utility library for advanced JWT/JWK operations (not strictly required).
•	@emnapi/runtime 1.4.3 (extraneous)
Appeared during install; not directly used by this project.

⸻

Installation Checklist
1.	Ensure you have Node.js and npm installed

node --version     # should be ≥ 18.x
npm --version      # should be ≥ 9.x


	2.	Clone and install

git clone https://github.com/okancaglar/dynamic-web-final-project.git
cd dynamic-web-final-project
npm install


	3.	Run the development servers

npm run dev

	•	Express API → http://localhost:4000
	•	Next.js Front → http://localhost:3000

	4.	Log in as admin
	•	Visit: http://localhost:3000/admin/login
	•	Email: admin@test.com   Password: admin123

⸻

Usage
•	Search & Book Flights (End User)
1.	Visit http://localhost:3000.
2.	Select “From City,” “To City,” and “Date.”
3.	Click “Search” to see available flights.
4.	Click “Book Now” on a flight, fill in passenger details, choose a seat, and confirm.
•	Admin Dashboard
1.	Go to http://localhost:3000/admin/login.
2.	Enter default admin credentials.
3.	On success, you land on /admin/dashboard, where you can:
•	View all flights
•	Add a new flight (automatically generates seats)
•	Edit or delete existing flights

⸻

Future Improvements
•	Implement a refresh-token flow to keep admins logged in longer without sacrificing security.
•	Migrate from SQLite to PostgreSQL or MySQL for horizontal scalability.
•	Add WebSocket support for real-time seat availability updates.
•	Build a dynamic seat-map UI instead of a dropdown.
•	Send email confirmations (using Nodemailer) after a successful booking.
•	Add unit/integration tests and set up a CI/CD pipeline (GitHub Actions, Travis CI, etc.).

⸻

License

This project is provided for educational purposes under the MIT License. See LICENSE for details.

⸻

Developed as the final assignment for CENG-3502: Dynamic Web Programming.