# Publishing Guide

This guide walks you through publishing the monify-react-native package to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com/signup)
2. **Git Repository**: Push your code to GitHub/GitLab
3. **Verification**: Verify your npm email address

## Pre-Publishing Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Run tests and ensure they pass
- [ ] Build the package successfully
- [ ] Update documentation if needed
- [ ] Commit all changes

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

### 2. Verify Login

```bash
npm whoami
```

### 3. Run Pre-publish Checks

```bash
# Build the package
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Check package contents
npm pack --dry-run
```

### 4. Version Management

Choose appropriate version bump:

- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Major** (1.0.0 → 2.0.0): Breaking changes

```bash
# Patch version
npm version patch

# Minor version
npm version minor

# Major version
npm version major

# Or set specific version
npm version 1.2.3
```

### 5. Publish to npm

For first-time publishing:

```bash
npm publish
```

For scoped packages:

```bash
npm publish --access public
```

For beta/alpha versions:

```bash
npm publish --tag beta
```

### 6. Verify Publication

```bash
npm info monify-react-native
```

## Post-Publishing

1. **Create Git Tag**

   ```bash
   git push origin main --tags
   ```

2. **Create GitHub Release**

   - Go to your repository on GitHub
   - Click "Releases" → "Create a new release"
   - Select the version tag
   - Add release notes

3. **Update Documentation**
   - Update README if needed
   - Update example projects
   - Notify users about new version

## Troubleshooting

### Package Name Already Exists

```bash
# Check if name is available
npm info your-package-name

# Use scoped package name
npm publish --access public @yourusername/monify-react-native
```

### Permission Errors

```bash
# Re-login
npm logout
npm login

# Check permissions
npm owner ls monify-react-native
```

### Build Errors

```bash
# Clean and rebuild
rm -rf lib node_modules
npm install
npm run build
```

## Automation with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish Package

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices

1. **Semantic Versioning**: Always follow semver
2. **Changelog**: Keep detailed changelog
3. **Testing**: Test thoroughly before publishing
4. **Documentation**: Keep docs up to date
5. **Backward Compatibility**: Avoid breaking changes in minor/patch versions
6. **Dependencies**: Keep dependencies minimal and up to date

## Version History

| Version | Description     | Date       |
| ------- | --------------- | ---------- |
| 1.0.0   | Initial release | 2025-06-23 |

Remember to update this table with each release!
