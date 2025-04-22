# Vercel Deployment Fix

## Initial Issue

The project was failing to build on Vercel due to a dependency conflict between React 19 and @react-jvectormap/core, which only supports React up to version 18.

Error message:
```
npm error While resolving: @react-jvectormap/core@1.0.4
npm error Found: react@19.1.0
npm error Could not resolve dependency:
npm error peer react@"^16.8 || ^17 || ^18" from @react-jvectormap/core@1.0.4
```

## Initial Solution

Downgraded React from version 19 to version 18.2.0, which is compatible with @react-jvectormap/core:

1. Updated `react` and `react-dom` to version `^18.2.0`
2. Updated type definitions `@types/react` to `^18.2.65` 
3. Updated type definitions `@types/react-dom` to `^18.2.22`

## Second Issue

After downgrading to React 18, another dependency conflict emerged with react-simple-maps:

```
npm error While resolving: react-simple-maps@1.0.0
npm error Found: react@18.3.1
npm error Could not resolve dependency:
npm error peer react@"^16.8.0" from react-simple-maps@1.0.0
```

## Final Solution

To resolve both conflicts at once, we:

1. Kept React at version 18.2.0
2. Added a custom installation script in package.json:
   ```json
   "vercel-install": "npm install --legacy-peer-deps"
   ```
3. Created a vercel.json configuration file to use the custom installation script:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next",
         "config": {
           "installCommand": "npm run vercel-install"
         }
       }
     ]
   }
   ```

This approach uses the `--legacy-peer-deps` flag to ignore peer dependency conflicts during installation on Vercel, allowing the application to build successfully despite the conflicts between different React version requirements.

## Alternatives Considered

Other potential solutions would include:
1. Using different map libraries that support React 18/19
2. Creating custom implementations without external map libraries
3. Downgrading to React 16 (which would be compatible with all libraries but incompatible with Next.js 15)

The chosen approach offers the best balance of performance and maintainability for this specific application. 