import React from 'react';
import {Text, View} from 'react-native';
import {colors} from '../colors';
import {MARBLE_MARGIN, MARBLE_SIZE} from './styles';

type CircleProps = {
  text: string;
  dashed?: boolean;
};

export const Circle = ({text, dashed}: CircleProps) => (
  <View
    style={{
      width: MARBLE_SIZE,
      height: MARBLE_SIZE,
      borderRadius: MARBLE_SIZE * 0.5,
      backgroundColor: colors.white,
      borderColor: colors.black_medium,
      borderWidth: 1,
      borderStyle: dashed ? 'dashed' : 'solid',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>{text}</Text>
  </View>
);
