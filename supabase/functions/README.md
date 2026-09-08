# Edge Functions — pagos

Estas funciones existen por una razón puntual: **el CCLW, el token y el
secret de PagueloFacil no pueden viajar al navegador.** Cualquier
variable con prefijo `VITE_` termina dentro del paquete público, y con
esas credenciales un tercero podría generar cobros a nombre de la
tienda. Por eso el pago pasa por el servidor.

| Función | Qué hace | Quién la llama |
| --- | --- | --- |
| `paguelofacil-checkout` | Pide el enlace de pago a LinkDeamon y lo devuelve | El navegador, al confirmar |
| `paguelofacil-webhook` | Marca el pedido como pagado | PagueloFacil, servidor a servidor |

---

## 1. Cargar los secretos

Los valores están en `supabase/functions/.env` (**no se sube a git**).
Para producción se cargan en Supabase:

```bash
supabase secrets set --env-file supabase/functions/.env
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya existen en el entorno de
las funciones; no hay que declararlas.

## 2. Desplegar

```bash
supabase functions deploy paguelofacil-checkout

# El webhook lo llama PagueloFacil, que no trae token de Supabase:
supabase functions deploy paguelofacil-webhook --no-verify-jwt
```

## 3. Registrar el webhook

La URL hay que dársela a soporte de PagueloFacil (no se configura solo
desde el panel):

```
https://ulqkkqsoyqgzdzhbqspz.supabase.co/functions/v1/paguelofacil-webhook
```

## 4. Probar en local

```bash
supabase functions serve --env-file supabase/functions/.env
```

---

## Tarjetas de prueba (solo ambiente demo)

| Marca | Número |
| --- | --- |
| Visa | 4059310181757001 |
| Visa | 4916012776136988 |
| Mastercard | 5517747952039692 |
| Mastercard | 5451819737278230 |

Fecha de vencimiento: cualquiera futura. CVV: cualquiera de 3 dígitos.

## Pasar a producción

1. Sacar las credenciales reales en `app.paguelofacil.com` (las de
   `demo.paguelofacil.com` **no** funcionan en producción — el endpoint
   responde `615 INVALID SERVICE GATEWAY`).
2. Cambiar `PF_ENV=production` y los tres valores en `.env`.
3. Volver a correr `supabase secrets set` y `functions deploy`.

---

## Detalles que conviene no olvidar

- **El monto nunca viene del navegador.** `paguelofacil-checkout` recibe
  solo un `orderId` y relee el total desde la base. Si el monto se
  aceptara del cliente, cualquiera podría pagar $0.01 por un pedido de
  $100.
- **El regreso del cliente no marca el pago.** Solo el webhook lo hace.
  El cliente puede cerrar la pestaña antes de volver, o editar la URL.
- **Un pago rechazado no cancela el pedido**: queda en `pending` para
  que pueda reintentar o cerrarlo por WhatsApp.
- **Los enlaces son de un solo uso** y aquí expiran a los 30 minutos
  (`EXPIRES_IN`).
- `PARM_1` lleva el id del pedido y PagueloFacil lo devuelve tal cual en
  la notificación: así se sabe qué pedido pagó.
