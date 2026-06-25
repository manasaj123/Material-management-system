import React from "react";
import AppRouter from "./routes/AppRouter";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

const appContainerStyle = {
  display: "flex",
  height: "100vh",
  fontFamily: "Arial, sans-serif"
};

const sidebarContainerStyle = {
  width: "220px",
  backgroundColor: "#1f2933",
  color: "#fff",
  display: "flex",             
  flexDirection: "column",
  alignSelf: "stretch" 
};

const mainContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f3f4f6"
};

const contentStyle = {
  padding: "16px",
  overflowY: "auto",
  flex: 1
};

export default function App() {
  return (
    <div style={appContainerStyle}>
      <div style={sidebarContainerStyle}>
        <Sidebar />
      </div>
      <div style={mainContainerStyle}>
        <Topbar />
        <div style={contentStyle}>
          <AppRouter />
        </div>
      </div>
    </div>
  );
}
