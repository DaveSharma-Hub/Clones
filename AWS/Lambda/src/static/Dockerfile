
            FROM node:20
            FROM null

            WORKDIR /app

            COPY package*.json ./

            RUN npm ci --only=production
            COPY . .

            # Expose the port the app runs on
            EXPOSE 8200

            # Command to run the application
            CMD ["npm", "start"]
        