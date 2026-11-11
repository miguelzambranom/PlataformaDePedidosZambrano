// Interceptor que mide cada petición (tarea en clase).
import { Request, Response, NextFunction } from "express";

const UMBRAL_LENTA_MS = Number(process.env.UMBRAL_LENTA_MS ?? 1000);

interface Estadistica {
  peticiones: number;
  totalMs: number;
  maxMs: number;
  lentas: number;
}

const porRuta = new Map<string, Estadistica>();

export function medirLatencia(req: Request, res: Response, next: NextFunction): void {
  const inicio = performance.now();
  res.on("finish", () => {
    // TODO 1: calcula la duración en ms
    const duracionMs = performance.now() - inicio;

    // TODO 2: busca la estadística de `${req.method} ${req.path}` (créala si no existe)
    const clave = `${req.method} ${req.path}`;
    const est = porRuta.get(clave) ?? { peticiones: 0, totalMs: 0, maxMs: 0, lentas: 0 };

    // TODO 3: actualiza peticiones, totalMs, maxMs y lentas (ms > UMBRAL_LENTA_MS)
    est.peticiones += 1;
    est.totalMs += duracionMs;
    if (duracionMs > est.maxMs) {
      est.maxMs = duracionMs;
    }
    if (duracionMs > UMBRAL_LENTA_MS) {
      est.lentas += 1;
    }
    porRuta.set(clave, est);
  });
  next(); // sin next(), la petición nunca llega a la ruta
}

export function resumenMetricas() {
  // TODO 4: devuelve { umbralLentaMs, rutas: [{ ruta, peticiones, promedioMs, maxMs, lentas }] }
  const rutas = [...porRuta.entries()].map(([ruta, e]) => ({
    ruta,
    peticiones: e.peticiones,
    promedioMs: e.peticiones > 0 ? e.totalMs / e.peticiones : 0,
    maxMs: e.maxMs,
    lentas: e.lentas
  }));

  return {
    umbralLentaMs: UMBRAL_LENTA_MS,
    rutas
  };
}