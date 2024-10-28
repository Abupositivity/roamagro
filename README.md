# RoamAgro

**RoamAgro** is a mobile-first web application designed to streamline the management of agribusinesses and create a digital marketplace that connects agroproducers, particularly farmers, directly with consumers. Built with a focus on accessibility, the platform offers functionalities like farm project management, a price index, a marketplace, and a community space for farmers to interact and stay informed.

## Table of Contents
- [Features](#features)
- [Project Architecture](#project-architecture)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Usage Guidelines](#usage-guidelines)
- [Folder Structure](#folder-structure)

## Features

- **Farm Project Management**: Add and manage various farm projects with relevant data.
- **Marketplace**: A digital marketplace for buying/selling agricultural products and equipment.
- **Community Forum**: Connect and interact with other farmers for tips and shared experiences.
- **Price Index**: Access real-time data on agricultural market trends and prices.
- **Multilingual Support**: Available in English and Hausa for accessibility.
- **Google Authentication**: Secure Google OAuth2 integration for easy sign-in.
- **Theme Mode**: Dark and light theme support to suit user preference.

---

## Project Architecture

RoamAgro follows a client-server architecture:
1. **Frontend**: Built with React, it uses Redux for state management and Material-UI for styling, focusing on a responsive and mobile-friendly experience.
2. **Backend**: Node.js with Express serves as the API layer, managing user authentication, CRUD operations for marketplace, farm projects, community posts, and the price index.
3. **Database**: MongoDB stores data related to users, projects, community posts, and marketplace items.
4. **Cache**: Redis provides caching for optimized data retrieval and user session handling.

### Tech Stack

- **Frontend**: React, Redux, Material-UI
- **Backend**: Node.js, Express, MongoDB, Redis
- **Authentication**: Google Identity Services, JWT
- **Development**: ESLint for linting, Babel for modern JavaScript compatibility

---

## Setup Instructions

### Prerequisites
- **Node.js** (v14 or later)
- **MongoDB** (Local or hosted)
- **Redis** (Optional, for caching)
- **Google Developer Console**: Create OAuth credentials for Google Authentication

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AbuPositivity/roamagro.git
   cd roamagro