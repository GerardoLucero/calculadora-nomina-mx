# calculadora-nomina-mx

Calculadora completa de nómina mexicana. Calcula salario neto a partir del salario bruto aplicando IMSS, INFONAVIT, ISR y subsidio al empleo según las tablas oficiales 2024.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/gerardolucero)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/lucerorios0)
[![GitHub Stars](https://img.shields.io/github/stars/GerardoLucero/calculadora-nomina-mx?style=social)](https://github.com/GerardoLucero/calculadora-nomina-mx)
[![npm version](https://badge.fury.io/js/calculadora-nomina-mx.svg)](https://www.npmjs.com/package/calculadora-nomina-mx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Nómina completa** — de salario bruto a neto en una llamada
- **IMSS 2024** — cuotas obreras con tarifas y UMA actualizadas
- **INFONAVIT** — 5% sobre salario integrado
- **ISR y subsidio al empleo** — tablas SAT 2024 aplicadas automáticamente
- **Periodicidad flexible** — semanal, quincenal, mensual
- **Múltiples trabajadores** — procesa listas para dispersión de nómina
- **TypeScript ready** — definiciones de tipos incluidas

## Instalación

```bash
npm install calculadora-nomina-mx
```

## Uso

### Calcular nómina individual

```javascript
import { calcularNomina } from 'calculadora-nomina-mx';

const nomina = calcularNomina({
  salarioDiario: 500,
  diasPeriodo: 15,  // Quincena
  claseRiesgoIMSS: 1
});

console.log(nomina);
// {
//   salarioBruto: 7500,
//   percepciones: {
//     salarioOrdinario: 7500
//   },
//   deducciones: {
//     imssObrero: 254.93,
//     isrRetenido: 412.50,
//     infonavit: 375.00,
//     total: 1042.43
//   },
//   subsidioEmpleo: 0,
//   salarioNeto: 6457.57,
//   costoPatronal: {
//     imssPatronal: 2487.15,
//     infonavitPatronal: 375.00,
//     total: 2862.15
//   },
//   costoTotal: 10362.15
// }
```

### Nómina semanal

```javascript
import { calcularNomina } from 'calculadora-nomina-mx';

const nominaSemanal = calcularNomina({
  salarioDiario: 248.93, // Salario mínimo 2024
  diasPeriodo: 7,
  claseRiesgoIMSS: 1
});
```

### Procesar múltiples empleados

```javascript
import { calcularNominas } from 'calculadora-nomina-mx';

const empleados = [
  { nombre: 'Ana García', salarioDiario: 400, diasPeriodo: 15 },
  { nombre: 'Luis Pérez', salarioDiario: 600, diasPeriodo: 15 },
  { nombre: 'María López', salarioDiario: 800, diasPeriodo: 15 }
];

const nominas = calcularNominas(empleados);

nominas.forEach(n => {
  console.log(`${n.nombre}: bruto $${n.salarioBruto} → neto $${n.salarioNeto}`);
});
```

## API

| Función | Descripción |
|---------|-------------|
| `calcularNomina(opciones)` | Calcula nómina completa para un trabajador |
| `calcularNominas(empleados)` | Procesa nómina para múltiples trabajadores |
| `calcularDeduccionesObrero(salarioDiario, opciones)` | Solo deducciones del trabajador |
| `calcularCostosPatronal(salarioDiario, opciones)` | Solo costos para el patrón |
| `obtenerTablasVigentes()` | Retorna UMA, salario mínimo y tablas ISR vigentes |

**Opciones de `calcularNomina`:**

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `salarioDiario` | number | requerido | Salario diario integrado |
| `diasPeriodo` | number | 15 | Días del periodo (7, 15, 30) |
| `claseRiesgoIMSS` | number | 1 | Clase de riesgo IMSS (1-5) |
| `infonavit` | boolean | true | Incluir aportación INFONAVIT |

## Conceptos de nómina

### Deducciones del trabajador
- **IMSS obrero** — cuota de seguridad social (~2.27% del salario)
- **ISR** — retención según tablas SAT 2024
- **INFONAVIT obrero** — no aplica (es aportación patronal)

### Costo del patrón (por encima del salario)
- **IMSS patronal** — ~22% del salario integrado (clase riesgo I)
- **INFONAVIT** — 5% del salario integrado
- **ISR** — no aplica (el ISR es del trabajador)

## Valores de referencia 2024

- **UMA Diaria**: $108.57
- **Salario Mínimo**: $248.93 (diario)
- **INFONAVIT**: 5% sobre salario integrado

## Testing

```bash
npm test
npm run test:coverage
```

## Licencia

MIT © [Gerardo Lucero](https://github.com/GerardoLucero)

---

- [calculadora-imss](https://www.npmjs.com/package/calculadora-imss) — Solo cuotas IMSS
- [calculadora-isr](https://www.npmjs.com/package/calculadora-isr) — Solo cálculo de ISR
- [calcula-rfc](https://www.npmjs.com/package/calcula-rfc) — Cálculo de RFC
