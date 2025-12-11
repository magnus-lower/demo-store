# Use a base image that includes both Maven and OpenJDK
FROM maven:3.8.4-openjdk-17-slim AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project file into the container
COPY pom.xml .

# Download Maven dependencies for offline use
RUN mvn dependency:go-offline -B

# Copy the rest of the project files into the container
COPY . .

# Build the application
RUN mvn package -DskipTests

# Start a new image based on OpenJDK to run the application
FROM eclipse-temurin:17-jdk-alpine

# Set the working directory in the final container
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/ecommerce-platform-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Define the command to start the application
ENTRYPOINT ["java","-jar","app.jar"]
