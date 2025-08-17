# PanTree - Smart Pantry Management

A modern, multi-tenant web application for managing pantry inventory with smart low-stock alerts, user management, and family-based isolation.

## 🚀 Features

### Core Functionality
- **Multi-Tenant Architecture**: Each admin has their own family group with isolated data
- **Authentication System**: Username/password login with role-based access control
- **Inventory Management**: Add, view, edit, consume, and delete pantry items
- **Low Stock Dashboard**: Visual alerts for items below threshold
- **Category Management**: Create, edit, and delete custom categories per family
- **Image Upload & Optimization**: Cloudinary integration with automatic 400x400px optimization
- **Search & Filter**: Find items by name, description, or category
- **Mobile-First Design**: Responsive UI optimized for all devices

### User Roles & Family System
- **Admin Users**: Full access to user management, inventory, and categories within their family
- **Regular Users**: Inventory management within their assigned family
- **Family Isolation**: Each family has completely separate data, categories, and users
- **No Cross-Family Access**: Admins cannot see other families' data

### Technical Features
- **Real-time Updates**: SWR for efficient data fetching and caching
- **Secure API**: JWT-based authentication with NextAuth.js
- **Database**: MySQL with Prisma ORM
- **Modern UI**: TailwindCSS with custom component system
- **Image Optimization**: Client-side image resizing before upload
- **Rate Limiting**: Built-in API rate limiting and protection
- **Input Validation**: Zod-based schema validation
- **Error Boundaries**: Graceful error handling throughout the app

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React Hooks
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Styling**: TailwindCSS with custom utilities
- **Image Storage**: Cloudinary API with automatic optimization
- **Data Fetching**: SWR for caching and real-time updates
- **Icons**: Lucide React, Heroicons
- **Validation**: Zod schemas
- **Utilities**: Custom hooks, error boundaries, loading states

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
CLOUDINARY_FOLDER="pantree"
# Note: Images will be stored in CLOUDINARY_FOLDER/username_of_admin/ structure
# Example: pantree/jamtraxx/image1.jpg, pantree/another_admin/image2.jpg
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run initial migration for multi-tenancy
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Family (Multi-Tenant)
- `id`: Unique identifier
- `name`: Family name
- `adminId`: Admin user ID
- `settings`: JSON configuration (thresholds, notifications, theme)
- `createdAt`: Family creation timestamp

### Users
- `id`: Unique identifier
- `username`: Globally unique username
- `email`: User email address
- `password`: Hashed password
- `role`: User role (USER/ADMIN)
- `familyId`: Family membership
- `createdAt`: Account creation timestamp

### Categories
- `id`: Unique identifier
- `name`: Category name (unique per family)
- `description`: Optional category description
- `familyId`: Family ownership

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
- `familyId`: Family ownership

## 🔐 Authentication & Multi-Tenancy

### User Registration
- **Self-Registration**: New users can create accounts without admin approval
- **Automatic Family Creation**: Each new user gets their own family and becomes admin
- **Default Setup**: New families get default categories and sample items
- **Global Username Uniqueness**: Usernames are unique across all families

### Family Isolation
- **Data Separation**: Each family has completely isolated data
- **Category Isolation**: Categories are family-specific
- **User Isolation**: Users cannot be transferred between families
- **Image Isolation**: Images stored in family-specific Cloudinary folders

### Security Features
- **JWT Sessions**: Secure token-based authentication
- **Role-based Access**: Different permissions for admins and users
- **Family Validation**: All API endpoints validate family membership
- **Input Sanitization**: Protection against XSS and injection attacks

## 📱 API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints
- `POST /api/auth/register` - User self-registration

### Users
- `GET /api/users` - List family users (admin only)
- `POST /api/users` - Create new user in family
- `PATCH /api/users/[id]` - Update user (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Items
- `GET /api/items` - List family items (with search/filter)
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get specific item
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item and associated image
- `POST /api/items/[id]/consume` - Consume item (reduce quantity)

### Categories
- `GET /api/categories` - List family categories
- `POST /api/categories` - Create new category
- `PATCH /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category (if no items)

### File Upload
- `POST /api/upload` - Upload and optimize image to Cloudinary

## 🎨 UI Components

The application uses a comprehensive component system built with TailwindCSS:

### Core Components
- **Buttons**: Primary, secondary, success, danger variants
- **Cards**: Consistent card layouts for items and information
- **Inputs**: Styled form inputs with validation
- **Badges**: Status indicators (success, warning, danger)
- **Modals**: Reusable modal components for forms and confirmations

### Specialized Components
- **ImageUpload**: Drag & drop image upload with optimization
- **NumberStepper**: Increment/decrement number inputs
- **LoadingSpinner**: Loading indicators and skeletons
- **ErrorBoundary**: Graceful error handling
- **SharedSidebar**: Consistent navigation across pages

### Mobile Optimization
- **Responsive Grids**: 3-4 items per row on mobile
- **Touch-Friendly**: Optimized button sizes and spacing
- **Compact Layouts**: Efficient use of small screen space
- **Mobile Navigation**: Collapsible sidebar for mobile

## 📱 User Experience Features

### Dashboard (`/`)
- **Pantry Overview**: All items as clickable consumption cards
- **Low Stock Alerts**: Visual indicators for urgent items
- **Quick Stats**: Total items, low stock count, status overview
- **Mobile Optimized**: Compact cards fitting 3 per row

### Inventory Management (`/inventory`)
- **Item Management**: Add, edit, delete, and view all items
- **Category Management**: Organize items by custom categories
- **Search & Filter**: Find items quickly
- **Smart Sorting**: Items sorted by stock level urgency

### Category Management (`/categories`)
- **Family Categories**: Create and manage family-specific categories
- **CRUD Operations**: Full create, read, update, delete functionality
- **Validation**: Prevent deletion of categories with items

### User Management (`/users`) - Admin Only
- **Family Users**: Manage users within the family
- **Role Management**: Assign admin or user roles
- **User Creation**: Add new users to the family
- **Security**: Prevent self-deletion

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migration
npm run db:studio    # Open Prisma Studio
```

### Project Structure
```
pantree/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── categories/    # Category management
│   │   ├── items/         # Item management
│   │   ├── upload/        # Image upload
│   │   └── users/         # User management
│   ├── auth/              # Authentication pages
│   ├── categories/        # Category management page
│   ├── inventory/         # Inventory management page
│   ├── users/             # User management page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── ui/                # Reusable UI components
│   └── ...                # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   ├── imageOptimization.ts # Image processing utilities
│   ├── rateLimit.ts       # Rate limiting
│   ├── validation.ts      # Input validation
│   └── utils.ts           # General utilities
├── prisma/                 # Database schema and migrations
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
- Set up Cloudinary credentials

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
- **Notifications**: Push notifications for low stock alerts
- **Export/Import**: Data backup and sharing
- **API Integration**: Connect with grocery delivery services

## 📊 Version History

### v0.0.2 - Enhanced Functionality & Documentation
- **Delete functionality** for inventory items with image cleanup
- **Enhanced documentation** with comprehensive README
- **Improved error handling** and user experience
- **Better security** with enhanced family validation
- **Performance improvements** with optimistic updates

### v0.0.1 - Initial Release
- **Multi-tenant architecture** with family-based isolation
- **Complete inventory management** system
- **User and category management** for admins
- **Image upload and optimization** with Cloudinary
- **Mobile-first responsive design**
- **Comprehensive security features**
- **Modern tech stack** with Next.js 14 and TypeScript
