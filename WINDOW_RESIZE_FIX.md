# Window Resize Issues - Root Cause and Fix

## 🔴 Critical Bug Found and Fixed

### The Bug
**File**: `src/background.js`, **Line**: 107

```javascript
// WRONG - Prevents window from being resized
win.setMaximumSize(0, 0)
```

This line was preventing the window from being resized beyond its initial 410×510 size.

### The Root Cause
When `setMaximumSize(0, 0)` is called on a BrowserWindow:
- The window cannot be resized to any size other than what's currently set
- Subsequent `setBounds()` or `setSize()` calls in `adjustWindowSize()` fail
- Window remains stuck at initial dimensions (410×510)

### The Fix
**Changed to**:
```javascript
// CORRECT - Allows unlimited window resizing
win.setMaximumSize(10000, 10000)
```

## ✅ Verification Results

### Before Fix
```
[Main] 📍 Adjusting to /login: 450x550
[Main] ✓ Final size: 410x510  ❌ WRONG - Window didn't resize
```

### After Fix
```
[Main] 📍 Adjusting to /login: 450x550
[Main] ✓ Final size: 450x550  ✅ CORRECT - Window resized properly
```

### Route-Based Window Sizing (All Working Now)
- **Login**: 450×550 ✓
- **Register**: 480×750 ✓
- **Home/Chat**: ~1875×1013 (75% of screen) ✓

## 📊 Impact Analysis

### What This Fixes
1. ✅ Window resizes correctly when navigating between routes
2. ✅ Small windows stay at correct sizes (login: 450×550, register: 480×750)
3. ✅ Large windows scale to 75% of screen (home/chat page)
4. ✅ All route-based automatic sizing now works as intended

### Related Code Components
The fix affects the `adjustWindowSize()` function in `background.js` which is triggered by:
1. Route change events from `did-navigate-in-page`
2. IPC messages from renderer process via `routeChange` event

## 🔍 Additional Issue (Pending Investigation)

### WebSocket Disconnect on Manual Resize
**User Report**: "拖动大小的时候， 会断线重连， 并且还原初始大小"
(When dragging to resize at large sizes, WebSocket disconnects/reconnects and window reverts to 410×510)

### Status
- Not directly caused by the window resizing code
- Likely caused by one of:
  1. Layout reflow during resize triggering component lifecycle events
  2. Network connectivity issue during window drag operation
  3. WebSocket reconnection logic triggering window size reset

### Next Steps
1. Monitor for WebSocket disconnect events during manual resize testing
2. Check if the reconnection handler in `Home.vue` triggers any window-related code
3. Implement debouncing for resize operations to prevent rapid re-triggering
4. Consider disabling automatic resize when user manually maximizes window

## 🛠️ Code Quality Improvements

### Recommended Future Fixes
1. **Add debouncing** to prevent multiple rapid `adjustWindowSize()` calls
2. **Add `isUserMaximized` flag** to track user-initiated maximize vs automatic maximize
3. **Disable dev tools** in production (currently `devTools: true`)
4. **Fix tray icon error** ("conversion failure from undefined" - appLogo path issue)
5. **Handle screen orientation changes** with display-metrics-changed event

## 📝 Testing Checklist

- [x] Window resizes correctly on route change
- [x] Login page displays at 450×550
- [x] Register page displays at 480×750
- [x] Home/Chat page displays at 75% screen size
- [x] Window remains at target size after route change
- [ ] Manual drag resize works without WebSocket issues (needs investigation)
- [ ] Maximize button works correctly
- [ ] Window position centered on screen
- [ ] Multi-monitor support works correctly

## 🚀 Deployment Notes

This fix is a critical bug fix that should be deployed immediately. It resolves the window sizing issues that were preventing proper application display across different pages.

The fix has been tested and verified to work correctly for all route-based window sizing scenarios.
