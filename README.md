# 🎮 UX Tools PlayStore Analytics

> Your one-stop dashboard for tracking and analyzing PlayStore app metrics! 🚀

## ✨ What's Cool About This?

- 📊 Real-time PlayStore metrics visualization
- 🔍 Deep-dive analytics for your apps
- 📱 Track reviews, ratings, and performance
- 🎯 Smart insights and trend analysis
- 🌈 Beautiful, modern UI with Tailwind CSS

## 👥 Who's This For?

### 🔬 UX Researchers
- Analyze user sentiment patterns
- Extract actionable insights from reviews
- Track user pain points over time
- Generate research reports with real data

### 🎨 UI/UX Designers
- Validate design decisions with user feedback
- Spot UI-related issues in reviews
- Compare your app's UX metrics with competitors
- Track impact of design changes

### 📊 Product Managers
- Make data-driven product decisions
- Monitor app performance metrics
- Track feature requests and bug reports
- Prioritize roadmap based on user feedback

### 💼 Business Analysts
- Generate comprehensive market reports
- Track competitor performance
- Analyze market trends
- Measure ROI of app updates

### 🚀 Startup Founders
- Understand your market position
- Track growth metrics
- Identify opportunities for improvement
- Monitor user satisfaction

### 🎯 Marketing Teams
- Track campaign impact on ratings
- Analyze user demographics
- Monitor brand sentiment
- Identify promotional opportunities

## 🚀 Quick Start

Fire up your dev environment:

```bash
npm run dev
```

## 🛠 Production Mode

Build it:
```bash
npm run build
```

Launch it:
```bash
npm start
```

## 💡 Pro Tips

### Modifying Data Fetch Limit

By default, we fetch 1000 reviews to keep things speedy. Want more? Here's how to level up:

1. Find the scraper config in `app/routes/analysis.$appId.tsx`
2. Update the `maxReviews` value:
   ```typescript
   const scraper = new PlayStoreScraper({
     maxReviews: 5000,  // change this number
     batchSize: 100
   })
   ```

> 🚨 **Heads Up**: Higher limits = longer load times. Choose wisely!

## 🎨 Styling

We're rocking [Tailwind CSS](https://tailwindcss.com/) for that sleek, modern look. Feel free to:
- Customize the theme
- Add your own components
- Mix in other CSS frameworks

## 🤝 Contributing

Got ideas? Let's make this even better:
1. Fork it
2. Create your feature branch
3. Send that PR! 

## 📦 Tech Stack

- 🎭 Remix
- 🎨 Tailwind CSS
- ⚡ Vite
- 📊 Chart.js

---

Made with 💜 by Mohammad Ilham Akbar Junior

