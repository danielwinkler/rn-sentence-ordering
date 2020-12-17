import {Dimensions, Platform, StyleSheet, ViewStyle} from 'react-native';
import {colors} from '../colors';

const {width, height} = Dimensions.get('window');
export const WINDOW_WIDTH = width;
export const WINDOW_HEIGHT = height;
export const MARBLE_SIZE = 40;
export const MARBLE_MARGIN = 4;
export const MARGIN_LEFT = 12;

export const dropShadow: ViewStyle = Platform.select({
  ios: {
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  android: {},
  default: {},
});

export const styles = StyleSheet.create({
  dropShadow,
  bottomSheet: {
    width: WINDOW_WIDTH,
    backgroundColor: colors.white,
    borderTopColor: colors.black_light,
    borderTopWidth: 1,
    justifyContent: 'flex-start',
  },
  sentenceText: {flex: 1, flexWrap: 'wrap', marginLeft: 17},
  marbleContainer: {
    paddingHorizontal: MARBLE_MARGIN,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  placeholder: {margin: MARBLE_MARGIN},
  screen: {flex: 1, overflow: 'hidden'},
  scrollView: {flex: 1},
});
