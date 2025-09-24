/**
 * Calculadora completa de nómina mexicana 2024
 * Incluye IMSS, ISR, Infonavit, y todas las deducciones oficiales
 */

// Constantes 2024
const UMA_2024 = { diaria: 108.57, mensual: 3297.57, anual: 39570.84 };
const SALARIO_MINIMO_2024 = { general: 248.93, fronterizo: 374.89 };

// Tarifas IMSS simplificadas
const TARIFAS_IMSS = {
  enfermedadMaternidad: { patronal: 0.204, obrera: 0.0075 },
  invalidezVida: { patronal: 0.0175, obrera: 0.00625 },
  retiro: 0.02, cesantiaVejez: 0.03, obreraRCV: 0.01125,
  guarderias: 0.01, riesgoI: 0.0054, infonavit: 0.05
};

// Tarifas ISR 2024
const TARIFAS_ISR = [
  { min: 0.01, max: 746.04, cuota: 0, tasa: 1.92 },
  { min: 746.05, max: 6332.05, cuota: 14.32, tasa: 6.40 },
  { min: 6332.06, max: 11128.01, cuota: 371.83, tasa: 10.88 },
  { min: 11128.02, max: 12935.82, cuota: 893.63, tasa: 16.00 },
  { min: 12935.83, max: 15487.71, cuota: 1182.88, tasa: 21.36 },
  { min: 15487.72, max: 31236.49, cuota: 1727.83, tasa: 23.52 },
  { min: 31236.50, max: 49233.00, cuota: 5429.49, tasa: 30.00 },
  { min: 49233.01, max: 93993.90, cuota: 10828.32, tasa: 32.00 },
  { min: 93993.91, max: 125325.20, cuota: 25123.80, tasa: 34.00 },
  { min: 125325.21, max: Infinity, cuota: 35775.24, tasa: 35.00 }
];

const SUBSIDIO_EMPLEO = [
  { min: 0.01, max: 1768.96, subsidio: 407.02 },
  { min: 1768.97, max: 2653.38, subsidio: 406.83 },
  { min: 2653.39, max: 3472.84, subsidio: 406.62 },
  { min: 3472.85, max: 3537.87, subsidio: 392.77 },
  { min: 3537.88, max: 4446.15, subsidio: 382.46 },
  { min: 4446.16, max: 4717.18, subsidio: 354.23 },
  { min: 4717.19, max: 5335.42, subsidio: 324.87 },
  { min: 5335.43, max: 6224.67, subsidio: 294.63 },
  { min: 6224.68, max: 7113.90, subsidio: 253.54 },
  { min: 7113.91, max: 7382.33, subsidio: 217.61 },
  { min: 7382.34, max: Infinity, subsidio: 0 }
];

/**
 * Calcula las cuotas IMSS
 */
export function calcularIMSS(salarioIntegrado, claseRiesgo = 'I') {
  if (!salarioIntegrado || salarioIntegrado <= 0) {
    throw new Error('El salario integrado debe ser mayor a cero');
  }

  const limiteSuperior = UMA_2024.mensual * 25;
  const baseCotizacion = Math.min(salarioIntegrado, limiteSuperior);
  const excedente = Math.max(0, salarioIntegrado - (UMA_2024.mensual * 3));

  const cuotaPatronal = baseCotizacion * (TARIFAS_IMSS.enfermedadMaternidad.patronal + 
    TARIFAS_IMSS.invalidezVida.patronal + TARIFAS_IMSS.retiro + TARIFAS_IMSS.cesantiaVejez + 
    TARIFAS_IMSS.guarderias + TARIFAS_IMSS.riesgoI + TARIFAS_IMSS.infonavit);

  const cuotaObrera = baseCotizacion * (TARIFAS_IMSS.enfermedadMaternidad.obrera + 
    TARIFAS_IMSS.invalidezVida.obrera + TARIFAS_IMSS.obreraRCV);

  return {
    salarioIntegrado: parseFloat(salarioIntegrado.toFixed(2)),
    baseCotizacion: parseFloat(baseCotizacion.toFixed(2)),
    excedente: parseFloat(excedente.toFixed(2)),
    totales: {
      patronal: parseFloat(cuotaPatronal.toFixed(2)),
      obrera: parseFloat(cuotaObrera.toFixed(2)),
      total: parseFloat((cuotaPatronal + cuotaObrera).toFixed(2))
    }
  };
}

