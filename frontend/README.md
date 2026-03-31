# SecureNote Frontend – React + Vite

This project provides a minimal frontend setup for **React** using **Vite**, featuring Hot Module Replacement (HMR) and basic ESLint rules to maintain code quality.

### Available Official Plugins

Currently, two official React plugins are supported:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) – powered by [Oxc](https://oxc.rs).  
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) – powered by [SWC](https://swc.rs).  

### React Compiler

The React Compiler is not enabled in this template to avoid potential performance impact during development and build.  
To enable it, follow the [official documentation](https://react.dev/learn/react-compiler/installation).

### ESLint Configuration

For production-grade applications, it is recommended to use **TypeScript** with type-aware ESLint rules.  
Refer to the [TypeScript React template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) and [typescript-eslint](https://typescript-eslint.io) documentation for integration guidance.