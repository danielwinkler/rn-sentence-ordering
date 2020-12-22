import React, {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  useDerivedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {PanGestureHandler, PanGestureHandlerGestureEvent} from 'react-native-gesture-handler';
import {useVector} from 'react-native-redash';

import {MARBLE_SIZE} from './styles';
import {StashProps} from './Stash';

const ANIM_CFG: Animated.WithTimingConfig = {duration: 450};

/// values also used as zIndex
export enum LabelModes {
  LIST = 1,
  BANK = 3,
  ACTIVE,
}
export const BANK_ZINDEX = 2; // higher than list , lower than bank labels

interface LabelProps {
  layout: StashProps['layout'];
  scrollY: Animated.SharedValue<number>;
  assignments: {
    x: Animated.SharedValue<number>[];
    y: Animated.SharedValue<number>[];
    sentence: Animated.SharedValue<number>[];
    mode: Animated.SharedValue<LabelModes>[];
  };

  children: ReactElement<{id: number}>;
  index: number;
  dragPosition: Animated.SharedValue<number>;
  activeIndex: Animated.SharedValue<number>;
  onDropped: (index: number) => void;
}

const Label = ({layout, assignments, index, children, dragPosition, activeIndex, scrollY, onDropped}: LabelProps) => {
  const translation = useVector();
  const mode = assignments.mode[index];
  const onGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, {x: number; y: number}>({
    onStart: (event, ctx) => {
      const sentence = assignments.sentence[index].value;
      if (sentence === -1) {
        translation.x.value = layout.bankPositions[index].x.value;
        translation.y.value = layout.bankPositions[index].y.value;
      } else {
        translation.x.value = layout.sentencePositions[sentence].x.value;
        translation.y.value = layout.sentencePositions[sentence].y.value - scrollY.value;
      }
      assignments.mode[index].value = LabelModes.ACTIVE;
      ctx.x = translation.x.value;
      ctx.y = translation.y.value;
    },
    onActive: ({translationX, translationY}, ctx) => {
      translation.x.value = ctx.x + translationX;
      translation.y.value = ctx.y + translationY;
      dragPosition.value = translation.y.value;
    },
    onEnd: () => {
      const sentenceIndex = activeIndex.value;
      const dropOnList = sentenceIndex !== -1;
      if (dropOnList) {
        // have we been assigned previously?
        const prevSentence = assignments.sentence[index].value;
        // is the new target occupied?
        const otherIndex = assignments.sentence.findIndex((a) => a.value === sentenceIndex);
        if (otherIndex !== -1) {
          // let us swap
          assignments.sentence[otherIndex].value = prevSentence;
          if (prevSentence !== -1) {
            assignments.mode[otherIndex].value = LabelModes.LIST;
            assignments.x[otherIndex].value = withTiming(layout.sentencePositions[prevSentence].x.value, ANIM_CFG);
            assignments.y[otherIndex].value = withTiming(layout.sentencePositions[prevSentence].y.value, ANIM_CFG);
          } else {
            assignments.mode[otherIndex].value = LabelModes.BANK;
            // when going from list to bank we switch from scrollY adjusted to pure absolute
            assignments.y[otherIndex].value -= scrollY.value;
            assignments.x[otherIndex].value = withTiming(layout.bankPositions[otherIndex].x.value, ANIM_CFG);
            assignments.y[otherIndex].value = withTiming(layout.bankPositions[otherIndex].y.value, ANIM_CFG);
          }
        }
      }

      assignments.sentence[index].value = sentenceIndex;
      assignments.x[index].value = translation.x.value;
      assignments.y[index].value = translation.y.value;
      if (dropOnList) {
        assignments.mode[index].value = LabelModes.LIST;
        // when not dragging (active) we switch from absolute to scroll adjusted
        assignments.y[index].value += scrollY.value;
        assignments.x[index].value = withTiming(layout.sentencePositions[sentenceIndex].x.value, ANIM_CFG, () => {
          runOnJS(onDropped)(sentenceIndex);
        });
        assignments.y[index].value = withTiming(layout.sentencePositions[sentenceIndex].y.value, ANIM_CFG);
      } else {
        assignments.mode[index].value = LabelModes.BANK;
        assignments.x[index].value = withTiming(layout.bankPositions[index].x.value, ANIM_CFG, () => {
          runOnJS(onDropped)(sentenceIndex);
        });
        assignments.y[index].value = withTiming(layout.bankPositions[index].y.value, ANIM_CFG);
      }
      dragPosition.value = 0;
    },
  });
  const translateX = useDerivedValue(() => {
    switch (mode.value) {
      case LabelModes.ACTIVE:
        return translation.x.value;
      default:
        return assignments.x[index].value;
    }
  });
  const translateY = useDerivedValue(() => {
    switch (mode.value) {
      case LabelModes.ACTIVE:
        return translation.y.value;
      case LabelModes.BANK: {
        return assignments.y[index].value;
      }
      case LabelModes.LIST: {
        return assignments.y[index].value - scrollY.value;
      }
    }
  });
  const style = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: assignments.mode[index].value,
      width: MARBLE_SIZE,
      height: MARBLE_SIZE,
      transform: [{translateX: translateX.value}, {translateY: translateY.value}],
    };
  });
  return (
    <Animated.View style={style}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={StyleSheet.absoluteFill}>{children}</Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

export default Label;
