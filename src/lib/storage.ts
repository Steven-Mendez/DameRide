import { isSupabaseConfigured, supabase } from './supabase';

const VEHICLE_PHOTOS_BUCKET = 'vehicles';
const AVATARS_BUCKET = 'avatars';

const inferContentType = (uri: string) => {
  const normalized = uri.toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const extensionFromType = (contentType: string) => {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
};

async function uploadPublicImage(params: {
  bucket: string;
  path: string;
  localUri: string;
  fallbackMessage: string;
}) {
  const { bucket, path, localUri, fallbackMessage } = params;

  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase no esta configurado.') };
  }

  try {
    const response = await fetch(localUri);
    const arrayBuffer = await response.arrayBuffer();
    const contentType = inferContentType(localUri);

    const { error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(path, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);

    return { data: data.publicUrl, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(fallbackMessage),
    };
  }
}

export async function uploadVehiclePhoto(params: {
  ownerId: string;
  localUri: string;
  vehicleId?: string;
}) {
  const { ownerId, localUri, vehicleId } = params;

  const contentType = inferContentType(localUri);
  const extension = extensionFromType(contentType);
  const fileName = `${vehicleId ?? 'new'}-${Date.now()}.${extension}`;

  return uploadPublicImage({
    bucket: VEHICLE_PHOTOS_BUCKET,
    path: `${ownerId}/${fileName}`,
    localUri,
    fallbackMessage: 'No se pudo subir la foto del vehiculo.',
  });
}

export async function uploadAvatar(params: {
  userId: string;
  localUri: string;
}) {
  const { userId, localUri } = params;

  const contentType = inferContentType(localUri);
  const extension = extensionFromType(contentType);

  return uploadPublicImage({
    bucket: AVATARS_BUCKET,
    path: `${userId}/avatar-${Date.now()}.${extension}`,
    localUri,
    fallbackMessage: 'No se pudo subir el avatar.',
  });
}

export async function deleteAvatar(avatarUrl: string) {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase no esta configurado.') };
  }

  try {
    const url = new URL(avatarUrl);
    const bucketPath = `/object/public/${AVATARS_BUCKET}/`;
    const bucketIndex = url.pathname.indexOf(bucketPath);

    if (bucketIndex === -1) {
      return { error: null };
    }

    const filePath = decodeURIComponent(url.pathname.slice(bucketIndex + bucketPath.length));
    if (!filePath) {
      return { error: null };
    }

    const { error } = await supabase.storage.from(AVATARS_BUCKET).remove([filePath]);
    return { error };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('No se pudo eliminar el avatar.'),
    };
  }
}
