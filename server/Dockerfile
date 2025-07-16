FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install

# Copy all application files into the container
COPY . .

# Expose port 3000 for the NestJS development server
EXPOSE 3000

# Start the NestJS development server
CMD ["npm", "run", "start:dev"]