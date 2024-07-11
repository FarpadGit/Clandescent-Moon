import { useState } from "react";
import VideoPlayer from "./components/MidnightPlayer/VideoPlayer";
import Playlist from "./components/Playlist/Playlist";
import useMediaQuery from "./hooks/useMediaQuery";
import Accordion from "react-bootstrap/Accordion";
import Offcanvas from "react-bootstrap/Offcanvas";
import { ToggleButton } from "react-bootstrap";
import { FiChevronDown } from "react-icons/fi";
import { PiPlaylist } from "react-icons/pi";
import { Trans, useTranslation } from "react-i18next";

function App() {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelTouchStart, setSidePanelTouchStart] = useState(0);
  const { t } = useTranslation();
  const screenWidth = useMediaQuery();

  return (
    <>
      <Accordion onSelect={(e) => setIsDescOpen(e === "description")}>
        <Accordion.Item eventKey="description">
          <Accordion.Header>
            <div className="logo">
              <img src="/logo.png" width={screenWidth.MD ? 400 : 300} />
              <p>Clandescent Moon</p>
            </div>
            <FiChevronDown
              color="var(--app-fg-color)"
              fontSize={30}
              style={{
                transition: "rotate 0.1s ease",
                rotate: `${isDescOpen ? "180deg" : "0deg"}`,
              }}
            />
          </Accordion.Header>
          <Accordion.Body style={{ textAlign: "justify" }}>
            <Trans>
              <p>{t("description.intro")}</p>
              <h4>{t("description.header1")}</h4>
              <p>{t("description.paragraph1")}</p>
              <h4>{t("description.header2")}</h4>
              <p>{t("description.paragraph2")}</p>
              <h4>{t("description.header3")}</h4>
              <p>{t("description.paragraph3")}</p>
              <h4>{t("description.header4")}</h4>
              <p>{t("description.paragraph4")}</p>
            </Trans>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="mx-auto my-5 w-100">
        <div className="container main-area-wrapper">
          <VideoPlayer />
          {!screenWidth.LG && (
            <>
              <ToggleButton
                id="side-panel-btn"
                value={0}
                type="checkbox"
                className="side-panel-btn"
                variant="clandescent"
                onChange={() => setIsSidePanelOpen((prev) => !prev)}
                checked={isSidePanelOpen}
              >
                <PiPlaylist fontSize={20} />
              </ToggleButton>
              <Offcanvas
                show={isSidePanelOpen}
                onHide={() => setIsSidePanelOpen(false)}
                placement="end"
              >
                <Offcanvas.Body
                  onTouchStart={(e) =>
                    setSidePanelTouchStart(e.touches[0].clientX)
                  }
                  onTouchMove={(e) => {
                    if (e.touches[0].clientX - sidePanelTouchStart > 100)
                      setIsSidePanelOpen(false);
                  }}
                >
                  <Playlist />
                </Offcanvas.Body>
              </Offcanvas>
            </>
          )}
          {screenWidth.LG && <Playlist />}
        </div>
      </div>
    </>
  );
}

export default App;
