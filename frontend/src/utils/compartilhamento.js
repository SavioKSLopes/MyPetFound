export function montarTextoCompartilhamento(animal, url) {
  const linhas = [
    `Ajude a encontrar ${animal.nome}.`,
    "Este animal está perdido.",
    `Espécie: ${animal.especie_nome || animal.especie || "Não informada"}.`,
  ];
  const porte = animal.porte_nome || animal.porte;
  if (porte) linhas.push(`Porte: ${porte}.`);
  const caracteristicas = [animal.raca, animal.cor]
    .filter(Boolean);
  if (caracteristicas.length) linhas.push(`Características: ${caracteristicas.join(", ")}.`);
  if (animal.localidade) linhas.push(`Desaparecimento em: ${animal.localidade}.`);
  linhas.push(`Anúncio: ${url}`);
  return linhas.join("\n");
}

export function montarUrlPublicaAnuncio(animal, origem) {
  const id = typeof animal === "object" ? animal?.id : animal;
  const origemPublica = origem || import.meta.env?.VITE_PUBLIC_URL || window.location.origin;
  return new URL(`/animais/${id}`, origemPublica).href;
}

export function obterUrlPublicaAnuncio(animalId, origem = import.meta.env?.VITE_PUBLIC_URL || window.location.origin) {
  return montarUrlPublicaAnuncio(animalId, origem);
}

export function montarUrlWhatsApp(texto) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export function montarUrlFacebook(urlPublica) {
  if (!ehUrlPublicaDeAnuncio(urlPublica)) {
    throw new TypeError("A URL de compartilhamento deve ser a URL pública de um anúncio.");
  }
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(urlPublica)}`;
}

export function ehUrlPublicaDeAnuncio(urlPublica) {
  if (typeof urlPublica !== "string" || !urlPublica.trim()) return false;

  try {
    const url = new URL(urlPublica);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return false;
    if (!/^\/animais\/\d+\/?$/.test(url.pathname)) return false;

    const parametroPrivado = [...url.searchParams.keys()].some((chave) =>
      /token|auth|qr|code|signature|signed|private/i.test(chave),
    );
    return !parametroPrivado && !/(token|auth|qr|code|signature|signed)/i.test(url.hash);
  } catch {
    return false;
  }
}

export function montarUrlX(texto, urlPublica) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(urlPublica)}`;
}

export async function copiarTexto(texto) {
  if (globalThis.isSecureContext && globalThis.navigator?.clipboard?.writeText) {
    try {
      await globalThis.navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Usa a alternativa abaixo quando o navegador recusa a Clipboard API.
    }
  }

  const documento = globalThis.document;
  if (!documento?.body || typeof documento.execCommand !== "function") return false;

  const campo = documento.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("readonly", "");
  campo.style.position = "fixed";
  campo.style.opacity = "0";
  documento.body.appendChild(campo);
  campo.select();

  try {
    return documento.execCommand("copy");
  } catch {
    return false;
  } finally {
    campo.remove();
  }
}
