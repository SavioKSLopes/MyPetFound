export function formatarData(data, opcoes = { day: "2-digit", month: "2-digit", year: "numeric" }) {
  if (!data) {
    return "Data não informada";
  }

  return new Date(data).toLocaleDateString("pt-BR", opcoes);
}

export function formatarDataHora(data, opcoes = { dateStyle: "short", timeStyle: "short" }) {
  return new Date(data).toLocaleString("pt-BR", opcoes);
}
