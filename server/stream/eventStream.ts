import type { Response } from 'express';

interface Client {
  id: string;
  res: Response;
}

class EventStreamManager {
  private clients: Map<string, Response> = new Map();

  public addClient(id: string, res: Response) {
    this.clients.set(id, res);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Send initial handshake
    this.sendToClient(res, 'system:connected', {
      connectedAt: new Date().toISOString(),
      activeClients: this.clients.size,
    });

    // Keepalive heartbeat every 20s
    const heartbeat = setInterval(() => {
      if (this.clients.has(id)) {
        res.write(': keepalive\n\n');
      } else {
        clearInterval(heartbeat);
      }
    }, 20000);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(id);
    });
  }

  public broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [, res] of this.clients.entries()) {
      try {
        res.write(payload);
      } catch (err) {
        // ignore closed socket errors
      }
    }
  }

  private sendToClient(res: Response, event: string, data: any) {
    try {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch {
      // ignore
    }
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export const eventStream = new EventStreamManager();
