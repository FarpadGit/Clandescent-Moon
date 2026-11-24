import { useEffect, useRef, useState } from "react";
import { ListItemType, useAppContext } from "@/contexts/AppContext";
import { usePlaylistsContext } from "@/contexts/PlaylistsContext";
import { userActions } from "@/contexts/UserActionsContext";
import ListItem from "@/components/Playlist//ListItem";
import ListToolbar from "@/components/Playlist/ListToolbar";
import {
  ListGroup as BS_ListGroup,
  ListGroupItem as BS_ListGroupItem,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";

type VerticalListProps = {
  activeList: ListItemType[];
  subtexts?: boolean;
  canShowLoading?: boolean;
  activeIndex: number;
  selectedIndex: number;
  onUserAction: (id: string, action: userActions, payload?: string) => void;
};
export default function VerticalList({
  activeList,
  subtexts = false,
  canShowLoading = true,
  activeIndex,
  selectedIndex,
  onUserAction,
}: VerticalListProps) {
  const { LSLoading, LSError } = useAppContext();
  const { getPlaylistSize } = usePlaylistsContext();
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const listItemsRef = useRef<{ [key: string]: HTMLAnchorElement }>({});
  const itemAdded = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsLoading(false);
    if (!itemAdded.current) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    itemAdded.current = false;
  }, [activeList]);

  function getUserMessage() {
    if (LSError) return t("loadError");
    if (canShowLoading && LSLoading) return t("loadingMessage");
    if (activeList.length === 0) return t("emptyList");
    return undefined;
  }

  function handleSelect(index: number, item: ListItemType) {
    if (index === selectedIndex) onUserAction(item.id, "play");
    else onUserAction(item.id, "select");
  }

  return (
    <>
      {/* Toolbar to add new items or sort list */}
      <ListToolbar
        onItemAdded={() => (itemAdded.current = true)}
        onUserAction={onUserAction}
        isLoading={isLoading}
        onLoading={() => setIsLoading(true)}
      />
      {/* Bootstrap vertical list */}
      <BS_ListGroup
        className="playlist-panel rounded-0"
        onClick={() => onUserAction("-1", "select")}
        ref={listRef}
      >
        {getUserMessage() ? (
          <span className={`message ${LSLoading ? "loading" : ""}`}>
            {getUserMessage()}
          </span>
        ) : (
          activeList.map((item, index) => (
            <BS_ListGroupItem
              ref={(el: HTMLAnchorElement | null) => {
                if (el) listItemsRef.current[item.id] = el;
                else delete listItemsRef.current[item.id];
              }}
              key={item.id + "_" + item.text}
              className={`text-start ${
                index === selectedIndex ? "selected" : ""
              }`}
              tabIndex={0}
              active={index === activeIndex}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(index, item);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleSelect(index, item);
              }}
            >
              <ListItem
                text={item.text}
                subtext={
                  subtexts &&
                  getPlaylistSize(item.id) + " " + t("playlists.counter")
                }
                textOnEdit={item.url ?? item.text}
                isFirst={index === 0}
                isLast={index === activeList.length - 1}
                isActive={index === activeIndex}
                isSelected={index === selectedIndex}
                onUserAction={(action, payload) =>
                  onUserAction(item.id, action, payload)
                }
                onScrollRequest={() => {
                  listItemsRef.current[item.id]?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              />
            </BS_ListGroupItem>
          ))
        )}
      </BS_ListGroup>
    </>
  );
}
