# Start with a base image containing Java runtime
FROM openjdk:17-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project file and download dependencies
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy the entire project into the container
COPY . ./

# Build the application
RUN mvn package -DskipTests

# Expose port 8080 to the outside world
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "target/ecommerce-platform-0.0.1-SNAPSHOT.jar"]
