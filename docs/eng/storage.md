# Storage

DameRide uses Supabase Storage for profile and vehicle images.

## Buckets

| Bucket | Use | Public | Limit | MIME types |
| --- | --- | --- | --- | --- |
| `avatars` | Profile avatar | Yes | 1 MiB | `image/jpeg`, `image/png`, `image/webp` |
| `vehicles` | Vehicle photo | Yes | 2 MiB | `image/jpeg`, `image/png`, `image/webp` |

## Code Files

- `src/lib/storage.ts` centralizes uploads and avatar deletion.
- `app/profile/edit.tsx` selects/uploads avatars.
- `app/profile/vehicle.tsx` takes or selects vehicle photos.

## Path Convention

```txt
<user-id>/avatar-<timestamp>.jpg
<user-id>/<vehicle-id-or-new>-<timestamp>.jpg
```

This enables policies based on `storage.foldername(name)[1] = auth.uid()`.

## Policies

Migrations create policies for public reads and authenticated writes within the user's folder. Avatar deletion is also documented for removing the old file when the profile avatar is removed.

## Security

Buckets are public by design so images can be rendered in the app. If the product later requires privacy, buckets, URLs, and policies should be changed.
