#!/usr/bin/env node

// Simple interactive CLI for æææ.com demos
// This does not connect to a real AT Protocol server but stubs out
// the main commands so the interface can be tested offline.

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'æææ.com> '
});

function showHelp() {
  console.log(`Available commands:
  create identity --handle <handle> [--method <method>] [--pds <url>]
  init project --type <type> [--template <template>]
  deploy --domain <domain> [--geo <location>]
  help - show this message
  exit - quit the CLI`);
}

function parseOptions(args) {
  const opts = { _: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1];
      opts[key] = val;
      i++;
    } else {
      opts._.push(a);
    }
  }
  return opts;
}

function handleCommand(line) {
  const args = line.trim().split(/\s+/).filter(Boolean);
  if (args.length === 0) return;
  const cmd = args.shift();
  const opts = parseOptions(args);

  switch (cmd) {
    case 'create':
      if (opts._[0] === 'identity') {
        console.log(`✅ Sovereign identity created for ${opts.handle || 'unknown'}.`);
      } else {
        console.log('Unknown create command');
      }
      break;
    case 'init':
      if (opts._[0] === 'project') {
        console.log('🧬 Project scaffolded with federated hooks.');
      } else {
        console.log('Unknown init command');
      }
      break;
    case 'deploy':
      console.log('🚀 Application launched.');
      if (opts.geo) {
        console.log(`🌎 Linked to ${opts.geo}`);
      }
      break;
    case 'help':
      showHelp();
      break;
    case 'exit':
    case 'quit':
      rl.close();
      return;
    default:
      console.log(`Unknown command: ${cmd}`);
  }
}

console.log('Welcome to the æææ.com terminal CLI');
showHelp();
rl.prompt();

rl.on('line', (line) => {
  handleCommand(line);
  rl.prompt();
}).on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
