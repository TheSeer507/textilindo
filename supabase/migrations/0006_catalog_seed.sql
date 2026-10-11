-- ============================================================
-- 0006 — CARGA DEL CATÁLOGO
-- ARCHIVO GENERADO: no editar a mano. Sale de src/data/catalog.js
-- con `npm run catalog:sql`.
--
-- Pegar completo en Supabase → SQL Editor → Run (después de 0005).
-- Se puede volver a correr las veces que haga falta:
--   · crea los artículos que falten y refresca sus textos;
--   · pone precio SOLO a lo que nunca ha tenido uno: no pisa un precio
--     ya cargado ni se lo devuelve a algo que se dejó "a consultar";
--   · no borra nada.
--
-- 27 artículos · 30 presentaciones · 23 con precio
-- ============================================================

insert into public.products (id, name, category, description, unit, sort_order) values
  ('algodon-estampado', 'Algodón estampado', 'Algodón', 'Tela de algodón estampada: flores, tulipanes, abanicos y rayas en tonos azules, lilas, rosados y amarillos. Fresca y fácil de coser, para vestidos, blusas y manualidades.', 'yarda', 10),
  ('algodon-cuadros-rayas', 'Algodón de cuadros y rayas', 'Algodón', 'Tela de algodón en cuadros, rejillas y rayas —azul marino, negro, rojo y blanco— y diseños náuticos con anclas. Para camisas, vestidos, blusas y manualidades.', 'yarda', 20),
  ('algodon-floral', 'Algodón floral', 'Algodón', 'Tela de algodón con flores grandes —rosas y peonías— sobre fondos amarillo, rojo, azul marino y rosado. Para vestidos, faldas, blusas y decoración.', 'yarda', 30),
  ('satin', 'Satín', 'Tela de vestidos', 'Satín liso de brillo intenso y tacto sedoso, en gran variedad de colores. Para vestidos de fiesta, forros, lazos, manteles y decoración de eventos.', 'yarda', 40),
  ('crepe-satinado', 'Crepe satinado', 'Tela de vestidos', 'Crepe de acabado satinado, con brillo suave y muy buena caída. En colores como rojo, vino, blanco y champán. Para vestidos de fiesta, blusas y faldas.', 'yarda', 50),
  ('poplin', 'Poplin', 'Tela de vestidos', 'Poplin liso, fresco y de tacto suave, en colores vivos y pasteles: morado, verde, amarillo claro, azul, lila y fucsia. Para vestidos, blusas, camisas y forros.', 'yarda', 60),
  ('scall', 'Scall', 'Tela de vestidos', 'Tela lisa para vestidos, de tejido fino y cuerpo ligero. En colores como amarillo, rojo, azul marino, azul rey, vino, naranja y crema.', 'yarda', 70),
  ('sutin', 'Sutin', 'Tela de vestidos', 'Tela lisa para vestidos, de acabado mate y tacto suave. En colores como lila, blanco, rojo, amarillo, verde, azul rey, menta y azul marino.', 'yarda', 80),
  ('tela-de-cuadritos', 'Tela de cuadritos', 'Tela de vestidos', 'Tela de cuadritos tipo vichy en muchos colores: naranja, rojo, azul, verde, amarillo, rosado, morado y más. Un clásico para vestidos, blusas, delantales y manteles.', 'yarda', 90),
  ('chifon', 'Chifón', 'Chifón', 'Chifón liso, liviano y semitransparente, de caída vaporosa. En colores como crema, verde limón, coral, azul, fucsia y rosado. Para vestidos, blusas, pañuelos y sobrefaldas.', 'yarda', 100),
  ('chifon-estampado-lentejuelas', 'Chifón estampado con lentejuelas', 'Chifón', 'Chifón liviano con estampados florales y pequeñas lentejuelas que le dan brillo. Varios diseños y colores, para vestidos, blusas y prendas de fiesta.', 'yarda', 110),
  ('organza', 'Organza', 'Organza', 'Organza de brillo tornasolado y cuerpo firme, en colores como naranja, rojo, azul, gris y cobre. Viene en dos anchos: 60″ y 120″. Para vestidos de fiesta, sobrefaldas, lazos y decoración de eventos.', 'yarda', 120),
  ('tull', 'Tull', 'Tull', 'Tull liviano en colores vivos y neón, y también con brillo escarchado. Para tutús, velos, vestidos de fiesta, lazos y decoración.', 'yarda', 130),
  ('encaje', 'Encaje', 'Encaje', 'Tela de encaje con diseño floral, en colores como turquesa, verde, naranja, fucsia, beige y azul. La hay normal y stretch (elástica). Para vestidos, blusas, sobrefaldas y detalles de costura.', 'yarda', 140),
  ('tela-para-toalla', 'Tela para toalla', 'Tela para toalla', 'Tela de toalla suave y absorbente, en blanco, rosado y rojo. Para toallas, batas, baberos y artículos de bebé.', 'yarda', 150),
  ('tela-para-sueter', 'Tela para suéter', 'Tela para suéter', 'Tela de punto para confeccionar suéteres y camisetas. En colores como verde, turquesa, mostaza, azul marino y coral.', 'yarda', 160),
  ('tela-tapiz', 'Tela tapiz', 'Tela tapiz', 'Tela de tapicería gruesa y resistente, con diseños geométricos en varios colores. Para tapizar muebles, cojines, cortinas y proyectos de decoración.', 'yarda', 170),
  ('telas-navidenas', 'Telas navideñas', 'Telas navideñas', 'Telas con estampados de Navidad: Santa Claus, flores de pascua, bastones de caramelo y más motivos festivos. Para manteles, caminos de mesa, cojines, botas y decoración de temporada.', 'yarda', 180),
  ('tela-navidena-nacimiento', 'Tela navideña del Nacimiento', 'Telas navideñas', 'Tela navideña azul con escenas del Nacimiento. Para manteles, caminos de mesa, cojines y decoración de temporada.', 'yarda', 190),
  ('lanilla', 'Lanilla', 'Tela para sabanillas', 'Lanilla suave y abrigada con estampados infantiles: animalitos, ballenas, lunares y más. Para sabanillas, pijamas y ropa de bebé.', 'yarda', 200),
  ('frazadas', 'Frazadas', 'Tela para sabanillas', 'Tela para frazadas, suave y abrigada, con estampados infantiles y de personajes. Para frazadas, mantas y cobijas de bebé.', 'yarda', 210),
  ('panos-colcha-bebe', 'Paños para colcha de bebés', 'Tela para sabanillas', 'Paños estampados para armar colchas de bebé, con ositos y motivos infantiles en tonos pastel. También hay tela acolchada en rollo.', 'yarda', 220),
  ('hilos-de-tejer', 'Hilos de tejer', 'Hilos', 'Hilos y estambres para tejer a crochet o a dos agujas, en decenas de colores: acrílicos, de algodón, matizados y para amigurumi. También agujas de crochet y de tejer.', 'unidad', 230),
  ('encajes-y-puntillas', 'Encajes y puntillas', 'Sedería', 'Encajes y puntillas blancas en tira, en distintos anchos y diseños. Para ribetear vestidos, blusas, manteles, cortinas y ropa de bebé.', 'yarda', 240),
  ('colorante-mariposa', 'Colorante para ropa Mariposa', 'Sedería', 'Colorante para ropa marca Mariposa, en cristales de color. Caja de 32 g. Colores: azul claro, azul marino, castaño oscuro y rojo escarlata, entre otros.', 'unidad', 250),
  ('bolsas-de-regalo', 'Bolsas de regalo de papel', 'Sedería', 'Bolsas de papel con asas para regalo, en varios tamaños y colores: kraft, blanco, negro, naranja, verde y más. Se venden por unidad o por docena.', 'unidad', 260),
  ('papel-en-rollo', 'Papel en rollo de colores', 'Sedería', 'Papel en rollo de colores lisos para envolver regalos, manualidades y decoración: negro, verde, azul, amarillo, gris, blanco, rojo, rosado y kraft.', 'unidad', 270)
