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
  if (!isMeasured(measurements)) {
    return {
      topInset: useSharedValue(INIT_VALUE),
      bankTop: useSharedValue(INIT_VALUE),
      sentenceBounds: measurements.sentences.map(() => ({
        top: useSharedValue(INIT_VALUE),
        bottom: useSharedValue(INIT_VALUE),
      })),
      bankPositions: measurements.bankTargets.map(() => useVector(INIT_VALUE, INIT_VALUE)),
      sentencePositions: measurements.sentences.map(() => useVector(INIT_VALUE, INIT_VALUE)),
    };
  } else {
    const topInset = useSharedValue(measurements.topInset ?? 0);
    const bankTop = useSharedValue(measurements.bankTop ?? 0);

    const sentencePositions = zip(measurements.sentences, measurements.sentenceTargets).map(([container, target]) =>
      useVector(container!.x + target!.x, container!.y + target!.y),
    );

    const bankOffset = measurements.bankTop!;
    const bankPositions = measurements.bankTargets.map((layout) =>
      useVector(layout!.x + MARBLE_MARGIN, layout!.y + bankOffset + BOTTOM_SHEET_PAD + MARBLE_MARGIN),
    );
    const sentenceBounds = measurements.sentences.map((layout) => ({
      top: useSharedValue(layout!.y),
      bottom: useSharedValue(layout!.y + layout!.height),
    }));

    return {sentenceBounds, sentencePositions, bankPositions, topInset, bankTop};
  }
};
