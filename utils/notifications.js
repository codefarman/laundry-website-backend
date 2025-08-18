import { WebSocket } from 'ws';

// Map to track user WebSocket connections (userId -> Set of WebSocket clients)
const userConnections = new Map();

// Register a WebSocket client for a user
export const registerUserSocket = (userId, ws) => {
  try {
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId).add(ws);
    console.log(`WebSocket registered for user ${userId}: ${userConnections.get(userId).size} connections`);

    // Clean up on disconnect
    ws.on('close', () => {
      userConnections.get(userId)?.delete(ws);
      if (userConnections.get(userId)?.size === 0) {
        userConnections.delete(userId);
      }
      console.log(`WebSocket disconnected for user ${userId}: ${userConnections.get(userId)?.size || 0} connections remaining`);
    });
  } catch (error) {
    console.error(`Error registering WebSocket for user ${userId}:`, error.message);
  }
};

// Send notification to a specific user via WebSocket
export const sendNotification = async (userId, message) => {
  try {
    const wsMessage = {
      type: 'NOTIFICATION',
      data: {
        userId,
        message,
        timestamp: new Date().toISOString(),
      },
    };

    // Send to specific user's WebSocket clients
    const userSockets = userConnections.get(userId);
    if (userSockets && userSockets.size > 0) {
      userSockets.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(wsMessage));
          console.log(`Notification sent to user ${userId}: ${message}`);
        } else {
          console.warn(`WebSocket not open for user ${userId}, removing connection`);
          userSockets.delete(client);
        }
      });
      if (userSockets.size === 0) {
        userConnections.delete(userId);
      }
    } else {
      console.warn(`No active WebSocket connections for user ${userId}; skipping notification`);
    }

    // Placeholder for additional methods (e.g., email, SMS)
    // Example: await sendEmail(userId, message);
    // Example: await sendSMS(userId, message);
    console.log(`Notification processed for user ${userId}: ${message}`);
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, {
      message,
      error: error.message,
    });
  }
};