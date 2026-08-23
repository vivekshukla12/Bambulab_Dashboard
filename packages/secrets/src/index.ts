// SPDX-License-Identifier: MPL-2.0

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Dedicated secret-store boundary. M1 tests use only synthetic values.
 */
export interface SecretStore {
  set(name: string, value: string): Promise<void>;
  get(name: string): Promise<string | undefined>;
  delete(name: string): Promise<void>;
  listNames(): Promise<string[]>;
}

/**
 * In-memory secret store for process-only synthetic tests.
 */
export class InMemorySecretStore implements SecretStore {
  private readonly values = new Map<string, string>();

  async set(name: string, value: string): Promise<void> {
    this.values.set(name, value);
  }

  async get(name: string): Promise<string | undefined> {
    return this.values.get(name);
  }

  async delete(name: string): Promise<void> {
    this.values.delete(name);
  }

  async listNames(): Promise<string[]> {
    return [...this.values.keys()].sort();
  }
}

interface EncryptedRecord {
  iv: string;
  tag: string;
  ciphertext: string;
}

type EncryptedVault = Record<string, EncryptedRecord>;

/**
 * File-backed encrypted secret store that demonstrates the M1 encrypted-at-rest direction.
 *
 * It does not claim the later machine-independent disaster-recovery key model.
 */
export class EncryptedFileSecretStore implements SecretStore {
  private readonly key: Buffer;

  constructor(
    private readonly filePath: string,
    keyMaterial: string
  ) {
    this.key = scryptSync(keyMaterial, "bpd-m1-synthetic-secrets", 32);
  }

  async set(name: string, value: string): Promise<void> {
    const vault = await this.readVault();
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    vault[name] = {
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ciphertext: ciphertext.toString("base64")
    };
    await this.writeVault(vault);
  }

  async get(name: string): Promise<string | undefined> {
    const vault = await this.readVault();
    const record = vault[name];
    if (!record) {
      return undefined;
    }
    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(record.iv, "base64"));
    decipher.setAuthTag(Buffer.from(record.tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(record.ciphertext, "base64")),
      decipher.final()
    ]).toString("utf8");
  }

  async delete(name: string): Promise<void> {
    const vault = await this.readVault();
    delete vault[name];
    await this.writeVault(vault);
  }

  async listNames(): Promise<string[]> {
    return Object.keys(await this.readVault()).sort();
  }

  private async readVault(): Promise<EncryptedVault> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as EncryptedVault;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {};
      }
      throw error;
    }
  }

  private async writeVault(vault: EncryptedVault): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, `${JSON.stringify(vault, null, 2)}\n`, "utf8");
  }
}
