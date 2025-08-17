# Supabase Setup Guide for PanTree

This guide will help you set up Supabase as the database for PanTree, replacing MySQL with PostgreSQL and implementing Row Level Security (RLS) for family-based data isolation.

## 🚀 Prerequisites

- Supabase account (free tier available)
- Node.js 18+ installed
- PanTree project cloned

## 📋 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign in
2. **Click "New Project"**
3. **Choose your organization** (or create one)
4. **Fill in project details:**
   - Name: `pantree` (or your preferred name)
   - Database Password: **Save this password!** You'll need it for the connection string
   - Region: **Tokyo** (as you specified)
5. **Click "Create new project"**
6. **Wait for setup to complete** (usually 1-2 minutes)

## 🔑 Step 2: Get Connection Details

1. **Go to Project Settings** → **Database**
2. **Note these values:**
   - Database Password: **Save this password!** You'll need it for `SUPABASE_DB_PASSWORD`
   - Host: `db.[YOUR-PROJECT-REF].supabase.co` (extract the project reference)
3. **Go to Project Settings** → **API**
4. **Copy these values:**
   - Project URL: `https://[YOUR-PROJECT-REF].supabase.co` (extract the project reference)
   - Anon (public) key: `[YOUR-ANON-KEY]`
   - Service role key: `[YOUR-SERVICE-ROLE-KEY]`

## ⚙️ Step 3: Update Environment Variables

1. **Copy `env.example` to `.env.local`:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your Supabase details:**
   ```env
   # Database (Supabase)
   SUPABASE_DB_PASSWORD="[YOUR-DATABASE-PASSWORD]"
   SUPABASE_PROJECT_REF="[YOUR-PROJECT-REF]"
   DATABASE_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_REF}.supabase.co:5432/postgres"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   CLOUDINARY_FOLDER="pantree"
   
   # Supabase Configuration
   SUPABASE_URL="https://${SUPABASE_PROJECT_REF}.supabase.co"
   SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
   ```

**📚 Note**: The environment variables use variable substitution. You only need to set `SUPABASE_DB_PASSWORD` and `SUPABASE_PROJECT_REF` once, and the other variables will automatically use these values.

**💡 Example**: If your project reference is `abc123def` and password is `mypassword123`, you would set:
```env
SUPABASE_DB_PASSWORD="mypassword123"
SUPABASE_PROJECT_REF="abc123def"
```

And the system automatically generates:
```env
DATABASE_URL="postgresql://postgres:mypassword123@db.abc123def.supabase.co:5432/postgres"
SUPABASE_URL="https://abc123def.supabase.co"
```

## 🗄️ Step 4: Set Up Database Schema

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database schema is managed directly through Supabase:**
   - Use the SQL scripts provided in this project
   - Or use the Supabase dashboard SQL editor

## 🔒 Step 5: Enable Row Level Security (RLS)

1. **Go to your Supabase project** → **SQL Editor**
2. **Copy and paste the contents of the SQL scripts provided in this project**
3. **Click "Run"** to execute the script

This script will:
- Enable RLS on all tables
- Create policies for family-based data isolation
- Set up indexes for performance
- Create unique constraints

## 🌱 Step 6: Seed the Database

1. **Run the seeding script:**
   ```bash
   npm run db:seed
   ```

This will create:
- A default family
- An admin user (username: `admin`, password: `admin123`)
- Default categories (Pantry, Refrigerator, Freezer, Spices, Beverages)
- Sample items (Rice, Milk, Chicken Breast)

## 🧪 Step 7: Test the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open [http://localhost:3000](http://localhost:3000)**
3. **Sign in with:**
   - Username: `admin`
   - Password: `admin123`

## 🔍 Step 8: Verify RLS is Working

1. **Go to Supabase** → **Table Editor**
2. **Try to view data** - you should only see data from your family
3. **Create a new user** in the app - they should only see their family's data
4. **Verify isolation** - users from different families can't see each other's data

## 🚨 Troubleshooting

### **Connection Issues**
- Verify your `SUPABASE_DB_PASSWORD` and `SUPABASE_PROJECT_REF` are correct
- Check that your IP is not blocked by Supabase
- Ensure the database password is correct
- Verify that `DATABASE_URL` is properly generated from the variables

### **RLS Not Working**
- Verify the SQL script ran successfully
- Check that RLS is enabled on all tables
- Ensure policies are created correctly

### **Seeding Fails**
- Check that the schema was pushed successfully
- Verify all tables exist in Supabase
- Check the console for specific error messages

### **Performance Issues**
- Verify indexes were created
- Check Supabase dashboard for query performance
- Consider upgrading to a paid plan for better performance

## 📊 Monitoring

### **Supabase Dashboard**
- **Database**: Monitor query performance and connections
- **Auth**: View user authentication logs
- **Storage**: Monitor file uploads (if using Supabase Storage)
- **Logs**: View real-time logs and errors

### **Application Logs**
- Check browser console for client-side errors
- Monitor server logs for API errors
- Use Supabase logs for database-level issues

## 🔄 Migration from MySQL

If you're migrating from an existing MySQL database:

1. **Export your data** from MySQL
2. **Transform the data** to match the new schema
3. **Import the data** into Supabase
4. **Verify data integrity** and relationships
5. **Test all functionality** with the new data

## 🎯 Benefits of Supabase

### **Security**
- **Row Level Security (RLS)** for automatic data isolation
- **Built-in authentication** (optional)
- **Real-time subscriptions** for live updates
- **Automatic backups** and point-in-time recovery

### **Performance**
- **PostgreSQL** - more powerful than MySQL
- **Automatic indexing** and query optimization
- **Connection pooling** for better performance
- **CDN** for global performance

### **Scalability**
- **Auto-scaling** based on usage
- **Multiple regions** for global deployment
- **Built-in caching** and optimization
- **Enterprise features** available

## 🚀 Next Steps

After successful setup:

1. **Customize RLS policies** if needed
2. **Set up monitoring** and alerts
3. **Configure backups** and retention policies
4. **Optimize queries** for better performance
5. **Set up staging environment** for testing

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Documentation](https://supabase.com/docs)

---

**Need Help?** Create an issue in the repository or check the Supabase community forums.