/**
 * Calcula ISR para nómina
 */
export function calcularISRNomina(ingresoGravable) {
  if (ingresoGravable < 0) {
    throw new Error('El ingreso gravable debe ser mayor o igual a cero');
  }

  const tarifa = TARIFAS_ISR.find(t => ingresoGravable >= t.min && ingresoGravable <= t.max);
  if (!tarifa) throw new Error('No se encontró tarifa aplicable');

  const excedente = ingresoGravable - tarifa.min + 0.01;
  const impuestoMarginal = excedente * (tarifa.tasa / 100);
  const isrAntesSubsidio = tarifa.cuota + impuestoMarginal;

  const tarifaSubsidio = SUBSIDIO_EMPLEO.find(s => ingresoGravable >= s.min && ingresoGravable <= s.max);
  const subsidio = tarifaSubsidio ? tarifaSubsidio.subsidio : 0;
  const isrFinal = Math.max(0, isrAntesSubsidio - subsidio);

  return {
    ingresoGravable: parseFloat(ingresoGravable.toFixed(2)),
    isrAntesSubsidio: parseFloat(isrAntesSubsidio.toFixed(2)),
    subsidio: parseFloat(subsidio.toFixed(2)),
    isrFinal: parseFloat(isrFinal.toFixed(2)),
    tarifa: { min: tarifa.min, max: tarifa.max, cuota: tarifa.cuota, tasa: tarifa.tasa }
  };
}

/**
 * Calcula descuento Infonavit
 */
export function calcularDescuentoInfonavit(salarioIntegrado, factorDescuento, tipoCredito = 'veces_salario_minimo') {
  if (!salarioIntegrado || salarioIntegrado <= 0) {
    throw new Error('El salario integrado debe ser mayor a cero');
  }
  if (!factorDescuento || factorDescuento <= 0) {
    throw new Error('El factor de descuento debe ser mayor a cero');
  }

  let descuento = 0;
  if (tipoCredito === 'veces_salario_minimo') {
    const factores = { 1: 0.05, 2: 0.10, 3: 0.15, 4: 0.20, 5: 0.25, 6: 0.30, 7: 0.35, 8: 0.40, 9: 0.45, 10: 0.50 };
    const porcentaje = factores[factorDescuento] || 0.05;
    descuento = salarioIntegrado * porcentaje;
  } else if (tipoCredito === 'porcentaje') {
    descuento = salarioIntegrado * (factorDescuento / 100);
  }

  const limiteMaximo = salarioIntegrado * 0.20;
  descuento = Math.min(descuento, limiteMaximo);

  return {
    salarioIntegrado: parseFloat(salarioIntegrado.toFixed(2)),
    factorDescuento,
    tipoCredito,
    descuento: parseFloat(descuento.toFixed(2)),
    porcentajeDescuento: parseFloat(((descuento / salarioIntegrado) * 100).toFixed(2)),
    limiteMaximo: parseFloat(limiteMaximo.toFixed(2))
  };
}

/**
 * Calcula nómina completa
 */
