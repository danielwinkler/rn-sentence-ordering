import React from 'react';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {colors} from '../colors';

import {MARBLE_SIZE} from './styles';

interface PlaceholderProps {
  text?: string;
  style?: ViewStyle;
}

const Placeholder = ({text, style}: PlaceholderProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: colors.grey_light,
          borderColor: colors.grey_medium,
          borderWidth: StyleSheet.hairlineWidth,
          width: MARBLE_SIZE,
          height: MARBLE_SIZE,
          borderRadius: MARBLE_SIZE * 0.5,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}>
      {text && <Text style={{color: colors.grey_medium}}>{text}</Text>}
    </View>
  );
};

export default Placeholder;
