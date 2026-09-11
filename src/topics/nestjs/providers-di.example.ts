/**
 * PROVIDERS, DI, SCOPES, DYNAMIC MODULES (reference)
 * --------------------------------------------------
 * DEPENDENCY INJECTION: Nest's IoC container instantiates providers and injects
 * them by type via constructor params. @Injectable() marks a class as a provider;
 * modules declare providers + exports.
 *
 * CUSTOM PROVIDERS (advanced tokens):
 *   { provide: 'TOKEN', useValue: x }        // constant
 *   { provide: X, useClass: Y }              // swap implementation
 *   { provide: 'CFG', useFactory: (dep) => ..., inject: [Dep] }  // computed
 *   inject with @Inject('TOKEN').
 *
 * PROVIDER SCOPES:
 *   DEFAULT   — singleton (one instance app-wide). Best perf; use unless you need
 *               per-request state.
 *   REQUEST   — new instance per request (e.g. request-scoped context/tenant).
 *               Bubbles: consumers become request-scoped too (perf cost).
 *   TRANSIENT — new instance per consumer.
 *
 * DYNAMIC MODULES: modules configured at import time via a static forRoot/forFeature
 * returning a DynamicModule (how ConfigModule, JwtModule, TypeOrmModule work).
 */

/* --- custom provider (factory) ---
{
  provide: 'DB_CONFIG',
  useFactory: (config: ConfigService) => ({ url: config.get('DATABASE_URL') }),
  inject: [ConfigService],
}
// consume: constructor(@Inject('DB_CONFIG') private cfg: DbConfig) {}
*/

/* --- request-scoped provider ---
import { Injectable, Scope } from '@nestjs/common';
@Injectable({ scope: Scope.REQUEST })
export class RequestContext { readonly id = crypto.randomUUID(); }
*/

/* --- dynamic module ---
import { DynamicModule, Module } from '@nestjs/common';
@Module({})
export class FeatureModule {
  static forRoot(options: { apiKey: string }): DynamicModule {
    return {
      module: FeatureModule,
      providers: [{ provide: 'OPTIONS', useValue: options }],
      exports: ['OPTIONS'],
    };
  }
}
// import: FeatureModule.forRoot({ apiKey: '...' })
*/

export {};
