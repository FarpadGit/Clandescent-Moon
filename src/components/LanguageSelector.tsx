import { Dropdown, DropdownButton } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hu", label: "Magyar" },
  ];
  return (
    <div className="lang-selector">
      <DropdownButton
        title={LANGUAGES.find((l) => l.code === i18n.language)?.label}
        defaultValue={i18n.language}
        onSelect={(i) => i18n.changeLanguage(i!)}
        variant="clandescent"
      >
        {LANGUAGES.map(({ code, label }) => (
          <Dropdown.Item key={code} eventKey={code}>
            {label}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </div>
  );
}
