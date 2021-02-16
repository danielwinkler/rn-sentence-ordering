import {zip} from 'lodash';
import {LayoutRectangle} from 'react-native';
import Animated, {runOnJS, useSharedValue} from 'react-native-reanimated';
import {useVector, Vector} from 'react-native-redash';
import {isDefined, some} from '../util';

import {SharedValues} from '../types';
import {BOTTOM_SHEET_PAD, MARBLE_MARGIN} from './styles';

export type Layout = {
  sentencePositions: Vector<Animated.SharedValue<number>>[];
  sentenceBounds: SharedValues<{top: number; bottom: number}>[];
  bankPositions: Vector<Animated.SharedValue<number>>[];
  topInset: Animated.SharedValue<number>;
  bankTop: Animated.SharedValue<number>;
};

export type Measurements = {
  sentences: (LayoutRectangle | undefined)[];
  sentenceTargets: (LayoutRectangle | undefined)[];
  bankTargets: (LayoutRectangle | undefined)[];
  bankTop?: number;
  topInset?: number;
};

export enum Readiness {
  NONE,
  MEASURED,
  COMPUTED,
}

const INIT_VALUE = Number.MIN_SAFE_INTEGER;

export const isMeasured = (measurements: Measurements) =>
  isDefined(measurements.topInset) &&
  isDefined(measurements.bankTop) &&
  measurements.sentences.every(isDefined) &&
  measurements.sentenceTargets.every(isDefined) &&
  measurements.bankTargets.every(isDefined);

export const isComputed = (layout: Layout, success: () => void) => {
  'worklet';
  if (layout.bankTop.value === INIT_VALUE) return;
  if (layout.topInset.value === INIT_VALUE) return;
  if (some(layout.sentenceBounds, (v) => v.top.value === INIT_VALUE || v.bottom.value === INIT_VALUE)) return;
  if (some(layout.sentencePositions, (v) => v.x.value === INIT_VALUE || v.y.value === INIT_VALUE)) return;
  if (some(layout.bankPositions, (v) => v.x.value === INIT_VALUE || v.y.value === INIT_VALUE)) return;
  runOnJS(success)();
};

export const computeLayout = (measurements: Measurements): Layout => {
  console.log('getLayout');
  const layout = {
    topInset: useSharedValue(INIT_VALUE),
    bankTop: useSharedValue(INIT_VALUE),
    sentenceBounds: measurements.sentences.map(() => ({
      top: useSharedValue(INIT_VALUE),
      bottom: useSharedValue(INIT_VALUE),
    })),
    bankPositions: measurements.bankTargets.map(() => useVector(INIT_VALUE, INIT_VALUE)),
    sentencePositions: measurements.sentences.map(() => useVector(INIT_VALUE, INIT_VALUE)),
  };
  if (!isMeasured(measurements)) {
    return layout;
  } else {
    layout.topInset.value = measurements.topInset ?? 0;
    layout.bankTop.value = measurements.bankTop ?? 0;

    zip(measurements.sentences, measurements.sentenceTargets).forEach(([container, target], idx) => {
      layout.sentencePositions[idx].x.value = container!.x + target!.x;
      layout.sentencePositions[idx].y.value = container!.y + target!.y;
    });

    const bankOffset = measurements.bankTop!;
    measurements.bankTargets.forEach((m, idx) => {
      layout.bankPositions[idx].x.value = m!.x + MARBLE_MARGIN;
      layout.bankPositions[idx].y.value = m!.y + bankOffset + BOTTOM_SHEET_PAD + MARBLE_MARGIN;
    });
    measurements.sentences.forEach((m, idx) => {
      layout.sentenceBounds[idx].top.value = m!.y;
      layout.sentenceBounds[idx].bottom.value = m!.y + m!.height;
    });

    return layout;
  }
};
