// Fotos ilustrativas (Unsplash) usadas pelo site: decoração da Home e sugestões de capa
// no cadastro de quadra. As fotos das quadras em si vêm da API.
const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

export const fotosDecoracao = {
  heroPrincipal: unsplash("photo-1522778119026-d647f0596c20"),
  heroSecundaria: unsplash("photo-1592656094267-764a45160876"),
  ctaEmpresa: unsplash("photo-1504450758481-7338eba7524a"),
};

/** Sugestões de capa no formulário de quadra (a empresa também pode enviar a própria foto). */
export const fotosSugeridas = [
  "photo-1522778119026-d647f0596c20",
  "photo-1518604666860-9ed391f76460",
  "photo-1551958219-acbc608c6377",
  "photo-1574629810360-7efbbe195018",
  "photo-1546519638-68e109498ffc",
  "photo-1521412644187-c49fa049e84d",
  "photo-1612872087720-bb876e2e67d1",
  "photo-1592656094267-764a45160876",
].map(unsplash);
