import React, {useState} from 'react';
import {LayoutChangeEvent, View} from 'react-native';
import Animated, {runOnUI, useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';
import {styles} from './styles';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {Circle} from './Circle';
import {data, labels} from './data';
import Placeholder from './Placeholder';
import Stash from './Stash';
import {computeLayout, Measurements, isMeasured, Readiness, isComputed} from './Layout';
import useInterval from '../hooks/useInterval';
import Sentence from './Sentence';

const measurements: Measurements = {
  sentences: data.map(() => undefined),
  sentenceTargets: data.map(() => undefined),
  bankTargets: data.map(() => undefined),
  bankTop: undefined,
  topInset: undefined,
};

const Screen = () => {
  measurements.topInset = useSafeAreaInsets().top;

  const [selections, setSelection] = useState(data.map(() => ''));

  // update constantly
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler(({contentOffset}) => {
    scrollY.value = contentOffset.y;
  });

  // value will be updated on dragging
  const activeIndex = useSharedValue(-1);

  // handle assignment in state
  const onSelected = (sentence: number, assignment: number) => {
    console.log(sentence, assignment);
    if (sentence >= 0 && assignment >= 0) {
      console.log(`dropped ${labels[assignment]} on sentence: ${data[sentence].substr(0, 15)}...`);
      const draft = [...selections];
      draft[sentence] = labels[assignment];
      setSelection(draft);
    }
  };

  const onLayoutTheBank = ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    measurements.bankTop = layout.y;
  };

  const onLayoutInBank = (index: number) => ({nativeEvent: {layout}}: LayoutChangeEvent) => {
    measurements.bankTargets[index] = layout;
  };

  const layout = computeLayout(measurements);
  const [ready, setReady] = useState(Readiness.NONE);
  const setComputed = () => setReady(Readiness.COMPUTED);
  useInterval(
    () => {
      console.log('polling...');
      if (ready === Readiness.NONE && isMeasured(measurements)) {
        console.log('measured');
        setReady(Readiness.MEASURED);
      } else if (ready === Readiness.MEASURED) {
        console.log('check compute');
        runOnUI(isComputed)(layout, setComputed);
      } else {
        console.log('failed');
      }
    },
    ready === Readiness.COMPUTED ? null : 25,
  );

  return (
    <SafeAreaView mode="margin" edges={['top', 'bottom']} style={styles.screen}>
      <Animated.ScrollView style={styles.scrollView} onScroll={onScroll} scrollEventThrottle={16}>
        {data.map((item, index) => (
          <Sentence
            key={index.toString()}
            index={index}
            activeIndex={activeIndex}
            text={item}
            measurements={measurements}
          />
        ))}
      </Animated.ScrollView>

      <View style={[styles.dropShadow, styles.bottomSheet]} onLayout={onLayoutTheBank}>
        <View style={styles.marbleContainer}>
          {labels.map((label, index) => (
            <View key={index.toString()} onLayout={onLayoutInBank(index)}>
              <Placeholder style={styles.placeholder} text={label} />
            </View>
          ))}
        </View>
      </View>

      {ready === Readiness.COMPUTED && (
        <Stash layout={layout} onSelected={onSelected} activeIndex={activeIndex} scrollY={scrollY}>
          {labels.map((l) => (
            <Circle key={l} text={l} />
          ))}
        </Stash>
      )}
    </SafeAreaView>
  );
};

export default Screen;
