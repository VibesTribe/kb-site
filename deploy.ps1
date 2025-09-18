# Deploy script for VibesTribe Knowledgebase
# Usage: .\deploy.ps1

Write-Host "🔨 Building project..."
npm run build

Write-Host "🧹 Removing old docs..."
if (Test-Path docs) {
    Remove-Item -Recurse -Force docs
}

Write-Host "📂 Renaming dist -> docs..."
Rename-Item dist docs

Write-Host "📤 Committing changes..."
git add docs
git commit -m "Deploy to GitHub Pages" --allow-empty

Write-Host "⬆️ Pushing to GitHub..."
git push origin main

Write-Host "✅ Deployment complete!"
Write-Host "🌍 Your site will be live at: https://vibestribe.github.io/kb-site/"
