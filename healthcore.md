## Empresa elegida
HealthCore

## Por qué elegí esta empresa
Seleccione esta empresa porque creo que tiene varios puntos de mejoras, tanto en lo operativo como en la retención de activos.
Creo que un problema interesante es la gestión de las agendas, ya que a pesar de que en ambos países se realiza telefónicamente no hay un sector único y especifico que gestione la tarea, por ej: Coordinación Médica. A su vez, 1/5 de los pacientes no acuden a sus citas, sobresaturando la agenda médica.
A su vez, me intereso la gestión de cobros a los seguros y NHS, ya que de estos cobros depende la estabilidad de la empresa.
-

## Departamentos que me interesan
- Departamento 1: Experiencia del Paciente y Acceso 
- Departamento 2: Ciclo de Ingresos y Facturación


## Mi idea de Agente de IA
- Qué haría: Mi agente de IA gestionaría las agendas, brindando las opciones disponibles por especialidad, prestador, fecha y horarios de preferencia. En caso de que las citas estén ocupadas podrá seleccionar quedar en lista de espera para cuando se libere un cupo. El usuario también podrá cancelar los servicios al menos 8 horas antes de la consulta, en caso contrario deberá de abonar el 50% de los honorarios médicos.  
- Qué información necesitaría:  Necesitaría: horarios de las consultas por prestador, especialidad y locación, duración estipulada de cada consulta en base a la especialidad. Información de turnos ya reservados, cancelaciones, y cambios de agenda. 
- Qué produciría o dispararía: La reservación de un turno generaría un nuevo evento que puede ser en un sistema interno o en una planilla, donde se especifique: Fecha, nombre del usuario, documento de identidad el prestador médico, la locación y el horario de la reserva. 
En los casos de las cancelaciones, deberá de generar una alerta para que dicho turno sea ofrecido a los pacientes en lista de espera, respetando la antigüedad de la solicitud.
Posteriormente el área de ciclo de ingresos y facturación evaluará si la consulta fue cancelada en tiempo y forma y procederá a generar una factura si corresponde el pago del 50%.

## Contrato del CSV de análisis

- Cabecera exacta: `Fecha,nombre del usuario,documento de identidad,locación,estado,satisfaccion`.
- `Fecha`, `nombre del usuario`, `documento de identidad`, `locación` y `estado` son obligatorios en cada registro.
- Estados permitidos: `cumplido`, `cancelado`, `cancelacion tardia`, `no concurrencia`.
- En estado `cumplido`, `satisfaccion` es obligatoria. Toda puntuación registrada debe ser numérica, finita y estar entre 1 y 10 (inclusive); se admiten decimales con punto.
- En los otros estados, `satisfaccion` puede estar vacía y no contribuye a la media.
- No existe columna de categoría ni se calcula un desglose por categoría.
- La fecha se requiere como texto no vacío; no se ha definido un formato, una restricción de locaciones ni una regla de duplicados.
- CSV UTF-8 (con o sin BOM), separado por coma, punto y coma o tabulación. Se eliminan espacios exteriores de cabeceras y valores, sin cambiar los estados.
- Registros inválidos: se excluyen de las métricas y se informan por fila, campo y tipo de error, sin reproducir datos del paciente. Una fila puede presentar varios errores; cada tipo se cuenta una vez por registro.
- El total procesado corresponde a filas de datos, no a la cabecera ni a líneas completamente vacías. La satisfacción media se presenta con dos decimales, con redondeo decimal al par en empates; sin casos cumplidos válidos se informa como no disponible.
- El análisis no infiere cancelaciones tardías ni cargos: recibe el estado ya clasificado. No exporta ni almacena identificadores de pacientes.

## Reglas ejecutables del análisis

Este bloque JSON es la fuente ejecutable del contrato anterior. CLI y API lo leen al iniciar; el frontend obtiene el mismo contrato desde la API. Después de modificarlo, reiniciar el servicio. No se interpreta el texto narrativo como configuración.

Los límites operativos son 10 MiB por fichero, 50.000 registros y 10.000 detalles de error. Al superar un límite se rechaza el fichero entero, sin truncar errores ni publicar resultados parciales.

<!-- healthcore-incidents-rules -->
```json
{
	"fields": {
		"date": "Fecha",
		"name": "nombre del usuario",
		"identity": "documento de identidad",
		"location": "locación",
		"state": "estado",
		"satisfaction": "satisfaccion"
	},
	"required_fields": ["Fecha", "nombre del usuario", "documento de identidad", "locación", "estado"],
	"states": ["cumplido", "cancelado", "cancelacion tardia", "no concurrencia"],
	"completed_state": "cumplido",
	"satisfaction": {"minimum": 1, "maximum": 10, "required_for_completed": true},
	"limits": {"max_file_bytes": 10485760, "max_records": 50000, "max_error_details": 10000},
	"error_labels": {
		"missing_field": "Campo obligatorio vacío",
		"invalid_state": "Estado no permitido",
		"invalid_score": "Puntuación no numérica o fuera de 1 a 10",
		"invalid_columns": "Número de columnas incorrecto"
	}
}
```
