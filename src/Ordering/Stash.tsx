/* eslint-disable react-hooks/rules-of-hooks */
import _ from 'lodash';
import React, {ReactElement} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {useSharedValue, useAnimatedReaction} from 'react-native-reanimated';
import {between} from 'react-native-redash';
import {findIndex} from '../util';
import {labels} from './data';

import Label, {BANK_ZINDEX, LabelModes} from './Label';
import {Layout} from './Layout';
import Placeholder from './Placeholder';
import {WINDOW_HEIGHT, WINDOW_WIDTH, styles as sharedstyles} from './styles';

export interface StashProps {
  children: ReactElement<{id: number}>[];
  activeIndex: Animated.SharedValue<number>;
  onSelected: (sentence: number, assignment: number) => void;
  scrollY: Animated.SharedValue<number>;
  layout: Layout;
}

const Stash = ({children, activeIndex, layout, scrollY, onSelected}: StashProps) => {
  const dragPosition = useSharedValue(0);
  useAnimatedReaction(
    () => {
      'worklet';
      if (!between(dragPosition.value, 1, layout.bankTop.value)) return -1;
      return findIndex(layout.sentenceBounds, (v) =>
        between(dragPosition.value + scrollY.value, v.top.value, v.bottom.value),
      );
    },
    (index: number) => {
      activeIndex.value = index;
    },
  );

  const assignments = {
    sentence: children.map(() => useSharedValue(-1)),
    x: layout.bankPositions.map((pos) => useSharedValue(pos.x.value)),
    y: layout.bankPositions.map((pos) => useSharedValue(pos.y.value)),
    mode: children.map(() => useSharedValue(LabelModes.BANK)),
  };

  return (
    <View style={styles.container}>
      {children.map((child, index) => (
        <Label
          key={index}
          dragPosition={dragPosition}
          layout={layout}
          scrollY={scrollY}
          assignments={assignments}
          index={index}
          activeIndex={activeIndex}
          onDropped={_.partialRight(onSelected, index)}>
          {child}
        </Label>
      ))}
      <View style={[sharedstyles.dropShadow, sharedstyles.bottomSheet, styles.bank, {top: layout.bankTop.value}]}>
        <View style={sharedstyles.marbleContainer}>
          {labels.map((label, index) => (
            <Placeholder key={index.toString()} style={sharedstyles.placeholder} text={label} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default Stash;
const styles = StyleSheet.create({
  container: {position: 'absolute', top: 0, left: 0},
  bank: {
    position: 'absolute',
    zIndex: BANK_ZINDEX,
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH,
  },
});
