import React from 'react';
import {LayoutChangeEvent, Text, View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {colors} from '../colors';
import {Measurements} from './Layout';
import Placeholder from './Placeholder';
import {MARGIN_LEFT, styles} from './styles';

type Props = {
  index: number;
  activeIndex: Animated.SharedValue<number>;
  text: string;
  measurements: Measurements;
};
const Sentence = ({index, activeIndex, text, measurements}: Props) => {
  const onLayoutCircle = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    measurements.sentenceTargets[index] = layout;
  };
  const onLayoutSentence = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    measurements.sentences[index] = layout;
  };

  const style = useAnimatedStyle(() => {
    const borderWidth = index === activeIndex.value ? 3 : 1;
    return {
      borderColor:
        index === activeIndex.value ? colors.red : colors.black_light,
      backgroundColor: colors.white,
      borderWidth,
      borderRadius: 4,
      margin: MARGIN_LEFT - borderWidth,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: 24,
    };
  });

  return (
    <Animated.View
      key={index.toString()}
      onLayout={onLayoutSentence}
      style={style}>
      <View onLayout={onLayoutCircle}>
        <Placeholder />
      </View>
      <Text style={styles.sentenceText}>{text}</Text>
    </Animated.View>
  );
};

export default Sentence;
