// context/context.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { clearSession, getSession } from "../services/storageService";
import { createTable, dropTable } from '../lib/dbCreator';
import { insertNewHouseholds, logTableColumns } from '../lib/dbHelper';
import { IS_DEMO_MODE, getClientToken } from "../src/composition/authSession";

const GlobalContext = createContext();

export const ContextProvider = ({ children }) => {
  const [auth, setAuth] = useState(undefined); // undefined until restoreSession completes
  const [loading, setLoading] = useState(true);
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: "",
    message: "",
    autoNavigate: false,
  });

  // --- Bootstrap (init DB + restore session) ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await Promise.all([initDatabase(), restoreSession(), initClientToken()]);
      } catch (e) {
        console.error("Bootstrap failed:", e);
        setModalInfo({
          show: true,
          title: "Startup Error",
          message: "The app failed to initialize properly.",
        });
      } finally {
        setLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // --- Initialize SQLite ---
  const initDatabase = async () => {
    try {
      // DROP TABLE
      // dropTable('tbl_loans');
      // dropTable('tbl_chats');
      // dropTable('tbl_messages');
      // CREATE TABLE
      await createTable(
        'tbl_loans',
        `
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT,
        borrower TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        term INTEGER NOT NULL,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        sync_error TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        `
      );

      // CREATE CHATS TABLE
      await createTable(
        'tbl_chats',
        `
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
        `
      );

      // CREATE MESSAGES TABLE
      await createTable(
        'tbl_messages',
        `
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        server_id TEXT,
        chat_id INTEGER NOT NULL,
        sender TEXT NOT NULL CHECK(sender IN ('user', 'bot', 'system')),
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (chat_id) REFERENCES tbl_chats(local_id) ON DELETE CASCADE
        `
      );

      // LOG table columns
      logTableColumns('tbl_loans')
      logTableColumns('tbl_chats')
      logTableColumns('tbl_messages')

      setIsDbReady(true);
      console.log("Database initialized.");
    } catch (error) {
      console.error("DB Init Error:", error);
    }
  };

  // --- Restore Session ---
  const restoreSession = async () => {
    try {
      const session = await getSession();
      console.log("Session restored:", session);
      const hasDemoToken =
        typeof session?.access_token === "string" &&
        session.access_token.startsWith("demo_access_");

      if (!IS_DEMO_MODE && hasDemoToken) {
        await clearSession();
        setAuth(null);
        return;
      }

      if (session?.user) {
        setAuth(session.user);
      } else {
        setAuth(null);
      }
    } catch (error) {
      console.error("Session Restore Error:", error);
      setAuth(null);
    }
  };

  const initClientToken = async () => {
    try {
      const result = await getClientToken();
      console.log("result", result);

      if (!result?.ok) {
        throw new Error(result?.error?.message || "Failed to initialize client token");
      }
      console.log("Client token initialized.");
    } catch (error) {
      console.error("Get Client Token Error:", error);
    }
  }

  return (
    <GlobalContext.Provider value={{
      auth,
      setAuth,
      loading,
      isDbReady,
      currentPage,
      setCurrentPage,
      modalInfo,
      setModalInfo,
      setLoading,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => useContext(GlobalContext);
