

export interface BridgeClientOptions {
  host: string;          // e.g. "127.0.0.1"
  port?: string | number; // e.g. "7350"
  serverKey?: string;    // if you have server key for server-to-server flows (optional)
  useSSL?: boolean;
  defaultTimeoutMs?: number;
  maxRetries?: number;
}
