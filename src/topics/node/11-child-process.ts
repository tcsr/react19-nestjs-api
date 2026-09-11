/**
 * CHILD PROCESS & PROCESS
 * -----------------------
 * node:child_process runs external commands / other programs:
 *  - spawn : stream-based, best for long-running / large output (no buffer limit).
 *  - exec  : buffers output into a callback string (convenient, size-capped).
 *  - fork  : spawn another Node script with an IPC channel (message passing).
 * Use to shell out, run CLIs, or scale across cores (fork per CPU / cluster).
 *
 * node:process — the running process: argv (CLI args), env, pid, cwd, exit(code),
 * and OS signals (SIGINT from Ctrl+C, SIGTERM from orchestrators) for GRACEFUL
 * SHUTDOWN (stop accepting work, drain, close DB, then exit).
 *
 * Run: npx tsx src/topics/node/11-child-process.ts
 */

import { spawn } from 'node:child_process';

// process basics
console.log('pid   :', process.pid);
console.log('node  :', process.version);
console.log('cwd   :', process.cwd());
console.log('argv  :', process.argv.slice(2)); // args after the script path
console.log('env   :', process.env.NODE_ENV ?? '(NODE_ENV unset)');

// Graceful shutdown handlers (real servers: close server + DB here).
process.on('SIGINT', () => {
  console.log('\nSIGINT received — cleaning up, then exit');
  process.exit(0);
});

// spawn a cross-platform command (node itself) and stream its output
const child = spawn(process.execPath, ['-e', "console.log('hello from child')"]);
child.stdout.on('data', (d) => console.log('child stdout:', d.toString().trim()));
child.on('exit', (code) => console.log('child exited with', code));
