import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, chmodSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import fetch from 'node-fetch';
import * as readline from 'readline';

const CREDENTIALS_DIR = join(homedir(), '.socialsyncs');
const CREDENTIALS_FILE = join(CREDENTIALS_DIR, 'credentials.json');

const DEFAULT_API_URL = 'https://app.socialsyncs.co/api';

interface StoredCredentials {
  accessToken: string;
  apiUrl: string;
  organizationId?: string;
}

export function loadCredentials(): StoredCredentials | null {
  try {
    if (!existsSync(CREDENTIALS_FILE)) return null;
    const data = JSON.parse(readFileSync(CREDENTIALS_FILE, 'utf-8'));
    if (!data.accessToken) return null;
    return data;
  } catch {
    return null;
  }
}

function saveCredentials(credentials: StoredCredentials): void {
  if (!existsSync(CREDENTIALS_DIR)) {
    mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
  }
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), { encoding: 'utf-8', mode: 0o600 });
  chmodSync(CREDENTIALS_FILE, 0o600);
}

function deleteCredentials(): void {
  if (existsSync(CREDENTIALS_FILE)) {
    unlinkSync(CREDENTIALS_FILE);
  }
}

function prompt(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (hidden) {
      process.stdout.write(question);
      let input = '';
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', function handler(char: string) {
        if (char === '\n' || char === '\r' || char === '') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', handler);
          process.stdout.write('\n');
          rl.close();
          resolve(input);
        } else if (char === '') {
          process.exit();
        } else if (char === '') {
          input = input.slice(0, -1);
        } else {
          input += char;
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

export async function authLogin(argv: any) {
  const defaultUrl = process.env.SOCIALSYNCS_API_URL || DEFAULT_API_URL;

  console.log('\n🔐 SocialSyncs Login\n');
  console.log('  Get your API key from: Settings → Developers → API Key\n');

  const apiKey = await prompt('  Paste your API key: ', true);

  if (!apiKey || apiKey.trim() === '') {
    console.error('\n❌ No API key provided. Aborting.');
    process.exit(1);
  }

  const apiUrlInput = await prompt(`  API URL [${defaultUrl}]: `);
  const apiUrl = apiUrlInput.trim() || defaultUrl;

  console.log('\n🔄 Verifying credentials...');

  try {
    const response = await fetch(`${apiUrl}/public/v1/integrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey.trim(),
      },
    });

    if (response.ok) {
      const integrations = (await response.json()) as any[];
      saveCredentials({ accessToken: apiKey.trim(), apiUrl });
      console.log(`✅ Authenticated! ${integrations.length} integration(s) connected.`);
      console.log(`📁 Credentials saved to ${CREDENTIALS_FILE}`);
    } else if (response.status === 401 || response.status === 403) {
      console.error('❌ Invalid API key. Check Settings → Developers and try again.');
      process.exit(1);
    } else {
      const error = await response.text();
      console.error(`❌ Could not verify (HTTP ${response.status}): ${error}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error(`❌ Could not reach ${apiUrl}: ${error.message}`);
    console.error('   Check your API URL and make sure the server is running.');
    process.exit(1);
  }
}

export async function authLogout() {
  const creds = loadCredentials();
  if (!creds) {
    console.log('ℹ️  No stored credentials found.');
    return;
  }
  deleteCredentials();
  console.log('✅ Credentials removed.');
}

export async function authStatus() {
  const envKey = process.env.SOCIALSYNCS_API_KEY;
  const creds = loadCredentials();

  let apiKey: string | undefined;
  let apiUrl: string;

  if (creds) {
    console.log('🔐 Authentication method: Saved credentials');
    console.log(`📡 API URL: ${creds.apiUrl}`);
    console.log(`🔑 Key: ${creds.accessToken.substring(0, 8)}...`);
    console.log(`📁 Credentials file: ${CREDENTIALS_FILE}`);
    apiKey = creds.accessToken;
    apiUrl = creds.apiUrl;
  } else if (envKey) {
    console.log('🔑 Authentication method: API Key (environment variable)');
    console.log(`🔑 Key: ${envKey.substring(0, 8)}...`);
    apiKey = envKey;
    apiUrl = process.env.SOCIALSYNCS_API_URL || DEFAULT_API_URL;
  } else {
    console.log('❌ Not authenticated.\n');
    console.log('Options:');
    console.log('  1. Interactive: socialsyncs auth:login');
    console.log('  2. Env var:     export SOCIALSYNCS_API_KEY=your_api_key');
    return;
  }

  console.log('\n🔄 Verifying credentials...');
  try {
    const response = await fetch(`${apiUrl}/public/v1/integrations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: apiKey,
      },
    });

    if (response.ok) {
      const integrations = (await response.json()) as any[];
      console.log(`✅ Credentials are valid. ${integrations.length} integration(s) connected.`);
    } else if (response.status === 401 || response.status === 403) {
      console.log('❌ Credentials are expired or invalid. Run: socialsyncs auth:login');
    } else {
      const error = await response.text();
      console.log(`⚠️  Could not verify credentials (HTTP ${response.status}): ${error}`);
    }
  } catch (error: any) {
    console.log(`⚠️  Could not reach API: ${error.message}`);
  }
}