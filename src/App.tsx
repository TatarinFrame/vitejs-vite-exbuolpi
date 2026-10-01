import { useEffect, useRef, useState } from 'react';
import { initialData } from './data/initialData';
import './App.css';

function App() {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('room-assets-data');

    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch {
        return initialData;
      }
    }

    return initialData;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterResource, setFilterResource] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  useEffect(() => {
    localStorage.setItem('room-assets-data', JSON.stringify(data));
  }, [data]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resourceType, setResourceType] = useState<'room' | 'asset'>('room');
  const [resourceId, setResourceId] = useState('room-101');

  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notes, setNotes] = useState('');

  const handleExportJSON = () => {
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'room-assets-data.json';

    link.click();

    URL.revokeObjectURL(url);
  };
  const handleImportJSON = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }
    const importMode = window.confirm(
      'OK — заменить все текущие данные.\n\n' +
        'Отмена — объединить импортированные данные с текущими.'
    )
      ? 'replace'
      : 'merge';

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Проверяем основную структуру JSON
      if (
        !importedData.rooms ||
        !Array.isArray(importedData.rooms) ||
        !importedData.assets ||
        !Array.isArray(importedData.assets) ||
        !importedData.bookings ||
        !Array.isArray(importedData.bookings)
      ) {
        alert('Ошибка: неправильный формат JSON.');
        return;
      }

      // Проверяем комнаты
      for (const room of importedData.rooms) {
        if (
          typeof room.id !== 'string' ||
          typeof room.name !== 'string' ||
          typeof room.capacity !== 'number' ||
          !Array.isArray(room.features)
        ) {
          alert('Ошибка: неправильная структура данных комнаты.');
          return;
        }
      }

      // Проверяем оборудование
      for (const asset of importedData.assets) {
        if (
          typeof asset.id !== 'string' ||
          typeof asset.name !== 'string' ||
          typeof asset.inventoryCode !== 'string' ||
          typeof asset.status !== 'string'
        ) {
          alert('Ошибка: неправильная структура данных оборудования.');
          return;
        }
      }

      // Собираем ID существующих ресурсов
      const roomIds = new Set(importedData.rooms.map((room: any) => room.id));

      const assetIds = new Set(
        importedData.assets.map((asset: any) => asset.id)
      );

      // Проверяем бронирования
      for (const booking of importedData.bookings) {
        // Проверяем структуру бронирования
        if (
          typeof booking.id !== 'string' ||
          (booking.resourceType !== 'room' &&
            booking.resourceType !== 'asset') ||
          typeof booking.resourceId !== 'string' ||
          typeof booking.title !== 'string' ||
          typeof booking.start !== 'string' ||
          typeof booking.end !== 'string' ||
          typeof booking.notes !== 'string'
        ) {
          alert('Ошибка: неправильная структура бронирования.');
          return;
        }

        // Проверяем существование ресурса
        const resourceExists =
          booking.resourceType === 'room'
            ? roomIds.has(booking.resourceId)
            : assetIds.has(booking.resourceId);

        if (!resourceExists) {
          alert(
            `Ошибка: ресурс для бронирования "${booking.title}" не найден.`
          );
          return;
        }

        // Проверяем UTC ISO-формат
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

        if (
          !isoDateRegex.test(booking.start) ||
          !isoDateRegex.test(booking.end)
        ) {
          alert(
            `Ошибка: время бронирования "${booking.title}" должно быть в UTC ISO-формате.`
          );
          return;
        }

        const start = new Date(booking.start);
        const end = new Date(booking.end);

        // Проверяем корректность времени
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
          alert(`Ошибка во времени бронирования "${booking.title}".`);
          return;
        }
      }

      // Проверяем пересечения бронирований
      for (let i = 0; i < importedData.bookings.length; i++) {
        for (let j = i + 1; j < importedData.bookings.length; j++) {
          const a = importedData.bookings[i];
          const b = importedData.bookings[j];

          if (
            a.resourceType === b.resourceType &&
            a.resourceId === b.resourceId
          ) {
            const aStart = new Date(a.start).getTime();
            const aEnd = new Date(a.end).getTime();

            const bStart = new Date(b.start).getTime();
            const bEnd = new Date(b.end).getTime();

            const hasOverlap = aStart < bEnd && aEnd > bStart;

            if (hasOverlap) {
              alert(
                `Ошибка: найдены пересекающиеся бронирования:\n\n` +
                  `"${a.title}"\n` +
                  `"${b.title}"`
              );

              return;
            }
          }
        }
      }

      // Если все проверки пройдены
      if (importMode === 'replace') {
        setData(importedData);

        alert(
          'Импорт завершён.\n\n' +
            'Все текущие данные заменены импортированными.'
        );
      } else {
        const existingBookingIds = new Set(
          data.bookings.map((booking: any) => booking.id)
        );

        const existingRoomIds = new Set(data.rooms.map((room: any) => room.id));

        const existingAssetIds = new Set(
          data.assets.map((asset: any) => asset.id)
        );

        const newRooms = importedData.rooms.filter(
          (room: any) => !existingRoomIds.has(room.id)
        );

        const newAssets = importedData.assets.filter(
          (asset: any) => !existingAssetIds.has(asset.id)
        );

        const newBookings = importedData.bookings.filter(
          (booking: any) => !existingBookingIds.has(booking.id)
        );

        setData({
          rooms: [...data.rooms, ...newRooms],
          assets: [...data.assets, ...newAssets],
          bookings: [...data.bookings, ...newBookings],
        });

        alert(
          'Импорт завершён.\n\n' +
            `Добавлено комнат: ${newRooms.length}\n` +
            `Добавлено оборудования: ${newAssets.length}\n` +
            `Добавлено бронирований: ${newBookings.length}`
        );
      }
    } catch {
      alert('Ошибка: файл не является корректным JSON.');
    }

    // Сбрасываем выбранный файл
    event.target.value = '';
  };
  const resetForm = () => {
    setTitle('');
    setStart('');
    setEnd('');
    setNotes('');
  };
  const handleEditBooking = (booking: any) => {
    setEditingBookingId(booking.id);

    setResourceType(booking.resourceType);
    setResourceId(booking.resourceId);
    setTitle(booking.title);

    const startDate = new Date(booking.start);
    const endDate = new Date(booking.end);

    setStart(startDate.toISOString().slice(0, 16));

    setEnd(endDate.toISOString().slice(0, 16));

    setNotes(booking.notes || '');

    setShowForm(true);
  };
  const handleDeleteBooking = (id: string) => {
    const confirmed = window.confirm(
      'Вы действительно хотите удалить это бронирование?'
    );

    if (!confirmed) {
      return;
    }

    setData({
      ...data,
      bookings: data.bookings.filter((booking) => booking.id !== id),
    });
  };
  const handleResourceTypeChange = (type: 'room' | 'asset') => {
    setResourceType(type);

    if (type === 'room') {
      setResourceId(data.rooms[0]?.id || '');
    } else {
      setResourceId(data.assets[0]?.id || '');
    }
  };

  const handleCreateBooking = () => {
    if (!resourceId) {
      alert('Выберите ресурс.');
      return;
    }

    if (!title.trim()) {
      alert('Введите название бронирования.');
      return;
    }

    if (!start || !end) {
      alert('Укажите время начала и окончания.');
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Проверяем, что начало раньше окончания
    if (startDate >= endDate) {
      alert('Время начала должно быть раньше времени окончания.');
      return;
    }

    // Проверяем пересечения
    const hasConflict = data.bookings.some((booking) => {
      // Проверяем только тот же тип ресурса
      if (booking.resourceType !== resourceType) {
        return false;
      }

      // Проверяем только тот же ресурс
      if (booking.resourceId !== resourceId) {
        return false;
      }

      const existingStart = new Date(booking.start).getTime();
      const existingEnd = new Date(booking.end).getTime();

      const newStart = startDate.getTime();
      const newEnd = endDate.getTime();

      // Пересечение временных интервалов
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasConflict) {
      const conflictingBookings = data.bookings.filter((booking) => {
        if (booking.id === editingBookingId) {
          return false;
        }

        if (booking.resourceType !== resourceType) {
          return false;
        }

        if (booking.resourceId !== resourceId) {
          return false;
        }

        const existingStart = new Date(booking.start).getTime();
        const existingEnd = new Date(booking.end).getTime();

        const newStart = startDate.getTime();
        const newEnd = endDate.getTime();

        return newStart < existingEnd && newEnd > existingStart;
      });

      const conflictText = conflictingBookings
        .map((booking) => {
          const startText = new Date(booking.start).toLocaleString();
          const endText = new Date(booking.end).toLocaleString();

          return `• ${booking.title}\n  ${startText} — ${endText}`;
        })
        .join('\n\n');

      alert(
        `Ресурс уже забронирован на это время.\n\n` +
          `Конфликтующие бронирования:\n\n` +
          `${conflictText}\n\n` +
          `Выберите другое время.`
      );

      return;
    }

    if (editingBookingId) {
      const updatedBookings = data.bookings.map((booking) => {
        if (booking.id !== editingBookingId) {
          return booking;
        }

        return {
          ...booking,
          resourceType,
          resourceId,
          title: title.trim(),
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          notes: notes.trim(),
        };
      });

      setData({
        ...data,
        bookings: updatedBookings,
      });

      setEditingBookingId(null);
      resetForm();
      setShowForm(false);

      alert('Бронирование успешно изменено!');

      return;
    }

    const newBooking = {
      id: `booking-${Date.now()}`,
      resourceType,
      resourceId,
      title: title.trim(),
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      notes: notes.trim(),
    };

    setData({
      ...data,
      bookings: [...data.bookings, newBooking],
    });

    resetForm();
    setShowForm(false);

    alert('Бронирование успешно создано!');

    setData({
      ...data,
      bookings: [...data.bookings, newBooking],
    });

    resetForm();
    setShowForm(false);

    alert('Бронирование успешно создано!');
  };
  const filteredBookings = data.bookings.filter((booking) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      booking.title.toLowerCase().includes(searchText) ||
      booking.notes.toLowerCase().includes(searchText);

    const matchesResource =
      filterResource === 'all' || booking.resourceId === filterResource;

    const matchesDate =
      !filterDate || booking.start.slice(0, 10) === filterDate;

    return matchesSearch && matchesResource && matchesDate;
  });

  return (
    <div className="app">
      <header className="header">
        <h1>Room&Assets</h1>

        <div className="header-buttons">
          <button className="secondary-button" onClick={handleExportJSON}>
            Экспорт JSON
          </button>

          <button
            className="secondary-button"
            onClick={() => fileInputRef.current?.click()}
          >
            Импорт JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
          />

          <button className="primary-button" onClick={() => setShowForm(true)}>
            + Добавить бронирование
          </button>
        </div>
      </header>

      <main className="container">
        {/* КНОПКА ДОБАВЛЕНИЯ */}
        <div className="top-actions">
          <button className="primary-button" onClick={() => setShowForm(true)}>
            + Добавить бронирование
          </button>
        </div>

        {/* ФОРМА БРОНИРОВАНИЯ */}
        {showForm && (
          <section className="booking-form">
            <h2>
              {editingBookingId
                ? 'Редактирование бронирования'
                : 'Новое бронирование'}
            </h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Тип ресурса</label>

                <select
                  value={resourceType}
                  onChange={(e) =>
                    handleResourceTypeChange(e.target.value as 'room' | 'asset')
                  }
                >
                  <option value="room">Помещение</option>
                  <option value="asset">Инвентарь</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ресурс</label>

                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                >
                  {resourceType === 'room'
                    ? data.rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))
                    : data.assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                </select>
              </div>

              <div className="form-group">
                <label>Название</label>

                <input
                  type="text"
                  placeholder="Например: Семинар"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Начало</label>

                <input
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Окончание</label>

                <input
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Примечание</label>

                <textarea
                  placeholder="Дополнительная информация"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="primary-button" onClick={handleCreateBooking}>
                {editingBookingId
                  ? 'Сохранить изменения'
                  : 'Создать бронирование'}
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Отмена
              </button>
            </div>
          </section>
        )}

        {/* ПОМЕЩЕНИЯ */}
        <section className="section">
          <h2>Помещения</h2>
          <div className="filters">
            <div className="filter-group">
              <label>Поиск</label>

              <input
                type="text"
                placeholder="Название или примечание..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Ресурс</label>

              <select
                value={filterResource}
                onChange={(e) => setFilterResource(e.target.value)}
              >
                <option value="all">Все ресурсы</option>

                <optgroup label="Помещения">
                  {data.rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Инвентарь">
                  {data.assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="filter-group">
              <label>Дата</label>

              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <button
              className="secondary-button"
              onClick={() => {
                setSearch('');
                setFilterResource('all');
                setFilterDate('');
              }}
            >
              Сбросить
            </button>
          </div>

          <div className="cards">
            {data.rooms.map((room) => (
              <div className="card" key={room.id}>
                <h3>{room.name}</h3>

                <p>
                  Вместимость: <strong>{room.capacity}</strong>
                </p>

                <p>Возможности: {room.features.join(', ')}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ИНВЕНТАРЬ */}
        <section className="section">
          <h2>Инвентарь</h2>

          <div className="cards">
            {data.assets.map((asset) => (
              <div className="card" key={asset.id}>
                <h3>{asset.name}</h3>

                <p>
                  Код: <strong>{asset.inventoryCode}</strong>
                </p>

                <p>Статус: {asset.status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* БРОНИРОВАНИЯ */}
        <section className="section">
          <h2>Бронирования</h2>

          {data.bookings.length === 0 ? (
            <p>Пока нет бронирований</p>
          ) : filteredBookings.length === 0 ? (
            <p>По заданным фильтрам бронирований не найдено.</p>
          ) : (
            <div className="cards">
              {filteredBookings.map((booking) => (
                <div className="card booking-card" key={booking.id}>
                  <h3>{booking.title}</h3>

                  <p>
                    Ресурс: <strong>{booking.resourceId}</strong>
                  </p>

                  <p>Начало: {new Date(booking.start).toLocaleString()}</p>

                  <p>Окончание: {new Date(booking.end).toLocaleString()}</p>

                  {booking.notes && <p>Примечание: {booking.notes}</p>}

                  <div className="booking-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEditBooking(booking)}
                    >
                      Редактировать
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDeleteBooking(booking.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
