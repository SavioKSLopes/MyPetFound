export function montarTextoCompartilhamento(animal, url) {
  const linhas = [
    `Ajude a encontrar ${animal.nome}.`,
    `Espécie: ${animal.especie_nome || animal.especie || "Não informada"}.`,
  ];
  const caracteristicas = [animal.raca, animal.cor, animal.porte_nome || animal.porte]
    .filter(Boolean);
  if (caracteristicas.length) linhas.push(`Características: ${caracteristicas.join(", ")}.`);
  if (animal.localidade) linhas.push(`Desaparecimento em: ${animal.localidade}.`);
  linhas.push(`Anúncio: ${url}`);
  return linhas.join("\n");
}

export function obterUrlPublicaAnuncio(animalId, origem = import.meta.env?.VITE_PUBLIC_URL || window.location.origin) {
  return new URL(`/animais/${animalId}`, origem).href;
}
