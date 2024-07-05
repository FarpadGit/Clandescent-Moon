import { useEffect, useRef, useState } from "react";
import { ListItemType } from "../../contexts/AppContext";
import { usePlaylistsContext } from "../../contexts/PlaylistsContext";
import { userActions } from "../../contexts/UserActionsContext";
import ListItem from "./ListItem";
import {
  ListGroup as BS_ListGroup,
  ListGroupItem as BS_ListGroupItem,
  Spinner,
} from "react-bootstrap";
import { FiPlus } from "react-icons/fi";
import { t } from "i18next";

type VerticalListProps = {
  activeList: ListItemType[];
  subtexts?: boolean;
  activeIndex: number;
  selectedIndex: number;
  onUserAction: (id: string, action: userActions, payload?: string) => void;
};
export default function VerticalList({
  activeList,
  subtexts = false,
  activeIndex,
  selectedIndex,
  onUserAction,
}: VerticalListProps) {
  const { getPlaylistSize } = usePlaylistsContext();
  const [itemToAdd, setItemToAdd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const itemAdded = useRef(false);

  useEffect(() => {
    if (!itemAdded.current) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    itemAdded.current = false;
  }, [itemAdded.current]);

  useEffect(() => {
    setIsLoading(false);
  }, [activeList]);

  function addNewItem() {
    if (!itemToAdd) return;
    setIsLoading(true);
    setItemToAdd("");
    onUserAction("", "add", itemToAdd);
    itemAdded.current = true;
  }

  return (
    <>
      {/* Add new item input */}
      <div className="add-item">
        <input
          type="text"
          className="w-75"
          value={itemToAdd}
          disabled={isLoading}
          onChange={(e) => setItemToAdd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addNewItem();
          }}
        />
        {isLoading && (
          <Spinner size="sm" style={{ color: "var(--button-border-color)" }} />
        )}
        <button className="playlist-button" onClick={() => addNewItem()}>
          <FiPlus />
        </button>
      </div>
      {/* Bootstrap vertical list */}
      <BS_ListGroup className="playlist-panel rounded-0" ref={listRef}>
        {activeList.length === 0 &&
          "This list is currently empty. Try adding some new items."}
        {activeList.length > 0 &&
          activeList.map((item, index) => (
            <BS_ListGroupItem
              key={item.id + "_" + item.text}
              className={`text-start ${
                index === selectedIndex ? "selected" : ""
              }`}
              active={index === activeIndex}
              onClick={() => {
                if (index === selectedIndex) onUserAction(item.id, "play");
                else onUserAction(item.id, "select");
              }}
            >
              <ListItem
                text={item.text}
                subtext={
                  subtexts
                    ? getPlaylistSize(item.id) + " " + t("playlists.counter")
                    : undefined
                }
                textOnEdit={item.url ?? item.text}
                isFirst={index === 0}
                isLast={index === activeList.length - 1}
                isActive={index === activeIndex}
                isSelected={index === selectedIndex}
                onUserAction={(action, payload) =>
                  onUserAction(item.id, action, payload)
                }
              />
            </BS_ListGroupItem>
          ))}
      </BS_ListGroup>
    </>
  );
}
