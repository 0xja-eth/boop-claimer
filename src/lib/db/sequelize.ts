import "mysql2"
import { Column, DataType, ModelCtor, Sequelize } from "sequelize-typescript";
import process from "process";
import { TextLength } from "sequelize";
import SnowflakeId from "snowflake-id";
import { BeforeCreate, ModelStatic } from "sequelize-typescript";
import { data2Str, str2Data } from "@/lib/json";
import { Dialect } from "sequelize/types/sequelize";

export function JSONColumn<T = any>(
  objOrLength: TextLength | object,
  keyOrGetWrapper?: ((res: T | any) => T) | string,
  setWrapper?: (res: T | any) => T | any,
) {
  const flag =
    typeof objOrLength == "string" || keyOrGetWrapper instanceof Function;

  const length = (flag && objOrLength) as TextLength;
  const getWrapper = (flag && keyOrGetWrapper) as (res: T | any) => T;
  const obj = (!flag && objOrLength) as object;
  const key = (!flag && keyOrGetWrapper) as string;

  const process = (obj: any, key: string) =>
    Column({
      type: DataType.TEXT(length),
      set(this, val: T | any) {
        val = setWrapper ? setWrapper(val) : val;
        this.setDataValue(key, data2Str(val));
      },
      get(this): T | any {
        let str, res: T | any = null;
        try {
          str = this.getDataValue(key);
          res = str2Data(str);
        } catch (e) {
          console.error(`JSON Field: "${key}" error!`, str, e);
        }
        return getWrapper ? getWrapper(res) : res;
      },
    })(obj, key);

  return flag ? process : process(obj, key);
}

export function DateTimeColumn(obj: any, key: string) {
  return Column({
    type: DataType.DATE,
    get(this) { return (new Date(this.getDataValue(key))).getTime() }
  })(obj, key)
}

const models: ModelCtor[] = [];
export function model(clazz: ModelCtor) {
  models.push(clazz);
}

export const snowflake = new SnowflakeId({
  custom_epoch: 1658291243929,
  instance_id: 1,
});

export function snowflakeModel(idKeyOrClazz: string | ModelStatic | any): any {
  if (idKeyOrClazz instanceof Function)
    return snowflakeModel("id")(idKeyOrClazz);

  return (clazz: any) => {
    clazz["setSnowflake"] = function (instance: any) {
      instance[idKeyOrClazz || "id"] = snowflake.generate();
      console.log("BeforeCreate", clazz, instance);
    };
    BeforeCreate(clazz, "setSnowflake");
  };
}

let _sequelize;
export const sequelize = () =>
  (_sequelize ||= new Sequelize({
    dialect: (process.env.DB_DIALECT as Dialect) || "mysql",
    dialectOptions: {
      supportBigNumbers: true,
      bigNumberStrings: true,
      // prepare: false,
      connectTimeout: 180000,
    },
    pool: { max: 20, min: 2, idle: 30000, acquire: 30000 },
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // logging: console.log,
    logging: false,
    models,
  }));

export async function sync() {
  await sequelize().sync({ alter: true });
}
