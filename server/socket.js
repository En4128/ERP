const socketio = require('socket.io');
const Message = require('./models/Message');

const initSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const activeUsers = new Map();

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join', (userId) => {
            if (!userId) {
                console.error('Socket error - join: userId is missing');
                return;
            }
            activeUsers.set(userId, socket.id);
            socket.join(userId);
            console.log(`User ${userId} joined their private room`);
        });

        socket.on('send_message', async (data) => {
            const { sender, receiver, content } = data;

            if (!sender || !receiver || !content) {
                console.error('Socket error - send_message: Missing required fields', { sender, receiver, content });
                return;
            }

            try {
                // Save to database
                const newMessage = new Message({
                    sender,
                    receiver,
                    content
                });
                await newMessage.save();

                // Send to receiver if online
                io.to(receiver).emit('receive_message', newMessage);

                // Send back to sender for confirmation
                io.to(sender).emit('message_sent', newMessage);

            } catch (error) {
                console.error('Socket error - send_message:', error.message);
            }
        });

        socket.on('mark_as_read', async (msgId) => {
            try {
                await Message.findByIdAndUpdate(msgId, { read: true });
            } catch (error) {
                console.error('Socket error - mark_as_read:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // Remove user from activeUsers map
            for (let [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

module.exports = initSocket;
