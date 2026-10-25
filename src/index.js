/**
 * Calculadora completa de nómina mexicana 2026
 * Incluye IMSS, ISR, Infonavit y las deducciones más comunes.
 * Datos: Anexo 8 RMF 2026 (DOF 28-12-2025), decreto del subsidio para el empleo (DOF 31-12-2025),
 * UMA 2026 (INEGI) y salarios mínimos 2026 (CONASAMI).
 */

// UMA 2026 (vigente del 1 de febrero de 2026 al 31 de enero de 2027; enero usa la UMA 2025)
const UMA_2026 = { diaria: 117.31, mensual: 3566.22, anual: 42794.64 };
const SALARIO_MINIMO_2026 = { general: 315.04, fronterizo: 440.87 };

// Cuotas IMSS por ramo (LSS arts. 25, 106, 107, 147, 168). Porcentajes sobre el SBC salvo la cuota fija.
const TARIFAS_IMSS = {
  enfermedadMaternidad: {
    cuotaFijaPatronal: 0.204,                        // 20.40% de UNA UMA diaria por trabajador
    excedente: { patronal: 0.011, obrera: 0.004 },   // sobre el excedente de 3 UMA
    dinero: { patronal: 0.007, obrera: 0.0025 },
    pensionados: { patronal: 0.0105, obrera: 0.00375 }
  },
  invalidezVida: { patronal: 0.0175, obrera: 0.00625 },
  retiro: 0.02,
  obreraRCV: 0.01125,
  guarderias: 0.01,
  // Prima media de riesgo de trabajo por clase
  riesgo: { I: 0.0054355, II: 0.0113065, III: 0.025984, IV: 0.0465325, V: 0.0758875 },
  infonavit: 0.05
};

// Cuota patronal de cesantía y vejez 2026 por rango (hastaUMA = tope en veces la UMA diaria)
const CESANTIA_PATRONAL_2026 = [
  { hastaUMA: 1.5, tasa: 0.03676 }, { hastaUMA: 2.0, tasa: 0.04851 }, { hastaUMA: 2.5, tasa: 0.05556 },
  { hastaUMA: 3.0, tasa: 0.06026 }, { hastaUMA: 3.5, tasa: 0.06361 }, { hastaUMA: 4.0, tasa: 0.06613 },
  { hastaUMA: Infinity, tasa: 0.07513 }
];

// Tarifa mensual ISR 2026 (Anexo 8 RMF 2026, apartado B, fracción V; art. 96 LISR)
const TARIFAS_ISR = [
  { min: 0.01,      max: 844.59,    cuota: 0,         tasa: 1.92  },
  { min: 844.60,    max: 7168.51,   cuota: 16.22,     tasa: 6.40  },
  { min: 7168.52,   max: 12598.02,  cuota: 420.95,    tasa: 10.88 },
  { min: 12598.03,  max: 14644.64,  cuota: 1011.68,   tasa: 16.00 },
  { min: 14644.65,  max: 17533.64,  cuota: 1339.14,   tasa: 17.92 },
  { min: 17533.65,  max: 35362.83,  cuota: 1856.84,   tasa: 21.36 },
  { min: 35362.84,  max: 55736.68,  cuota: 5665.16,   tasa: 23.52 },
  { min: 55736.69,  max: 106410.50, cuota: 10457.09,  tasa: 30.00 },
  { min: 106410.51, max: 141880.66, cuota: 25659.23,  tasa: 32.00 },
  { min: 141880.67, max: 425641.99, cuota: 37009.69,  tasa: 34.00 },
  { min: 425642.00, max: Infinity,  cuota: 133488.54, tasa: 35.00 }
];

// Subsidio para el empleo 2026 (decreto DOF 31-12-2025): hasta 11,492.66 de ingreso mensual;
// 535.65 de febrero a diciembre (15.02% de la UMA mensual) y 536.21 en enero.
const SUBSIDIO_EMPLEO = { limiteIngresoMensual: 11492.66, mensual: 535.65, enero: 536.21 };

/**
 * Tasa patronal de cesantía y vejez según el SBC diario (1.00 SM = 3.150%).
 */
function tasaCesantiaPatronal(sbcDiario, salarioMinimo) {
  if (sbcDiario <= salarioMinimo) return 0.0315;
  return CESANTIA_PATRONAL_2026.find(r => sbcDiario / UMA_2026.diaria <= r.hastaUMA).tasa;
}

