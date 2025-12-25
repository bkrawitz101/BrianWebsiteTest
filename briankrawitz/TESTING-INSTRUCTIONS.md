# 🧪 Testing the WordPress Theme

## 🚀 Quick Test Setup

### **Option 1: Local WordPress Testing**
1. **Install XAMPP/MAMP** or similar local server
2. **Create a WordPress database**
3. **Upload the `bk-resume` folder** to `/wp-content/themes/`
4. **Activate the theme** in WordPress admin

### **Option 2: Online WordPress Testing**
1. **Use a free WordPress hosting** (like 000webhost, InfinityFree)
2. **Upload the `bk-resume` folder** to `/wp-content/themes/`
3. **Activate the theme**

## 🔍 What to Test

### **Header Layout:**
- ✅ **Name and profile** should be centered
- ✅ **Navigation** should be below header (not side by side)
- ✅ **Proper spacing** between header and content

### **Navigation:**
- ✅ **Click navigation tabs** to switch sections
- ✅ **Mobile menu** should work
- ✅ **Sections should show/hide** properly

### **Content Sections:**
- ✅ **About section** should be visible by default
- ✅ **Other sections** should be hidden until clicked
- ✅ **Background videos** should play

## 🐛 Common Issues & Fixes

### **Issue: Navigation not working**
**Fix:** Check browser console for JavaScript errors

### **Issue: Header layout broken**
**Fix:** Clear browser cache, check CSS loading

### **Issue: Videos not playing**
**Fix:** Ensure video files are in `/assets/video/` folder

## 📱 Mobile Testing
- **Test mobile navigation** on small screens
- **Check responsive layout** at different breakpoints
- **Verify touch interactions** work properly

## 🎯 Expected Results

### **Desktop:**
- Header with name/profile centered
- Navigation tabs below header
- Content sections with proper spacing
- Background videos playing

### **Mobile:**
- Responsive header layout
- Mobile navigation menu
- Touch-friendly interactions
- Proper content scaling

## 🔧 Debug Mode

If something's not working:
1. **Check browser console** for errors
2. **Verify file paths** are correct
3. **Test with different browsers**
4. **Check WordPress debug log**

## 📞 Need Help?

If you encounter issues:
1. **Check the browser console** for error messages
2. **Verify all files** are uploaded correctly
3. **Test with a fresh WordPress installation**
4. **Compare with the working static version**

---

**Remember:** This is a WordPress theme, so it needs WordPress to function properly!
