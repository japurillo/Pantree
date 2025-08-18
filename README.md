# Pantree - Smart Pantry Management

A modern, family-focused pantry management application built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Key Features

- **Smart Inventory Management**: Track items, set thresholds, and get low-stock alerts
- **Family Collaboration**: Multiple users can manage shared pantry inventory
- **Category Organization**: Organize items by storage location and type
- **Image Support**: Upload and manage item images with Cloudinary
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant synchronization across all family members
- **Supabase (PostgreSQL)**: Robust database backend with direct API calls
- **bcrypt Password Hashing**: Secure authentication for user accounts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with bcrypt password hashing
- **Database**: Supabase (PostgreSQL) with direct API calls
- **Image Storage**: Cloudinary for optimized image management
- **Data Fetching**: SWR for efficient data caching and synchronization
- **Validation**: Zod for input validation and type safety
- **Deployment**: Ready for Vercel, Netlify, or any Next.js-compatible platform

## 📁 Project Structure

```
pantree/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── categories/        # Category management
│   ├── inventory/         # Main inventory view
│   ├── users/             # User management
│   └── globals.css        # Global styles and Tailwind
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   └── supabase.ts       # Supabase client configuration
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main tables:

- **`families`**: Family groups with admin users
- **`app_users`**: Application users (separate from Supabase auth)
- **`categories`**: Item categories (Pantry, Refrigerator, Freezer, etc.)
- **`items`**: Individual pantry items with quantities and thresholds

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Cloudinary account (for image uploads)

### 1. Clone and Install

```bash
git clone <repository-url>
cd pantree
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 3. Database Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the database setup script (see `SUPABASE_SETUP.md` for details)

#### Option B: Using psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres.[project-ref]:[password]@[host]:[port]/postgres"

# Run the setup script
\i setup-database.sql
```

### 4. Initial Data Setup

After setting up the database schema, seed it with initial data:

```sql
-- Temporarily disable foreign key constraints
SET session_replication_role = replica;

-- Create admin family
INSERT INTO families (id, name, "adminId") VALUES 
('admin-family-001', 'Admin Family', 'temp-admin-id');

-- Create admin user (password: admin123)
INSERT INTO app_users (id, username, email, password, role, "familyId") VALUES 
('admin-user-001', 'admin', 'admin@grocie.com', '$2a$12$ss0nu/g56JW2w3I9ORWUV.fqjfrveFpMHGWsunLpXOo4KDDCirHa2', 'ADMIN', 'admin-family-001');

-- Update family adminId
UPDATE families SET "adminId" = 'admin-user-001' WHERE id = 'admin-family-001';

-- Create basic categories
INSERT INTO categories (id, name, description, "familyId") VALUES 
('cat-admin-001', 'Pantry', 'Dry goods and non-perishables', 'admin-family-001'),
('cat-admin-002', 'Refrigerator', 'Cold items and leftovers', 'admin-family-001'),
('cat-admin-003', 'Freezer', 'Frozen foods', 'admin-family-001'),
('cat-admin-004', 'Spices', 'Herbs and seasonings', 'admin-family-001');

-- Create sample item
INSERT INTO items (id, name, description, quantity, threshold, notes, "categoryId", "createdBy", "familyId") VALUES 
('item-admin-001', 'Black Pepper', 'Ground black pepper for seasoning', 1, 1, 'Sample item to get started', 'cat-admin-004', 'admin-user-001', 'admin-family-001');

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and log in with:
- **Username**: `admin`
- **Password**: `admin123`

## 🔐 Authentication

The application uses NextAuth.js with a custom credentials provider:

- **User Registration**: New users automatically become admins of their own family
- **Password Security**: All passwords are hashed using bcrypt with 12 salt rounds
- **Session Management**: JWT-based sessions with automatic refresh
- **Role-based Access**: Admin and User roles with appropriate permissions

## 📱 Features

### Inventory Management
- Add, edit, and delete items
- Set quantity thresholds for low-stock alerts
- Organize items by categories
- Upload and manage item images

### Family Collaboration
- Multiple users per family
- Shared inventory across family members
- Role-based permissions (Admin/User)
- Real-time updates for all family members

### Category System
- Pre-configured categories (Pantry, Refrigerator, Freezer, Spices)
- Custom category creation
- Item organization by storage location

### User Management
- Family member invitations
- Role assignment and management
- Secure password handling
- User profile management

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Other Platforms

The application is compatible with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## 📚 Documentation

- **`SUPABASE_SETUP.md`**: Detailed Supabase setup instructions
- **`VERSION.md`**: Project version history and changelog

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
- Check the documentation files
- Review the Supabase setup guide
- Open an issue on GitHub

---

**Pantree** - Making pantry management simple and collaborative for families everywhere.
