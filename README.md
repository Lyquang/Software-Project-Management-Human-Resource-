# 🧑‍💼 HR Management Website  
**Group Project for Software Project Management Course (Sep 2025 – Present)**  

🔗 **Live Demo:** [https://software-project-management-human-r-nu.vercel.app/](https://software-project-management-human-r-nu.vercel.app/)  
🔗 **Backend Repository:** [https://github.com/George9071/EMS](https://github.com/George9071/EMS)

---

## 📘 Overview  

This project is a **Human Resource Management System (HRMS)** built as part of the *Software Project Management* course.  
It is a full-featured web application designed to **streamline and automate various HR operations**, including:  

- 👥 Employee information management  
- 🕒 Attendance and time tracking  
- 💰 Payroll and benefits management  
- 🧭 Department and project organization  
- 💬 Internal communication and collaboration  

The system provides separate **Admin**, **Manager**, and **Employee** interfaces, ensuring secure and efficient data management.  

---

## 🏗️ Tech Stack  

### **Frontend (Client – React + Vite)**
- **Framework:** React + Vite  
- **Styling:** TailwindCSS, SCSS  
- **Libraries & Tools:** Axios, React Router DOM, Lucide React, Day.js  
- **Deployment:** Vercel  

### **Backend (Server – Java MVC)**
- **Framework:** Spring Boot (Java MVC pattern)  
- **Database:** MySQL  
- **ORM:** Hibernate / JPA  
- **Cloud Services:** Aiven (MySQL hosting), Render (API hosting)  
- **API Tools:** Postman, Swagger  
- **DevOps:** Azure DevOps for CI/CD pipelines  

---

## 👩‍💻 Project Members & Roles  

| Name | Role | Responsibilities |
|------|------|------------------|
| **Lý Thanh Nhật Quang** | *Product Owner (PO)* | Managed product backlog, prioritized features, developed employee/admin interfaces, designed Figma mockups, created use case diagrams |
| *(Add teammates here)* | *Developers / Testers / Scrum Master / BA* | *(Describe their contributions here)* |

---

## 🚀 Features  

### 🧑‍💻 **Employee Portal**
- View and update personal profile  
- View attendance and teaching schedule  
- Submit leave and overtime requests  
- Receive announcements and notifications  

### 🧭 **Admin Portal**
- Manage employee records, departments, and projects  
- Track attendance and payroll  
- Create and broadcast announcements  
- Approve/reject leave and overtime requests  

### 🧩 **System-Wide**
- Authentication and role-based access control  
- Pagination, filtering, and sorting  
- Real-time updates  
- Local data caching  

---

## 🔑 Test Accounts  

You can log in using the following demo credentials:

| Role | Username | Password |
|------|-----------|-----------|
| **Admin** | `admin` | `admin` |
| **Manager** | `quangquang` | `12345678` |
| **Employee** | `tranbao` | `12345678` |

---

## ⚙️ Installation & Setup  

### 🧩 1. Clone Both Repositories

You need to clone **both the frontend (React)** and **backend (Java MVC)** projects.  

```bash
# Frontend
git clone <this-repo-link>
cd <frontend-project-folder>

# Backend
git clone https://github.com/George9071/EMS
cd EMS
