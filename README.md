# calculadora-nomina-mx

<!-- BADGES-DONATIONS-START -->
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate-orange?logo=ko-fi)](https://ko-fi.com/gerardolucero)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/lucerorios0)
<!-- BADGES-DONATIONS-END -->


[![npm version](https://badge.fury.io/js/calculadora-nomina-mx.svg)](https://badge.fury.io/js/calculadora-nomina-mx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Calculadora completa de nómina mexicana con IMSS, ISR, Infonavit y cálculo de finiquito.

## Instalación

```bash
npm install calculadora-nomina-mx
```

## Uso

```javascript
import { calcularNomina, calcularFiniquito } from 'calculadora-nomina-mx';

// Calcular nómina completa
const nomina = calcularNomina({
  salarioBase: 15000,
  diasTrabajados: 30,
  antiguedad: 2 // años
});

console.log(nomina);
// {
//   salarioBruto: 15000,
//   imss: 562.50,
//   isr: 1174.47,
//   infonavit: 750,
//   salarioNeto: 12513.03
// }
```

## API

### `calcularNomina(opciones)`
Calcula nómina completa con todas las deducciones.

### `calcularIMSS(salario, tipo)`
Calcula cuotas IMSS (obrero/patronal).

### `calcularFiniquito(salario, antiguedad, causa)`
Calcula finiquito según causa de separación.

## Características

- ✅ Cálculo IMSS (cuotas obrero/patronal)
- ✅ ISR con tarifas actualizadas
- ✅ Descuento Infonavit 5%
- ✅ Cálculo de finiquito
- ✅ Aguinaldo y vacaciones proporcionales
- ✅ Prima vacacional

## Licencia

MIT © Gerardo Lucero

<!-- DONATIONS-START -->
## 💖 Apoya el Ecosistema Mexicano OSS

Si estos paquetes te ayudan (RFC, ISR, Nómina, Bancos, Feriados, Nombres, Códigos Postales, Validadores), considera invitarme un café o apoyar el mantenimiento:

- [Ko-fi](https://ko-fi.com/gerardolucero)
- [Buy Me a Coffee](https://buymeacoffee.com/lucerorios0)

> Gracias por tu apoyo 🙌. Priorizaré issues/PRs con **contexto de uso en México** (SAT/IMSS/INFONAVIT, bancos, feriados) y publicaré avances en los READMEs.
<!-- DONATIONS-END -->
