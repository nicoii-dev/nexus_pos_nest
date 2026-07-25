import { readFileSync } from 'fs';
import { join } from 'path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly version: string;

  constructor() {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    this.version = packageJson.version;
  }

  checkHealth(): string {
    return `Nexus POS API Version ${this.version} is healthy.`;
  }
}
