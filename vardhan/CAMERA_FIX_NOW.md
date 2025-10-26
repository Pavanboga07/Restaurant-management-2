# 🎥 Camera Not Working - Quick Fix

## The Problem
Your camera shows a "no camera" icon (camera with slash) and the feed is black, even though it's trying to capture images.

## ✅ Immediate Solutions

### Step 1: Check Browser Camera Permissions
**This is the most common issue!**

1. **Look at your browser's address bar** (where it says `localhost:3000/register`)
2. **Click the lock icon** or **camera icon** on the left side of the address bar
3. You should see camera permissions - it might say "Blocked" or "Ask"
4. **Change it to "Allow"**
5. **Refresh the page** (press F5)

### Step 2: Grant Permissions When Prompted
1. When you click "Start Capturing Images", your browser should show a popup asking:
   > "localhost:3000 wants to use your camera"
2. **Click "Allow"** or "Yes"
3. If you accidentally clicked "Block", follow Step 1 to change it

### Step 3: Browser-Specific Instructions

#### For Chrome/Edge:
1. Click the **camera icon with an X** in the address bar
2. Select **"Always allow localhost:3000 to access your camera"**
3. Click **"Done"**
4. **Refresh the page** (F5)

#### For Firefox:
1. Click the **lock icon** in the address bar
2. Click **"Clear permissions and reload"**
3. Refresh and **allow** when prompted again

### Step 4: Verify Camera is Working
1. Open Windows Camera app from Start menu
2. If camera works there, it's just a browser permission issue
3. If camera doesn't work in Windows Camera either:
   - Check Device Manager (Win + X → Device Manager)
   - Expand "Cameras" section
   - Right-click your camera → "Enable device"

### Step 5: Close Other Apps Using Camera
Close these if running:
- Zoom
- Microsoft Teams
- Skype
- Discord (if in video call)
- Other browser tabs with camera access
- OBS Studio
- Any other video recording software

## 🔍 Quick Test in Browser Console

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Paste this code and press Enter:

```javascript
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Camera works!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => {
    console.log('❌ Camera error:', error.name, error.message);
  });
```

**If you see:**
- ✅ "Camera works!" → Your camera is accessible, just refresh the registration page
- ❌ "NotAllowedError" → You need to allow camera permissions (Step 1)
- ❌ "NotFoundError" → No camera detected (check Device Manager)
- ❌ "NotReadableError" → Camera is in use by another app (Step 5)

## 🔄 After Fixing

1. **Refresh the browser page** (F5 or Ctrl+R)
2. Go to Register page
3. Enter Student ID and Name
4. Click "Start Capturing Images"
5. **You should now see yourself in the camera feed!**
6. The system will automatically capture 50 images
7. Submit the registration

## 📸 What You Should See

**BEFORE (Not Working):**
- ❌ Black screen with camera-slash icon
- ❌ "Capture Progress: 10/50" but no actual images

**AFTER (Working):**
- ✅ Live video feed showing your face
- ✅ Green progress bar filling up
- ✅ "Capture Progress: 1/50, 2/50, 3/50..." with actual images
- ✅ "Successfully captured 50 images!" message

## 🆘 Still Not Working?

If camera still doesn't work after trying all the above:

1. **Try a different browser:**
   - Chrome (recommended)
   - Edge
   - Firefox

2. **Check Windows Privacy Settings:**
   - Open Settings → Privacy & Security → Camera
   - Turn ON "Camera access"
   - Turn ON "Let apps access your camera"
   - Turn ON "Let desktop apps access your camera"

3. **Restart your browser completely:**
   - Close ALL browser windows
   - Open browser again
   - Try the registration page

4. **Last resort - Restart your computer**
   - Sometimes camera drivers need a restart

---

**Quick Summary:**
The main issue is almost always browser permissions. Click the lock/camera icon in the address bar and set camera to "Allow", then refresh!
