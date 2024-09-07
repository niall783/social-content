// lib/dbConnect.ts

import mongoose, { Connection, ConnectOptions } from 'mongoose';

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var mongooseConnection: CachedConnection | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;
const DEVELOPMENT = process.env.DEVELOPMENT;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached: CachedConnection = global.mongooseConnection ?? { conn: null, promise: null };

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

async function dbConnect(): Promise<Connection> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: ConnectOptions = {
      bufferCommands: false,
      // dbName: DEVELOPMENT === 'true' ? 'DevDB_Transcriptions' : 'ProdDB_Transcriptions',
      dbName: 'ProdDB_SocialContent',

    };

    cached.promise = mongoose.createConnection(MONGODB_URI ?? '', opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;