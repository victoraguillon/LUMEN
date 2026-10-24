/* Exportación de actividades a calendario (.ics y Google Calendar). */
const LumenCalendar = {
    _pad: function(n) { return String(n).padStart(2, '0'); },
    _icsDate: function(value) {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return '';
        return d.getUTCFullYear() + this._pad(d.getUTCMonth() + 1) + this._pad(d.getUTCDate()) + 'T' +
            this._pad(d.getUTCHours()) + this._pad(d.getUTCMinutes()) + this._pad(d.getUTCSeconds()) + 'Z';
    },
    _googleDate: function(value) {
        const d = value instanceof Date ? value : new Date(value);
        if (isNaN(d.getTime())) return '';
        return this._icsDate(d).replace(/[-:]/g, '');
    },
    _escapeICS: function(value) {
        return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    },
    _end: function(event) {
        if (event.fecha_fin) {
            const end = new Date(event.fecha_fin);
            if (!isNaN(end.getTime())) return end;
        }
        const start = new Date(event.fecha_inicio);
        if (isNaN(start.getTime())) return null;
        return new Date(start.getTime() + 2 * 60 * 60 * 1000);
    },
    canExport: function(event) {
        return !!(event && event.tipo !== 'recurrente' && event.fecha_inicio && !isNaN(new Date(event.fecha_inicio).getTime()));
    },
    googleUrl: function(event) {
        if (!this.canExport(event)) return '';
        const start = new Date(event.fecha_inicio);
        const end = this._end(event) || new Date(start.getTime() + 2 * 60 * 60 * 1000);
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: event.titulo || 'Actividad LUMEN',
            dates: this._googleDate(start) + '/' + this._googleDate(end),
            details: (event.descripcion || '') + '\n\nActividad de LUMEN.',
            location: event.ubicacion || 'Parroquia Nuestra Señora de Lourdes, Maracaibo'
        });
        return 'https://calendar.google.com/calendar/render?' + params.toString();
    },
    ics: function(event) {
        if (!this.canExport(event)) return '';
        const start = new Date(event.fecha_inicio);
        const end = this._end(event) || new Date(start.getTime() + 2 * 60 * 60 * 1000);
        const now = new Date();
        const uid = 'lumen-' + (event.id || start.getTime()) + '@lumenve.vercel.app';
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//LUMEN//Actividades//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:' + uid,
            'DTSTAMP:' + this._icsDate(now),
            'DTSTART:' + this._icsDate(start),
            'DTEND:' + this._icsDate(end),
            'SUMMARY:' + this._escapeICS(event.titulo || 'Actividad LUMEN'),
            'DESCRIPTION:' + this._escapeICS((event.descripcion || '') + '\n\nActividad de LUMEN.'),
            'LOCATION:' + this._escapeICS(event.ubicacion || 'Parroquia Nuestra Señora de Lourdes, Maracaibo'),
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
    },
    download: function(event) {
        if (!this.canExport(event)) {
            if (typeof LumenUI !== 'undefined' && LumenUI.showToast) LumenUI.showToast('Esta actividad no tiene una fecha concreta para el calendario.', 'info');
            return;
        }
        const blob = new Blob([this.ics(event)], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lumen-' + String(event.titulo || 'actividad').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.ics';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
    },
    openGoogle: function(event) {
        const url = this.googleUrl(event);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    }
};
