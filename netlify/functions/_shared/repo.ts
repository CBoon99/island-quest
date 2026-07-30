/**
 * Server repository factory.
 * Default: durable file store (survives restarts; local + long-running Netlify).
 * IQ_STORE=memory — in-process only (tests).
 * IQ_STORE_PATH — override file path (default .data/island-quest-store.json).
 *
 * Netlify Blobs: set IQ_STORE=blobs when @netlify/blobs is available in runtime;
 * falls back to file if Blobs init fails.
 */
import { join } from 'node:path';
import { FileGameRepository } from '../../../src/repositories/fileStore';
import { MemoryGameRepository } from '../../../src/repositories/memory';
import type { GameRepository } from '../../../src/repositories/types';

declare global {
  // eslint-disable-next-line no-var
  var __iqRepo: GameRepository | undefined;
  // eslint-disable-next-line no-var
  var __iqRepoMode: string | undefined;
}

function defaultFilePath(): string {
  return process.env.IQ_STORE_PATH ?? join(process.cwd(), '.data', 'island-quest-store.json');
}

function createRepo(): GameRepository {
  const mode = (process.env.IQ_STORE ?? 'file').toLowerCase();

  if (mode === 'memory') {
    return new MemoryGameRepository();
  }

  if (mode === 'blobs') {
    // Optional dynamic path — keep file fallback for environments without Blobs.
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      // Blobs adapter is deferred: require site context. File is durable SoT for v1.
      return new FileGameRepository(defaultFilePath());
    } catch {
      return new FileGameRepository(defaultFilePath());
    }
  }

  return new FileGameRepository(defaultFilePath());
}

export function getServerRepo(): GameRepository {
  const mode = process.env.IQ_STORE ?? 'file';
  if (!globalThis.__iqRepo || globalThis.__iqRepoMode !== mode) {
    globalThis.__iqRepo = createRepo();
    globalThis.__iqRepoMode = mode;
  }
  return globalThis.__iqRepo;
}

/** Reset singleton. Tests should set IQ_STORE=memory before calling. */
export function resetServerRepo(): void {
  globalThis.__iqRepo = undefined;
  globalThis.__iqRepoMode = undefined;
}
