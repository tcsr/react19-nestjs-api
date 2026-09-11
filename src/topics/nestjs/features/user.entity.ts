/**
 * SERIALIZATION — class-transformer + ClassSerializerInterceptor
 * -------------------------------------------------------------
 * @Exclude() hides fields from the serialized response (e.g. password hash);
 * @Expose() opts fields in / renames. The ClassSerializerInterceptor (applied on
 * the controller) runs class-transformer on returned class instances, so secrets
 * never leak. The handler must return a CLASS INSTANCE for this to apply.
 */

import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  id!: number;
  email!: string;

  @Exclude() // never serialized to the client
  passwordHash!: string;

  @Expose({ name: 'displayName' }) // rename in output
  name!: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
