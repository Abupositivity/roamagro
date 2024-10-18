# RoamAgro

RoamAgro is a mobile-first platform designed to facilitate efficient management of agribusinesses and establish an easy-to-use digital marketplace. The platform connects farmers directly with consumers, offering farm management tools, community interactions, a localized price index, and a marketplace for buying and selling agricultural products.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Usage Guidelines](#usage-guidelines)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

RoamAgro is a full-stack web application that streamlines agricultural management and brings agricultural products closer to consumers. It features tools for managing farm projects, a price index for real-time agricultural prices, and a community platform for sharing trends and agricultural practices.

### Core Objectives

- Help farmers manage their projects effectively.
- Enable consumers to directly connect with farmers.
- Provide real-time price updates based on location.
- Promote agricultural practices through a community-driven platform.
- Support multilingual functionality, targeting Hausa and English speakers in Africa.

---

## Features

- **Farm Project Management**: Track, manage, and update farm projects.
- **Marketplace**: A platform for buying and selling agricultural products.
- **Price Index Tool**: Real-time, location-specific agricultural price updates.
- **Community Interaction**: A forum for sharing agricultural practices and trends.
- **Authentication**: JWT authentication and Google OAuth.
- **Dark Mode**: Supports dark and light themes.
- **Multilingual**: Supports English and Hausa languages.

---

## Project Architecture

RoamAgro is structured into two main components:

### Frontend

- **React.js** for building a dynamic user interface.
- **Redux** for state management.
- **React Router** for navigation.
- **Material-UI (MUI)** for UI components.
- **i18n** for internationalization support (English, Hausa).
- **CSS Modules** and **MUI Themes** for custom styles and theme support (light/dark modes).

### Backend

- **Node.js** and **Express.js** for handling API requests and server logic.
- **MongoDB** for storing user data, farm projects, and marketplace entries.
- **Redis** for caching and performance improvement.
- **JWT & OAuth2** for secure authentication.
- **Passport.js** for Google OAuth integration.

---

## Tech Stack

### Frontend:
- **React.js**
- **Redux**
- **React Router**
- **Material-UI (MUI)**
- **i18n**
  
### Backend:
- **Node.js**
- **Express.js**
- **MongoDB**
- **Redis**
- **Passport.js** for OAuth
- **JWT** for token-based authentication
  
### Deployment:
- **Heroku** or **AWS** for cloud hosting.
- **ESLint** for code linting and formatting.

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or above)
- [MongoDB](https://www.mongodb.com/try/download/community) (MongoDB Atlas for cloud hosting)
- [Redis](https://redis.io/download) (for local caching)
- [Git](https://git-scm.com/)
- A cloud hosting service like [Heroku](https://www.heroku.com/) or [AWS](https://aws.amazon.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Abupositivity/roamagro.git
   cd roamagro
