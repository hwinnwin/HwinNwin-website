# ⚡ Quick Start Guide

**Get the Codex UI running in 5 minutes**

---

## 1️⃣ Install Dependencies (1 min)

```bash
npm install framer-motion lucide-react clsx tailwind-merge class-variance-authority @radix-ui/react-slot tailwindcss @tailwindcss/typography tailwindcss-animate
```

---

## 2️⃣ Setup Path Aliases (1 min)

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

---

## 3️⃣ Copy Files (1 min)

```bash
# From codex-ui-export directory:
cp -r pages/* your-project/src/pages/
cp -r components/* your-project/src/components/
cp -r lib/* your-project/src/lib/
cp -r content/* your-project/src/content/
cp index.css your-project/src/
cp tailwind.config.ts your-project/
```

---

## 4️⃣ Import Global Styles (30 sec)

**In your main.tsx or index.tsx:**
```tsx
import './index.css';
```

---

## 5️⃣ Setup Routing (30 sec)

**React Router:**
```tsx
import Codex from '@/pages/Codex';
<Route path="/" element={<Codex />} />
```

**Next.js App Router:**
```tsx
// app/page.tsx
import Codex from '@/pages/Codex';
export default Codex;
```

**Wouter:**
```tsx
import Codex from '@/pages/Codex';
<Route path="/" component={Codex} />
```

---

## 6️⃣ Start Dev Server (30 sec)

```bash
npm run dev
```

---

## ✅ Done!

Visit `http://localhost:5173` (or your dev server URL)

---

## 🎨 Quick Customizations

**Change gradient colors:**
```tsx
// In Codex.tsx, line ~72
className="bg-gradient-to-b from-[#0A0D1A] via-[#0E1330] to-[#0A0D1A]"
//                              ↑ Change these hex colors
```

**Update your content:**
```bash
# Edit these files:
content/mission.md   # Your mission
content/codex.md     # Your principles
```

**Update site info:**
```typescript
// In lib/constants.ts
export const SITE_CONFIG = {
  baseUrl: 'https://yoursite.com',
  name: 'Your Brand',
  tagline: 'Your Tagline'
};
```

---

## 🐛 Common Issues

**"Cannot find module '@/...'"**
→ Check path aliases in tsconfig.json

**"Tailwind classes not working"**
→ Ensure index.css is imported in main.tsx

**"Markdown not loading"**
→ Add to vite.config.ts:
```typescript
assetsInclude: ['**/*.md']
```

---

## 📚 Need More Help?

- **Full Guide:** See `MIGRATION-GUIDE.md`
- **Customization:** Check `README.md`
- **Code Comments:** Read inline documentation in files

---

**Happy coding!** ✨
