import React, { useState } from "react";
import { type userActions } from "@/contexts/UserActionsContext";
import { Carousel, Spinner, DropdownButton, Dropdown } from "react-bootstrap";
import { FiPlus, FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { type IconType } from "react-icons";

const toolbarActions = ["reverse-list", "sort"] as const;

type ListToolbarProps = {
  onUserAction: (
    id: string,
    action: userActions,
    payload?: string,
  ) => Promise<void>;
  onItemAdded: () => void;
};
export default function ListToolbar({
  onUserAction,
  onItemAdded,
}: ListToolbarProps) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<
    (typeof toolbarActions)[number] | null
  >("reverse-list");
  const [itemToAdd, setItemToAdd] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  async function addNewItem() {
    if (!itemToAdd) return;
    setIsLoading(true);
    await onUserAction("", "add", itemToAdd);
    setItemToAdd("");
    onItemAdded();
    setIsLoading(false);
  }

  async function sortList() {
    if (!selectedAction) return;
    setIsLoading(true);
    await onUserAction("", selectedAction);
    setIsLoading(false);
  }

  return (
    <Carousel
      className="toolbar-slider"
      controls={false}
      indicators={false}
      activeIndex={selectedTabIndex}
      onSelect={undefined}
    >
      <Carousel.Item data-testid="add-item">
        {/* Add new item input */}
        <ToolbarTab
          isLoading={isLoading}
          onSelect={() => addNewItem()}
          onNext={() => setSelectedTabIndex(1)}
          SelectIcon={FiPlus}
          NextIcon={FiChevronRight}
        >
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
        </ToolbarTab>
      </Carousel.Item>
      <Carousel.Item data-testid="sort">
        <ToolbarTab
          isLoading={isLoading}
          onSelect={() => sortList()}
          onNext={() => setSelectedTabIndex(0)}
          SelectIcon={FiCheck}
          NextIcon={FiChevronLeft}
        >
          <DropdownButton
            onSelect={(i) => setSelectedAction(i as typeof selectedAction)}
            title={t(`options.toolbarActions.${selectedAction}`)}
            variant="playlist-option"
          >
            {toolbarActions.map((action) => (
              <Dropdown.Item key={action} eventKey={action}>
                {t(`options.toolbarActions.${action}`)}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </ToolbarTab>
      </Carousel.Item>
    </Carousel>
  );
}

type toolbarTabType = {
  children: React.ReactNode;
  isLoading: boolean;
  onSelect: () => void;
  onNext: () => void;
  SelectIcon: IconType;
  NextIcon: IconType;
};
const ToolbarTab = ({
  children,
  isLoading,
  onSelect,
  onNext,
  SelectIcon,
  NextIcon,
}: toolbarTabType) => {
  return (
    <div className="toolbar-tab">
      {children}
      <div className="toolbar-buttons">
        {isLoading && (
          <Spinner size="sm" style={{ color: "var(--border-color)" }} />
        )}
        <button className="playlist-button" onClick={() => onSelect()}>
          <SelectIcon />
        </button>
        <button className="playlist-button" onClick={() => onNext()}>
          <NextIcon />
        </button>
      </div>
    </div>
  );
};
