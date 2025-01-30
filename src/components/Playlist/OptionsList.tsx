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
    isFileUploadOn,
    toggleAutocorrect,
    toggleFileUpload,
    playMode,
    setPlayMode,
  } = useAppContext();
  const {
    exportActiveToFile,
    exportAllToFile,
    importFromFile,
    exportActiveToCloud,
    exportAllToCloud,
    importFromCloud,
    setPlaylistToLocalStorage,
  } = useUserActionsContext();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [fileUploadSlug, setFileUploadSlug] = useState<string>("");
  const [importLoading, setImportLoading] = useState<boolean | null>(false);
  const [exportActiveLoading, setExportActiveLoading] = useState<
    boolean | null
  >(false);
  const [exportAllLoading, setExportAllLoading] = useState<boolean | null>(
    false
  );
  const { t } = useTranslation();

  async function handleImport(file: File | undefined) {
    if (!isFileUploadOn && (!file || !file.name.endsWith(".csv"))) return;
    try {
      setImportLoading(true);
      if (isFileUploadOn) {
        const success = await importFromCloud(fileUploadSlug);
        if (!success) throw new Error();
      }
      // read text file
      else await file!.text().then((fileText) => importFromFile(fileText));
      setImportLoading(false);
    } catch (error) {
      console.error(error);
      setImportLoading(null);
    }
  }

  async function handleExport(mode: "active" | "all") {
    try {
      if (mode === "active") {
        setExportActiveLoading(true);
        if (isFileUploadOn) {
          const downloadId = await exportActiveToCloud();
          setFileUploadSlug(downloadId ?? t("options.ERROR"));
          if (!downloadId) throw new Error();
        } else exportActiveToFile();
        setExportActiveLoading(false);
      }
      if (mode === "all") {
        setExportAllLoading(true);
        if (isFileUploadOn) {
          const downloadId = await exportAllToCloud();
          setFileUploadSlug(downloadId ?? t("options.ERROR"));
          if (!downloadId) throw new Error();
        } else exportAllToFile();
        setExportAllLoading(false);
      }
    } catch (error) {
      console.error(error);
      if (mode === "active") setExportActiveLoading(null);
      if (mode === "all") setExportAllLoading(null);
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
          <b>{t("options.fileupload.title")}:</b>
          <Button
            variant="playlist-option"
            onClick={() => toggleFileUpload()}
            style={{ width: "60px" }}
          >
            {isFileUploadOn ? t("options.ON") : t("options.OFF")}
          </Button>
        </Option.Lead>
        <Option.Description>
          {t("options.fileupload.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead>
          <Option.LeadGroup>
            <AsyncButton
              variant="playlist-option"
              loading={importLoading}
              onClick={() => {
                if (isFileUploadOn) handleImport(undefined);
                else importFileInputRef?.current?.click();
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
          </Option.LeadGroup>
          {isFileUploadOn && (
            <Option.LeadGroup>
              <div className="d-flex w-100 justify-content-center align-items-center gap-2">
                <span>{t("options.DOWNLOADID")}: </span>
                <input
                  type="text"
                  value={fileUploadSlug}
                  onChange={(e) => setFileUploadSlug(e.target.value)}
                  disabled={!isFileUploadOn}
                />
              </div>
            </Option.LeadGroup>
          )}
        </Option.Lead>
        <Option.Description>
          {t("options.import.description")}
        </Option.Description>
      </Option>

      <Option>
        <Option.Lead>
          <Option.LeadGroup>
            <AsyncButton
              variant="playlist-option"
              loading={exportAllLoading}
              onClick={() => handleExport("all")}
            >
              {t("options.export.title.all")}
            </AsyncButton>
            <AsyncButton
              variant="playlist-option"
              loading={exportActiveLoading}
              onClick={() => handleExport("active")}
            >
              {t("options.export.title.current")}
            </AsyncButton>
          </Option.LeadGroup>
          {isFileUploadOn && fileUploadSlug !== "" && (
            <Option.LeadGroup>
              <p className="d-flex w-100 justify-content-center mb-0">
                {t("options.DOWNLOADID")}: {fileUploadSlug}
              </p>
            </Option.LeadGroup>
          )}
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
