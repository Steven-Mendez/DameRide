# Funcionalidades

## Autenticación

- Registro con correo, contraseña y metadata de perfil.
- Inicio de sesión con correo y contraseña.
- Inicio de sesión con Google vía Supabase OAuth.
- Persistencia de sesión en móvil con AsyncStorage.
- Redirección automática según sesión y onboarding.

## Onboarding

El onboarding recopila nombre, teléfono, departamento y permite registrar un vehículo inicial. Al completarse, actualiza `profiles.onboarding_completed_at`.

## Búsqueda de Viajes

La pantalla `buscar` permite elegir punto de salida/llegada en mapa, filtrar por fecha, hora y radio, ordenar por cercanía, hora, precio o cupos, ver resultados en lista/mapa y recibir actualizaciones realtime.

## Publicación de Viajes

La pantalla `publicar` permite definir ruta, puntos exactos, fecha, hora, cupos, precio, punto de encuentro y notas. Si hay vehículo registrado, asocia el primer vehículo del usuario al viaje.

## Reservas

Los usuarios pueden reservar asiento desde el detalle de un viaje. La reserva se ejecuta mediante RPC `reserve_seat`, que valida disponibilidad y evita reservar viajes propios. La pantalla `reservas` muestra reservas activas y viajes publicados, y permite cancelar reservas mediante `cancel_reservation`.

## Perfil y Vehículos

La pantalla de perfil muestra datos del usuario, rating, cantidad de viajes, número de vehículos y contacto por WhatsApp. También existen pantallas para editar perfil, subir avatar, crear vehículos, editar vehículos y subir fotos.

## Mapas y Rutas

La app usa selección visual de puntos y cálculo de ruta con OSRM/Valhalla. Guarda polyline, distancia y duración cuando están disponibles.
