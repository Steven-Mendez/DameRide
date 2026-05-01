import React from 'react';
import { View, Text, Image } from 'react-native';
import { getInitials } from '../utils/format';

interface DriverBadgeProps {
  name: string | null;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  verified?: boolean;
}

const sizeMap = {
  sm: { container: 'w-10 h-10', text: 'text-sm', badge: 'w-4 h-4', badgeText: 'text-[7px]' },
  md: { container: 'w-12 h-12', text: 'text-base', badge: 'w-5 h-5', badgeText: 'text-[8px]' },
  lg: { container: 'w-28 h-28', text: 'text-2xl', badge: 'w-7 h-7', badgeText: 'text-[10px]' },
};

export function DriverBadge({ name, avatarUrl, size = 'md', verified = true }: DriverBadgeProps) {
  const s = sizeMap[size];

  return (
    <View className="relative">
      <View
        className={`${s.container} rounded-full bg-primary-container/30 items-center justify-center ${
          size === 'lg' ? 'border-4 border-primary-fixed' : 'border-2 border-primary-container'
        } overflow-hidden`}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text className={`font-jakarta-bold ${s.text} text-on-primary-container`}>
            {getInitials(name)}
          </Text>
        )}
      </View>
      {verified && (
        <View
          className={`absolute -bottom-0.5 -right-0.5 ${s.badge} bg-secondary rounded-full items-center justify-center border-2 border-white`}
        >
          <Text className={`text-white ${s.badgeText} font-jakarta-bold`}>✓</Text>
        </View>
      )}
    </View>
  );
}
