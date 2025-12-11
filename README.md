# E-Commerce Platform

This is a full-stack e-commerce web application I built using Spring Boot and modern web technologies. It includes user authentication, a product catalog, shopping cart functionality, and order processing - basically everything you'd expect from an online store!

## What It Does

### Main Features
- **Product Catalog**: Users can browse and search through different products organized by categories
- **User Authentication**: People can sign up and log in securely using JWT tokens
- **Shopping Cart**: Add items to cart, remove them, and keep track of what you want to buy
- **Order Management**: Complete the checkout process and track your orders
- **Responsive Design**: Works on both desktop and mobile devices

### Cool Technical Stuff
- **RESTful API**: Built a proper REST API with all the right HTTP methods and status codes
- **JWT Security**: Used JSON Web Tokens for secure authentication
- **Session Management**: Your shopping cart stays even if you close the browser
- **Input Validation**: Made sure users can't break things with bad input
- **Error Handling**: When something goes wrong, users get helpful error messages

## Technologies I Used

### Backend
- **Java 17**: The main programming language
- **Spring Boot 3.3.2**: Makes building Java web apps way easier
- **Spring Security**: Handles all the authentication stuff
- **Spring Data JPA**: Makes database operations simple
- **H2 Database**: An in-memory database that's perfect for development
- **Maven**: Manages dependencies and builds the project
- **JWT (JSON Web Tokens)**: How users stay logged in

### Frontend
- **HTML5/CSS3**: The basics for structure and styling
- **JavaScript (ES6+)**: Makes the website interactive
- **Font Awesome**: For nice-looking icons
- **CSS Grid/Flexbox**: Modern layout techniques for responsive design

## How the Code is Organized

Here's how I structured the project - it follows standard Spring Boot conventions:

```
src/
├── main/
│   ├── java/com/example/ecommerce/
│   │   ├── ECommercePlatformApplication.java
│   │   │
│   │   ├── application/          
│   │   │   ├── service/
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── CartService.java
│   │   │   │   └── OrderService.java
│   │   │   └── session/
│   │   │       └── CartStoragePort.java
│   │   │
│   │   ├── domain/              
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Product.java
│   │   │   │   ├── Order.java
│   │   │   │   └── OrderItem.java
│   │   │   ├── exception/
│   │   │   │   ├── ProductNotFoundException.java
│   │   │   │   └── InsufficientStockException.java
│   │   │   └── repository/
│   │   │       ├── UserRepository.java
│   │   │       ├── ProductRepository.java
│   │   │       └── OrderRepository.java
│   │   │
│   │   ├── infrastructure/      
│   │   │   ├── bootstrap/
│   │   │   │   └── ProductDataInitializer.java
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── security/
│   │   │   │   ├── JwtUtil.java
│   │   │   │   ├── JwtFilter.java
│   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   └── session/
│   │   │       ├── CartStorageFactory.java
│   │   │       └── HttpSessionCartStorageFactory.java
│   │   │
│   │   └── web/                 
│   │       ├── auth/
│   │       │   ├── AuthController.java
│   │       │   └── dto/
│   │       │       ├── LoginRequestDto.java
│   │       │       ├── RegisterRequestDto.java
│   │       │       └── AuthResponseDto.java
│   │       │
│   │       ├── cart/
│   │       │   ├── CartController.java
│   │       │   └── dto/
│   │       │       └── CartItemDto.java
│   │       │
│   │       ├── order/
│   │       │   ├── CheckoutController.java
│   │       │   ├── OrderController.java
│   │       │   └── dto/
│   │       │       ├── CheckoutRequestDto.java
│   │       │       └── OrderResponseDto.java
│   │       │
│   │       ├── product/
│   │       │   └── ProductController.java
│   │       │
│   │       ├── health/
│   │       │   └── HealthController.java
│   │       │
│   │       └── exception/
│   │           └── GlobalExceptionHandler.java
│   │
│   └── resources/
│       ├── application.properties
│       └── static/             
│           ├── html/
│           ├── css/
│           ├── js/
│           ├── assets/
│           └── images/
│
└── test/                        
    └── java/com/example/ecommerce/
        ├── application/service/
        ├── domain/model/
        ├── integration/
        └── web/health/
```

## API Endpoints I Created

