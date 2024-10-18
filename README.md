# RoamAgro

RoamAgro is a digital platform designed to streamline the management of agribusinesses and create a direct connection between agroproducers, particularly farmers, and consumers. The platform supports project management tools, a marketplace for selling and advertising agricultural produce and equipment, localized price indexes, and a community space for discussions around agricultural practices and market trends. The app also supports multilingual functionality, focusing on Hausa and English speakers.

## Table of Contents
- [Overview](#overview)
- [Project Architecture](#project-architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage Guidelines](#usage-guidelines)
- [Contributing](#contributing)
- [License](#license)

## Overview

RoamAgro is developed to assist farmers in managing their agribusinesses, provide consumers with access to agro-products, and offer localized price information to facilitate decision-making. Key features include:

- **Farm Project Management:** A tool to help farmers organize and manage their farm projects.
- **Marketplace:** A digital marketplace for agricultural produce and equipment.
- **Price Index:** Provides real-time, location-specific price information for various crops and goods.
- **Community Forum:** A space for interaction, knowledge sharing, and collaboration.
- **Multilingual Support:** Available in both Hausa and English.

## Project Architecture

RoamAgro uses a modern, scalable architecture with separate frontend and backend layers:

### **Frontend** 
- **React.js**: The frontend is built using React for a dynamic, component-based UI.
- **Redux**: Used to manage the application state across components.
- **React Router**: Enables seamless navigation between different parts of the application.
- **Material-UI (MUI)**: Provides pre-built, responsive UI components for quick and consistent design.
- **i18n**: Provides internationalization support for multiple languages.
- **Axios**: Used for making HTTP requests to the backend APIs.

### **Backend** 
- **Node.js** and **Express.js**: Power the backend API server.
- **MongoDB**: A NoSQL database for storing user data, farm projects, marketplace entries, and more.
- **Redis**: Used for caching frequent requests to improve performance.
- **Passport.js**: Provides authentication support with Google OAuth for a seamless login experience.
- **JWT**: Secure authentication using JSON Web Tokens.

## Installation

Follow these steps to set up the RoamAgro project locally.

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local instance or MongoDB Atlas)
- **Redis** (local or cloud instance)
- **Git** (for version control)
- **npm** or **yarn** (for package management)

### Clone the Repository

To get started, clone the RoamAgro repository to your local machine:

```bash
git clone https://github.com/AbuPositivity/roamagro.git
cd roamagro

#Environment Variables

You need to set up environment variables for both the backend and frontend. Create .env files in the respective directories.

Backend .env File
Create a .env file in the backend directory:

```bash
cd backend
touch .env
Add the following environment variables:

```bash
MONGO_URI=mongodb://localhost:27017/roamagro
REDIS_URL=redis://localhost:6379
JWT_SECRET=yourSecretKey
GOOGLE_CLIENT_ID=yourGoogleClientId
GOOGLE_CLIENT_SECRET=yourGoogleClientSecret
SESSION_SECRET=yourSessionSecret
PORT=5000
Replace the placeholder values with your actual MongoDB URI, Redis URL, Google OAuth credentials, and session secret.

Frontend .env File
Create a .env file in the frontend directory:

```bash
cd ../frontend
touch .env
Add the following environment variable:

```bash
REACT_APP_API_URL=http://localhost:5000/api
This points the frontend to the backend's API.

## Running the Application

Once the environment variables are set up, you can run the application.

Backend Server
Start the backend server by running:

```bash
cd backend
npm start

The backend server will start on port 5000 (or the port you defined in the .env file).

Frontend Server
Start the frontend server by running:

```bash
cd ../frontend
npm start

The frontend server will run on port 3000 by default. Open a browser and navigate to http://localhost:3000 to view the application.

## Usage Guidelines

Here’s how you can use RoamAgro:

### User Registration/Login:
You can register and log in using Google OAuth.

###Farm Project Management:
From the dashboard, create, manage, and track farm projects.

### Marketplace:
Post and browse agricultural products and equipment for sale.

### Price Index:
View location-based, real-time price information for various crops.

### Community Forum:
Interact with other users in the community forum, sharing insights on agricultural practices.

### Multilingual Support:
Toggle between English and Hausa languages using the language switcher.

## Contributing

We welcome contributions to RoamAgro! To contribute:

Fork the repository to your GitHub account.
Clone the repository to your local machine:

```bash
git clone https://github.com/your-username/roamagro.git
Create a new branch for your feature or bugfix:

```bash
git checkout -b feature-name
Make your changes and commit them:

```bash
git commit -m "Add feature or fix description"
Push your branch to your forked repository:

```bash
git push origin feature-name

Submit a pull request from your branch to the main branch of the original repository.
Please ensure your code is clean and follows the project’s code style. Also, run the tests before submitting a pull request.

## Code Style Guidelines

ESLint is used for linting the code. Ensure there are no linting errors.
Prettier is used for code formatting. Make sure your code is formatted according to Prettier’s rules.

## License

RoamAgro is licensed under the MIT License. You are free to use, modify, and distribute this project under the terms of the license. See the LICENSE file for more details.

Thank you for using and contributing to RoamAgro! Feel free to open issues for bug reports or feature requests.



This version includes:

1. **Installation Instructions:** Detailed steps on how to clone the project, install dependencies, and set up the project locally.
2. **Environment Variables:** Clear instructions for creating `.env` files for both backend and frontend, including all required variables.
3. **Running the Application:** Steps to start both the backend and frontend servers.
4. **Usage Guidelines:** How to navigate the app and use its main features.
5. **Contributing:** A guide for contributors to fork, clone, branch, make changes, and submit pull requests.
6. **License:** License details for the project.

This README file will guide users and contributors on how to set up, run, and contribute to the RoamAgro project.