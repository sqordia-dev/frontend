import * as signalR from '@microsoft/signalr';

const getHubUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return `${envUrl}/hubs/notifications`;
  // Default: same-origin in production
  return '/hubs/notifications';
};

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection | null {
  return connection;
}

export function buildConnection(): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(getHubUrl(), {
      // HttpOnly cookies are sent automatically with the WebSocket handshake
      withCredentials: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export async function startConnection(): Promise<void> {
  const conn = buildConnection();
  if (conn.state === signalR.HubConnectionState.Connected) return;
  if (conn.state === signalR.HubConnectionState.Connecting) return;

  try {
    await conn.start();
  } catch (err) {
    console.warn('[SignalR] Connection failed, will retry:', err);
  }
}

export async function stopConnection(): Promise<void> {
  if (connection) {
    try {
      await connection.stop();
    } catch {
      // ignore
    }
    connection = null;
  }
}