### Authentication Stuff
- `POST /api/auth/register` - Sign up new users
- `POST /api/auth/login` - Log users in
- `POST /api/auth/password-reset-request` - Request password reset (basic implementation)

### Products
- `GET /api/products` - Get all the products to display

### Shopping Cart
- `GET /api/cart` - See what's in your cart
- `POST /api/cart/add` - Add something to your cart
- `POST /api/cart/remove` - Remove something from your cart
- `POST /api/cart/clear` - Empty the entire cart

### Orders (You Need to be Logged In)
- `POST /api/checkout` - Actually buy the stuff in your cart
- `GET /api/checkout/orders` - See your order history

## How to Run This Project

### What You'll Need First
- Java 17 or newer
- Maven 3.6 or newer
- Git (to clone the repo)

### Setting It Up

1. **Get the code**
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. **Build everything**
   ```bash
   mvn clean install
   ```

3. **Start the server**
   ```bash
   mvn spring-boot:run
   ```

4. **Check it out**
   Open your browser and go to `http://localhost:8080`

### Or Use Docker (If You Know How)

1. **Build the Docker image**
   ```bash
   docker build -t ecommerce-platform .
   ```

2. **Run it**
   ```bash
   docker run -p 8080:8080 ecommerce-platform
   ```

## Configuration

### Database Setup
I used H2 database because it's super easy for development - it runs in memory so you don't need to install anything. You can find the settings in `application.properties`:

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.h2.console.enabled=true
```

### JWT Settings
The JWT token stuff can be configured here:

```properties
jwt.secret=yourSecretKeyHereMakeItAtLeast32CharactersLong
jwt.expiration=86400000
```

### Server Settings
```properties
server.port=8080
```

## How to Use the App

### Signing Up and Logging In
1. Go to the registration page
2. Fill out your info (first name, last name, email, password)
3. Log in with what you just created
4. The app saves a JWT token in your browser so you stay logged in

### Shopping Around
1. Look at products on the main page
2. Use the search bar or click on categories to find stuff
3. Click "Add to Cart" on things you want
4. Check your cart and adjust quantities if needed
5. Hit checkout when you're ready to buy (you'll need to be logged in)

### Managing Orders
1. Complete the checkout process
2. You'll see a confirmation page
3. Check your order history by clicking on your user icon

## Database Models

### User
- Has an ID, email (has to be unique), and encrypted password
- Stores first name and last name
- Has roles for permissions (like admin vs regular user)
- Connected to their order history

### Product
- Basic info like ID, name, and description
- Price stored as BigDecimal (better for money calculations)
- Has a category and image URL
- Tracks how many are in stock
- Includes validation to make sure data is good

### Order
- Gets a unique ID and order number
- Links to the user who placed it and when
- Status tracking (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
- Stores shipping address and shipping costs
- Contains all the items that were ordered

## Security Features

### Authentication
- Used BCrypt to hash passwords (way more secure than storing plain text)
- JWT tokens for staying logged in across requests
- Protected endpoints check if your token is valid

### Authorization
- Different user roles can access different features
- Checkout requires you to be logged in
- Shopping cart works with browser sessions

### Input Validation
- Server checks all input to prevent bad data
- Email format validation
- Password requirements (length, complexity)
- Protection against XSS attacks

## Development Notes

### Running Tests
```bash
mvn test
```

### Building for Production
```bash
mvn clean package -DskipTests
```

### Database Console
When running locally, you can check out the H2 database at: `http://localhost:8080/h2-console`

## Deployment Ideas

### Things to Change for Production
1. Switch from H2 to a real database (PostgreSQL or MySQL)
2. Use proper JWT secret keys (not the demo ones)
3. Set up HTTPS/SSL certificates
4. Configure proper logging
5. Add monitoring and health checks

### Environment Variables for Production
```bash
export JWT_SECRET=your-production-secret-key
export DATABASE_URL=your-production-database-url
export SERVER_PORT=8080
```

## Contributing

If you want to help improve this project:

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/cool-new-thing`)
3. Make your changes and commit them (`git commit -am 'Add cool new thing'`)
4. Push to your branch (`git push origin feature/cool-new-thing`)
5. Create a Pull Request

## License

This project is open source - feel free to use it for learning or your own projects!

## Questions or Problems?

If something isn't working or you have questions, feel free to create an issue in the repository. I'm still learning too, so any feedback is appreciated!
