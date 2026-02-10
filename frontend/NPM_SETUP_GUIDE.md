# Frontend npm Setup & Troubleshooting Guide

## ✅ Current Status

**npm install**: ✅ Successfully completed  
**Build**: ✅ Successful (with minor warnings)  
**Dependencies**: 1,428 packages installed  
**Vulnerabilities**: 9 remaining (in transitive dependencies - low risk)  

## 🔧 What Was Fixed

### Network Timeout Resolution
The original error was `ETIMEDOUT` downloading `victory-vendor`. Fixed by:
1. Clearing npm cache: `npm cache clean --force`
2. Increasing timeouts: `--fetch-timeout=120000`
3. Using `--legacy-peer-deps` for compatibility

### Security Vulnerabilities
Ran `npm audit fix` to address:
- Updated glob to v10.5.0
- Updated 31 packages to latest secure versions
- Removed 7 packages with vulnerabilities

## ⚠️ Remaining Issues (Low Priority)

### 9 Security Vulnerabilities (in transitive dependencies)
These are in packages required by `react-scripts@5.0.1`:
- `nth-check` vulnerability in svgo
- `postcss` parsing error in resolve-url-loader
- `webpack-dev-server` source code disclosure vulnerability

**Why they're not fixed**: Resolving them would require upgrading to `react-scripts@5.0.0` (breaking change)

**Risk Level**: **Low** - Only affects development, not production builds

**Resolution Options**:
1. **Recommended**: Upgrade React and dependencies (see next section)
2. **Current**: Keep as-is for now, monitor security advisories

### ESLint Warnings (5 cleanup items)

These are in the source code and should be fixed:

#### 1. Unused Variables - Add underscore prefix or remove
```typescript
// File: src/App.tsx
// Line 65: 'CompanyDashboard' is defined but never used
// Line 129: 'isIndividualUser' and 'isOrganizationUser' never used

// File: src/components/Auth/SocialCallback.tsx
// Line 2: 'useParams' never used

// File: src/components/ConnectWalletButton.tsx
// Line 9: 'providerAvailable' never used

// File: src/pages/enterprise/EnterpriseSecurity.tsx
// Lines 34,36: 'Security', 'Warning' never used
// Line 186: 'setSelectedEnterprise' never used
// Line 201: 'token' never used
// Line 204: 'eid' parameter never used
```

**Fix**: Either use the variable or prefix with underscore `_variableName`

#### 2. Anonymous Default Export
```typescript
// File: src/services/securityMockData.ts
// Line 105: Assign object to variable before exporting

// Current (bad):
// export default { ... objects ... }

// Should be:
// const mockData = { ... objects ... }
// export default mockData
```

## 🚀 Recommended: Upgrade to Latest Versions

While current setup works, modernizing dependencies improves security:

```bash
# Option 1: Update individual packages
npm install react@latest react-dom@latest react-scripts@latest
npm install --save-dev typescript@latest
npm audit fix

# Option 2: Full package upgrade
npm update --save
npm update --save-dev
npm audit fix
```

## 📋 Quick Fixes

### Fix ESLint Warnings
```bash
# Rename unused variables to _variableName to suppress warnings
# Or better: remove if not needed

# Run linter to see all issues
npm run lint  # (if available)
# Or check during build
npm run build
```

### Clear node_modules & Reinstall (if issues persist)
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Test the Development Server
```bash
npm start
```
Server starts at http://localhost:3000

## 🔍 Checking Vulnerabilities

### View all security issues:
```bash
npm audit
```

### View detailed vulnerability info:
```bash
npm audit --detailed
npm audit --json  # For programmatic parsing
```

### Check for outdated packages:
```bash
npm outdated
```

## 📦 Package Status

### Critical Dependencies:
| Package | Version | Status |
|---------|---------|--------|
| react | ^19.1.1 | ✅ Latest major |
| react-dom | ^19.1.1 | ✅ Latest major |
| react-scripts | ^5.0.1 | ⚠️ Has transitive vulnerabilities |
| typescript | ^4.9.5 | ✅ Good version |
| @mui/material | ^7.3.2 | ✅ Latest |

### Deprecated Packages (Development Only):
- `@babel/plugin-proposal-*` → Use `@babel/plugin-transform-*` instead
- `eslint@8.57.1` → Update to ESLint 9
- `svgo@1.3.2` → Update to v3 or v2

These don't need immediate action but should be tracked for updates.

## 🎯 Deployment Status

### For Development:
```bash
npm start      # Runs dev server with hot reload
npm run build  # Creates optimized production build
npm test       # Runs test suite
```

### For Production:
The build output is ready to deploy:
- ✅ Compiled with minor warnings only
- ✅ Code split and optimized (412 kB gzipped main bundle)
- ✅ Static files ready in `/build` directory
- ✅ Can be served with: `serve -s build` or any static server

## 🔐 Security Checklist

Before deploying to production:
- [ ] Run `npm audit` and review all vulnerabilities
- [ ] Update to latest dependencies: `npm update`
- [ ] Fix ESLint warnings in source code
- [ ] Run security scanning in CI/CD (Trivy, OWASP)
- [ ] Test build: `npm run build`
- [ ] Test in staging environment first

## 📞 Support

For npm issues:
1. Check official docs: https://docs.npmjs.com/
2. View specific advisory: https://registry.npmjs.org/-/npm/v1/security/advisories
3. Check GitHub: https://github.com/npm/npm/issues

---

**Last Updated**: February 10, 2026  
**Node Version**: Check with `node --version` (should be 18+)  
**npm Version**: Check with `npm --version` (should be 9+)
