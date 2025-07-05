import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import PromptScreen from '../screens/PromptScreen';
import CookbookScreen from '../screens/CookbookScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AppColors from '../AppColors';
import { AppColorsDark } from '../AppColors';

const TAB_ICONS = {
  create: {
    filled: 'cookie',
    outline: 'cookie-outline',
  },
  cookbook: {
    filled: 'book',
    outline: 'book-outline',
  },
  settings: {
    filled: 'cog',
    outline: 'cog-outline',
  },
};

type TabKey = 'create' | 'cookbook' | 'settings';

const TabNavigator = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState<{
    key: TabKey;
    title: string;
    icon: string;
  }[]>([
    { key: 'create', title: 'Create', icon: 'cookie' },
    { key: 'cookbook', title: 'Cookbook', icon: 'book' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
  ]);
  const theme = useTheme();
  const isDark = theme.dark;

  const renderIcon = ({ route, focused, color }: { route: { key: TabKey }, focused: boolean, color: string }) => {
    const iconName = focused ? TAB_ICONS[route.key].filled : TAB_ICONS[route.key].outline;
    return (
      <MaterialCommunityIcons
        name={iconName as any}
        color={color}
        size={24}
        style={{ alignSelf: 'center', marginTop: 0, marginBottom: 2 }}
      />
    );
  };

  const handleIndexChange = (i: number) => {
    if (i !== index) {
      Haptics.selectionAsync();
    }
    setIndex(i);
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes: routes as any }}
      onIndexChange={handleIndexChange}
      renderScene={BottomNavigation.SceneMap({
        create: PromptScreen,
        cookbook: CookbookScreen,
        settings: SettingsScreen,
      })}
      renderIcon={renderIcon}
      shifting={false}
      sceneAnimationEnabled={false}
      barStyle={{
        backgroundColor: theme.colors.elevation.level2,
        height: 64,
        justifyContent: 'center',
        shadowColor: 'transparent',
        elevation: 0,
        borderTopWidth: 0,
      }}
      labeled={true}
      activeColor={isDark ? AppColorsDark.navIcon : '#2A1C14'}
      inactiveColor={isDark ? AppColorsDark.navIcon : '#2A1C14'}
    />
  );
};

export default TabNavigator; 