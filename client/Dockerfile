# Use an official Node.js image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all application files into the container
COPY . .

# Expose port 3000 for the Vite development server
EXPOSE 5173

# Start the Vite development server (React)
CMD ["npm", "run", "dev"]