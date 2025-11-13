// src/infra/bridgeClient.ts
// Generic bridge wrapper (RPC / HTTP / nakama-js / custom)

import { Client, Session } from "@heroiclabs/nakama-js";
import axios, { AxiosInstance } from "axios";
import { BridgeClientOptions } from "./BridgeClientOptions";

type RpcResult<T = any> = T;


// this class wraps nakama-js Client and provides RPC call with retries, timeouts, and session management
// It can be used to call Nakama server RPC functions from other services.
// e.g. from Colyseus rooms or other backend services.

export class BridgeClient {
  private client: Client;
  private session?: Session;
  private http: AxiosInstance;
  private opts: Required<BridgeClientOptions>;

  constructor(opts: BridgeClientOptions) {
    this.opts = {
      port: opts.port ?? 7350,
      serverKey: opts.serverKey ?? "",
      useSSL: !!opts.useSSL,
      defaultTimeoutMs: opts.defaultTimeoutMs ?? 3000,
      maxRetries: opts.maxRetries ?? 2,
      host: opts.host,
    };

    // nakama-js client (low-level)
    this.client = new Client(this.opts.serverKey || undefined, this.opts.host, String(this.opts.port), this.opts.useSSL);

    // axios for health checks / fallback HTTP calls / consistent timeout
    this.http = axios.create({
      baseURL: `${this.opts.useSSL ? "https" : "http"}://${this.opts.host}:${this.opts.port}`,
      timeout: this.opts.defaultTimeoutMs,
    });
  }

  /** Authenticate as a service user (custom) - you must allow or create service account in Nakama settings */
  async authenticateService(serviceId = "bridge-service"): Promise<void> {
    // This uses custom auth to get a session token. You must enable custom auth or adapt to your auth method.
    // create=true will create user if not exists (ok for service account).
    const session = await this.client.authenticateCustom(serviceId, undefined);
    this.session = session;
  }

  /** Ensure there's a valid session before calls; caller can also supply explicit session */
  private async ensureSession(): Promise<Session> {
    if (this.session && !this.session.isexpired(Date.now() / 1000)) return this.session;
    // Re-authenticate
    await this.authenticateService();
    if (!this.session) throw new Error("Failed to obtain Nakama session");
    return this.session;
  }

  /**
   * Generic RPC call to Nakama's RPC functions.
   * - rpcId: function id / name registered on Nakama (e.g. "user.get")
   * - payload: object -> will be JSON-stringified by nakama-js
   * - opts: optional control (timeoutMs, retries)
   */
  async rpc<T = RpcResult>(rpcId: string, payload?: any, opts?: { timeoutMs?: number; retries?: number; idempotencyId?: string }): Promise<T> {
    const retries = opts?.retries ?? this.opts.maxRetries;
    let attempt = 0;
    const timeoutMs = opts?.timeoutMs ?? this.opts.defaultTimeoutMs;

    // nakama-js client.rpc(session, id, payload, ...). It returns an object with result, payload, etc.
    while (true) {
      attempt++;
      try {
        const session = await this.ensureSession();

        // nakama-js rpc returns { payload?: string; code?: number; message?: string }
        // but many projects wrap results into payload.
        const res = await this.client.rpc(session, rpcId, payload);

        // res.payload may be a JSON string from server module; parse if exists
        if (res && typeof res.payload === "string") {
          try {
            const parsed = JSON.parse(res.payload);
            return parsed as T;
          } catch (e) {
            // payload not JSON, but we still return it
            return (res.payload as unknown) as T;
          }
        }

        // no payload case — return raw res
        return (res as unknown) as T;
      } catch (err) {
        // Fatal: if not retriable or last attempt -> throw
        const isLast = attempt > retries;
        const isNetwork = this.isNetworkError(err);
        if (!isNetwork || isLast) {
          // attach context
          const e = new Error(`BridgeClient.rpc failed for ${rpcId} after ${attempt} attempt(s): ${String(err)}`);
          (e as any).cause = err;
          throw e;
        }
        // else backoff and retry
        await this.backoffSleep(attempt);
      }
    }
  }

  // Example: read storage object (single)
  async getStorageObject<T = any>(collection: string, key: string, userId?: string): Promise<T | null> {
    const session = await this.ensureSession();
    // Nakama storage read: client.readStorageObjects returns StorageObjects with objects array
    const objs = await this.client.readStorageObjects(session, {
      object_ids: [{ collection, key, user_id: userId || session.user_id }]
    });
    if (!objs || !objs.objects || objs.objects.length === 0) return null;
    const obj = objs.objects[0];
    if (!obj || !obj.value) return null;
    // Parse JSON value if it's a string
    try {
      return (typeof obj.value === 'string' ? JSON.parse(obj.value) : obj.value) as T;
    } catch {
      return obj.value as T;
    }
  }

  // helper for backoff
  private async backoffSleep(attempt: number) {
    const ms = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
    await new Promise((r) => setTimeout(r, ms));
  }

  private isNetworkError(err: any): boolean {
    if (!err) return false;
    // axios network error shapes
    if (err.isAxiosError) return true;
    const msg = String(err).toLowerCase();
    return msg.includes("network") || msg.includes("timeout") || msg.includes("failed to fetch") || msg.includes("econnrefused");
  }
}