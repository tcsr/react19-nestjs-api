/**
 * SWAGGER, CONFIG, LIFECYCLE HOOKS (reference)
 * --------------------------------------------
 *
 * SWAGGER / OpenAPI (@nestjs/swagger):
 *   npm i @nestjs/swagger
 *   Auto-generates interactive API docs from decorators. Decorate DTOs with
 *   @ApiProperty and controllers with @ApiTags/@ApiResponse.
 *
 * CONFIG (@nestjs/config): load + validate env (used in this app). Validate with a
 *   Joi/Zod schema at boot so misconfig fails fast.
 *
 * LIFECYCLE HOOKS: implement to run code at phases:
 *   onModuleInit / onApplicationBootstrap  — after (all) modules initialized
 *   onModuleDestroy / beforeApplicationShutdown / onApplicationShutdown — teardown
 *   PrismaService uses onModuleInit/onModuleDestroy to connect/disconnect.
 *   Call app.enableShutdownHooks() to receive SIGTERM/SIGINT for graceful shutdown.
 */

/* --- swagger setup in main.ts ---
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const config = new DocumentBuilder().setTitle('API').setVersion('1.0').addBearerAuth().build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
// visit /docs
*/

/* --- validated config ---
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    PORT: Joi.number().default(3000),
  }),
});
*/

/* --- graceful shutdown ---
// main.ts
app.enableShutdownHooks();
// any provider
@Injectable()
export class JobsService implements OnApplicationShutdown {
  onApplicationShutdown(signal?: string) { /* stop workers, flush *\/ }
}
*/

export {};
