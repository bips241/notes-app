# Notes App - Full-Stack Application

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Angular Version](https://img.shields.io/badge/angular-17.x-red)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/mongodb-7.x-green)](https://mongodb.com/)
[![Test Coverage](https://img.shields.io/badge/coverage-%3E80%25-brightgreen)](./backend/tests/README.md)

A modern, full-stack notes management application built with Angular and Node.js, featuring advanced analytics, user authentication, role-based access control, and comprehensive note sharing capabilities.

## 🌟 Features

### Core Fu## 📖 API Documentation

### Postman Collection

A complete Postman collection is available for testing all API endpoints:

- **Collection**: [`Notes-App-API.postman_collection.json`](./Notes-App-API.postman_collection.json)
- **Environment**: [`Notes-App-Environment.postman_environment.json`](./Notes-App-Environment.postman_environment.json)

#### Quick Setup
1. **Import Collection**: Import the collection file into Postman
2. **Import Environment**: Import the environment file
3. **Set Base URL**: Update `baseUrl` in environment (default: `http://localhost:3000/api`)
4. **Login**: Use "Login User" request to get authentication token
5. **Test Endpoints**: All requests will automatically use the auth token

#### Collection Features
- **Auto-Authentication**: Token automatically set after login
- **Environment Variables**: Dynamic values for IDs and tokens
- **Comprehensive Tests**: Built-in response validation
- **Error Handling**: Tests for common error scenarios
- **Complete Coverage**: All API endpoints included

#### Testing Workflow
```bash
# Start the backend server
cd backend
npm run dev

# In Postman:
# 1. Import collection and environment
# 2. Run "Login User" request
# 3. Run any endpoint tests
# 4. Use "Login Regular User" for user-level testing
```

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
```ty
- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Profile management with avatar support
  - Account activation/deactivation

- **Notes Management**
  - Create, read, update, delete notes
  - Rich text editing capabilities
  - Tag-based organization
  - Search and filtering
  - Archive/unarchive functionality
  - Pagination and sorting

- **Advanced Sharing System**
  - Share notes with read/write permissions
  - Sharing restrictions management
  - User search and discovery
  - Shared notes dashboard

- **Analytics Dashboard (Admin)**
  - Interactive charts with ECharts
  - User activity tracking
  - Notes statistics and trends
  - Popular tags analysis
  - User leaderboards

- **Admin Panel**
  - User management
  - System analytics
  - Sharing restrictions control
  - Account management

## 🏗️ Architecture

### Technology Stack

**Frontend (Angular 17)**
- TypeScript
- Angular Material UI
- ECharts for analytics visualization
- Responsive design
- Progressive Web App (PWA) ready

**Backend (Node.js/Express)**
- RESTful API architecture
- MongoDB with Mongoose ODM
- JWT authentication
- Express middleware
- Comprehensive error handling

**Database**
- MongoDB Atlas (Production)
- MongoDB Memory Server (Testing)
- Efficient indexing and aggregation

**Testing & Quality**
- Jest testing framework
- Unit, Integration, and E2E tests
- 80%+ test coverage
- ESLint code quality

## 📁 Project Structure

```
notes-app/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Custom middleware
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Utility functions
│   │   └── config/            # Configuration files
│   ├── tests/                 # Comprehensive test suite
│   │   ├── unit/              # Unit tests
│   │   ├── integration/       # Integration tests
│   │   ├── e2e/               # End-to-end tests
│   │   └── helpers/           # Test utilities
│   └── package.json
├── frontend/                  # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   ├── auth/          # Authentication
│   │   │   ├── dashboard/     # User dashboards
│   │   │   ├── notes/         # Notes management
│   │   │   ├── roles/         # Role management
│   │   │   ├── shared/        # Shared components
│   │   │   └── users/         # User management
│   │   └── environments/      # Environment configs
│   └── package.json
├── DEMO_CREDENTIALS.md        # Demo user credentials
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MongoDB Atlas account** (or local MongoDB)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your MongoDB connection string
   nano .env
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

**Backend (.env)**
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

**Frontend (environment.ts)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Running the Application

**Development Mode**

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:3000
   ```

2. **Start Frontend Application**
   ```bash
   cd frontend
   npm start
   # App runs on http://localhost:4200
   ```

**Production Mode**

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## 🔧 Diagnostic & Seeding Methods

### Diagnostic Run Method

The application includes a diagnostic utility to test system health and connectivity:

```bash
cd backend
node diagnostic.js
```

**What it checks:**
- **Database Connection**: MongoDB Atlas connectivity
- **Environment Variables**: Required configuration
- **Server Health**: Port availability and basic functionality
- **Dependencies**: Critical package installations
- **File System**: Required directories and permissions

**Sample Output:**
```
🔍 Running Notes App Diagnostics...
✅ Database connection: Connected to MongoDB Atlas
✅ Environment variables: All required variables present
✅ Server port 3000: Available
✅ Required directories: All present
✅ Dependencies: All packages installed
🎉 System is healthy and ready!
```

### Seeding Methods

The application provides several seeding scripts for different scenarios:

#### 1. Demo Data Seeding (Full Dataset)
```bash
cd backend
node seed-demo-data.js
```

**What it creates:**
- **Admin User**: Full admin privileges
- **Regular Users**: 5 demo users with varied profiles
- **Notes**: 20+ notes with different categories and tags
- **Sharing**: Cross-user note sharing scenarios
- **Restrictions**: Configured sharing restrictions
- **Analytics Data**: Historical data for dashboard

**Use Case**: Complete demo environment with realistic data

#### 2. Simple Data Seeding (Minimal Dataset)
```bash
cd backend
node seed-simple-data.js
```

**What it creates:**
- **Admin User**: Basic admin account
- **Test User**: Single regular user
- **Sample Notes**: 5 basic notes
- **Basic Sharing**: One sharing example

**Use Case**: Quick setup for development or testing

#### 3. User Listing Utility
```bash
cd backend
node list-user-notes.js
```

**What it shows:**
- **All Users**: Complete user list with roles
- **User Notes**: Notes count per user
- **Sharing Status**: Shared notes overview
- **Account Status**: Active/inactive users

**Use Case**: Verify seeding results and user data

### Seeding Script Details

#### Demo Data Seeding Features
- **Realistic Data**: Names, emails, and content that simulate real usage
- **Diverse Content**: Notes with various tags, lengths, and categories
- **Sharing Scenarios**: Complex sharing patterns between users
- **Role Distribution**: Proper admin/user role assignment
- **Time Variance**: Created dates spread across time periods

#### Environment Requirements
```bash
# Required environment variables for seeding
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

#### Safety Features
- **Data Cleanup**: Automatically removes existing test data
- **Confirmation Prompts**: Asks before overwriting data
- **Error Handling**: Graceful failure with detailed error messages
- **Rollback**: Ability to restore previous state

### Common Seeding Scenarios

#### Development Setup
```bash
# Fresh development environment
npm run seed:demo
npm run dev
```

#### Testing Environment
```bash
# Clean test environment
npm run seed:simple
npm test
```

#### Production Demo
```bash
# Production demo with full features
NODE_ENV=production npm run seed:demo
npm start
```

### Troubleshooting Seeding Issues

**Connection Errors**
```bash
# Check database connectivity
node diagnostic.js

# Verify environment variables
cat .env | grep MONGODB_URI
```

**Permission Errors**
```bash
# Check MongoDB user permissions
# Ensure your DB user has read/write access
```

**Data Conflicts**
```bash
# Clear existing data before seeding
mongo your-db-name --eval "db.dropDatabase()"
```

---

## 🧪 Testing

The application includes a comprehensive testing suite with excellent coverage.

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run specific test types
npm run test:unit         # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```
![Test Results](https://res.cloudinary.com/drbnwx068/image/upload/v1751612022/github/Screenshot_from_2025-07-04_12-21-51_znjxkp.png)


### Test Structure
- **Unit Tests**: Model validation, business logic
- **Integration Tests**: API endpoints, authentication
- **E2E Tests**: Complete user journeys
- **Coverage**: 80%+ across all components

For detailed testing documentation, see [Backend Testing Guide](./backend/tests/README.md).

## 🎯 Demo Credentials

The application comes with pre-seeded demo data. See [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md) for login details.

**Quick Access:**
- **Admin User**: `admin@example.com` / `password123`
- **Regular User**: `john@example.com` / `password123`

## � Diagnostic Run Method

The project includes a comprehensive diagnostic tool to check system health, database connectivity, and data integrity.

### Running Diagnostics

```bash
# Navigate to backend directory
cd backend

# Run full system diagnostic
node diagnostic.js

# Run specific diagnostic checks
node diagnostic.js --check=database
node diagnostic.js --check=users
node diagnostic.js --check=notes
node diagnostic.js --check=analytics
```

### Diagnostic Features

#### System Health Checks
- **Database Connection**: MongoDB Atlas connectivity
- **Environment Variables**: Required configs validation
- **Port Availability**: Server port accessibility
- **Dependencies**: Package versions and compatibility

#### Data Integrity Checks
- **User Data**: Validates user accounts and roles
- **Notes Data**: Checks note relationships and permissions
- **Analytics Data**: Verifies analytics calculations
- **Sharing Permissions**: Validates sharing restrictions

#### Performance Metrics
- **Response Times**: API endpoint performance
- **Database Queries**: Query execution times
- **Memory Usage**: Server resource consumption
- **Error Rates**: System error frequency

### Diagnostic Output Example

```
🔍 NOTES APP DIAGNOSTIC REPORT
===============================

✅ Database Connection: Connected to MongoDB Atlas
✅ Environment Variables: All required variables present
✅ Port Availability: Port 3000 is available
✅ Dependencies: All packages up to date

📊 DATA INTEGRITY CHECKS
- Users: 156 active users found
- Notes: 2,847 notes (2,234 active, 613 archived)
- Sharing: 1,023 shared notes, 45 restricted users
- Analytics: Data consistent, calculations verified

⚡ PERFORMANCE METRICS
- Average API Response Time: 120ms
- Database Query Time: 45ms
- Memory Usage: 234MB / 1GB
- Error Rate: 0.02% (last 24h)

🚨 ISSUES FOUND
- Warning: 3 users with unverified emails
- Info: 12 notes scheduled for cleanup
```

### Troubleshooting with Diagnostics

#### Common Issues and Solutions

**Database Connection Issues**
```bash
# Check MongoDB connection
node diagnostic.js --check=database --verbose

# Common fixes:
# 1. Verify MONGODB_URI in .env
# 2. Check IP whitelist in MongoDB Atlas
# 3. Validate database credentials
```

**Performance Issues**
```bash
# Check performance metrics
node diagnostic.js --check=performance

# Optimization suggestions:
# 1. Review slow queries
# 2. Check memory usage
# 3. Analyze error patterns
```

**Data Integrity Issues**
```bash
# Check data consistency
node diagnostic.js --check=integrity

# Repair options:
# 1. Fix orphaned references
# 2. Validate user permissions
# 3. Recalculate analytics
```

## 🌱 Seeding Methods

The project includes comprehensive seeding utilities to populate the database with demo data for testing and development.

### Available Seeding Scripts

#### 1. Demo Data Seeding (Recommended)
```bash
cd backend
node seed-demo-data.js
```

**What it creates:**
- **Admin Users**: 2 admin accounts with full permissions
- **Regular Users**: 15 diverse user accounts
- **Notes**: 100+ notes with various content types
- **Sharing**: Complex sharing relationships
- **Analytics**: Rich data for dashboard testing

#### 2. Simple Data Seeding
```bash
cd backend
node seed-simple-data.js
```

**What it creates:**
- **Basic Users**: 5 simple user accounts
- **Basic Notes**: 20 simple notes
- **Basic Sharing**: Minimal sharing setup
- **Test Data**: Lightweight dataset for development

#### 3. Custom Seeding Options
```bash
# Seed specific data types
node seed-demo-data.js --type=users
node seed-demo-data.js --type=notes
node seed-demo-data.js --type=sharing

# Seed with custom quantities
node seed-demo-data.js --users=50 --notes=200
node seed-demo-data.js --notes-per-user=10

# Seed with specific scenarios
node seed-demo-data.js --scenario=collaboration
node seed-demo-data.js --scenario=analytics
node seed-demo-data.js --scenario=testing
```

### Seeding Scenarios

#### Collaboration Scenario
```bash
node seed-demo-data.js --scenario=collaboration
```
- **Focus**: Note sharing and collaboration
- **Users**: 10 users with varied roles
- **Notes**: 50 notes with extensive sharing
- **Features**: Comments, collaboration history

#### Analytics Scenario
```bash
node seed-demo-data.js --scenario=analytics
```
- **Focus**: Rich analytics data
- **Users**: 25 users with diverse activity
- **Notes**: 150 notes with usage patterns
- **Features**: Time-series data, user behavior

#### Testing Scenario
```bash
node seed-demo-data.js --scenario=testing
```
- **Focus**: Edge cases and validation
- **Users**: Various user states (active, inactive, restricted)
- **Notes**: Different note types and statuses
- **Features**: Boundary conditions, error cases

### Seeding Configuration

#### Environment Variables
```bash
# Seeding behavior
SEED_CLEAN_FIRST=true          # Clean database before seeding
SEED_SKIP_EXISTING=false       # Skip if data exists
SEED_VERBOSE=true              # Detailed output
SEED_BATCH_SIZE=100            # Insert batch size

# Data generation
SEED_USERS_COUNT=20            # Number of users to create
SEED_NOTES_PER_USER=10         # Notes per user
SEED_SHARING_RATIO=0.3         # Percentage of notes shared
SEED_ARCHIVE_RATIO=0.1         # Percentage of notes archived
```

#### Custom Seeding with list-user-notes.js
```bash
# List all user notes (useful for verification)
node list-user-notes.js

# List specific user's notes
node list-user-notes.js --user=admin@example.com
node list-user-notes.js --user-id=65f1234567890abcdef12345

# List with filters
node list-user-notes.js --status=active
node list-user-notes.js --shared=true
node list-user-notes.js --archived=false
```

### Seeding Best Practices

#### Development Workflow
1. **Clean Start**: Always clean database before seeding
2. **Appropriate Scenario**: Choose scenario matching your needs
3. **Verify Results**: Use diagnostic tools to verify seeding
4. **Document Changes**: Note any custom seeding requirements

#### Production Considerations
- **Never seed production**: Use seeding only in development/testing
- **Data Privacy**: Ensure no real user data in seeds
- **Resource Usage**: Monitor database size and performance
- **Backup First**: Always backup before major seeding operations

### Seeding Output Example

```
🌱 SEEDING NOTES APP DATABASE
=============================

🧹 CLEANING EXISTING DATA
- Removed 1,234 existing notes
- Removed 56 existing users
- Cleared analytics data

👥 CREATING USERS
- Created 2 admin users
- Created 15 regular users
- Set up user preferences and settings

📝 CREATING NOTES
- Created 150 notes across all users
- Set up note categories and tags
- Generated realistic content

🔗 SETTING UP SHARING
- Created 45 shared notes
- Set up sharing permissions
- Configured sharing restrictions

📊 GENERATING ANALYTICS DATA
- Created usage history
- Generated time-series data
- Set up user activity patterns

✅ SEEDING COMPLETED SUCCESSFULLY
- Total Users: 17 (2 admin, 15 regular)
- Total Notes: 150 (135 active, 15 archived)
- Shared Notes: 45
- Execution Time: 12.3 seconds

🔐 DEMO CREDENTIALS CREATED
See DEMO_CREDENTIALS.md for login details
```

## �📖 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
```

### Notes Endpoints
```
GET    /api/notes           # Get user notes
POST   /api/notes           # Create new note
GET    /api/notes/:id       # Get specific note
PUT    /api/notes/:id       # Update note
DELETE /api/notes/:id       # Delete note
POST   /api/notes/:id/share # Share note
PATCH  /api/notes/:id/archive   # Archive note
PATCH  /api/notes/:id/unarchive # Unarchive note
```

### Admin Endpoints
```
GET   /api/users            # Get all users (admin)
GET   /api/analytics/*      # Analytics data (admin)
PATCH /api/users/:id/activate   # Activate user
PATCH /api/users/:id/deactivate # Deactivate user
```

## 🎨 UI Components

### Key Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Angular Material components
- **Dark/Light Theme**: User preference support
- **Interactive Charts**: ECharts integration
- **Real-time Updates**: Live data synchronization
- **Progressive Web App**: Offline capabilities

### Page Structure
- **Login/Register**: Authentication pages
- **Dashboard**: User overview and quick actions
- **Notes**: Main notes management interface
- **Analytics**: Admin dashboard with charts
- **Profile**: User settings and preferences
- **Admin Panel**: User and system management

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: User/Admin permissions
- **Token Expiration**: Automatic session management

### Data Protection
- **Input Validation**: Server-side validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Secure cross-origin requests

### Best Practices
- **Environment Variables**: Sensitive data protection
- **Error Handling**: Secure error messages
- **Rate Limiting**: API abuse prevention
- **Audit Logging**: User action tracking

## 📊 Performance & Monitoring

### Optimization
- **Database Indexing**: Optimized MongoDB queries
- **Pagination**: Efficient data loading
- **Caching**: Strategic caching implementation
- **Bundle Optimization**: Minimized frontend assets

### Monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern analysis
- **Health Checks**: System status monitoring

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGODB_URI=your-production-db-url
   export JWT_SECRET=your-production-secret
   ```

2. **Build Application**
   ```bash
   # Build frontend
   cd frontend
   npm run build:prod
   
   # The frontend build will be in dist/
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   npm install --production
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Cloud Deployment Options
- **Heroku**: Easy deployment with buildpacks
- **AWS**: EC2, ECS, or Lambda deployment
- **Google Cloud**: App Engine or Cloud Run
- **DigitalOcean**: App Platform deployment

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Jest**: Testing requirements
- **Documentation**: Clear code comments

### Testing Requirements
- **Unit Tests**: All new functions
- **Integration Tests**: New API endpoints
- **E2E Tests**: New user workflows
- **Coverage**: Maintain 80%+ coverage

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Backend Issues**
- **MongoDB Connection**: Check connection string format
- **Port Conflicts**: Ensure port 3000 is available
- **JWT Errors**: Verify JWT_SECRET in environment

**Frontend Issues**
- **API Connection**: Check backend server is running
- **Build Errors**: Clear node_modules and reinstall
- **CORS Issues**: Verify backend CORS configuration

### Getting Help

1. **Check Documentation**: Review this README and testing docs
2. **Search Issues**: Look through existing GitHub issues
3. **Create Issue**: Report bugs with reproduction steps
4. **Community**: Join discussions and ask questions

### Debug Mode

**Backend Debugging**
```bash
DEBUG=* npm run dev
```

**Frontend Debugging**
```bash
ng serve --verbose
```

## 📈 Roadmap

### Upcoming Features
- [ ] Real-time collaboration
- [ ] File attachments support
- [ ] Mobile application
- [ ] Advanced search with filters
- [ ] Integration with third-party services
- [ ] Automated backups
- [ ] Multi-language support

### Performance Improvements
- [ ] Redis caching implementation
- [ ] Database query optimization
- [ ] Frontend bundle size reduction
- [ ] Image optimization and CDN
- [ ] Progressive loading

## 📊 Project Statistics

- **Backend Files**: 50+ TypeScript/JavaScript files
- **Frontend Components**: 30+ Angular components
- **Test Coverage**: 80%+ across all modules
- **API Endpoints**: 25+ RESTful endpoints
- **Database Collections**: 3 optimized collections
- **Features**: 15+ major features implemented

---

**Built with ❤️ by the Notes App Team**

*Last Updated: July 4, 2025*
