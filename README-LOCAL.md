# Running Locally

Follow these steps to run the HwinNwin marketing site locally:

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   - Go to `http://localhost:5000`
   - You should see the HwinNwin marketing site

## Troubleshooting

### If you see a blank page:

1. **Check the console logs** in your terminal - look for any error messages
2. **Check your browser's developer console** - press F12 and look for errors
3. **Make sure all content files exist** in the `content/` folder
4. **Try clearing your browser cache** and refresh

### If you get dependency errors:

1. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

2. **Make sure you have Node.js 18+ installed:**
   ```bash
   node --version
   ```

### If the server won't start:

1. **Check if port 5000 is already in use:**
   ```bash
   lsof -i :5000  # On Mac/Linux
   netstat -ano | findstr :5000  # On Windows
   ```

2. **Kill any process using port 5000** and try again

## Environment Variables (Optional)

You can create a `.env` file if you need custom settings:

```bash
# Copy the example file
cp .env.example .env
```

The app works without any environment variables - it will use sensible defaults.

## What You Should See

- **Homepage**: HwinNwin marketing site with "AI Automation & Creative Ecosystems" headline
- **Navigation**: About, Services, Case Studies, Blog, Contact pages
- **Old automotive app**: Still available at `/panel-quote` if needed

## Common Issues

- **Blank page**: Usually a content loading issue - check console for errors
- **Port conflicts**: Try killing other processes on port 5000
- **Missing dependencies**: Run `npm install` again
- **File permissions**: Make sure the `content/` folder is readable