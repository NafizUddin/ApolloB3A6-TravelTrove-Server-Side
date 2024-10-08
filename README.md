# :ledger: Project: TravelTrove Server

**Project Name:** TravelTrove Server

**Project Task:** Building the backend for a "Travel Tips & Destination Guides" platform.

**Project Motive:** to build an engaging community of travel enthusiasts, enabling users to share their personal travel stories, exchange valuable tips, and interact with fellow travelers.

## :computer: Server Live Link

Click here to see the Backend Server Live Link: [https://traveltrove-server.vercel.app/](https://traveltrove-server.vercel.app/)

## :keyboard: Technologies

- TypeScript
- Express
- Mongoose
- axios
- nodeMailer
- Zod
- dotenv
- http-status
- eslint
- prettier
- vercel


## :link: How to run the application locally

### :arrow_forward: Step 1: Clone the Repository

Firstly, we have to clone the repository to our local machine using Git.

```node
git clone <repository-url>
```

### :arrow_forward: Step 2: Navigate to the Project Directory

We need to navigate to the cloned repository directory.

```node
cd <repository-name>
```

### :arrow_forward: Step 3: Install Dependencies

Then we have to install the project's dependencies using npm.

```node
npm install
```

This command reads the package.json file in the project directory and installs all the required packages from the npm registry. With this command, node_modules will be installed.

### :arrow_forward: Step 4: Set up the `.env` File

Next, we will create a .env file in the root directory of our project. This file will hold the environment variables. `.env` file will look like this:

```node
PORT=5000
DATABASE_URL=mongodb://localhost:27017/mydatabase
```

We need to ensure that these variables are correctly referenced in our application, typically in a configuration file which is under `./src/config` folder named as `index.ts`.

### :arrow_forward: Step 5: Start the Server

To run our Express.js application, we will use the following command:

```node
npm run start:dev
```

In our package.json file, we have a script defined as `npm run start:dev` to run the server.

```node
"scripts": {
    "start:dev": "ts-node-dev --respawn --transpile-only ./src/server.ts",
    "start:prod": "node ./dist/server.js",
    //...more scripts
  }
```

### :arrow_forward: Step 6: Access the Application

Once the server is running, we can access the application by navigating to `http://localhost:<port>` in web browser. We have to replace the `<port>` with the port number specified in the .env file.

---

So, these are the steps to run an expressJs application locally.
