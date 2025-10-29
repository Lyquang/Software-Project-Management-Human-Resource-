🧑‍💼 HR Management Website

Group Project for Software Project Management Course (Sep 2025 – Present)

🔗 Live Demo: https://software-project-management-human-r-nu.vercel.app/

🔗 Backend Repository: https://github.com/George9071/EMS

📘 Overview

This project is a Human Resource Management System (HRMS) built as part of the Software Project Management course.
It is a full-featured web application designed to streamline and automate various HR operations, including:

👥 Employee information management

🕒 Attendance and time tracking

💰 Payroll and benefits management

🧭 Department and project organization

💬 Internal communication and collaboration

The system provides separate Admin, Manager, and Employee interfaces, ensuring secure and efficient data management.

🏗️ Tech Stack
Frontend (Client – React + Vite)

Framework: React + Vite

Styling: TailwindCSS, SCSS

Libraries & Tools: Axios, React Router DOM, Lucide React, Day.js

Deployment: Vercel

Backend (Server – Java MVC)

Framework: Spring Boot (Java MVC pattern)

Database: MySQL

ORM: Hibernate / JPA

Cloud Services: Aiven (MySQL hosting), Render (API hosting)

API Tools: Postman, Swagger

DevOps: Azure DevOps for CI/CD pipelines

| Name                      | Role                                        | Responsibilities                                                                                               |
| ------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Lý Thanh Nhật Quang**   | *Product Owner (PO), Frontend Developer*    | Managed product backlog, prioritized features, designed Figma mockups, implemented admin & employee interfaces |
| **Nguyễn Võ Công Phương** | *Backend Developer*                         | Developed and maintained API services, database design, and integrations                                       |
| **Nguyễn Tuấn Phong**     | *Backend Developer, DevOps Engineer*        | Implemented CI/CD pipelines, backend logic, and deployment automation                                          |
| **Bùi Ngọc Diễm Quỳnh**   | *Frontend Developer*                        | Built reusable UI components, styling with TailwindCSS, and optimized responsiveness                           |
| **Nguyễn Quang Huy**      | *Frontend Developer, Business Analyst (BA)* | Designed UI flow, gathered requirements, and developed frontend logic                                          |
| **Trần Thanh Phúc**       | *Backend Developer, Scrum Master*           | Facilitated sprint meetings, managed progress tracking, and developed backend modules                          |
| **Nguyễn Quốc Kiệt**      | *Quality Control (QC)*                      | Wrote and executed test cases, ensured feature reliability and performance                                     |

🚀 Features
🧑‍💻 Employee Portal

View and update personal profile

View attendance and teaching schedule

Submit leave and overtime requests

Receive announcements and notifications

🧭 Admin Portal

Manage employee records, departments, and projects

Track attendance and payroll

Create and broadcast announcements

Approve/reject leave and overtime requests

🧩 System-Wide

Authentication and role-based access control

Pagination, filtering, and sorting

Real-time updates

Local data caching

| Role         | Username     | Password   |
| ------------ | ------------ | ---------- |
| **Admin**    | `admin`      | `admin`    |
| **Manager**  | `quangquang` | `12345678` |
| **Employee** | `tranbao`    | `12345678` |

⚙️ Installation & Setup
🧩 1. Clone Both Repositories

You need to clone both the frontend (React) and backend (Java MVC) projects.

# Frontend
git clone https://github.com/Lyquang/Software-Project-Management-Human-Resource
cd Software-Project-Management-Human-Resource
npm install
npm run dev

# Backend
git clone https://github.com/George9071/EMS
cd EMS
# Configure application.properties and run Spring Boot server

🧠 Notes

The project is intended for academic and learning purposes.

It demonstrates the full development lifecycle — from requirements analysis and UI design to DevOps deployment.

CI/CD pipelines are configured in Azure DevOps to automate builds and deployments.
