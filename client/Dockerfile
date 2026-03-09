# -----------------------------------------------------
# Step 1: Use the official Node image as the foundation.
# -----------------------------------------------------
FROM node:22-alpine

# -----------------------------------------------------
# Step 2: Set the working directory inside the container.
# -----------------------------------------------------
WORKDIR /usr/src/app

# -----------------------------------------------------
# Step 3: Copy package files first to leverage Docker's 
# layer caching system for faster builds.
# -----------------------------------------------------
COPY package*.json ./

# -----------------------------------------------------
# Step 4: Install all front-end dependencies.
# -----------------------------------------------------
RUN npm install

# -----------------------------------------------------
# Step 5: Copy all remaining client code.
# -----------------------------------------------------
COPY . .

# -----------------------------------------------------
# Step 6: Expose Vite's default port.
# -----------------------------------------------------
EXPOSE 5173

# -----------------------------------------------------
# Step 7: Define the command to start Vite.
# We include --host so Vite accepts connections from 
# outside the container (like your host computer).
# -----------------------------------------------------
CMD ["npm", "run", "dev", "--", "--host"]
