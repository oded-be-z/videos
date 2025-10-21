#!/usr/bin/env node

/**
 * Deployment Validation Script
 *
 * Validates that all required configurations, secrets, and dependencies
 * are properly set up before deploying to production.
 *
 * Usage:
 *   node scripts/validate-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('blue', '═'.repeat(70));
}

class ValidationReport {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  addCheck(name, passed, message) {
    this.checks.push({ name, passed, message });
    if (!passed) {
      if (message.includes('Warning')) {
        this.warnings.push({ name, message });
      } else {
        this.errors.push({ name, message });
      }
    }
  }

  printCheck(name, passed, message) {
    const icon = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    console.log(`${icon} ${name}`);
    if (message && !passed) {
      log('yellow', `   ${message}`);
    }
  }

  printSummary() {
    console.log('');
    separator();
    log('bright', '📊 Validation Summary');
    separator();
    console.log('');

    const passedCount = this.checks.filter(c => c.passed).length;
    const totalCount = this.checks.length;
    const percentage = Math.round((passedCount / totalCount) * 100);

    console.log(`Total Checks: ${totalCount}`);
    log('green', `Passed: ${passedCount}`);
    log('red', `Failed: ${this.errors.length}`);
    log('yellow', `Warnings: ${this.warnings.length}`);
    console.log(`Success Rate: ${percentage}%`);
    console.log('');

    if (this.errors.length === 0) {
      separator();
      log('green', '🎉 All validation checks passed!');
      log('green', '✅ System is ready for production deployment');
      separator();
      console.log('');
      console.log('Next steps:');
      console.log('1. Run local test: npm start');
      console.log('2. Deploy to GitHub: git push origin main');
      console.log('3. Enable automation: gh workflow run daily-video.yml');
      console.log('');
      return 0;
    } else {
      separator();
      log('red', '❌ Validation failed!');
      log('yellow', `${this.errors.length} critical issue(s) found`);
      separator();
      console.log('');
      console.log('Critical Issues:');
      this.errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.name}`);
        log('yellow', `   ${err.message}`);
      });
      console.log('');
      console.log('Please fix these issues before deploying to production.');
      console.log('Refer to DEPLOYMENT.md for detailed setup instructions.');
      console.log('');
      return 1;
    }
  }
}

async function validateEnvironment() {
  const report = new ValidationReport();

  console.clear();
  separator();
  log('bright', '🔍 Seekapa YouTube Automation - Deployment Validation');
  separator();
  console.log('');

  // 1. Node.js Version
  log('cyan', '📦 Checking Dependencies...\n');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  const nodeCheck = majorVersion >= 20;
  report.addCheck(
    'Node.js Version',
    nodeCheck,
    nodeCheck ? `${nodeVersion} ✓` : `${nodeVersion} - Requires Node.js 20+`
  );
  report.printCheck('Node.js Version', nodeCheck, nodeCheck ? `${nodeVersion}` : `Requires 20+`);

  // 2. Package.json exists
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJsonExists = fs.existsSync(packageJsonPath);
  report.addCheck(
    'package.json',
    packageJsonExists,
    packageJsonExists ? null : 'package.json not found'
  );
  report.printCheck('package.json', packageJsonExists);

  // 3. Node modules installed
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const nodeModulesExists = fs.existsSync(nodeModulesPath);
  report.addCheck(
    'Dependencies Installed',
    nodeModulesExists,
    nodeModulesExists ? null : 'Run: npm install'
  );
  report.printCheck('Dependencies Installed', nodeModulesExists);

  // 4. FFmpeg installed
  let ffmpegInstalled = false;
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpegInstalled = true;
  } catch (err) {
    // FFmpeg not found
  }
  report.addCheck(
    'FFmpeg Installed',
    ffmpegInstalled,
    ffmpegInstalled ? null : 'Install: sudo apt install ffmpeg'
  );
  report.printCheck('FFmpeg Installed', ffmpegInstalled);

  console.log('');

  // 5. GitHub CLI
  log('cyan', '🔧 Checking Tools...\n');
  let ghInstalled = false;
  try {
    execSync('gh --version', { stdio: 'ignore' });
    ghInstalled = true;
  } catch (err) {
    // gh not found
  }
  report.addCheck(
    'GitHub CLI (gh)',
    ghInstalled,
    ghInstalled ? null : 'Install: sudo apt install gh'
  );
  report.printCheck('GitHub CLI (gh)', ghInstalled);

  console.log('');

  // 6. Configuration files
  log('cyan', '📁 Checking Configuration Files...\n');
  const configFiles = [
    'src/config/personas.json',
    'src/config/brand-compliance.json',
    'src/config/weekly-schedule.json',
    '.github/workflows/daily-video.yml'
  ];

  for (const file of configFiles) {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    report.addCheck(
      file,
      exists,
      exists ? null : `File not found: ${file}`
    );
    report.printCheck(file, exists);
  }

  console.log('');

  // 7. Environment variables (if .env exists)
  log('cyan', '🔐 Checking Environment Variables...\n');
  const envPath = path.join(process.cwd(), '.env');
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const requiredEnvVars = [
      'SYNTHESIA_API_KEY',
      'AZURE_OPENAI_KEY',
      'AZURE_OPENAI_ENDPOINT',
      'PERPLEXITY_API_KEY'
    ];

    for (const envVar of requiredEnvVars) {
      const hasVar = envContent.includes(`${envVar}=`) &&
                     !envContent.includes(`${envVar}=your_`) &&
                     !envContent.includes(`${envVar}=PENDING`);
      report.addCheck(
        envVar,
        hasVar,
        hasVar ? null : `Set in .env file`
      );
      report.printCheck(envVar, hasVar);
    }

    // YouTube credentials (optional for local testing)
    const youtubeVars = [
      'YOUTUBE_CLIENT_ID',
      'YOUTUBE_CLIENT_SECRET',
      'YOUTUBE_REFRESH_TOKEN'
    ];

    let youtubeConfigured = true;
    for (const envVar of youtubeVars) {
      if (!envContent.includes(`${envVar}=`) ||
          envContent.includes(`${envVar}=your_`)) {
        youtubeConfigured = false;
        break;
      }
    }

    report.addCheck(
      'YouTube OAuth',
      youtubeConfigured,
      youtubeConfigured ? null : 'Warning: Run scripts/get-youtube-token.js'
    );
    report.printCheck('YouTube OAuth', youtubeConfigured);
  } else {
    log('yellow', '⚠️  .env file not found (optional for local testing)');
    console.log('   Create .env for local testing or use GitHub secrets for production');
  }

  console.log('');

  // 8. GitHub secrets (if gh is installed and authenticated)
  if (ghInstalled) {
    log('cyan', '🔒 Checking GitHub Secrets...\n');
    let ghAuthenticated = false;
    try {
      execSync('gh auth status', { stdio: 'ignore' });
      ghAuthenticated = true;
    } catch (err) {
      // Not authenticated
    }

    if (ghAuthenticated) {
      try {
        const secrets = execSync('gh secret list', { encoding: 'utf-8' });
        const requiredSecrets = [
          'SYNTHESIA_API_KEY',
          'AZURE_OPENAI_KEY',
          'AZURE_OPENAI_ENDPOINT',
          'PERPLEXITY_API_KEY'
        ];

        for (const secret of requiredSecrets) {
          const hasSecret = secrets.includes(secret);
          report.addCheck(
            `GitHub Secret: ${secret}`,
            hasSecret,
            hasSecret ? null : 'Run: scripts/setup-github-secrets.sh'
          );
          report.printCheck(`GitHub Secret: ${secret}`, hasSecret);
        }
      } catch (err) {
        log('yellow', '⚠️  Could not fetch GitHub secrets (may need repo access)');
      }
    } else {
      log('yellow', '⚠️  Not authenticated with GitHub CLI');
      console.log('   Run: gh auth login');
    }
  }

  console.log('');

  // 9. Directory structure
  log('cyan', '📂 Checking Directory Structure...\n');
  const requiredDirs = [
    'src/agents',
    'src/services',
    'src/pipeline',
    'src/config',
    'src/utils',
    '.github/workflows',
    'docs'
  ];

  for (const dir of requiredDirs) {
    const dirPath = path.join(process.cwd(), dir);
    const exists = fs.existsSync(dirPath);
    report.addCheck(
      dir,
      exists,
      exists ? null : `Directory missing: ${dir}`
    );
    report.printCheck(dir, exists);
  }

  console.log('');

  // 10. Git repository
  log('cyan', '🌿 Checking Git Repository...\n');
  let isGitRepo = false;
  let hasRemote = false;
  let remoteName = '';

  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    isGitRepo = true;
  } catch (err) {
    // Not a git repo
  }

  report.addCheck(
    'Git Repository',
    isGitRepo,
    isGitRepo ? null : 'Run: git init'
  );
  report.printCheck('Git Repository', isGitRepo);

  if (isGitRepo) {
    try {
      remoteName = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
      hasRemote = remoteName.includes('github.com') && remoteName.includes('videos');
    } catch (err) {
      // No remote
    }

    report.addCheck(
      'GitHub Remote',
      hasRemote,
      hasRemote ? remoteName : 'Add remote: git remote add origin https://github.com/oded-be-z/videos'
    );
    report.printCheck('GitHub Remote', hasRemote);
  }

  // Print final summary
  const exitCode = report.printSummary();

  return exitCode;
}

// Run validation
validateEnvironment()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    log('red', `\n❌ Fatal error during validation: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
