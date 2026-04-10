import { neon } from '@neondatabase/serverless';
import {
  databaseUrl,
  hasDatabase,
  missingDatabaseErrorMessage,
} from '@/app/api/utils/database-config';

const missingDatabaseError = () => new Error(missingDatabaseErrorMessage);

const NullishQueryFunction = () => {
  throw missingDatabaseError();
};

NullishQueryFunction.transaction = () => {
  throw missingDatabaseError();
};

export const isMissingDatabaseError = (error) =>
  error instanceof Error && error.message === missingDatabaseErrorMessage;

const sql = hasDatabase && databaseUrl ? neon(databaseUrl) : NullishQueryFunction;

export { hasDatabase, databaseUrl, missingDatabaseErrorMessage };
export default sql;
