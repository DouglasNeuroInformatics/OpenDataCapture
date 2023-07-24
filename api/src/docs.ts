import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupDocs(app: NestExpressApplication) {
  const httpAdapter = app.getHttpAdapter().getInstance();

  const config = new DocumentBuilder()
    .setTitle('The Douglas Data Capture Platform')
    .setContact('Joshua Unrau', '', 'joshua.unrau@mail.mcgill.ca')
    .setDescription('Documentation for the REST API for Douglas Data Capture Platform')
    .setLicense('AGPL-3.0', 'https://www.gnu.org/licenses/agpl-3.0.txt')
    .setVersion('1')
    .setExternalDoc(
      'Additional Technical Documentation',
      'https://douglasneuroinformatics.github.io/DouglasDataCapturePlatform/#/'
    )
    .addTag('Authentication')
    .addTag('Groups')
    .addTag('Instruments')
    .addTag('Instrument Records')
    .addTag('Subjects')
    .addTag('Users')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  httpAdapter.get('/spec.json', (_, res) => {
    res.send(document);
  });
}
