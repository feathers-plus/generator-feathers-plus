import { Paginated } from '@feathersjs/feathers';
import { GraphQLFieldResolver } from 'graphql/type/definition';
import { App } from '../../app.interface';

export interface ArgMap { [argName: string]: any; }

export interface ResolverContext {
  app: App;
  batchLoaders: {};
  provider: string;
  user: any;
  authenticated: boolean;
  pagination: Pick<Paginated<any>, 'total' | 'limit' | 'skip'> | undefined;
}

export interface ResolverMap {
  [parentName: string]: {
    [childName: string]: GraphQLFieldResolver<any, ResolverContext>,
  };
}

interface SqlColumnResolver {
  sqlColumn: string;
}

interface SqlExpressionResolver {
  sqlExpr(table: string, args: ArgMap): string;
}

interface SqlComplexResolver {
  sqlJoin?(ourTable: string, otherTable: string): string;
  orderBy(args: ArgMap, content: ResolverContext): string;
  where(table: string, args: ArgMap): string;
}

type SqlResolver = SqlColumnResolver | SqlExpressionResolver | SqlComplexResolver;

export interface SqlResolverMap {
  [parentName: string]: {
    sqlTable?: string;
    uniqueKey?: string;
    fields: {
      [childName: string]: SqlResolver;
    }
  };
}
