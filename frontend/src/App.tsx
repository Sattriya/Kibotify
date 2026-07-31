import { Routes, Route } from "react-router-dom";
import HomePage from './pages/home/HomePage';
import AuthCallbackPage from './pages/auth-callback/AuthCallbackPage';
import { AuthenticateWithRedirectCallback } from "@clerk/react";
import MainLayout from "./layouts/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />} >
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/albums/:albumId" element={<AlbumPage />} />
        </Route>
        <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
        <Route path="/auth-callback" element={<AuthCallbackPage />} />
      </Routes>
    </>
  )
}

export default App
