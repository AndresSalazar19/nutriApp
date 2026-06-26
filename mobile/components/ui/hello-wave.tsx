import Animated from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export function HelloWave() {
  return (
    <AnimatedIcon
      name="hand-wave"
      size={28}
      color="#F59E0B"
      style={{
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}
    />
  );
}