/**
 * Calcula las cuotas IMSS mensuales (30 días) a partir del salario integrado MENSUAL.
 * Misma lógica que calculadora-imss 2.x: la cuota fija es de una UMA y la cesantía patronal depende del rango.
 */
export function calcularIMSS(salarioIntegrado, claseRiesgo = 'I', opciones = {}) {
  if (!salarioIntegrado || salarioIntegrado <= 0) {
    throw new Error('El salario integrado debe ser mayor a cero');
  }
  const { zonaFronteriza = false, dias = 30 } = opciones;
  const salarioMinimo = zonaFronteriza ? SALARIO_MINIMO_2026.fronterizo : SALARIO_MINIMO_2026.general;
  const prima = TARIFAS_IMSS.riesgo[claseRiesgo] ?? TARIFAS_IMSS.riesgo.I;

  const sbc = Math.min(Math.max(salarioIntegrado / dias, salarioMinimo), UMA_2026.diaria * 25);
  const excedente = Math.max(0, sbc - UMA_2026.diaria * 3);
  const t = TARIFAS_IMSS;

  const patronalDiario =
    UMA_2026.diaria * t.enfermedadMaternidad.cuotaFijaPatronal +
    excedente * t.enfermedadMaternidad.excedente.patronal +
    sbc * (t.enfermedadMaternidad.dinero.patronal + t.enfermedadMaternidad.pensionados.patronal) +
    sbc * (t.invalidezVida.patronal + t.retiro + t.guarderias + prima + tasaCesantiaPatronal(sbc, salarioMinimo));
  const obreraDiario =
    excedente * t.enfermedadMaternidad.excedente.obrera +
    sbc * (t.enfermedadMaternidad.dinero.obrera + t.enfermedadMaternidad.pensionados.obrera) +
    sbc * (t.invalidezVida.obrera + t.obreraRCV);

  const cuotaPatronal = patronalDiario * dias;
  const cuotaObrera = obreraDiario * dias;

  return {
    salarioIntegrado: parseFloat(salarioIntegrado.toFixed(2)),
    baseCotizacion: parseFloat((sbc * dias).toFixed(2)),
    excedente: parseFloat((excedente * dias).toFixed(2)),
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
export function calcularISRNomina(ingresoGravable, opciones = {}) {
  const { mes = null } = opciones;
  if (ingresoGravable < 0) {
    throw new Error('El ingreso gravable debe ser mayor o igual a cero');
  }

  if (ingresoGravable === 0) {
    return { ingresoGravable: 0, isrAntesSubsidio: 0, subsidio: 0, isrFinal: 0, tarifa: null };
  }

  // El ultimo renglon cuyo limite inferior no excede el ingreso (evita huecos de centavos)
  const tarifa = [...TARIFAS_ISR].reverse().find(t => ingresoGravable >= t.min);
  if (!tarifa) throw new Error('No se encontró tarifa aplicable');

  const excedente = ingresoGravable - tarifa.min;
  const impuestoMarginal = excedente * (tarifa.tasa / 100);
  const isrAntesSubsidio = tarifa.cuota + impuestoMarginal;

  const subsidio = ingresoGravable <= SUBSIDIO_EMPLEO.limiteIngresoMensual
    ? (mes === 1 ? SUBSIDIO_EMPLEO.enero : SUBSIDIO_EMPLEO.mensual)
    : 0;
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

  // Días trabajados en el año actual (para aguinaldo proporcional)
  const añoSalida = salida.getFullYear();
  const inicioAño = new Date(añoSalida, 0, 1);
  const diasEnAño = Math.ceil((salida - inicioAño) / (1000 * 60 * 60 * 24));

  // Días pendientes de pago en el período actual (período incompleto)
  const diasPendientes = diasTrabajados % 30;

  const conceptos = {
    salariosPendientes: diasPendientes * salarioDiario,                          // LFT Art. 88
    vacacionesPendientes: diasVacacionesPendientes * salarioDiario,
    primaVacacional: (diasVacacionesPendientes * salarioDiario) * 0.25,
    aguinaldoProporcional: (diasEnAño / 365) * 15 * salarioDiario,              // LFT Art. 87
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
    año: 2026,
    uma: UMA_2026,
    salarioMinimo: SALARIO_MINIMO_2026,
    tarifasIMSS: TARIFAS_IMSS,
    cesantiaPatronal: CESANTIA_PATRONAL_2026,
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