on conflict (id) do update set
  name        = excluded.name,
  category    = excluded.category,
  description = excluded.description,
  sort_order  = excluded.sort_order;
  -- `unit` y `active` no se tocan si el artículo ya existe: esos los decide la base.

insert into public.product_variants as v (id, product_id, label, price, note, sort_order) values
  ('algodon-estampado', 'algodon-estampado', null, 4.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162293.webp)', 10),
  ('algodon-cuadros-rayas', 'algodon-cuadros-rayas', null, 6.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162299.webp)', 10),
  ('algodon-floral', 'algodon-floral', null, null, null, 10),
  ('satin', 'satin', null, 2.25, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162287.webp)', 10),
  ('crepe-satinado', 'crepe-satinado', null, 6.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162297.webp)', 10),
  ('poplin', 'poplin', null, null, null, 10),
  ('scall-a', 'scall', null, 5.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162269.webp)', 10),
  ('scall-b', 'scall', null, 6.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162269.webp)', 20),
  ('sutin', 'sutin', null, 2.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162283.webp)', 10),
  ('tela-de-cuadritos', 'tela-de-cuadritos', null, null, null, 10),
  ('chifon', 'chifon', null, 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162305.webp)', 10),
  ('chifon-estampado-lentejuelas', 'chifon-estampado-lentejuelas', null, 4.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162310.webp)', 10),
  ('organza-60', 'organza', '60″ de ancho', 2.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162285.webp)', 10),
  ('organza-120', 'organza', '120″ de ancho', 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162285.webp)', 20),
  ('tull', 'tull', null, 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162271.webp)', 10),
  ('encaje-normal', 'encaje', 'Normal', 2.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162295.webp)', 10),
  ('encaje-stretch', 'encaje', 'Stretch', 6.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162295.webp)', 20),
  ('tela-para-toalla', 'tela-para-toalla', null, 18.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162291.webp)', 10),
  ('tela-para-sueter', 'tela-para-sueter', null, 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162301.webp)', 10),
  ('tela-tapiz', 'tela-tapiz', null, 5.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162275.webp)', 10),
  ('telas-navidenas', 'telas-navidenas', null, 4.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162303.webp)', 10),
  ('tela-navidena-nacimiento', 'tela-navidena-nacimiento', null, 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162303.webp)', 10),
  ('lanilla', 'lanilla', null, 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162277.webp)', 10),
  ('frazadas', 'frazadas', null, 3.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162281.webp)', 10),
  ('panos-colcha-bebe', 'panos-colcha-bebe', null, 5.95, 'Lista de precios del CM, oct-2026 (Fotos_con_Precios/1000162289.webp)', 10),
  ('hilos-de-tejer', 'hilos-de-tejer', null, null, null, 10),
  ('encajes-y-puntillas', 'encajes-y-puntillas', null, null, null, 10),
  ('colorante-mariposa', 'colorante-mariposa', null, 2.50, 'Etiqueta de precio en cada caja de la foto (3-sep-2026). Pendiente de confirmar con la tienda.', 10),
  ('bolsas-de-regalo', 'bolsas-de-regalo', null, null, null, 10),
  ('papel-en-rollo', 'papel-en-rollo', null, null, null, 10)
on conflict (id) do update set
  sort_order = excluded.sort_order,
  label      = coalesce(v.label, excluded.label),
  -- El precio entra solo si esta presentación NUNCA ha tenido uno (sin
  -- precio hoy y sin filas en el historial). Un precio que alguien quitó
  -- desde el panel es una decisión de la tienda y aquí no se revierte.
  price      = case when v.price is null
                     and not exists (select 1 from public.price_history h where h.variant_id = v.id)
                    then excluded.price else v.price end,
  -- La nota dice de dónde salió el precio: entra solo junto con él.
  note       = case when v.price is null
                     and not exists (select 1 from public.price_history h where h.variant_id = v.id)
                    then excluded.note else v.note end;
