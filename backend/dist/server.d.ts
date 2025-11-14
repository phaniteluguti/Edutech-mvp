import { Express } from 'express';
import { Server } from 'socket.io';
import './lib/redis';
declare const app: Express;
declare const io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { app, io };
//# sourceMappingURL=server.d.ts.map