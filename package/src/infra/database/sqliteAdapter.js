/**
 * Thin promise‑based wrapper around the legacy react‑native‑sqlite‑storage
 * transaction API exposed by `dbCreator`.
 *
 * Every method returns a Promise so callers can use async/await instead of
 * callbacks.
 */
import { db, createTable } from "../../../lib/dbCreator";

/**
 * Run a single SQL statement inside a transaction.
 * @param {string} sql  – the SQL query
 * @param {any[]}  params – positional bind parameters (default [])
 * @returns {Promise<{rows: any[], rowsAffected: number, insertId?: number}>}
 */
export const executeSql = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                sql,
                params,
                (_tx, result) => {
                    const rows = [];
                    for (let i = 0; i < result.rows.length; i++) {
                        rows.push(result.rows.item(i));
                    }
                    resolve({ rows, rowsAffected: result.rowsAffected, insertId: result.insertId });
                },
                (_tx, error) => {
                    reject(error);
                    return true; // rollback
                }
            );
        });
    });

/**
 * Ensure a table exists.  Delegates to `createTable` from dbCreator.
 */
export const ensureTable = (tableName, columns) => createTable(tableName, columns);
