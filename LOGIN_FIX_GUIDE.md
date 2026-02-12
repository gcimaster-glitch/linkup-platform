# 🔐 Login Fix Guide - LinkUp Platform

## 📋 Problem Summary

The user `user@example.com` with password `password123` cannot log in because:
1. This user does not exist in the production database
2. The backend authentication schema has been updated to use `name` instead of `display_name`

## ✅ Solutions

### Solution 1: Use Existing Demo Account (IMMEDIATE)

Use one of these existing accounts:

**For Organizer Access:**
- Email: `organizer@demo.com`
- Password: `demo`

**For Regular User Access:**
- Email: `user@demo.com`
- Password: `demo`

### Solution 2: Add Test User to Database (RECOMMENDED)

Execute the SQL script to add the test user:

```bash
# Upload to Cloudflare D1
wrangler d1 execute linkup-db --file=database/add_test_user.sql

# Or via Cloudflare Dashboard:
# 1. Go to Cloudflare Dashboard
# 2. Navigate to D1 Database → linkup-db
# 3. Open Console
# 4. Paste the contents of database/add_test_user.sql
# 5. Execute
```

### Solution 3: Register New Account (USER-FRIENDLY)

1. Visit https://link-up.live/
2. Click "ログイン" (Login)
3. Click "新規登録" (New Registration) tab
4. Fill in the form:
   - Name: Your name
   - Email: Your email
   - Password: Strong password (8+ chars)
   - Role: 主催者 (Organizer)
5. Check your email for verification link
6. Click the verification link
7. Log in with your credentials

## 🔧 Backend Fixes Applied

### 1. Schema Consistency Fix
✅ Updated `backend/src/routes/auth.ts` to use `name` instead of `display_name`
- Changed schema validation
- Updated INSERT statements
- Fixed SELECT queries

### 2. Error Handling Improvement
✅ Enhanced `index.html` login error messages
- Better error display
- More descriptive error messages
- User-friendly guidance

### 3. Demo Account Info
✅ Added demo account hints in login form
- Displays test credentials
- Guides users to existing accounts

## 📁 Files Modified

- `backend/src/routes/auth.ts` - Schema consistency fixes
- `index.html` - Error handling and demo account info
- `database/add_test_user.sql` - New test user script

## 🚀 Deployment Status

### ⚠️ Pending: Backend Deployment

The backend fixes need to be deployed. Two options:

**Option A: Manual Deployment (No API Token)**
1. Go to Cloudflare Dashboard
2. Navigate to Workers & Pages
3. Select `linkup-backend`
4. Upload the fixed `backend/src/routes/auth.ts`

**Option B: CLI Deployment (Requires API Token)**
```bash
# Set Cloudflare API token
export CLOUDFLARE_API_TOKEN=your_token_here

# Deploy backend
cd backend
npm run deploy
```

### ✅ Completed: Frontend Updates

Frontend changes are already live:
- Error messages improved
- Demo account info displayed
- User guidance enhanced

## 📝 Test Credentials

After deploying backend or adding test user:

```
Email: user@example.com
Password: password123
Role: Organizer
```

Or use existing demo accounts:

```
Organizer: organizer@demo.com / demo
User: user@demo.com / demo
```

## 🎯 Next Steps

1. **Immediate**: Test login with `organizer@demo.com` / `demo`
2. **Deploy Backend**: Apply auth.ts fixes to production
3. **Add Test User**: Run `add_test_user.sql` in D1 database
4. **Verify**: Test login with `user@example.com` / `password123`

## 🔍 Debugging

If login still fails, check:

1. **Network Tab**: Check API response from `/api/auth/login`
2. **Console**: Look for error messages
3. **Backend Logs**: Check Cloudflare Worker logs
4. **Database**: Verify user exists with correct password hash

```bash
# Check if user exists
wrangler d1 execute linkup-db --command="SELECT email, name, role FROM users WHERE email='user@example.com';"
```

## 💡 Tips

- Password hashes are generated with bcrypt (cost=10)
- Use `$2b$` or `$2a$` prefix for bcrypt hashes
- Email must be unique in the database
- Demo passwords are **not** secure - change for production!

---
**Created**: 2026-02-12  
**Status**: Backend deployment pending  
**Priority**: High - Blocks user login
