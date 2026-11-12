# Workspace Booking System

Full-stack web application for booking office desks and meeting rooms with real-time floor plan availability, conflict prevention, and role-based access control.

## Tech Stack

- **Backend:** ASP.NET Core Web API (.NET), Entity Framework Core
- **Database:** PostgreSQL (Docker)
- **Frontend:** React, Vite, CSS3

## Features

- **User Authentication & Roles:** Registration and login with role separation (`Admin` and `User`). Registering with an email starting with `admin@` (e.g., `admin@admin.com`) automatically grants administrator privileges.
- **Interactive Floor Plan:** Visual grid of workspaces showing real-time availability (`Available` / `Occupied`) for the selected date and time slot.
- **Collision Validation:** Backend validation prevents overlapping bookings for the same workspace.
- **Admin Management Panel:** Administrators can add or remove workspaces directly from the UI and cancel any active booking.

## Getting Started

### Prerequisites
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Start the Database
Start Docker Desktop and run the PostgreSQL container from the project root:
```bash
docker compose up -d
```

### 2. Run the Backend API
Apply the database migrations and start the ASP.NET Core server:
```bash
dotnet ef database update
dotnet run
```
The API will start on `http://localhost:5084` (Swagger UI is available at `http://localhost:5084/swagger`).

### 3. Run the Frontend Client
Open a new terminal window and run:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
