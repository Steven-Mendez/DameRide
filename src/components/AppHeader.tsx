import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { DriverBadge } from './DriverBadge';
import { useAuth } from '../hooks/useAuth';
import { Colors, Shadows } from '../constants/theme';
import { getDisplayAvatarUrl } from '../utils/avatar';

interface AppHeaderProps {
  showBack?: boolean;
  showAvatar?: boolean;
  showNotification?: boolean;
  rightIcon?: React.ReactNode;
}

export function AppHeader({
  showBack = false,
  showAvatar = true,
  showNotification = true,
  rightIcon,
}: AppHeaderProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const avatarUrl = getDisplayAvatarUrl(profile, user);

  return (
    <View
      className="flex-row justify-between items-center px-5 h-16 bg-white border-b border-gray-100"
      style={Shadows.sm}
    >
      <View className="flex-row items-center gap-3">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        )}
        {showAvatar && !showBack && (
          <DriverBadge name={profile?.full_name ?? null} avatarUrl={avatarUrl} size="sm" />
        )}
        <Text className="font-jakarta-extrabold text-xl text-primary tracking-tight">
          DameRide
        </Text>
      </View>
      <View className="flex-row items-center gap-4">
        {rightIcon}
        {showNotification && (
          <TouchableOpacity
            className="p-2 rounded-full"
            activeOpacity={0.7}
          >
            <Bell size={22} color="#6b7280" />
          </TouchableOpacity>
        )}
        {showBack && showAvatar && (
          <DriverBadge name={profile?.full_name ?? null} avatarUrl={avatarUrl} size="sm" />
        )}
      </View>
    </View>
  );
}
