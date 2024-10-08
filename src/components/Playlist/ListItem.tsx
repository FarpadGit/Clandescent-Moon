import React, { useEffect, useState } from "react";
import { userActions } from "../../contexts/UserActionsContext";
import { useVideoPlayerContext } from "../../contexts/VideoPlayerContext";
import {
  PiCaretCircleDoubleDownBold,
  PiCaretCircleDoubleUpBold,
  PiXCircleBold,
} from "react-icons/pi";
import { FiEdit3, FiCheckSquare } from "react-icons/fi";
import { useTranslation } from "react-i18next";

type ListItemProps = {
  text: string;
  subtext: string | false;
  textOnEdit: string;
  isFirst: boolean;
  isLast: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  onUserAction: (action: userActions, payload?: string) => void;
};
export default function ListItem({
  text,
  subtext = false,
  textOnEdit,
  isFirst,
  isLast,
  isActive = false,
  isSelected = false,
  onUserAction,
}: ListItemProps) {
  const [editedText, setEditedText] = useState(textOnEdit);
  const [isEditMode, setIsEditMode] = useState(false);
  const { t } = useTranslation();

  function onEdit() {
    if (isEditMode) onUserAction("edit", editedText);
    setIsEditMode((prev) => !prev);
  }

  function onEditCancel() {
    setEditedText(textOnEdit);
    setIsEditMode(false);
  }

  useEffect(() => {
    if (!isSelected) onEditCancel();
  }, [isSelected]);

  return (
    <>
      {!isEditMode && (
        <div className="d-flex flex-column">
          <div className="d-flex justify-content-center">
            <div
              className={`list-item-text ${
                isSelected ? "marquee" : "text-truncate"
              }`}
              style={
                {
                  lineHeight: subtext ? "1.5rem" : "1.75rem",
                  "--marquee-duration":
                    1 + Math.max(0, text.length - 35) / 10 + "s",
                } as React.CSSProperties
              }
            >
              {/* if text is an i18n key then display the error message stored there; else display text */}
              <span>
                <span>{t(text) ?? text}</span>
              </span>
            </div>
          </div>
          {/* if it has subtexts to show display it under main text */}
          {subtext && (
            <div className="d-flex justify-content-center">
              <span className={`fs-6 mb-0 list-item-text`}>{subtext}</span>
            </div>
          )}
        </div>
      )}
      {isEditMode && (
        <input
          type="text"
          value={editedText}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEdit();
            if (e.key === "Escape") onEditCancel();
          }}
        />
      )}
      <div className="list-item-controls">
        {/* Edit button */}
        <Button className="playlist-button" click={() => onEdit()}>
          {isEditMode ? (
            <FiCheckSquare alignmentBaseline="central" />
          ) : (
            <FiEdit3 alignmentBaseline="central" />
          )}
        </Button>
        {/* Move-up button */}
        <Button
          className="playlist-button"
          click={() => onUserAction("move-up")}
          disabled={isEditMode || isFirst}
        >
          <PiCaretCircleDoubleUpBold alignmentBaseline="central" />
        </Button>
        {/* Play button */}
        <PlayButton active={isActive} />
        {/* Move-down button */}
        <Button
          className="playlist-button"
          click={() => onUserAction("move-down")}
          disabled={isEditMode || isLast}
        >
          <PiCaretCircleDoubleDownBold alignmentBaseline="central" />
        </Button>
        {/* Delete Button */}
        <Button
          className="playlist-button border-danger"
          click={() => onUserAction("delete")}
          disabled={isEditMode}
        >
          <PiXCircleBold alignmentBaseline="central" />
        </Button>
      </div>
    </>
  );
}

interface UnpropagatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  click: () => void;
}
function Button({ children, click, ...props }: UnpropagatedButtonProps) {
  return (
    <button
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        click();
      }}
    >
      {children}
    </button>
  );
}

function PlayButton({ active = false }: { active?: boolean }) {
  const { videoState } = useVideoPlayerContext();
  function buttonStateClass() {
    if (!active) return "";
    if (!videoState.playing) return "active paused";
    return "active";
  }
  return (
    <svg
      className={`playButton ${buttonStateClass()}`}
      viewBox="0 0 163 163"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
    >
      <g fill="none">
        <g transform="translate(2.000000, 2.000000)" strokeWidth="6">
          <path
            className="lineTwo"
            d="m9.4203 82.24c0 40.183 32.029 72.768 72.768 72.768s72.768-32.823 72.768-72.768c0-39.945-32.585-72.768-72.768-72.768"
            stroke="#f00"
          />
          <path
            className="lineTwo fragment"
            d="m82.188 9.4721c-40.183 0-72.768 32.585-72.768 72.768"
            stroke="#f00"
            strokeOpacity="0"
          />
          <path
            className="lineOne"
            d="m154.56 82.24c0-39.96-32.84-72.369-72.369-72.369-39.53 0-72.369 32.133-72.369 72.369 0 40.236 32.409 72.369 72.369 72.369"
            stroke="#00f"
          />
          <path
            className="lineOne fragment"
            d="m82.188 154.61c39.96 0 72.369-32.409 72.369-72.369"
            stroke="#00f"
            strokeOpacity="0"
          />
          <circle
            id="coverCircle"
            cx="81.5"
            cy="81.5"
            r="75"
            fill="black"
            fillOpacity="0"
            strokeOpacity="0"
          />
          <path
            id="triangle"
            d="m107.37 74.4-38.7-30.2c-3.7-2.9-9.2-0.3-9.2 4.5v60.3c0 4.7 5.4 7.4 9.2 4.5l38.7-30.2c2.9-2.2 2.9-6.7 0-8.9z"
            stroke="#a3cd3a"
            strokeWidth="10"
          />
          <path
            id="pauseBars"
            d="m70.5 50c-0.19854-5.0846-9-4.8-9 0v60c0 4.7 9 4.6075 9 0v-60zm31 0c-0.19854-5.0846-9-4.8-9 0v60c0 4.7 9 4.6075 9 0v-60z"
            stroke="#a3cd3a"
            strokeWidth="5"
          />
        </g>
      </g>
    </svg>
  );
}
