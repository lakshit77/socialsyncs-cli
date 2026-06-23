import { readFileSync } from 'fs';
import { SocialSyncsAPI } from '../api';
import { getConfig } from '../config';

function client() {
  return new SocialSyncsAPI(getConfig());
}

function readWorkflow(file: string): any {
  let raw: string;
  try {
    raw = readFileSync(file, 'utf-8');
  } catch (error: any) {
    console.error(`❌ Could not read file "${file}":`, error.message);
    process.exit(1);
  }
  try {
    return JSON.parse(raw);
  } catch (error: any) {
    console.error(`❌ "${file}" is not valid JSON:`, error.message);
    process.exit(1);
  }
}

export async function listAutomations(args: any) {
  const api = client();
  try {
    const result = await api.listAutomations(args?.integration);
    console.log('🤖 Automations:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to list automations:', error.message);
    process.exit(1);
  }
}

export async function getAutomation(args: any) {
  if (!args.id) {
    console.error('❌ Automation ID is required');
    process.exit(1);
  }
  const api = client();
  try {
    const result = await api.getAutomation(args.id);
    console.log(`🤖 Automation: ${args.id}`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to get automation:', error.message);
    process.exit(1);
  }
}

export async function createAutomation(args: any) {
  if (!args.json) {
    console.error('❌ --json <file> is required (path to a workflow JSON file)');
    process.exit(1);
  }
  const workflow = readWorkflow(args.json);
  const api = client();
  try {
    const result = await api.createAutomation(workflow);
    console.log('✅ Automation created:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to create automation:', error.message);
    process.exit(1);
  }
}

export async function updateAutomation(args: any) {
  if (!args.id) {
    console.error('❌ Automation ID is required');
    process.exit(1);
  }
  if (!args.json) {
    console.error('❌ --json <file> is required (path to a workflow JSON file)');
    process.exit(1);
  }
  const workflow = readWorkflow(args.json);
  const api = client();
  try {
    const result = await api.updateAutomation(args.id, workflow);
    console.log('✅ Automation updated:');
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to update automation:', error.message);
    process.exit(1);
  }
}

export async function toggleAutomation(args: any) {
  if (!args.id) {
    console.error('❌ Automation ID is required');
    process.exit(1);
  }
  const active = String(args.active) === 'true';
  const api = client();
  try {
    const result = await api.toggleAutomation(args.id, active);
    console.log(`✅ Automation ${active ? 'activated' : 'deactivated'}:`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to toggle automation:', error.message);
    process.exit(1);
  }
}

export async function deleteAutomation(args: any) {
  if (!args.id) {
    console.error('❌ Automation ID is required');
    process.exit(1);
  }
  const api = client();
  try {
    const result = await api.deleteAutomation(args.id);
    console.log(`🗑️  Automation deleted: ${args.id}`);
    if (result) console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to delete automation:', error.message);
    process.exit(1);
  }
}

export async function automationLogs(args: any) {
  if (!args.id) {
    console.error('❌ Automation ID is required');
    process.exit(1);
  }
  const api = client();
  try {
    const result = await api.getAutomationLogs(args.id, {
      cursor: args.cursor,
      limit: args.limit ? Number(args.limit) : undefined,
    });
    console.log(`📜 Logs for automation: ${args.id}`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to get automation logs:', error.message);
    process.exit(1);
  }
}

export async function testAutomation(args: any) {
  if (!args.id) {
    console.error('❌ Automation ID is required');
    process.exit(1);
  }
  if (!args.text) {
    console.error('❌ --text is required (the sample message to test against)');
    process.exit(1);
  }
  const api = client();
  try {
    const result = await api.testAutomation(args.id, {
      sampleText: args.text,
      samplePostId: args.postId,
      sampleUsername: args.username,
    });
    console.log(`🧪 Test result for automation: ${args.id}`);
    console.log(JSON.stringify(result, null, 2));
    return result;
  } catch (error: any) {
    console.error('❌ Failed to test automation:', error.message);
    process.exit(1);
  }
}