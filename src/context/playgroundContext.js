import React, { useEffect, createContext, useState, useContext } from 'react';
import { buildTheme } from './themeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { predefinedFonts } from '../models/themePlaygroundOptions';
import { loadFonts } from '../models/utils';

export const PlaygroundContext = createContext({});

export function PlaygroundProvider({ children }) {
  const [themeType, setThemeType] = useLocalStorage('theme', 'light');
  const [themeObject, setThemeObject] = useLocalStorage(
    'themeObject',
    undefined,
  );
  const [fonts, setFonts] = useState(predefinedFonts);
  const [theme, setTheme] = useState({
    dark: buildTheme('dark'),
    light: buildTheme('light'),
    fonts: [...predefinedFonts],
  });

  useEffect(() => {
    if (themeObject === undefined) return;
    // set theme for customization to the saved theme
    setTheme((prevTheme) => ({
      ...prevTheme,
      ...themeObject,
    }));

    if (!themeObject.fonts) return;

    loadFonts(themeObject.fonts).then((fontsLoaded) => {
      if (!fontsLoaded) return;
      setFonts((prevFonts) => {
        const newFonts = new Set([...prevFonts, ...themeObject.fonts]);
        return [...newFonts];
      });
    });
  }, []);

  useEffect(() => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      fonts: [...fonts],
    }));
  }, [fonts]);

  /**
   * set mui theme prop by path
   *
   * @param {string} propPath - path to the prop
   * @param {string|number} value - new value of the prop
   *
   * @example
   * setPropByPath('palette.primary.main', '#FFFF33')
   *
   * @returns the new theme
   */
  const setPropByPath = (propPath, value) => {
    if (!value || !propPath) return null;
    const temp = { ...theme[themeType] };
    propPath.split('.').reduce((acc, curr, i, src) => {
      if (curr === src[src.length - 1]) {
        acc[src[src.length - 1]] = value;
        return acc[src[src.length - 1]];
      }
      return acc[curr];
    }, temp);
    setTheme({
      ...theme,
      [themeType]: temp,
    });
    return temp;
  };

  /**
   * get mui theme prop by path
   *
   * @param {string} propPath - path to the prop
   *
   * @example
   * // returns #FFFF33
   * getPropByPath('palette.primary.main')
   *
   * @example
   * // returns { main: xxx, light: xxx, dark: xxx }
   * getPropByPath('palette.primary')
   */
  const getPropByPath = (propPath) => {
    if (!propPath) return null;
    return propPath
      .split('.')
      .reduce((acc, curr, i, src) => acc[curr], theme[themeType]);
  };

  const contextValue = React.useMemo(
    () => ({
      theme,
      setTheme,
      themeType,
      setThemeType,
      fonts,
      setFonts,
      getPropByPath,
      setPropByPath,
    }),
    [
      theme,
      setTheme,
      themeType,
      setThemeType,
      fonts,
      setFonts,
      getPropByPath,
      setPropByPath,
    ],
  );

  return (
    <PlaygroundContext.Provider value={contextValue}>
      {children}
    </PlaygroundContext.Provider>
  );
}

export const usePlaygroundTheme = () => {
  const { theme, setTheme } = useContext(PlaygroundContext);
  return [theme, setTheme];
};

export const usePlaygroundThemeType = () => {
  const { themeType, setThemeType } = useContext(PlaygroundContext);
  return [themeType, setThemeType];
};

export const usePlaygroundFonts = () => {
  const { fonts, setFonts } = useContext(PlaygroundContext);
  return [fonts, setFonts];
};

export const usePropUtils = () => {
  const { getPropByPath, setPropByPath } = useContext(PlaygroundContext);
  return { getPropByPath, setPropByPath };
};
