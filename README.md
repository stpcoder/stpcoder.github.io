# 🚀 Modern Resume Website

A beautiful, modern resume website with bilingual support (Korean/English), PDF export, and LaTeX compatibility.

## ✨ Features

- **🌐 Bilingual Support**: Seamless Korean/English language switching
- **🎨 Modern Glass-Morphism Design**: Beautiful visual effects with backdrop blur
- **📱 Fully Responsive**: Optimized for all devices and screen sizes
- **📄 PDF Export**: High-quality PDF generation with professional formatting
- **📝 LaTeX Export**: Overleaf-compatible .tex files for academic use
- **⚡ Dynamic Content**: Easy data management through JSON configuration
- **🎭 Advanced Animations**: Smooth transitions and interactive effects
- **🌙 Dark/Light Theme**: Toggle between themes
- **🎯 Performance Optimized**: Fast loading with modern web standards

## 🎯 Live Demo

Visit the live website: [https://stpcoder.github.io/](https://stpcoder.github.io/)

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Glass-morphism, CSS Grid, Flexbox, Custom Animations
- **Export**: jsPDF, html2canvas, LaTeX (moderncv)
- **Deployment**: GitHub Pages
- **Performance**: Responsive images, lazy loading, optimized animations

## 📁 Project Structure

```
resume/
├── index.html              # Main HTML file
├── data/
│   └── resume-data.json    # Resume data (easily editable)
├── styles/
│   ├── main.css           # Core styles with glass-morphism
│   ├── animations.css     # Advanced animations
│   └── mobile.css         # Responsive design
├── js/
│   ├── main.js            # Main application logic
│   ├── i18n.js            # Internationalization system
│   ├── data-manager.js    # Dynamic content management
│   ├── pdf-export.js      # PDF generation functionality
│   └── latex-export.js    # LaTeX export functionality
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Option 1: Direct Download
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Edit `data/resume-data.json` to customize your content

### Option 2: Local Development Server
```bash
# Navigate to project directory
cd resume

# Start a local server (Python)
python3 -m http.server 8000

# Or use Node.js (if you have it installed)
npx serve .

# Visit http://localhost:8000
```

## ⚙️ Customization

### 1. Personal Information
Edit `data/resume-data.json` to update:
- Personal details (name, contact, location)
- About section
- Work experience
- Education
- Projects
- Skills
- Awards and certifications

### 2. Styling
Modify CSS files in the `styles/` directory:
- `main.css`: Core styles and color schemes
- `animations.css`: Animation effects
- `mobile.css`: Responsive breakpoints

### 3. Functionality
Update JavaScript files in the `js/` directory:
- `data-manager.js`: Data handling logic
- `main.js`: UI interactions and animations

## 📄 Export Features

### PDF Export
- Click "Download CV" → "PDF Format"
- Generates professional PDF with proper formatting
- Supports both Korean and English versions
- Optimized for printing and digital sharing

### LaTeX Export
- Click "Download CV" → "LaTeX Format"
- Downloads .tex file compatible with Overleaf
- Uses moderncv template for academic/professional use
- Includes README with compilation instructions

## 🌐 Deployment

### GitHub Pages (Recommended)
1. Fork this repository
2. Go to repository Settings
3. Navigate to "Pages" section
4. Select source: "Deploy from a branch"
5. Choose branch: `main` (or `master`)
6. Your site will be available at: `https://yourusername.github.io/`

### Other Deployment Options
- **Netlify**: Drag & drop the project folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: Use Firebase CLI
- **Traditional Web Hosting**: Upload files via FTP

## 🎨 Design Features

- **Glass Morphism**: Modern frosted glass effects
- **Particle System**: Interactive background animations
- **Smooth Scrolling**: Enhanced user experience
- **Micro-interactions**: Hover effects and transitions
- **Typography**: Professional font combinations
- **Color Scheme**: Carefully selected gradient palettes

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Advanced Configuration

### Adding New Sections
1. Update `data/resume-data.json` with new data structure
2. Modify `data-manager.js` to handle new section rendering
3. Add corresponding HTML structure in `index.html`
4. Style the new section in CSS files

### Customizing Animations
- Edit `styles/animations.css` for custom effects
- Modify `js/main.js` for interaction behaviors
- Adjust timing and easing functions as needed

## 📈 Performance

- **Lighthouse Score**: 95+ Performance, Accessibility, Best Practices, SEO
- **Loading Time**: <2 seconds on 3G connection
- **Bundle Size**: Optimized for fast delivery
- **Mobile Optimized**: Touch-friendly interactions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Taeho Je**
- GitHub: [@stpcoder](https://github.com/stpcoder)
- Website: [https://stpcoder.github.io/](https://stpcoder.github.io/)
- Email: taeho.je@example.com

## 🙏 Acknowledgments

- Modern CSS techniques and glass-morphism design trends
- Open source libraries: jsPDF, html2canvas
- LaTeX moderncv template community
- Web development best practices and accessibility guidelines

---

⭐ **Star this repository if you found it helpful!**

🐛 **Found a bug or have a suggestion?** [Open an issue](../../issues)