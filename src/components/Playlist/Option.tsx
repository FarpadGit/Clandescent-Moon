import React, { ReactNode } from "react";
import { Trans } from "react-i18next";

export const Option = ({ children }: { children: ReactNode }) => {
  const Lead = React.Children.map(children, (c) => {
    if (React.isValidElement(c) && "type" in c && c.type === Option.Lead)
      return c;
  })?.[0];
  const Description = React.Children.map(children, (c) => {
    if (React.isValidElement(c) && "type" in c && c.type === Option.Description)
      return c;
  })?.[0];
  return (
    <div className="options-settings">
      {Lead}
      {Description}
    </div>
  );
};

function JustifiedSection({
  children,
  vertical = false,
}: {
  children: ReactNode;
  vertical?: boolean;
}) {
  return (
    <div
      className={`d-flex align-items-center justify-content-between w-100 mb-3 gap-2 ${
        vertical ? "flex-column" : ""
      }`}
    >
      {children}
    </div>
  );
}

function Paragraph({ children }: { children: ReactNode }) {
  return (
    <p>
      <Trans>{children}</Trans>
    </p>
  );
}

Option.Lead = JustifiedSection;
Option.Description = Paragraph;
