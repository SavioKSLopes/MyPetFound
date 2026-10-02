export function ordenarEventosHistorico(eventos = []) {
  return [...eventos].sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
}
