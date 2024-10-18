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