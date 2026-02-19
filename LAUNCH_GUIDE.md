# atonixcorp – Launch Guide

##  Ready to Launch

Your atonixcorp rebranding is complete! Here's how to view, test, and deploy the new landing page.

---

##  Files Created

### Design & Strategy
- **[CLOUD_PLATFORM_HOMEPAGE.md](./CLOUD_PLATFORM_HOMEPAGE.md)** - Complete homepage design with sections and specifications
- **[CLOUD_PLATFORM_BRAND_GUIDELINES.md](./CLOUD_PLATFORM_BRAND_GUIDELINES.md)** - Official brand standards
- **[CLOUD_PLATFORM_REBRANDING_SUMMARY.md](./CLOUD_PLATFORM_REBRANDING_SUMMARY.md)** - Complete rebranding overview

### Landing Page
- **[index.html](./index.html)** - Interactive landing page (fully responsive, production-ready)

### Updated Documentation
- **[README.md](./README.md)** - Updated with atonixcorp branding

---

##  View the Landing Page

### Option 1: View Locally (Recommended for Testing)

```bash
# Navigate to the repository
cd /home/atonixdev/atonixcorp

# Open in your default browser
open index.html        # macOS
# OR
xdg-open index.html   # Linux
# OR
start index.html      # Windows

# Access at: file:///home/atonixdev/atonixcorp/index.html
```

### Option 2: Serve with Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Access at: http://localhost:8000/index.html
```

### Option 3: Serve with Node.js

```bash
# Using http-server
npx http-server

# Or using live-server with auto-reload
npx live-server
```

### Option 4: VS Code Built-in Server

In VS Code:
1. Install "Live Server" extension (Ritwick Dey)
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Opens automatically in default browser

---

##  Landing Page Features

### Fully Responsive Design
-  Works on desktop (1920px+)
-  Works on tablet (768px-1024px)
-  Works on mobile (320px-767px)
-  Touch-friendly buttons
-  Fast load times (no dependencies)

### Interactive Elements
- Navigation menu with section links
- Hover effects on cards
- Smooth scrolling
- CTA buttons (Get Started, Explore Documentation)
- Contact section with team information

### Professional Design
- Blue/Cyan color scheme (trust + innovation)
- Clean typography hierarchy
- Consistent spacing and alignment
- Modern card-based layouts
- Icon-enhanced sections

### Content Sections
1. **Hero** - Main headline and CTAs
2. **Capabilities** - 5-layer architecture
3. **Standards** - Developer requirements checklist
4. **Workflow** - Deployment timeline
5. **Observability & Security** - Detailed panels
6. **AI Engine** - Feature highlights
7. **Support** - Team contacts
8. **Footer** - Links and branding

---

##  Test on Different Devices

### Desktop Testing

```bash
# Chrome DevTools
1. Open index.html in Chrome
2. Press F12 (or Cmd+Option+I on Mac)
3. Click device toggle (top-left corner)
4. Try different device sizes
```

**Recommended Desktop Screen Sizes**:
- 1920x1080 (Full HD)
- 1440x900 (Macbook Air)
- 1366x768 (Common laptop)

### Mobile Testing

**iPhone Sizes**:
- 375x667 (iPhone 8/SE)
- 390x844 (iPhone 12)
- 428x926 (iPhone 14 Pro Max)

**Android Sizes**:
- 360x800 (Common Android)
- 412x915 (Pixel 5)

---

##  Customization Options

### Update Contact Information

Edit `index.html` lines ~650-680 to update team emails:

```html
<div class="support-card">
    <h4> Platform Engineering</h4>
    <p>Infrastructure design, service architecture...</p>
    <p><strong>your-email@yourdomain.com</strong></p>
