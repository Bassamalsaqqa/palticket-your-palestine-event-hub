import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

@Injectable()
export class StorageService {
  private readonly driver: string;
  private readonly localRoot: string;
  private readonly publicUrl: string;

  constructor(private configService: ConfigService) {
    this.driver = this.configService.get<string>('STORAGE_DRIVER') || 'local';
    this.localRoot =
      this.configService.get<string>('STORAGE_LOCAL_ROOT') || 'uploads';
    this.publicUrl =
      this.configService.get<string>('STORAGE_PUBLIC_URL') ||
      'http://localhost:3001/uploads';
  }

  buildEventAssetPath(eventStartDate: Date, eventSlug: string): string {
    const year = format(eventStartDate, 'yyyy');
    return path.join(year, eventSlug);
  }

  storeLocal(buffer: Buffer, fileName: string, relativePath: string): string {
    const fullDir = path.join(process.cwd(), this.localRoot, relativePath);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }

    const fullPath = path.join(fullDir, fileName);
    fs.writeFileSync(fullPath, buffer);

    // Return the public URL
    const publicPath = path.join(relativePath, fileName).replace(/\\/g, '/');
    return `${this.publicUrl}/${publicPath}`;
  }

  store(buffer: Buffer, fileName: string, relativePath: string): string {
    if (this.driver === 's3') {
      // Stub for S3
      console.log('S3 storage driver requested, falling back to local');
    }
    return this.storeLocal(buffer, fileName, relativePath);
  }
}
