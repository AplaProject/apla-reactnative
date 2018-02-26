import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Dimensions } from 'react-native'
const { width, height } = Dimensions.get('window');
const statusBarHeight = getStatusBarHeight();

export const Fonts = {
  regular: 'Lato-Regular',
  bold: 'Lato-Bold',
  thin: 'Lato-Thin',
  light: 'Lato-Light',
};
export const borderRadius = 12;
export const buttonsBorderRadius = 8;
export const scrollableContainerHeight = height - statusBarHeight - 120; // container`s padding *2

export const FontSizes = {
  smallCommonSize: 14,
  mediumCommonSize: 16,
  commonSize: 18,
  titleSize: 32,
  smallTitleSize: 28,
  modalTitleSize: 26,
};

export const Colors = {
  blue: '#4d3ebc',
  green: '#3ebc9a',
  dark: '#231f20',
  white: '#fff',
  violet: '#532B83',
  dangerRed: '#f03f61',
  lightGrey: '#DFDFDF',
  underlayGreen: 'rgba(62, 188, 154, .15)',
};

export const cancelButton = {
  backgroundColor: 'transparent',
  borderColor: '#fff',
  borderWidth: 1,
  width: '100%',
  marginTop: 0,
}