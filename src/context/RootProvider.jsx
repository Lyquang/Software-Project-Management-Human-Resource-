import React from "react";
import { AppProvider } from "./AppContext";
import { ThemeProvider } from "./ThemeContext";
import { NotificationProvider } from "./NotificationContext";

/**
 * Gộp toàn bộ Provider dùng trong toàn bộ ứng dụng
 * => giúp index.jsx gọn gàng và dễ mở rộng
 */
const RootProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <AppProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default RootProvider;
