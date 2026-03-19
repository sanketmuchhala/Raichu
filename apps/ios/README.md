# Raichu iOS App (Placeholder)

This directory is reserved for the future iOS implementation of Raichu.

## Architecture Plan

The iOS app will reuse the shared TypeScript game engine (`@raichu/game-engine`) through one of these approaches:

### Option A: React Native (Recommended for v1)
- Use React Native with the shared TS engine directly
- Reuse move generation, validation, and game state logic
- Build native-feeling UI with React Native components
- Share Zustand stores and game logic from the web app

### Option B: Native Swift with JS Bridge
- Embed the compiled game engine JS bundle via JavaScriptCore
- Build native SwiftUI interface
- Call engine functions through a thin bridge layer
- Better native performance but more bridge code

### Option C: Full Swift Rewrite
- Port game engine logic to Swift
- Use Swift Package Manager
- Most native but requires maintaining two engine codebases

## Shared Engine Integration

The `@raichu/game-engine` package is designed to be portable:
- Pure TypeScript with zero DOM dependencies
- No browser APIs used
- Deterministic — same input always produces same output
- All state is passed explicitly (no global state)

This makes it suitable for embedding in any JavaScript runtime, including React Native's Hermes or JavaScriptCore.

## TODO
- [ ] Choose integration approach (React Native vs Native Swift)
- [ ] Set up project scaffolding
- [ ] Implement board UI
- [ ] Integrate shared engine
- [ ] Add touch-based interaction
- [ ] Test on physical devices
