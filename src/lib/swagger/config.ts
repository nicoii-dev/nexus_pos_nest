import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { EnvConfigService } from '../../env-config/env-config.service';

export const SwaggerConfiguration = (app: any, envConfigService: EnvConfigService) => {
  const config = new DocumentBuilder()
    .setTitle('Nexus POS API')
    .setDescription('API Documentation for Nexus POS System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the access token obtained from the signin endpoint',
        in: 'header',
      },
      'jwt-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.tags = [
    { name: 'Auth', description: 'Authentication APIs' },
    { name: 'Branches', description: 'Branch management APIs' },
    { name: 'Categories', description: 'Product category APIs' },
    { name: 'Products', description: 'Product management APIs' },
    { name: 'Inventory', description: 'Inventory movement APIs' },
    { name: 'Sales', description: 'Sales transaction APIs' },
    { name: 'Reports', description: 'Reports and dashboard APIs' },
    { name: 'Settings', description: 'Store settings APIs' },
  ];

  if (envConfigService.getNodeEnv() !== 'production') {
    SwaggerModule.setup('api/docs', app, document);
  }
};
