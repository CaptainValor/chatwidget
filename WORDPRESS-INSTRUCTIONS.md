# WordPress Chat Widget Integration

## Embed Code

Add this single line of code to your WordPress site's header:

```html
<script src="https://todt-chatwidget-production.up.railway.app/widget.js"></script>
```

## How to Install in WordPress

### Method 1: Using a Header/Footer Plugin (Recommended)

1. Install the "Insert Headers and Footers" plugin (or similar)
2. Go to **Settings → Insert Headers and Footers**
3. Paste the embed code above into the "Scripts in Header" section
4. Click **Save**

### Method 2: Direct Theme Editing

1. Go to **Appearance → Theme File Editor**
2. Find and edit `header.php`
3. Add the script tag just before the closing `</head>` tag
4. Click **Update File**

### Method 3: Using a Custom Code Plugin

1. Install the "Code Snippets" plugin
2. Add a new snippet
3. Paste the embed code
4. Set location to "Site Head"
5. Activate the snippet

## What You'll Get

- ✅ Chat bubble in bottom-right corner
- ✅ Full-screen mode support
- ✅ Mobile responsive (auto full-screen on mobile)
- ✅ Session-based chat persistence
- ✅ AI-powered responses from Doggy Dan AI
- ✅ Markdown formatting support
- ✅ Typing indicators

## Testing

Open the `test-embed.html` file in a browser to see exactly how it will look on your WordPress site.

## Troubleshooting

**Widget not appearing?**
- Check browser console for errors
- Ensure the script URL is accessible
- Verify no ad blockers are interfering

**Widget conflicts with site design?**
- The widget uses high z-index (9999) to appear above content
- All styles are scoped to prevent conflicts
- Chat bubble position can be customized if needed

## Railway Deployment

- **Service URL**: https://todt-chatwidget-production.up.railway.app
- **Project**: doggy-dan-ai
- **Service**: todt-chatwidget

## Customization

If you need to customize colors, positioning, or behavior, contact your developer to modify the files in the Railway deployment.
