import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Search, PlusCircle, Route, User } from 'lucide-react-native';
import { Colors, Shadows } from '@/src/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS = {
  buscar: Search,
  publicar: PlusCircle,
  reservas: Route,
  perfil: User,
};

function StitchTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: bottomPadding,
          paddingTop: 12,
          paddingHorizontal: 8,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
        },
        Shadows.bottomBar,
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;

        const IconComponent = TAB_ICONS[route.name as keyof typeof TAB_ICONS] ?? Search;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 4,
            }}
          >
            <View
              style={[
                {
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                },
                isFocused && {
                  backgroundColor: Colors.emerald50,
                },
              ]}
            >
              <IconComponent
                size={22}
                color={isFocused ? Colors.primary : Colors.gray400}
                {...(isFocused ? { strokeWidth: 2.5 } : {})}
              />
            </View>
            <Text
              style={{
                fontFamily: isFocused
                  ? 'PlusJakartaSans_600SemiBold'
                  : 'PlusJakartaSans_500Medium',
                fontSize: 11,
                marginTop: 4,
                color: isFocused ? Colors.primary : Colors.gray400,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <StitchTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Publicar',
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Viajes',
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
        }}
      />
    </Tabs>
  );
}
