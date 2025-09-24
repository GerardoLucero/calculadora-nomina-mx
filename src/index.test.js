import lib from './index.js';

describe('calculadora-nomina-mx', () => {
  describe('calcularIMSS', () => {
    test('debe calcular cuotas IMSS correctamente', () => {
      const resultado = lib.calcularIMSS(15000);
      expect(resultado).toHaveProperty('salarioIntegrado', 15000);
      expect(resultado).toHaveProperty('baseCotizacion');
      expect(resultado).toHaveProperty('totales');
      expect(resultado.totales).toHaveProperty('patronal');
      expect(resultado.totales).toHaveProperty('obrera');
      expect(resultado.totales.patronal).toBeGreaterThan(0);
      expect(resultado.totales.obrera).toBeGreaterThan(0);
    });

    test('debe rechazar salarios inválidos', () => {
      expect(() => lib.calcularIMSS(0)).toThrow('El salario integrado debe ser mayor a cero');
      expect(() => lib.calcularIMSS(-1000)).toThrow('El salario integrado debe ser mayor a cero');
    });

    test('debe aplicar límite de 25 UMAs', () => {
      const salarioAlto = 100000;
      const resultado = lib.calcularIMSS(salarioAlto);
      expect(resultado.baseCotizacion).toBeLessThanOrEqual(3297.57 * 25);
    });
  });

  describe('calcularISRNomina', () => {
    test('debe calcular ISR para nómina', () => {
      const resultado = lib.calcularISRNomina(15000);
      expect(resultado).toHaveProperty('ingresoGravable', 15000);
      expect(resultado).toHaveProperty('isrFinal');
      expect(resultado).toHaveProperty('subsidio');
      expect(resultado).toHaveProperty('tarifa');
      expect(resultado.isrFinal).toBeGreaterThanOrEqual(0);
    });

    test('debe aplicar subsidio correctamente', () => {
      const resultado = lib.calcularISRNomina(5000);
      expect(resultado.subsidio).toBeGreaterThan(0);
      expect(resultado.isrFinal).toBeLessThan(resultado.isrAntesSubsidio);
    });

    test('debe rechazar ingresos negativos', () => {
      expect(() => lib.calcularISRNomina(-1000)).toThrow('El ingreso gravable debe ser mayor o igual a cero');
    });
  });

  describe('calcularDescuentoInfonavit', () => {
    test('debe calcular descuento por veces salario mínimo', () => {
      const resultado = lib.calcularDescuentoInfonavit(20000, 5, 'veces_salario_minimo');
      expect(resultado).toHaveProperty('salarioIntegrado', 20000);
      expect(resultado).toHaveProperty('descuento');
      expect(resultado).toHaveProperty('porcentajeDescuento');
      expect(resultado.descuento).toBeGreaterThan(0);
      expect(resultado.descuento).toBeLessThanOrEqual(resultado.limiteMaximo);
    });

    test('debe calcular descuento por porcentaje', () => {
      const resultado = lib.calcularDescuentoInfonavit(20000, 15, 'porcentaje');
      expect(resultado.descuento).toBe(3000); // 15% de 20000
    });

    test('debe aplicar límite máximo del 20%', () => {
      const resultado = lib.calcularDescuentoInfonavit(10000, 25, 'porcentaje');
      expect(resultado.descuento).toBe(2000); // Máximo 20% = 2000
    });
  });

  describe('calcularNominaCompleta', () => {
    test('debe calcular nómina completa básica', () => {
      const empleado = {
        nombre: 'Juan Pérez',
        salarioDiario: 500,
        diasTrabajados: 30,
        claseRiesgo: 'II'
      };
      
      const resultado = lib.calcularNominaCompleta(empleado);
      expect(resultado).toHaveProperty('empleado');
      expect(resultado).toHaveProperty('percepciones');
      expect(resultado).toHaveProperty('deducciones');
      expect(resultado).toHaveProperty('resultado');
      expect(resultado).toHaveProperty('costoPatronal');
      
      expect(resultado.empleado.nombre).toBe('Juan Pérez');
      expect(resultado.percepciones.salarioBase).toBe(15000);
      expect(resultado.resultado.sueldoNeto).toBeGreaterThan(0);
      expect(resultado.resultado.sueldoNeto).toBeLessThan(resultado.percepciones.totalPerceciones);
    });

    test('debe incluir Infonavit cuando se especifica', () => {
      const empleado = {
        salarioDiario: 600,
        tieneInfonavit: true,
        factorInfonavit: 3
      };
      
      const resultado = lib.calcularNominaCompleta(empleado);
      expect(resultado.deducciones.infonavit.descuento).toBeGreaterThan(0);
    });

    test('debe rechazar salarios inválidos', () => {
      const empleado = { salarioDiario: 0 };
      expect(() => lib.calcularNominaCompleta(empleado)).toThrow('El salario diario debe ser mayor a cero');
    });
  });

  describe('calcularFiniquito', () => {
    test('debe calcular finiquito básico', () => {
      const empleado = {
        salarioDiario: 500,
        fechaIngreso: '2020-01-01',
        fechaSalida: '2024-01-01',
        diasVacacionesPendientes: 10
      };
      
      const parametros = {
        pagarIndemnizacion: false,
        pagarPrimaAntiguedad: true
      };
      
      const resultado = lib.calcularFiniquito(empleado, parametros);
      expect(resultado).toHaveProperty('empleado');
      expect(resultado).toHaveProperty('conceptos');
      expect(resultado).toHaveProperty('total');
      
      expect(resultado.empleado.diasTrabajados).toBeGreaterThan(0);
      expect(resultado.conceptos.vacacionesPendientes).toBe(5000); // 10 días * 500
      expect(resultado.conceptos.primaVacacional).toBe(1250); // 25% de vacaciones
      expect(resultado.total).toBeGreaterThan(0);
    });

    test('debe incluir indemnización cuando se especifica', () => {
      const empleado = {
        salarioDiario: 500,
        fechaIngreso: '2023-01-01',
        fechaSalida: '2024-01-01'
      };
      
      const parametros = { pagarIndemnizacion: true };
      const resultado = lib.calcularFiniquito(empleado, parametros);
      expect(resultado.conceptos.indemnizacion).toBe(45000); // 90 días * 500
    });

    test('debe rechazar datos faltantes', () => {
      const empleado = { salarioDiario: 500 };
      expect(() => lib.calcularFiniquito(empleado, {})).toThrow('Faltan datos requeridos para el cálculo');
    });
  });

  describe('obtenerConstantesFiscales', () => {
    test('debe retornar constantes fiscales 2024', () => {
      const constantes = lib.obtenerConstantesFiscales();
      expect(constantes).toHaveProperty('año', 2024);
      expect(constantes).toHaveProperty('uma');
      expect(constantes).toHaveProperty('salarioMinimo');
      expect(constantes).toHaveProperty('tarifasIMSS');
      expect(constantes).toHaveProperty('tarifasISR');
      expect(constantes.uma).toHaveProperty('diaria', 108.57);
    });
  });
});