export function calcularNominaCompleta(empleado, opciones = {}) {
  const { nombre = 'Empleado', salarioDiario, diasTrabajados = 30, claseRiesgo = 'I',
    tieneInfonavit = false, factorInfonavit = 0, tipoCredito = 'veces_salario_minimo',
    prestaciones = {}, deducciones = {} } = empleado;

  if (!salarioDiario || salarioDiario <= 0) {
    throw new Error('El salario diario debe ser mayor a cero');
  }

  const salarioBase = salarioDiario * diasTrabajados;
  const salarioIntegrado = salarioBase * 1.0452;

  const prestacionesCalculadas = {
    aguinaldo: prestaciones.aguinaldo || 0,
    vacaciones: prestaciones.vacaciones || 0,
    primaVacacional: prestaciones.primaVacacional || 0,
    valesDespensa: prestaciones.valesDespensa || 0,
    otrasPerceciones: prestaciones.otras || 0
  };

  const totalPrestaciones = Object.values(prestacionesCalculadas).reduce((sum, val) => sum + val, 0);
  const ingresoGravable = salarioBase + totalPrestaciones;

  const imss = calcularIMSS(salarioIntegrado, claseRiesgo);
  const isr = calcularISRNomina(ingresoGravable);
  
  let infonavit = { descuento: 0 };
  if (tieneInfonavit && factorInfonavit > 0) {
    infonavit = calcularDescuentoInfonavit(salarioIntegrado, factorInfonavit, tipoCredito);
  }

  const otrasDeduccionesCalculadas = {
    prestamosPersonales: deducciones.prestamos || 0,
    pensionAlimenticia: deducciones.pension || 0,
    seguroVida: deducciones.seguroVida || 0,
    fondoAhorro: deducciones.fondoAhorro || 0,
    otras: deducciones.otras || 0
  };

  const totalOtrasDeducciones = Object.values(otrasDeduccionesCalculadas).reduce((sum, val) => sum + val, 0);
  const totalPerceciones = salarioBase + totalPrestaciones;
  const totalDeducciones = imss.totales.obrera + isr.isrFinal + infonavit.descuento + totalOtrasDeducciones;
  const sueldoNeto = totalPerceciones - totalDeducciones;

  return {
    empleado: { nombre, salarioDiario: parseFloat(salarioDiario.toFixed(2)), diasTrabajados, claseRiesgo },
    percepciones: {
      salarioBase: parseFloat(salarioBase.toFixed(2)),
      prestaciones: prestacionesCalculadas,
      totalPrestaciones: parseFloat(totalPrestaciones.toFixed(2)),
      totalPerceciones: parseFloat(totalPerceciones.toFixed(2))
    },
    deducciones: {
      imss: { cuotaObrera: imss.totales.obrera },
      isr: { impuesto: isr.isrFinal, subsidio: isr.subsidio },
      infonavit: { descuento: infonavit.descuento },
      otras: otrasDeduccionesCalculadas,
      totalOtrasDeducciones: parseFloat(totalOtrasDeducciones.toFixed(2)),
      totalDeducciones: parseFloat(totalDeducciones.toFixed(2))
    },
    resultado: {
      sueldoNeto: parseFloat(sueldoNeto.toFixed(2)),
      porcentajeDeduccion: parseFloat(((totalDeducciones / totalPerceciones) * 100).toFixed(2))
    },
    costoPatronal: {
      cuotasIMSS: imss.totales.patronal,
      total: parseFloat((imss.totales.patronal + totalPerceciones).toFixed(2))
    }
  };
}

/**
 * Calcula finiquito
 */
export function calcularFiniquito(empleado, parametros) {
  const { salarioDiario, fechaIngreso, fechaSalida, diasVacacionesPendientes = 0 } = empleado;
  const { pagarIndemnizacion = false, pagarPrimaAntiguedad = false } = parametros;

  if (!salarioDiario || !fechaIngreso || !fechaSalida) {
    throw new Error('Faltan datos requeridos para el cálculo');
  }

  const inicio = new Date(fechaIngreso);
  const salida = new Date(fechaSalida);
  const diasTrabajados = Math.ceil((salida - inicio) / (1000 * 60 * 60 * 24));

  const conceptos = {
    salariosPendientes: 0,
    vacacionesPendientes: diasVacacionesPendientes * salarioDiario,
    primaVacacional: (diasVacacionesPendientes * salarioDiario) * 0.25,
    aguinaldoProporcional: 0,
    indemnizacion: pagarIndemnizacion ? salarioDiario * 90 : 0,
    primaAntiguedad: pagarPrimaAntiguedad ? salarioDiario * 12 : 0
  };

  const total = Object.values(conceptos).reduce((sum, val) => sum + val, 0);

  return {
    empleado: {
      salarioDiario: parseFloat(salarioDiario.toFixed(2)),
      fechaIngreso: inicio.toISOString().split('T')[0],
      fechaSalida: salida.toISOString().split('T')[0],
      diasTrabajados
    },
    conceptos: Object.fromEntries(Object.entries(conceptos).map(([k, v]) => [k, parseFloat(v.toFixed(2))])),
    total: parseFloat(total.toFixed(2))
  };
}

/**
 * Obtiene constantes fiscales
 */
export function obtenerConstantesFiscales() {
  return {
    año: 2024,
    uma: UMA_2024,
    salarioMinimo: SALARIO_MINIMO_2024,
    tarifasIMSS: TARIFAS_IMSS,
    tarifasISR: TARIFAS_ISR,
    subsidioEmpleo: SUBSIDIO_EMPLEO
  };
}

export default {
  calcularIMSS,
  calcularISRNomina,
  calcularDescuentoInfonavit,
  calcularNominaCompleta,
  calcularFiniquito,
  obtenerConstantesFiscales
};
