import fs from 'fs';
import path from 'path';

export class ConsoleLogger {
  private stream: fs.WriteStream | null = null;

  start(testTitle: string) {
    const safe = testTitle.replace(/[^a-z0-9-_]+/gi, '_');
    const dir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.stream = fs.createWriteStream(path.join(dir, `${safe}.log`), { flags: 'w' });
  }

  attach(message: string) {
    if (this.stream) this.stream.write(message + '\n');
  }

  stop() {
    this.stream?.end();
    this.stream = null;
  }
}
