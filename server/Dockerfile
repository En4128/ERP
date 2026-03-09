# -----------------------------------------------------
# Step 1: Choose the base image. 
# We use node:22-alpine because we need a modern Node version
# -----------------------------------------------------
FROM node:22-alpine

# -----------------------------------------------------
# Step 2: Set the folder inside the container where 
# our application will live.
# -----------------------------------------------------
WORKDIR /usr/src/app

# -----------------------------------------------------
# Step 3: Copy the package.json and package-lock.json 
# first. This is a Docker trick to cache dependencies!
# -----------------------------------------------------
COPY package*.json ./

# -----------------------------------------------------
# Step 4: Install all the backend dependencies 
# from the package.json.
# -----------------------------------------------------
RUN npm install

# -----------------------------------------------------
# Step 5: Copy the rest of the backend files from our 
# computer into the container.
# (.dockerignore will prevent node_modules from copying)
# -----------------------------------------------------
COPY . .

# -----------------------------------------------------
# Step 6: Expose the port that the Express server uses 
# (e.g., 5000). Important for networking.
# -----------------------------------------------------
EXPOSE 5000

# -----------------------------------------------------
# Step 7: Default command to start the server. 
# (In development, we will override this in docker-compose)
# -----------------------------------------------------
CMD ["npm", "start"]
