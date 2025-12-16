import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize/types';
import { SequelizeStorage, Umzug } from 'umzug';

import { MODELS, setupAssociations } from './models';

import { ormConfig } from '../settings';

export class ORM {
  queryInterface: QueryInterface;
  private config: any;
  sequelize: Sequelize;
  umzug: Umzug;

  constructor() {
    this.config = ormConfig;
    this.init();
  }

  private async init() {
    await this.startSequelizeService();
    this.initUmzug();
    // Only auto-run migrations if not in CLI mode
    const isCLIMode = process.env.UMZUG_CLI_MODE === 'true';
    if (!isCLIMode) {
      await this.runMigrations();
    }
  }

  private async startSequelizeService() {
    this.sequelize = new Sequelize(this.config.database, this.config.username, this.config.password, {
      dialect: 'postgres',
      host: this.config.host,
      modelMatch: (filename, member) => {
        return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
      },
      models: MODELS,
      pool: {
        acquire: 60000,
        idle: 10000,
        max: 10,
        min: 2,
        evict: 1000,
      },
      dialectOptions: {
        connectTimeout: 60000,
      },
      port: Number(process.env.DB_PORT),
    });

    setupAssociations();

    this.queryInterface = this.sequelize.getQueryInterface();

    try {
      await this.sequelize.authenticate();
      console.log('---------------------------------------------');
      console.log('Sequelize Service Started Successfully');
      console.log('---------------------------------------------');
    } catch (error) {
      console.log('---------------------------------------------');
      console.error('Unable to start sequelize service', error);
      console.log('---------------------------------------------');
    }
  }

  private initUmzug() {
    this.umzug = new Umzug({
      context: { queryInterface: this.queryInterface, sequelize: this.sequelize },
      create: {
        folder: path.join(path.resolve(), 'src/db/migrations'),
        template: (filepath: string) => {
          const templatePath = path.join(path.resolve(), 'src/db/template/simple-migrations.ts');
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          return [
            [filepath, templateContent],
          ];
        },
      },
      logger: console,
      migrations: {
        glob: ['dist/db/migrations/*.js', { cwd: path.resolve() }],
        resolve: ({ context, name, path: migrationPath }) => {
          // Use require for CommonJS modules (compiled JS files)
          const migration = require(migrationPath);
          
          return {
            down: () => {
              if (typeof migration.down === 'function') {
                return migration.down(context.queryInterface);
              }
              throw new Error(`Migration ${name} does not export a 'down' function`);
            },
            name,
            up: () => {
              if (typeof migration.up === 'function') {
                return migration.up(context.queryInterface);
              }
              throw new Error(`Migration ${name} does not export an 'up' function`);
            },
          };
        },
      },
      storage: new SequelizeStorage({
        sequelize: this.sequelize,
      }),
    });
  }

  private async runMigrations() {
    try {
      await this.umzug.up();
      console.log('---------------------------------------------');
      console.log('Migration Service Started Successfully');
      console.log('---------------------------------------------');
    } catch (error) {
      console.log('---------------------------------------------');
      console.error('Unable to start migration service', error);
      console.log('---------------------------------------------');
    }
  }
}

export const orm = new ORM();

export type Migration = typeof orm.umzug._types.migration;
