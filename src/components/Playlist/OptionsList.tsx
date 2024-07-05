import { useRef, useState } from "react";
import playlists from "../../assets/presetplaylists.json";
import { PlayMode, playModes, useAppContext } from "../../contexts/AppContext";
import { useUserActionsContext } from "../../contexts/UserActionsContext";
import { Option } from "./Option";
import AsyncButton from "../AsyncButton";
import { Button, Dropdown, DropdownButton } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function OptionsList() {
  const {
    isAutosaveOn,
    toggleAutosave,
    isAutocorrectOn,
    toggleAutocorrect,
    playMode,
    setPlayMode,
  } = useAppContext();
  const {
    exportActiveToFile,
    exportAllToFile,
    importFromFile,
    setPlaylistToLocalStorage,
  } = useUserActionsContext();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState<boolean | null>(false);
  const { t } = useTranslation();

  async function handleImport(file: File | undefined) {
    if (!file || !file.name.endsWith(".csv")) return;
    try {
      setImportLoading(true);
      // read text file
      await file.text().then((fileText) => importFromFile(fileText));
      setImportLoading(false);
    } catch (error) {
      console.error(error);
      setImportLoading(null);
    }
  }

  return (
    <div className="options-panel vstack gap-3">
      <Option>
        <Option.Lead>
          <b>{t("options.autosave.title")}:</b>
          <Button
            variant="playlist-option"
            onClick={() => toggleAutosave()}
            style={{ width: "60px" }}
          >
            {isAutosaveOn ? t("options.ON") : t("options.OFF")}
          </Button>
        </Option.Lead>
        <Option.Description>
          {t("options.autosave.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead>
          <b>{t("options.playback.title")}:</b>
          <DropdownButton
            onSelect={(i) => setPlayMode(i as PlayMode)}
            title={t(`options.playback.mode.${playMode}`)}
            variant="playlist-option"
            style={{ width: "158px" }}
          >
            {playModes.map((mode) => (
              <Dropdown.Item key={mode} eventKey={mode}>
                {t(`options.playback.mode.${mode}`)}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Option.Lead>
        <Option.Description>
          {t("options.playback.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead>
          <b>{t("options.autocorrect.title")}:</b>
          <Button
            variant="playlist-option"
            onClick={() => toggleAutocorrect()}
            style={{ width: "60px" }}
          >
            {isAutocorrectOn ? t("options.ON") : t("options.OFF")}
          </Button>
        </Option.Lead>
        <Option.Description>
          {t("options.autocorrect.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead>
          <AsyncButton
            variant="playlist-option"
            loading={importLoading}
            onClick={() => {
              importFileInputRef?.current?.click();
            }}
          >
            {t("options.import.title")}
          </AsyncButton>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleImport(e.target.files?.[0])}
            onAbort={() => setImportLoading(false)}
            ref={importFileInputRef}
            style={{ display: "none" }}
          />
        </Option.Lead>
        <Option.Description>
          {t("options.import.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead>
          <Button variant="playlist-option" onClick={() => exportAllToFile()}>
            {t("options.export.title.all")}
          </Button>
          <Button
            variant="playlist-option"
            onClick={() => exportActiveToFile()}
          >
            {t("options.export.title.current")}
          </Button>
        </Option.Lead>
        <Option.Description>
          {t("options.export.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead vertical>
          <b>{t("options.presets.title")}:</b>
          {playlists.map((playlist) => (
            <AsyncButton
              key={playlist.name}
              variant="playlist-option"
              onClick={() => setPlaylistToLocalStorage(playlist.name)}
            >
              {t("options.presets.label", { name: playlist.name })}
            </AsyncButton>
          ))}
        </Option.Lead>
        <Option.Description>
          {t("options.presets.description")}
        </Option.Description>
      </Option>
    </div>
  );
}
