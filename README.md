# PanTree - Smart Pantry Management

A modern, mobile-first web application for managing pantry inventory with smart low-stock alerts and user management.

## 🚀 Features

### Core Functionality
- **Authentication System**: Username/password login with role-based access control
- **Inventory Management**: Add, view, and consume pantry items
- **Low Stock Dashboard**: Visual alerts for items below threshold
- **Image Upload**: Cloudinary integration for item photos
- **Search & Filter**: Find items by name, description, or category
- **Mobile-First Design**: Responsive UI optimized for all devices

### User Roles
- **Admin Users**: Full access to user management and inventory
- **Regular Users**: Inventory management only (add, consume, view)

### Technical Features
- **Real-time Updates**: SWR for efficient data fetching and caching
- **Secure API**: JWT-based authentication with NextAuth.js
- **Database**: MySQL with Prisma ORM
- **Modern UI**: TailwindCSS with custom component system

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React Hooks
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Styling**: TailwindCSS
- **Image Storage**: Cloudinary API
- **Data Fetching**: SWR
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- MySQL database
- Cloudinary account (for image uploads)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pantree
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/pantree"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Users
- `id`: Unique identifier
- `username`: Unique username for login
- `email`: User email address
- `password`: Hashed password
- `role`: User role (USER/ADMIN)
- `createdAt`: Account creation timestamp

### Categories
- `id`: Unique identifier
- `name`: Category name
- `description`: Optional category description

### Items
- `id`: Unique identifier
- `name`: Item name
- `description`: Optional item description
- `imageUrl`: Cloudinary image URL
- `quantity`: Current stock quantity
- `threshold`: Low stock threshold
- `notes`: Additional notes
- `categoryId`: Foreign key to category
- `createdBy`: Foreign key to user

## 🔐 Authentication

The application uses NextAuth.js with a custom credentials provider:

- **Registration**: New users can create accounts
- **Login**: Username/password authentication
- **Session Management**: JWT-based sessions
- **Role-based Access**: Admin and user permissions

## 📱 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Users
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user
- `PATCH /api/users/[id]` - Update user role (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Items
- `GET /api/items` - List user's items (with search/filter)
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get specific item
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item
- `POST /api/items/[id]/consume` - Consume item (reduce quantity)

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category (admin only)

### File Upload
- `POST /api/upload` - Upload image to Cloudinary

## 🎨 UI Components

The application uses a custom component system built with TailwindCSS:

- **Buttons**: Primary, secondary, success, danger variants
- **Cards**: Consistent card layouts
- **Inputs**: Styled form inputs
- **Badges**: Status indicators (success, warning, danger)
- **Modals**: Reusable modal components

## 📱 Mobile-First Design

- Responsive grid layouts
- Touch-friendly buttons and inputs
- Mobile-optimized navigation
- Compact UI elements for small screens

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Project Structure
```
pantree/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── providers/         # Context providers
│   └── ...                # Other components
├── prisma/                 # Database schema
├── types/                  # TypeScript types
├── .env.local             # Environment variables
└── package.json           # Dependencies
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- Ensure environment variables are set
- Run `npm run build` before deployment
- Configure database connection for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- **Barcode Scanning**: Add items by scanning barcodes
- **Shopping Lists**: Generate shopping lists from low stock items
- **Expiration Tracking**: Track item expiration dates
- **Recipe Integration**: Link items to recipes
- **Analytics**: Usage patterns and insights
- **Mobile App**: Native mobile applications
- **Multi-language**: Internationalization support
