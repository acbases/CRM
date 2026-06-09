/**
 * fetch() avec timeout automatique.
 * Lance une AbortError si le serveur ne répond pas dans le délai imparti.
 *
 * @param url      URL à appeler
 * @param options  Options fetch standard (method, headers, body, ...)
 * @param timeout  Délai max en ms (défaut : 15 000 ms)
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 15_000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(
        'Le serveur ne répond pas. Vérifiez votre connexion ou réessayez.'
      );
    }
    // Erreur réseau classique
    if (
      err.message === 'Network request failed' ||
      err.message?.toLowerCase().includes('fetch') ||
      err.message?.toLowerCase().includes('network')
    ) {
      throw new Error(
        'Impossible de se connecter au serveur. Vérifiez votre connexion internet.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
