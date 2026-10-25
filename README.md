# calculadora-nomina-mx

Calculadora completa de nómina mexicana. Calcula salario neto a partir del salario bruto aplicando IMSS, INFONAVIT, ISR y subsidio al empleo según las tablas oficiales de 2026.

[![npm version](https://badge.fury.io/js/calculadora-nomina-mx.svg)](https://www.npmjs.com/package/calculadora-nomina-mx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/GerardoLucero/calculadora-nomina-mx/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/GerardoLucero/calculadora-nomina-mx/actions/workflows/ci-cd.yml)

## Features

- **Nómina completa** — de salario bruto a neto en una llamada (`calcularNominaCompleta`)
- **IMSS 2026** — cuotas obrero-patronales con UMA 2026, cuota fija de una UMA y cesantía patronal por rango
- **ISR y subsidio al empleo 2026** — tarifa mensual del Anexo 8 de la RMF 2026 y subsidio del decreto del DOF 31-12-2025
- **INFONAVIT** — descuento por veces salario mínimo o porcentaje, con tope del 20 %
- **Finiquito** — salarios pendientes, vacaciones, prima vacacional, aguinaldo proporcional e indemnización opcional

> Los datos corresponden al ejercicio **2026**. Es una ayuda de cálculo con supuestos simplificados (por ejemplo, factor de integración fijo de 1.0452); no sustituye a un contador.

## Instalación

```bash
npm install calculadora-nomina-mx
```

## Uso

### Nómina de un trabajador

```javascript
import { calcularNominaCompleta } from 'calculadora-nomina-mx';

const nomina = calcularNominaCompleta({
  nombre: 'Juan',
  salarioDiario: 600,
  diasTrabajados: 30,
  claseRiesgo: 'I'
});

// nomina.percepciones.totalPerceciones  -> 18000
// nomina.deducciones.imss.cuotaObrera   -> 479.85
// nomina.deducciones.isr.impuesto       -> 1956.45
// nomina.resultado.sueldoNeto           -> 15563.70
// nomina.costoPatronal.cuotasIMSS       -> 3547.36
```

### Piezas por separado

```javascript
import { calcularIMSS, calcularISRNomina, calcularDescuentoInfonavit, calcularFiniquito } from 'calculadora-nomina-mx';

calcularIMSS(18000);                  // { totales: { patronal, obrera, total }, ... }
calcularISRNomina(10000);             // ISR 2026 menos subsidio de 535.65
calcularISRNomina(5000, { mes: 1 });  // enero usa el subsidio transitorio de 536.21
calcularDescuentoInfonavit(18000, 2); // factor 2 veces salario mínimo, con tope del 20 %

calcularFiniquito(
  { salarioDiario: 600, fechaIngreso: '2024-03-01', fechaSalida: '2026-06-15', diasVacacionesPendientes: 6 },
  { pagarIndemnizacion: false }
);
```

## API

| Función | Descripción |
|---|---|
| `calcularNominaCompleta(empleado, opciones)` | Percepciones, deducciones, neto y costo patronal |
| `calcularIMSS(salarioIntegradoMensual, claseRiesgo, { zonaFronteriza, dias })` | Cuotas IMSS obrera y patronal del periodo |
| `calcularISRNomina(ingresoGravable, { mes })` | ISR con tarifa y subsidio 2026 |
| `calcularDescuentoInfonavit(salarioIntegrado, factor, tipoCredito)` | Descuento de crédito INFONAVIT |
| `calcularFiniquito(empleado, parametros)` | Finiquito e indemnización opcional |
| `obtenerConstantesFiscales()` | UMA, salario mínimo, tarifas y subsidio del año |

## Valores de referencia 2026

- **UMA diaria**: $117.31 (vigente desde el 1 de febrero de 2026; enero usa la UMA 2025)
- **Salario mínimo**: $315.04 diario (zona libre de la frontera norte: $440.87)
- **Subsidio para el empleo**: hasta $11,492.66 de ingreso mensual; $535.65 de febrero a diciembre y $536.21 en enero
- **Tarifa ISR mensual**: ver la librería [calculadora-isr](https://github.com/GerardoLucero/calculadora-isr)
- **INFONAVIT**: 5 % patronal sobre salario integrado

## Limitaciones conocidas

- La prima de antigüedad del finiquito se calcula con 12 días de salario sin multiplicar por años de servicio ni aplicar el tope de dos salarios mínimos.
- El salario integrado usa un factor fijo de 1.0452.

## Testing

```bash
npm test
npm run test:coverage
```

## Apoyo

Proyecto de código abierto mantenido en mi tiempo libre. Si te fue útil y quieres agradecerlo:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/gerardolucero)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/lucerorios0)

## Licencia

MIT © [Gerardo Lucero](https://github.com/GerardoLucero), ver [LICENSE](LICENSE).

---

- [calculadora-imss](https://www.npmjs.com/package/calculadora-imss) — Solo cuotas IMSS
- [calculadora-isr](https://www.npmjs.com/package/calculadora-isr) — Solo cálculo de ISR
- [calcula-rfc](https://www.npmjs.com/package/calcula-rfc) — Cálculo de RFC
