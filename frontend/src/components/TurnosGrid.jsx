import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import axios from 'axios';
import API_BASE_URL from '../constants/api';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/Turnos.css'; // Importar los estilos personalizados

import TurnoModal from './TurnoModal';
import PagoModal from './PagoModal';
import PacienteModal from './PacienteModal';
import NuevoTurnoPanel from './NuevoTurnoPanel';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

// --- Componentes Personalizados ---

const StatusLegend = () => {
  const statuses = [
    { name: 'Confirmado', class: 'confirmado' },
    { name: 'Completado', class: 'completado' },
    { name: 'Pendiente', class: 'pendiente' },
    { name: 'Cancelado', class: 'cancelado' },
    { name: 'No Presentó', class: 'no_presento' },
  ];

  return (
    <div className="status-legend">
      {statuses.map(status => (
        <div key={status.class} className="legend-item">
          <span className={`legend-color-box status-${status.class}`}></span>
          <span>{status.name}</span>
        </div>
      ))}
    </div>
  );
};

// Renderizar turno
const SimpleEvent = ({ event }) => (
  <div>
    <strong>{event.title}</strong>
    <p style={{ margin: 0, fontSize: '0.9em' }}>{event.data.profesional_nombres}</p>
    <p style={{ margin: '2px 0 0', fontSize: '0.8em', opacity: 0.8 }}>{moment(event.start).format('HH:mm')}</p>
  </div>
);

// Toolbar
const CustomToolbar = ({
  label,
  onNavigate,
  onShowAllConsultorios,
  canShowAllConsultorios,
  isShowingAll,
  onOpenDatePicker,
}) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('PREV')}>&lt; Anterior</button>
        <button type="button" onClick={() => onNavigate('TODAY')}>Hoy</button>
        <button type="button" onClick={() => onNavigate('NEXT')}>Siguiente &gt;</button>
        <button type="button" onClick={onOpenDatePicker}>Ir a fecha…</button>
      </span>
      <StatusLegend />
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group toolbar-show-consultorios">
        <button
          type="button"
          onClick={onShowAllConsultorios}
          disabled={!canShowAllConsultorios}
          aria-pressed={isShowingAll}
        >
          {isShowingAll ? 'Ver consultorios con turnos' : 'Mostrar todos los consultorios'}
        </button>
      </span>
    </div>
  );
};

// Horario de almuerzo
const TimeSlotWrapper = ({ children, value }) => {
  const isLunchBreak = moment(value).hour() === 13;
  const className = isLunchBreak ? 'lunch-break' : '';
  return React.cloneElement(children, { className: `${children.props.className} ${className}` });
};

// Componente Principal

