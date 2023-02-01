const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      ...colors,
      amaranth: {
        50: '#fef2f3',
        100: '#fde3e5',
        200: '#fcccd0',
        300: '#f9a8ae',
        400: '#f3767f',
        500: '#e63946',
        600: '#d52d3a',
        700: '#b3222d',
        800: '#942029',
        900: '#7b2128'
      },
      'aqua-island': {
        DEFAULT: '#a8dadc',
        50: '#f1fafa',
        100: '#dcf0f1',
        200: '#a8dadc',
        300: '#8fced1',
        400: '#5ab0b6',
        500: '#3e949c',
        600: '#367a84',
        700: '#31646d',
        800: '#2f535b',
        900: '#2b464e'
      },
      cello: {
        DEFAULT: '#1d3557',
        50: '#f3f6fc',
        100: '#e6edf8',
        200: '#c7d9f0',
        300: '#95bae4',
        400: '#5c95d4',
        500: '#3777c0',
        600: '#275da2',
        700: '#214b83',
        800: '#1f416d',
        900: '#1d3557'
      },
      peppermint: {
        DEFAULT: '#f1faee',
        50: '#f1faee',
        100: '#e6f7e1',
        200: '#cceec4',
        300: '#a4e095',
        400: '#73c95f',
        500: '#4fae39',
        600: '#3d8f2a',
        700: '#327124',
        800: '#2b5a21',
        900: '#244a1d'
      },
      wedgewood: {
        DEFAULT: '#457b9d',
        50: '#f2f7f9',
        100: '#ddeaf0',
        200: '#bfd7e2',
        300: '#92b9ce',
        400: '#5e93b2',
        500: '#457b9d',
        600: '#3a6180',
        700: '#34516a',
        800: '#314559',
        900: '#2d3d4c'
      }
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem'
      }
    },
    fontFamily: ['Roboto']
  }
};
