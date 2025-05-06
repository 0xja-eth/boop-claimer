declare module 'snowflake-id' {
  interface SnowflakeOptions {
    custom_epoch?: number;
    instance_id?: number;
  }

  class SnowflakeId {
    constructor(options?: SnowflakeOptions);
    generate(): string;
  }

  export default SnowflakeId;
}
