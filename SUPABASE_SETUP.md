# Supabase Setup Guide for Grocie

This guide will help you set up Supabase for the Grocie pantry management application.

## 🚀 Prerequisites

- A Supabase account (free tier available)
- Basic knowledge of SQL
- Your project ready for database setup

## 📋 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `grocie` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (usually 2-3 minutes)

## 🔑 Step 2: Get Your Credentials

Once your project is created, go to **Settings** → **API** and copy:

- **Project URL** (e.g., `https://your-project-ref.supabase.co`)
- **Anon Key** (public key for client-side operations)
- **Service Role Key** (private key for server-side operations)

## 🗄️ Step 3: Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create families table
CREATE TABLE families (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create app_users table (separate from Supabase auth.users)
CREATE TABLE app_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    "familyId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create items table
CREATE TABLE items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "imageUrl" TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    "categoryId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints
ALTER TABLE families ADD CONSTRAINT "families_adminid_fkey" 
    FOREIGN KEY ("adminId") REFERENCES app_users(id);

ALTER TABLE app_users ADD CONSTRAINT "app_users_familyId_fkey" 
    FOREIGN KEY ("familyId") REFERENCES families(id);

ALTER TABLE categories ADD CONSTRAINT "categories_familyId_fkey" 
    FOREIGN KEY ("familyId") REFERENCES families(id);

ALTER TABLE items ADD CONSTRAINT "items_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES categories(id);

ALTER TABLE items ADD CONSTRAINT "items_createdby_fkey" 
    FOREIGN KEY ("createdBy") REFERENCES app_users(id);

ALTER TABLE items ADD CONSTRAINT "items_familyId_fkey" 
    FOREIGN KEY ("familyId") REFERENCES families(id);

-- Add unique constraints
ALTER TABLE categories ADD CONSTRAINT "categories_name_familyId_key" 
    UNIQUE (name, "familyId");

ALTER TABLE items ADD CONSTRAINT "items_name_family_unique" 
    UNIQUE (name, "familyId");

-- Create indexes for performance
CREATE INDEX "idx_families_admin_id" ON families("adminId");
CREATE INDEX "idx_app_users_family_id" ON app_users("familyId");
CREATE INDEX "idx_app_users_username" ON app_users(username);
CREATE INDEX "idx_app_users_email" ON app_users(email);
CREATE INDEX "idx_categories_family_id" ON categories("familyId");
CREATE INDEX "idx_categories_name_family" ON categories(name, "familyId");
CREATE INDEX "idx_items_category_id" ON items("categoryId");
CREATE INDEX "idx_items_created_by" ON items("createdBy");
CREATE INDEX "idx_items_family_id" ON items("familyId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON families
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_users_updated_at BEFORE UPDATE ON app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies that allow service role operations
CREATE POLICY "Enable all operations for authenticated users" ON families FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for authenticated users" ON app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for authenticated users" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for authenticated users" ON items FOR ALL USING (true) WITH CHECK (true);
```

4. Click **Run** to execute the SQL

### Option B: Using psql Command Line

If you prefer using the command line:

```bash
# Connect to your Supabase database
psql "postgresql://postgres.[project-ref]:[password]@[host]:[port]/postgres"

# Run the setup script
\i setup-database.sql
```

## 🌱 Step 4: Seed Initial Data

After setting up the schema, seed the database with initial data:

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

## ⚙️ Step 5: Environment Configuration

In your project's `.env.local` file, add your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🔐 Step 6: Test Your Setup

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Log in with the default admin account:
   - **Username**: `admin`
   - **Password**: `admin123`

## 🚨 Important Notes

### Security
- **Service Role Key**: Keep this secret and never expose it in client-side code
- **RLS Policies**: The current setup uses simple policies for development. Consider implementing more restrictive policies for production
- **Password Hashing**: All passwords are hashed using bcrypt with 12 salt rounds

### Database Management
- **Backups**: Supabase automatically handles database backups
- **Migrations**: For production, consider using proper migration tools
- **Monitoring**: Use Supabase dashboard to monitor database performance

### Production Considerations
- **Environment Variables**: Ensure all environment variables are set in production
- **Database Connections**: Monitor connection limits and performance
- **Rate Limiting**: Implement appropriate rate limiting for your use case

## 🆘 Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Ensure tables are created in the correct order
   - Check that all referenced IDs exist

2. **RLS Policy Issues**
   - Verify RLS is enabled on all tables
   - Check that policies allow the operations you need

3. **Connection Issues**
   - Verify your database password and connection string
   - Check that your IP is not blocked by Supabase

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the main [README.md](./README.md) for application setup
- Open an issue in the project repository

## ✅ Next Steps

Once your Supabase setup is complete:

1. **Test the application** with the default admin account
2. **Create additional users** through the registration system
3. **Customize categories** and add your own items
4. **Deploy to production** when ready

Your Grocie application is now ready to use! 🎉
