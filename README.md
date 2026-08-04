# 🥗 A&M Infinity Bites

A full-stack e-commerce and ordering platform built for **A&M Infinity Bites**, a food business specializing in fresh fruit salads, parfaits, and healthy treats.

The application combines a responsive customer-facing storefront with a Node.js REST API, PostgreSQL database, authentication, product management, order processing, and payment-related functionality.

---

## 🚀 Project Overview

A&M Infinity Bites was built as a complete digital platform rather than a static business website.

Customers can browse products, interact with a shopping cart, access their account dashboard, proceed through checkout, and place orders.

Behind the storefront is a REST API responsible for products, orders, authentication, database operations, and protected administrative functionality.

---

## ✨ Key Features

### 🛍️ Customer Storefront

* Dynamic product menu
* Product categories
* Product information and pricing
* Shopping cart
* Quantity tracking
* Checkout workflow
* Customer dashboard
* Responsive interface
* Business contact and social links

### 🔐 Authentication

* User authentication system
* Password hashing
* JWT-based authorization
* Protected API endpoints
* Authenticated administrative operations

### 📦 Product Management

The backend provides CRUD functionality for products:

* Create products
* Retrieve products
* Retrieve individual products
* Update products
* Delete products
* Product categories
* Product add-ons

Administrative product operations are protected through authentication middleware.

### 🛒 Order Management

The platform supports order creation and management, including:

* Customer details
* Delivery address
* Ordered items
* Order amount
* Payment method
* Payment reference
* Order status
* Order creation timestamps

Protected endpoints allow authorized users to retrieve and update order information.

### 💳 Payment Integration

The backend includes infrastructure for **Paystack** payment processing using protected environment configuration.

### 📧 Email Infrastructure

Nodemailer is integrated into the backend to support application email functionality.

Sensitive email credentials are loaded through environment variables rather than being hard-coded into the application.

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* Browser Local Storage

### Backend

* Node.js
* Express.js
* REST API
* JWT
* bcrypt
* Axios
* Nodemailer

### Database

* PostgreSQL
* SQL

### Development & Deployment

* Git
* GitHub
* GitHub Pages
* Environment Variables
* Nodemon

---

## 🏗️ Architecture

```text
Customer
   │
   ▼
Frontend Application
HTML / CSS / JavaScript
   │
   │ REST API Requests
   ▼
Node.js + Express API
   │
   ├── Authentication
   ├── Products
   ├── Orders
   ├── Payments
   └── Email Services
   │
   ▼
PostgreSQL Database
```

---

## 📁 Project Structure

```text
am-infinity-bites/
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── checkout.html
│   ├── stylesheet/
│   ├── script/
│   ├── images/
│   └── logo/
│
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── auth.js
│   ├── middleware.js
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## ⚙️ Running the Project Locally

Clone the repository:

```bash
git clone https://github.com/movffasea-byte/am-infinity-bites.git
```

Enter the repository:

```bash
cd am-infinity-bites
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create a `.env` file containing the required development environment variables.

Example:

```env
PORT=3000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET=your_paystack_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
FRONTEND_URL=your_frontend_url
```

> Never commit real API keys, passwords, payment secrets, or database credentials to GitHub.

Start the development server:

```bash
npm run dev
```

Or run the production command:

```bash
npm start
```

---

## 🔌 API Examples

The backend provides endpoints for resources including:

```text
GET     /products
GET     /products/:id
POST    /products
PUT     /products/:id
DELETE  /products/:id

GET     /api/addons

POST    /orders
GET     /orders
PUT     /orders/:id/status
```

Protected endpoints require valid authentication.

---

## 🧠 Engineering Concepts Demonstrated

This project demonstrates practical experience with:

* Full-stack application development
* REST API design
* Client/server architecture
* PostgreSQL integration
* SQL queries
* CRUD operations
* Authentication and authorization
* JWT
* Password hashing
* API middleware
* Asynchronous JavaScript
* Shopping-cart logic
* Checkout workflows
* Order management
* Payment integration
* Environment configuration
* Email services
* Error handling
* Responsive frontend development
* Git and GitHub version control

---

## 🔒 Security

Sensitive configuration is managed through environment variables.

Production secrets such as database credentials, JWT secrets, payment keys, and email credentials should never be committed to the repository.

---

## 🔗 Related Project

### A&M Infinity Bites Admin Dashboard

The administration interface is maintained separately:

**`am-infinity-bites-admin`**

It provides administrators with dedicated product, order, and business-management functionality.

---

## 🔮 Future Improvements

* Automated testing
* Improved accessibility
* Enhanced payment verification
* Order notifications
* Advanced customer order tracking
* Product search and filtering
* Analytics
* Improved API validation
* CI/CD workflow
* Expanded security controls

---

## 👨‍💻 Developer

**Gaba Abraham**

Full-Stack Developer / Software Engineer

GitHub: **@movffasea-byte**

---

## 📄 Project Status

A&M Infinity Bites is an actively developed portfolio and business application demonstrating end-to-end web application development.

---

⭐ If you find the project interesting, consider starring the repository.
