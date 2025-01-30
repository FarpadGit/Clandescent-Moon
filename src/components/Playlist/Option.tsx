import React, { ReactNode } from "react";
import { Trans } from "react-i18next";

/* Options can be structured in the following way:

<Option>
  <Option.Lead></Option.Lead>
  <Option.Description></Option.Description>
</Option>

OR

<Option>
  <Option.Lead>
    <Option.LeadGroup></Option.LeadGroup>
    <Option.LeadGroup></Option.LeadGroup>
  </Option.Lead>
  <Option.Description></Option.Description>
</Option>

The former will implicitly group everything in the Lead into one LeadGroup
Elements not following these structures will be filtered out
*/

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

function GroupedSections({
  children,
  vertical = false,
}: {
  children: ReactNode;
  vertical?: boolean;
}) {
  const LeadGroups = React.Children.map(children, (c) => {
    if (React.isValidElement(c) && "type" in c && c.type === Option.LeadGroup)
      return c;
  });

  if (!LeadGroups || LeadGroups.length === 0)
    return <JustifiedSection vertical={vertical}>{children}</JustifiedSection>;

  return <div className="d-flex flex-column w-100">{LeadGroups}</div>;
}

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

Option.Lead = GroupedSections;
Option.LeadGroup = JustifiedSection;
Option.Description = Paragraph;
