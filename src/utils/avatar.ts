import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';

const PROVIDER_AVATAR_KEYS = ['avatar_url', 'picture', 'photo_url'] as const;

const normalizeAvatarUrl = (value: unknown) => {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const getMetadataAvatarUrl = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object') return null;

  const record = metadata as Record<string, unknown>;
  for (const key of PROVIDER_AVATAR_KEYS) {
    const avatarUrl = normalizeAvatarUrl(record[key]);
    if (avatarUrl) return avatarUrl;
  }

  return null;
};

export const getProviderAvatarUrl = (user: User | null | undefined) => {
  const userMetadataAvatar = getMetadataAvatarUrl(user?.user_metadata);
  if (userMetadataAvatar) return userMetadataAvatar;

  for (const identity of user?.identities ?? []) {
    const identityAvatar = getMetadataAvatarUrl(identity.identity_data);
    if (identityAvatar) return identityAvatar;
  }

  return null;
};

export const getDisplayAvatarUrl = (
  profile: Pick<Profile, 'avatar_url'> | null | undefined,
  user: User | null | undefined
) => normalizeAvatarUrl(profile?.avatar_url) ?? getProviderAvatarUrl(user);
