# 🧑‍💼 HR Management Website  
**Group Project for Software Project Management Course (Sep 2025 – Present)**  

🔗 **Live Demo:** [https://software-project-management-human-r-nu.vercel.app/](https://software-project-management-human-r-nu.vercel.app/)  

---

## 📘 Overview  

This project is a **Human Resource Management System (HRMS)** built as part of the *Software Project Management* course.  
It is a full-featured web application designed to **streamline and automate various HR operations**, including:  

- 👥 Employee information management  
- 🕒 Attendance and time tracking  
- 💰 Payroll and benefits management  
- 🧭 Department and project organization  
- 💬 Internal communication and collaboration  

The system provides separate **Admin** and **Employee** interfaces, ensuring secure and efficient data management.  

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
| **Lý Thanh Nhật Quang** | *Product Owner (PO)* | Managed the product backlog, prioritized features, developed employee and admin interfaces, designed UI mockups in Figma, and created use case diagrams |
| *(Add your teammates here)* | *Developers / Testers / Scrum Master / BA* | *(Describe their contributions here)* |

---

## 🚀 Features  

### 🧑‍💻 **Employee Portal**
- View and update personal information  
- Check attendance records and teaching schedules  
- Submit leave requests and overtime registrations  
- View notifications and announcements  

### 🧭 **Admin Portal**
- Manage employees, departments, and roles  
- Track attendance and payroll  
- Create and send announcements to staff  
- Approve or reject leave/overtime requests  

### 🧩 **System-Wide**
- Secure login & authentication  
- Pagination, search, and sorting for management tables  
- Real-time notifications  
- Local data caching for faster performance  

---

## ⚙️ Installation & Setup  

### 🧩 1. Clone Both Repositories

You need to clone **both the frontend (React)** and **backend (Java MVC)** projects.  

```bash
# Frontend
git clone <frontend-repo-link>
cd <frontend-project-folder>

# Backend
git clone <backend-repo-link>
cd <backend-project-folder>


cd frontend
npm install        # Install dependencies
npm run dev        # Start development server


