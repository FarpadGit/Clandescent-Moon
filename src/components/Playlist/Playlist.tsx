import { useAppContext } from "../../contexts/AppContext";
import { usePlaylistsContext } from "../../contexts/PlaylistsContext";
import { useActivePlaylistContext } from "../../contexts/ActivePlaylistContext";
import { useUserActionsContext } from "../../contexts/UserActionsContext";
import VerticalList from "../Playlist/VerticalList";
import OptionsList from "./OptionsList";
import { Carousel, Tab, Tabs } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function Playlist() {
  const { selectedTabIndex, changeToTab } = useAppContext();
  const { playlists, selectedPlaylist, loadedPlaylist } = usePlaylistsContext();
  const { activePlaylist, selectedVideo, currentlyPlaying } =
    useActivePlaylistContext();
  const { handleUserActions } = useUserActionsContext();
  const { t } = useTranslation();
  return (
    <div className="playlist">
      <Tabs
        fill
        activeKey={selectedTabIndex}
        onSelect={(i) => (i !== null ? changeToTab(+i) : null)}
      >
        <Tab eventKey={0} title={t("playlistsTab")} />
        <Tab eventKey={1} title={t("videosTab")} disabled={!activePlaylist} />
        <Tab eventKey={2} title={t("settingsTab")} />
      </Tabs>
      <Carousel
        className="playlist-slider"
        controls={false}
        indicators={false}
        activeIndex={selectedTabIndex}
        onSelect={undefined}
      >
        <Carousel.Item>
          <VerticalList
            activeList={playlists}
            subtexts
            activeIndex={loadedPlaylist.index}
            selectedIndex={selectedPlaylist.index}
            onUserAction={(id, action, payload) =>
              handleUserActions("playlist", id, action, payload)
            }
          />
        </Carousel.Item>
        <Carousel.Item>
          <VerticalList
            activeList={activePlaylist?.videos || []}
            activeIndex={currentlyPlaying.index}
            selectedIndex={selectedVideo.index}
            onUserAction={(id, action, payload) =>
              handleUserActions("video", id, action, payload)
            }
          />
        </Carousel.Item>
        <Carousel.Item>
          <OptionsList />
        </Carousel.Item>
      </Carousel>
    </div>
  );
}
