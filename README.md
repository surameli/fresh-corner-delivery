# Fresh Corner Delivery

Fresh Corner Delivery is a full-stack food and grocery delivery platform that allows customers to browse products, place orders, make online payments, and track deliveries.

## Features

* User registration and login
* Browse and search products
* Shopping cart
* Address management
* Order creation and management
* Chapa payment integration
* Payment verification
* Order status tracking
* Delivery partner management
* Delivery location updates
* Admin order management

## Tech Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma
* PostgreSQL

### Payment

* Chapa

## Project Structure

```text
fresh-corner-delivery/
├── client/
└── server/
```

## User Roles

### Customer

* Browse products
* Manage cart
* Place orders
* Make payments
* Track orders

### Delivery Partner

* View assigned deliveries
* Update delivery status
* Update delivery location

### Admin

* Manage products
* Manage orders
* Manage users
* Assign delivery partners
* Monitor deliveries

## Payment Flow

1. Customer creates an order.
2. Backend initializes a Chapa payment.
3. Customer is redirected to the Chapa checkout page.
4. Customer completes the payment.
5. Payment is verified by the backend.
6. The order is updated after successful payment.

## Live Application

### Frontend

[Fresh Corner Delivery](https://fresh-corner-delivery.vercel.app/)

### Backend API

[Fresh Corner Delivery Server](https://fresh-corner-delivery-server.vercel.app)

## Project Status

🚀 **Deployed**

The project is currently deployed and actively being developed and improved.

