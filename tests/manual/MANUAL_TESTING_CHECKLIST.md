# Manual Testing Checklist

## Core App Flow
- [ ] App launches without crash on Android.
- [ ] App launches without crash on iOS.
- [ ] Chat screen loads and accepts user input.
- [ ] Chat history can be cleared and restored.

## Network and Offline
- [ ] App handles airplane mode without crash.
- [ ] Offline banner/snackbar is visible when disconnected.
- [ ] Reconnection removes offline banner/snackbar.

## Location and Dispatch
- [ ] Location permission prompt appears when needed.
- [ ] Chat send is blocked when location permission is denied.
- [ ] Dispatch payload includes geotag when permission is granted.

## Authentication
- [ ] Login with valid credentials succeeds.
- [ ] Login with invalid credentials shows a user-safe error.
- [ ] Password reset flow completes.

## UI and UX
- [ ] Layout is usable on small-screen devices.
- [ ] Layout is usable on large-screen devices.
- [ ] Dark/light mode status bar contrast is readable.

## Accessibility
- [ ] Screen reader can focus critical controls.
- [ ] Primary actions are announced with clear labels.
- [ ] Touch targets are comfortably tappable.
