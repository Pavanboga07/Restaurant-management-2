# Camera Diagnostics Script

Since you have camera permissions enabled but the camera still shows a black screen, let's diagnose the issue.

## 🔍 Run This Diagnostic in Browser Console

1. **Open the registration page** in your browser
2. **Press F12** to open Developer Tools
3. **Go to the Console tab**
4. **Copy and paste this complete script** and press Enter:

```javascript
// Camera Diagnostics Script
console.log('🎥 Starting Camera Diagnostics...\n');

// Test 1: Check if MediaDevices API is available
console.log('Test 1: Checking MediaDevices API...');
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log('✅ MediaDevices API is available');
} else {
    console.log('❌ MediaDevices API is NOT available');
    console.log('Your browser may not support camera access');
}

// Test 2: List all available devices
console.log('\nTest 2: Listing all media devices...');
navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        console.log(`Found ${devices.length} total devices:`);
        devices.forEach((device, index) => {
            console.log(`${index + 1}. ${device.kind}: ${device.label || 'Unnamed'} (ID: ${device.deviceId.substring(0, 20)}...)`);
        });
        
        const cameras = devices.filter(d => d.kind === 'videoinput');
        console.log(`\n📹 Found ${cameras.length} camera(s):`);
        cameras.forEach((cam, index) => {
            console.log(`  ${index + 1}. ${cam.label || 'Camera ' + (index + 1)}`);
        });
        
        if (cameras.length === 0) {
            console.log('❌ No cameras detected!');
            console.log('Solutions:');
            console.log('  - Connect an external webcam');
            console.log('  - Enable built-in camera in Device Manager');
            console.log('  - Check if camera is disabled in BIOS');
        }
    })
    .catch(err => {
        console.error('❌ Error listing devices:', err);
    });

// Test 3: Try to access the camera
console.log('\nTest 3: Attempting to access camera...');
navigator.mediaDevices.getUserMedia({ 
    video: { 
        width: 640, 
        height: 480, 
        facingMode: "user" 
    } 
})
    .then(stream => {
        console.log('✅ Camera access SUCCESSFUL!');
        console.log('Stream details:', stream);
        console.log(`Video tracks: ${stream.getVideoTracks().length}`);
        
        stream.getVideoTracks().forEach((track, index) => {
            console.log(`\nVideo Track ${index + 1}:`);
            console.log(`  Label: ${track.label}`);
            console.log(`  Enabled: ${track.enabled}`);
            console.log(`  Muted: ${track.muted}`);
            console.log(`  Ready State: ${track.readyState}`);
            console.log(`  Settings:`, track.getSettings());
        });
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        console.log('\n✅ Camera test successful! Camera is working properly.');
        console.log('If registration page still shows black screen, try:');
        console.log('  1. Hard refresh the page (Ctrl+Shift+R)');
        console.log('  2. Close and reopen the browser');
        console.log('  3. Try a different browser');
    })
    .catch(error => {
        console.error('❌ Camera access FAILED!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        console.log('\n🔧 Troubleshooting based on error:');
        
        if (error.name === 'NotAllowedError') {
            console.log('Issue: Permission denied');
            console.log('Solution:');
            console.log('  1. Click lock/camera icon in address bar');
            console.log('  2. Set camera permission to "Allow"');
            console.log('  3. Refresh the page');
        } else if (error.name === 'NotFoundError') {
            console.log('Issue: No camera found');
            console.log('Solution:');
            console.log('  1. Check Device Manager (Win+X → Device Manager)');
            console.log('  2. Look under "Cameras" or "Imaging devices"');
            console.log('  3. Enable the camera if disabled');
            console.log('  4. Update camera drivers');
        } else if (error.name === 'NotReadableError') {
            console.log('Issue: Camera is in use by another application');
            console.log('Solution:');
            console.log('  1. Close Zoom, Teams, Skype, Discord');
            console.log('  2. Close other browser tabs using camera');
            console.log('  3. Close Camera app if open');
            console.log('  4. Restart browser');
        } else if (error.name === 'OverconstrainedError') {
            console.log('Issue: Camera doesn\'t meet requirements');
            console.log('Solution:');
            console.log('  1. Try a different camera');
            console.log('  2. Camera may not support 640x480 resolution');
        } else {
            console.log('Issue: Unknown error');
            console.log('Solution:');
            console.log('  1. Try restarting browser');
            console.log('  2. Try different browser (Chrome recommended)');
            console.log('  3. Restart computer');
        }
    });

console.log('\n⏳ Diagnostic tests running... Results will appear above.');
```

## 📊 Understanding the Results

### If You See:
**✅ "Camera access SUCCESSFUL!"**
- Your camera is working!
- The issue is in the React app
- **Solution:** Hard refresh the page (Ctrl+Shift+R)

**❌ "NotAllowedError"**
- Permission issue despite what browser shows
- **Solution:** 
  1. Go to `chrome://settings/content/camera` (Chrome)
  2. Check if `localhost:3000` is in "Blocked" list
  3. Move it to "Allowed" list

**❌ "NotFoundError"**
- No camera detected by Windows
- **Solution:**
  1. Open Device Manager (Win+X)
  2. Check "Cameras" section
  3. Enable/update drivers

**❌ "NotReadableError"**
- Camera in use by another app
- **Solution:** Close all apps that might use camera:
  - Zoom, Teams, Skype, Discord
  - Windows Camera app
  - Other browser tabs
  - OBS, Streamlabs

## 🛠️ Additional Diagnostics

### Check Camera in Windows Settings
```powershell
# Run this in PowerShell to open Camera settings
start ms-settings:privacy-webcam
```

### Test Camera in Windows Camera App
1. Press `Win` key
2. Type "Camera"
3. Open "Camera" app
4. If camera works here but not in browser → Browser/permission issue
5. If camera doesn't work here → Hardware/driver issue

### Check if Camera is Being Used
```powershell
# Run this in PowerShell to see processes using camera
Get-Process | Where-Object {$_.ProcessName -match "zoom|teams|skype|discord|obs|camera"}
```

## 🎯 Most Likely Issues (Based on Your Symptom)

Since you have permissions but see a black screen:

### Issue 1: Camera Hardware Problem (Most Likely)
**Symptoms:** Black screen, camera icon with slash
**Test:** Open Windows Camera app
**Solution:** 
- If Windows Camera also shows black → Hardware/driver issue
- Update camera drivers in Device Manager
- Try external webcam

### Issue 2: Browser Not Releasing Camera
**Symptoms:** Works once, then black screen
**Solution:**
```javascript
// Run in console to force release all camera streams
navigator.mediaDevices.getUserMedia({video: true})
  .then(stream => {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Stopped track:', track.label);
    });
  });
```

### Issue 3: Wrong Camera Selected
**Symptoms:** Black screen from specific camera
**Solution:** If you have multiple cameras, browser might be using wrong one
- Check the diagnostic script output for camera list
- Physically disconnect other cameras
- Or modify video constraints to use specific camera

## 📝 Report Results

After running the diagnostic script, you'll see exactly what the issue is. Common outputs:

1. **"Found 0 camera(s)"** → No camera detected by Windows
2. **"Camera access SUCCESSFUL"** → Camera works, app issue
3. **"NotReadableError"** → Camera in use
4. **"NotFoundError"** → Camera disabled/not working

Run the script and let me know what you see! 🔍
