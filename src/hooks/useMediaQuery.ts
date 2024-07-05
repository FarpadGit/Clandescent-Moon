import { useEffect, useState } from "react";

const ScreenENUM = {
  "2XL": 1400,
  XL: 1200,
  LG: 992,
  MD: 768,
  SM: 576,
  XS: 0,
};

type screenSizeType = {
  "2XL": boolean;
  XL: boolean;
  LG: boolean;
  MD: boolean;
  SM: boolean;
  XS: boolean;
};

//hook for reading screen width like css or tailwind media queries but for components with width/height props
// ** usecase **
// const screenWidth = useMediaQuery(); if(screenWidth.MD) {*console.log("screen is at least MD wide")*}

export default function useMediaQuery() {
  const allFalse: screenSizeType = {
    "2XL": false,
    XL: false,
    LG: false,
    MD: false,
    SM: false,
    XS: false,
  };
  const [screenSize, setScreenSize] = useState<screenSizeType>(allFalse);
  function checkScreenSize() {
    const screenWidth2XL = window.matchMedia(
      `(min-width: ${ScreenENUM["2XL"]}px)`
    ).matches;
    const screenWidthXL = window.matchMedia(
      `(min-width: ${ScreenENUM["XL"]}px)`
    ).matches;
    const screenWidthLG = window.matchMedia(
      `(min-width: ${ScreenENUM["LG"]}px)`
    ).matches;
    const screenWidthMD = window.matchMedia(
      `(min-width: ${ScreenENUM["MD"]}px)`
    ).matches;
    const screenWidthSM = window.matchMedia(
      `(min-width: ${ScreenENUM["SM"]}px)`
    ).matches;
    let _screenSize = { ...allFalse, XS: true };
    if (screenWidthSM) _screenSize["SM"] = true;
    if (screenWidthMD) _screenSize["MD"] = true;
    if (screenWidthLG) _screenSize["LG"] = true;
    if (screenWidthXL) _screenSize["XL"] = true;
    if (screenWidth2XL) _screenSize["2XL"] = true;

    setScreenSize(_screenSize);
  }
  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return screenSize;
}