export default function TurnosGrid({ loggedInProfesionalId }) {
  const [events, setEvents] = useState([]);
  const [consultoriosTurnos, setConsultoriosTurnos] = useState([]);
  const [todosConsultorios, setTodosConsultorios] = useState([]);
  const [mostrarTodosConsultorios, setMostrarTodosConsultorios] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [turnoForPago, setTurnoForPago] = useState(null);
  const [pacienteParaVer, setPacienteParaVer] = useState(null);
  const [mostrarNuevoTurno, setMostrarNuevoTurno] = useState(false);

  // Datos de turnos
  const fetchTurnos = useCallback(async (date) => {
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const [turnosRes, formDataRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/turnos?date=${formattedDate}`),
        axios.get(`${API_BASE_URL}/api/turnos/form-data`),
      ]);
      
      const formattedEvents = turnosRes.data.data.map(turno => ({
        id: turno.id,
        title: `${turno.paciente_nombre} ${turno.paciente_apellido}`,
        start: new Date(turno.inicio),
        end: new Date(turno.fin),
        resourceId: turno.consultorio_id,
        data: turno
      }));
      setEvents(formattedEvents);

      const resourcesMap = new Map();
      (turnosRes.data.data || []).forEach((turno) => {
        if (turno.consultorio_id) {
          resourcesMap.set(turno.consultorio_id, {
            resourceId: turno.consultorio_id,
            resourceTitle: turno.consultorio_nombre || `Consultorio ${turno.consultorio_id}`,
          });
        }
      });

      const consultoriosCatalogo = formDataRes.data?.data?.consultorios || [];
      const catalogoResources = consultoriosCatalogo.map((consultorio) => ({
        resourceId: consultorio.id,
        resourceTitle: consultorio.nombre || `Consultorio ${consultorio.id}`,
      }));
      setTodosConsultorios(catalogoResources);

      const resources = Array.from(resourcesMap.values()).sort((a, b) => {
        if (a.resourceId === null) return 1;
        if (b.resourceId === null) return -1;
        return a.resourceId - b.resourceId;
      });

      setConsultoriosTurnos(resources);

    } catch (error) {
      console.error("Error fetching turnos:", error);
    }
  }, []);

  useEffect(() => {
    fetchTurnos(currentDate);
  }, [currentDate, fetchTurnos]);

  const handleEventAction = useCallback(async (turno, data, openPaymentModal = false) => {
    try {
      await axios.put(`${API_BASE_URL}/api/turnos/${turno.id}`, data, {
        headers: { 'X-User-ID': loggedInProfesionalId }
      });
      fetchTurnos(currentDate);
      setSelectedEvent(null);
      
      if (openPaymentModal) {
        setTurnoForPago(turno);
      }
    } catch (error) {
      console.error("Error updating turno:", error);
      alert('Error al actualizar el turno: ' + (error.response?.data?.message || error.message));
    }
  }, [currentDate, fetchTurnos, loggedInProfesionalId]);

  const handleEventDrop = useCallback(async ({ event, start, end, resourceId }) => {
    handleEventAction(event, {
      inicio: moment(start).toISOString(),
      fin: moment(end).toISOString(),
      consultorio_id: resourceId
    });
  }, [handleEventAction]);

  const handleEventResize = useCallback(async ({ event, start, end }) => {
    handleEventAction(event, {
      inicio: moment(start).toISOString(),
      fin: moment(end).toISOString(),
    });
  }, [handleEventAction]);

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const handleOpenPagos = (turnoEvent) => {
    setSelectedEvent(null);
    setTurnoForPago(turnoEvent.data);
  };

  const handleClosePagoModal = () => {
    setTurnoForPago(null);
  };

  const handleOpenPaciente = (pacienteData) => {
    setSelectedEvent(null); // Cierra el modal de turno
    setPacienteParaVer(pacienteData);
  };

  const handleClosePacienteModal = () => {
    setPacienteParaVer(null);
  };

  const handleOpenNuevoTurno = () => {
    setMostrarNuevoTurno(true);
  };

  const handleCloseNuevoTurno = () => {
    setMostrarNuevoTurno(false);
  };

  const handleTurnoCreado = useCallback(() => {
    fetchTurnos(currentDate);
    setMostrarNuevoTurno(false);
  }, [currentDate, fetchTurnos]);

  const handleMostrarTodosConsultorios = () => {
    setMostrarTodosConsultorios((prev) => !prev);
  };

  const calendarResources = mostrarTodosConsultorios ? todosConsultorios : consultoriosTurnos;

  const handleOpenDatePicker = () => {
    setMostrarSelectorFecha(true);
  };

  const handleCloseDatePicker = () => {
    setMostrarSelectorFecha(false);
  };

  const handleDateSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dateValue = formData.get('goto-date');
    if (dateValue) {
      const selected = moment(dateValue, 'YYYY-MM-DD').toDate();
      if (!Number.isNaN(selected.getTime())) {
        setCurrentDate(selected);
      }
    }
    setMostrarSelectorFecha(false);
  };

  const isEventDraggable = useCallback((event) => {
    return event.data.profesional_ids?.split(',').includes(String(loggedInProfesionalId));
  }, [loggedInProfesionalId]);

  const eventPropGetter = useCallback((event) => {
    const statusClass = `event-${event.data.estado}`;
    const isMyEvent = event.data.profesional_ids?.split(',').includes(String(loggedInProfesionalId));
    const highlightClass = isMyEvent ? 'highlighted-event' : '';
    return { className: `${statusClass} ${highlightClass}` };
  }, [loggedInProfesionalId]);

  const formats = {
    timeGutterFormat: 'HH:mm',
  };

  return (
    <div className="turnos-grid-container">
      <DnDCalendar
        localizer={localizer}
        events={events}
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        defaultView="day"
        views={['day']}
  resources={calendarResources}
        resourceIdAccessor="resourceId"
        resourceTitleAccessor="resourceTitle"
        startAccessor="start"
        endAccessor="end"
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        draggableAccessor={isEventDraggable}
        resizableAccessor={isEventDraggable}
        selectable
        step={15}
        timeslots={2}
        min={moment(currentDate).set({ h: 9, m: 0 }).toDate()}
        max={moment(currentDate).set({ h: 20, m: 0 }).toDate()}
        formats={formats}
        eventPropGetter={eventPropGetter}
        components={{
          toolbar: (toolbarProps) => (
            <CustomToolbar
              {...toolbarProps}
              onShowAllConsultorios={handleMostrarTodosConsultorios}
              canShowAllConsultorios={todosConsultorios.length > 0}
              isShowingAll={mostrarTodosConsultorios}
              onOpenDatePicker={handleOpenDatePicker}
            />
          ),
          timeSlotWrapper: TimeSlotWrapper,
          event: SimpleEvent
        }}
      />
      {selectedEvent && (
        <TurnoModal 
          event={selectedEvent} 
          onClose={handleCloseModal}
          onUpdate={handleEventAction}
          onOpenPagos={handleOpenPagos}
          onOpenPaciente={handleOpenPaciente}
          loggedInProfesionalId={loggedInProfesionalId}
        />
      )}
      {turnoForPago && (
        <PagoModal
          turno={turnoForPago}
          onClose={handleClosePagoModal}
        />
      )}
      {pacienteParaVer && (
        <PacienteModal
          paciente={pacienteParaVer}
          onClose={handleClosePacienteModal}
        />
      )}
      <button
        type="button"
        className="floating-create-turno-btn"
        onClick={handleOpenNuevoTurno}
      >
        + Nuevo turno
      </button>
      <NuevoTurnoPanel
        isOpen={mostrarNuevoTurno}
        onClose={handleCloseNuevoTurno}
        onCreated={handleTurnoCreado}
        defaultDate={currentDate}
        loggedInProfesionalId={loggedInProfesionalId}
      />
      {mostrarSelectorFecha && (
        <div className="goto-date-overlay" role="dialog" aria-modal="true">
          <form className="goto-date-dialog" onSubmit={handleDateSubmit}>
            <h3>Ir a fecha</h3>
            <label htmlFor="goto-date">Seleccionar fecha</label>
            <input
              id="goto-date"
              name="goto-date"
              type="date"
              defaultValue={moment(currentDate).format('YYYY-MM-DD')}
              required
            />
            <div className="goto-date-actions">
              <button type="button" onClick={handleCloseDatePicker}>Cancelar</button>
              <button type="submit">Ir</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
