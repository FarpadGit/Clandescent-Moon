import { MouseEvent, ReactNode, useEffect, useState } from "react";
import { Button, ButtonProps, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function AsyncButton({
  children,
  loading: loadingProp,
  ...props
}: { children: ReactNode; loading?: boolean | null } & ButtonProps) {
  const [loadingState, setLoadingState] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const { onClick, ...rest } = props;

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (loadingProp === undefined) {
      setLoadingState("loading");
      try {
        await new Promise((res) => res(onClick?.(e)));
        setLoadingState("done");
      } catch (error) {
        console.error(error);
        setLoadingState("error");
      }
    } else onClick?.(e);
  }

  useEffect(() => {
    if (loadingProp === undefined) return;
    if (loadingProp === true) setLoadingState("loading");
    if (loadingProp === false) setLoadingState("done");
    if (loadingProp === null) setLoadingState("error");
  }, [loadingProp]);

  useEffect(() => {
    if (loadingState === "done" || loadingState === "error")
      setTimeout(() => setLoadingState("idle"), 1500);
  }, [loadingState]);

  return (
    <Button
      onClick={(e) => handleClick(e)}
      disabled={loadingState === "loading"}
      {...rest}
    >
      {loadingState === "idle" && children}
      {loadingState === "loading" && <Loading />}
      {loadingState === "done" && <Done />}
      {loadingState === "error" && <Error />}
    </Button>
  );
}

function Loading() {
  const { t } = useTranslation();
  return (
    <span className="d-flex justify-content-center gap-2">
      {t("options.LOADING")}
      <Spinner size="sm" />
    </span>
  );
}

function Done() {
  const { t } = useTranslation();
  return (
    <span className="d-flex justify-content-center gap-2">
      {t("options.DONE")}
      <span>
        <Checkmark size="1.5rem" color="var(--border-color)" />
      </span>
    </span>
  );
}

function Error() {
  const { t } = useTranslation();
  return (
    <span className="d-flex justify-content-center gap-2">
      {t("options.ERROR")}
      <span>
        <Cross size="1.5rem" color="red" />
      </span>
    </span>
  );
}

function Checkmark({ size, color }: { size: string; color: string }) {
  return (
    <svg
      className="checkmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      style={
        {
          width: size,
          height: size,
          "--checkmark-fill-color": color,
        } as React.CSSProperties
      }
    >
      <circle className="circle" cx="26" cy="26" r="25" fill="none"></circle>
      <path
        className="check"
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      ></path>
    </svg>
  );
}

function Cross({ size, color }: { size: string; color: string }) {
  return (
    <svg
      className="cross"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      style={
        {
          width: size,
          height: size,
          "--checkmark-fill-color": color,
        } as React.CSSProperties
      }
    >
      <circle className="circle" cx="26" cy="26" r="25" fill="none"></circle>
      <path className="line" fill="none" d="M 10,10 41,41"></path>
      <path className="line" fill="none" d="M 41,10 10,41"></path>
    </svg>
  );
}
