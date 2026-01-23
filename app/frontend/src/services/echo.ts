// ВРЕМЕННАЯ заглушка для Echo - отключаем WebSocket на Railway
const echo = {
    channel: (name: string) => ({
        listen: (event: string, callback: Function) => {
            console.log(`[Echo Stub] Listening to ${name}.${event}`);
            return { stop: () => {} };
        },
        listenForWhisper: (event: string, callback: Function) => {
            console.log(`[Echo Stub] Whisper listening to ${name}.${event}`);
            return { stop: () => {} };
        },
        stopListening: (event?: string, callback?: Function) => {
            console.log(`[Echo Stub] Stopped listening to ${name}.${event}`);
        },
        notification: (callback: Function) => {
            console.log(`[Echo Stub] Notification on ${name}`);
            return { stop: () => {} };
        },
        whisper: (event: string, data: any) => {
            console.log(`[Echo Stub] Whispering ${event} on ${name}`, data);
        },
    }),
    private: (name: string) => ({
        listen: (event: string, callback: Function) => {
            console.log(`[Echo Stub] Private listening to ${name}.${event}`);
            return { stop: () => {} };
        },
        listenForWhisper: (event: string, callback: Function) => {
            console.log(`[Echo Stub] Private whisper listening to ${name}.${event}`);
            return { stop: () => {} };
        },
        stopListening: (event?: string, callback?: Function) => {
            console.log(`[Echo Stub] Stopped private listening to ${name}.${event}`);
        },
        whisper: (event: string, data: any) => {
            console.log(`[Echo Stub] Private whispering ${event} on ${name}`, data);
        },
    }),
    join: (name: string) => ({
        here: (callback: Function) => {
            console.log(`[Echo Stub] Joined ${name}`);
            if (callback) callback([]);
            return this;
        },
        joining: (callback: Function) => {
            console.log(`[Echo Stub] Joining ${name}`);
            if (callback) callback({ id: 1, name: 'Test User' });
            return this;
        },
        leaving: (callback: Function) => {
            console.log(`[Echo Stub] Leaving ${name}`);
            if (callback) callback({ id: 1, name: 'Test User' });
            return this;
        },
        listen: (event: string, callback: Function) => {
            console.log(`[Echo Stub] Presence listening to ${name}.${event}`);
            return { stop: () => {} };
        },
    }),
    leave: (channel: string) => {
        console.log(`[Echo Stub] Left ${channel}`);
    },
    socketId: () => 'stub-socket-id-123',
    disconnect: () => {
        console.log('[Echo Stub] Disconnected');
    },
    connector: {
        pusher: {
            connection: {
                bind: () => {},
                unbind: () => {},
            },
        },
    },
};

export default echo;