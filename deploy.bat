@echo off
echo 🔨 Building project...
npm run build

echo 🧹 Removing old docs folder...
if exist docs rmdir /s /q docs

echo 📂 Renaming dist to docs...
rename dist docs

echo 📤 Committing changes...
git add docs
git commit -m "Deploy to GitHub Pages"

echo ⬆️ Pushing to GitHub...
git push origin main

echo ✅ Deployment complete! Site will update shortly.
