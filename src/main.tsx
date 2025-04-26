import React from "react";
import ReactDOM from "react-dom/client";
import AppContext from "@/contexts/AppContext.tsx";
import ActivePlaylistContext from "@/contexts/ActivePlaylistContext.tsx";
import PlaylistsContext from "@/contexts/PlaylistsContext.tsx";
import VideoPlayerContext from "@/contexts/VideoPlayerContext.tsx";
import UserActionsContext from "@/contexts/UserActionsContext.tsx";
import App from "./App.tsx";
import LanguageSelector from "@/components/LanguageSelector.tsx";
import "./i18next/i18next.ts";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.less";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppContext>
      <PlaylistsContext>
        <ActivePlaylistContext>
          <VideoPlayerContext>
            <UserActionsContext>
              <App />
            </UserActionsContext>
          </VideoPlayerContext>
        </ActivePlaylistContext>
      </PlaylistsContext>
      <LanguageSelector />
    </AppContext>
  </React.StrictMode>
);
