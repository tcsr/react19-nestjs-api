/**
 * ERROR HANDLING
 * --------------
 * Patterns:
 *  - Sync: try/catch.
 *  - Promises/async: try/catch around await, or .catch(). An UNAWAITED rejected
 *    promise becomes an "unhandledRejection".
 *  - Callbacks: error-first convention fn(err, result).
 *
 * Custom error classes carry type + context (status codes, cause). Use `cause`
 * (ES2022) to wrap the original error without losing the stack.
 *
 * Process-level safety nets (last resort — log + exit, don't keep running in an
 * unknown state):
 *   process.on('uncaughtException', ...)
 *   process.on('unhandledRejection', ...)
 *
 * Run: npx tsx src/topics/node/06-error-handling.ts
 */

// Custom typed error
class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AppError';
  }
}

async function risky(fail: boolean) {
  if (fail) throw new AppError('resource missing', 404);
  return 'ok';
}

async function main() {
  try {
    await risky(true);
  } catch (e) {
    if (e instanceof AppError) console.log(`AppError ${e.status}: ${e.message}`);
  }

  // wrapping with cause
  try {
    try {
      JSON.parse('{bad');
    } catch (orig) {
      throw new AppError('failed to parse config', 500, { cause: orig });
    }
  } catch (e) {
    const err = e as AppError;
    console.log('wrapped:', err.message, '| cause:', (err.cause as Error).name);
  }
}

// Safety net (illustrative)
process.on('unhandledRejection', (reason) => console.error('unhandledRejection:', reason));

await main();
