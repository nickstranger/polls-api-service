import { snakeCase } from 'typeorm/util/StringUtils';
import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

export class NamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return snakeCase(
      embeddedPrefixes.concat(customName ? customName : propertyName).join('_')
    ).toLowerCase();
  }

  tableName(targetName: string, useSpecificName: string): string {
    const globalPrefix: string = 'polls_service_';
    return useSpecificName ? useSpecificName : globalPrefix.concat(snakeCase(targetName));
  }

  columnNameCustomized(customName: string): string {
    return customName;
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }
}
