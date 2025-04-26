import React from "react";
import AppContext from "@/contexts/AppContext";
import PlaylistsContext from "@/contexts/PlaylistsContext";
import ActivePlaylistContext from "@/contexts/ActivePlaylistContext";
import VideoPlayerContext from "@/contexts/VideoPlayerContext";
import UserActionsContext from "@/contexts/UserActionsContext";

export function MidnightPlayerWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActivePlaylistContext>
      <VideoPlayerContext>{children}</VideoPlayerContext>
    </ActivePlaylistContext>
  );
}

export function AllWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppContext>
      <PlaylistsContext>
        <ActivePlaylistContext>
          <VideoPlayerContext>
            <UserActionsContext>{children}</UserActionsContext>
          </VideoPlayerContext>
        </ActivePlaylistContext>
      </PlaylistsContext>
    </AppContext>
  );
}
