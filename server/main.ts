import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import * as createMemoryStore from 'memorystore';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "classroom-clone-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  };

  if (process.env.NODE_ENV === 'production') {
    app.enableCors();
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  await app.listen(5000, '0.0.0.0');
}
bootstrap();