</div>
```

### Update Brand Colors

Edit the CSS `<style>` section (lines ~15-50):

```css
:root {
    /* Change these colors */
    --primary-blue: #1E3A8A;    /* Main brand color */
    --accent-cyan: #06B6D4;     /* Accent/CTA color */
    --white: #FFFFFF;
    --dark-gray: #1F2937;
}
```

### Update Domain/Links

Email addresses to update:
- `platform-team@cloudplatform.io`
- `infra-team@cloudplatform.io`
- `security-team@cloudplatform.io`
- `ai-team@cloudplatform.io`

Replace with your actual domain.

---

##  Analytics Integration

### Add Google Analytics

Add before closing `</head>` tag:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Add Event Tracking

Add to CTA buttons:

```html
<button class="btn btn-primary" onclick="gtag('event', 'cta_clicked', {'button': 'get_started'})">
    Get Started
</button>
```

---

##  Deploy to Web

### Option 1: GitHub Pages

```bash
# Push to GitHub repository
git add index.html
git commit -m "Add atonixcorp landing page"
git push origin main

# Enable GitHub Pages:
# Repository Settings → Pages → Source: main branch → /root
# Access at: https://yourusername.github.io/atonixcorp/
```

### Option 2: AWS S3

```bash
# Upload to S3
aws s3 cp index.html s3://your-bucket/index.html --acl public-read

# Or use AWS CloudFront for CDN distribution
# Access at: https://your-cloudfront-domain/index.html
```

### Option 3: Cloudflare Pages

```bash
# Push to GitHub
# Log in to Cloudflare
# Add GitHub repository
# Auto-deploys on push
# Access at: https://your-project.pages.dev
```

### Option 4: Nginx

```bash
# Copy to web root
sudo cp index.html /var/www/html/

# Or configure in nginx.conf
server {
    listen 80;
    server_name cloudplatform.io;
    root /var/www/html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

##  Security Checklist

Before deploying to production:

- [ ] Remove any test/debug code
- [ ] Update all email addresses
- [ ] Update domain references
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Add security headers (CSP, X-Frame-Options)
- [ ] Test form submissions (if any)
- [ ] Check all links work
- [ ] Test on multiple browsers
- [ ] Verify mobile responsiveness
- [ ] Check accessibility (keyboard nav, contrast)
- [ ] Add robots.txt and sitemap.xml
- [ ] Configure analytics
- [ ] Set up monitoring/alerting

---

##  Launch Checklist

### Pre-Launch
- [ ] Review landing page design
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on mobile (iPhone, Android)
- [ ] Verify all links work
- [ ] Confirm email addresses
- [ ] Check color accuracy
- [ ] Verify copy for typos

### Launch Day
- [ ] Deploy to production web server
- [ ] Update DNS records (if applicable)
- [ ] Enable HTTPS
- [ ] Configure analytics
- [ ] Test E2E from production URL
- [ ] Announce on social media
- [ ] Update documentation links

### Post-Launch
- [ ] Monitor website uptime
- [ ] Track visitor metrics
- [ ] Gather user feedback
- [ ] Fix any reported issues
- [ ] Optimize based on analytics

---

##  Support

### Questions About the Design?
See [CLOUD_PLATFORM_BRAND_GUIDELINES.md](./CLOUD_PLATFORM_BRAND_GUIDELINES.md)

### Questions About the Copy?
See [CLOUD_PLATFORM_HOMEPAGE.md](./CLOUD_PLATFORM_HOMEPAGE.md)

### Technical Issues?
- Test in different browsers
- Check browser console (F12) for errors
- Verify JavaScript is enabled
- Clear cache and reload

---

##  You're Ready!

Your atonixcorp landing page is:
-  Professionally designed
-  Fully responsive
-  Mobile-optimized
-  Accessible
-  Fast-loading
-  Production-ready

**Next Step**: Open `index.html` in your browser and review!

```bash
# Quick command to open
open /home/atonixdev/atonixcorp/index.html
```

---

**Version**: 1.0  
**Last Updated**: February 10, 2026  
**Status**:  Ready for Launch
