import { Server } from 'ws';

export default (server) => {
  const wss = new Server({ server });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      const { type, data } = JSON.parse(message);
      if (type === 'ORDER_UPDATE') {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'ORDER_UPDATE', data }));
          }
        });
      }
    });
  });
};