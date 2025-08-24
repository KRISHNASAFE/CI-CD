# Stage #: Build (optional if you have a build step)
# FROM node:18-alpine as builder
# WORKDIR /app
# COPY . .
# RUN npm install && npm run build

# Stage 1: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files (adjust path if you have a build step)
# If using build step: COPY --from=builder /app/dist /usr/share/nginx/html
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
