document.addEventListener('DOMContentLoaded', function() {
  const monthNames = ["OCAK", "ŞUBAT", "MART", "NİSAN", "MAYIS", "HAZİRAN", "TEMMUZ", "AĞUSTOS", "EYLÜL", "EKİM", "KASIM", "ARALIK"];
  const dayNames = ["Pts", "Sal", "Çar", "Prş", "Cum", "Cts", "Paz"];

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const divs = ['.div1', '.div2', '.div3', '.div4', '.div5', '.div6', '.div7', '.div8', '.div9', '.div10', '.div11', '.div12'];

  divs.forEach((div, index) => {
      const month = index;
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      const firstDayIndex = (new Date(currentYear, month, 1).getDay() + 6) % 7; // Pazartesi'yi hafta başı yap

      const container = document.querySelector(div);
      container.innerHTML = `
          <div class="sol flexmid">
              <h1>${monthNames[month]}</h1>
          </div>
          <div class="sag">
              <ul class="weeks"></ul>
              <ul class="days"></ul>
          </div>
      `;

      const weeksList = container.querySelector('.weeks');
      const daysList = container.querySelector('.days');

      dayNames.forEach(day => {
          const li = document.createElement('li');
          li.textContent = day;
          weeksList.appendChild(li);
      });

      for (let i = 0; i < firstDayIndex; i++) {
          const li = document.createElement('li');
          li.textContent = '';
          li.classList.add('inactive');
          daysList.appendChild(li);
      }

      for (let i = 1; i <= daysInMonth; i++) {
          const li = document.createElement('li');
          li.textContent = i;

          // Add "currentday" class to the current date
          if (index === currentMonth && i === currentDate) {
              li.classList.add('currentday');
          }

          daysList.appendChild(li);
      }

      const totalDays = firstDayIndex + daysInMonth;
      for (let i = totalDays; i < 42; i++) {
          const li = document.createElement('li');
          li.textContent = '';
          li.classList.add('inactive');
          daysList.appendChild(li);
      }
  });

  // Initialize IndexedDB
  let db;
  const request = indexedDB.open('CalendarDB', 1);

  request.onupgradeneeded = function(event) {
      db = event.target.result;
      const objectStore = db.createObjectStore('leaveDays', { keyPath: 'name' });
      objectStore.createIndex('days', 'days', { unique: false });
  };

  request.onsuccess = function(event) {
      db = event.target.result;
      loadLeaveDays();
      loadCheckedNames();
  };

  request.onerror = function(event) {
      console.error('IndexedDB error:', event.target.errorCode);
  };

  function loadLeaveDays() {
      const transaction = db.transaction(['leaveDays'], 'readonly');
      const objectStore = transaction.objectStore('leaveDays');
      const request = objectStore.getAll();

      request.onsuccess = function(event) {
          const leaveDays = event.target.result;
          leaveDays.forEach(item => {
              if (item.name === 'selectedDays') {
                  item.days.forEach(day => {
                      const date = new Date(day.date);
                      const monthIndex = date.getMonth();
                      const dayIndex = date.getDate();
                      const firstDayIndex = (new Date(date.getFullYear(), monthIndex, 1).getDay() + 6) % 7;
                      const dayElement = document.querySelector(`.div${monthIndex + 1} .days li:nth-child(${dayIndex + firstDayIndex})`);

                      let names = dayElement.getAttribute('data-names');
                      if (names) {
                          names = names.split(',');
                          names.push(day.name);
                          dayElement.setAttribute('data-names', names.join(','));
                          dayElement.style.background = createGradient(names);
                      } else {
                          dayElement.setAttribute('data-names', day.name);
                          dayElement.style.backgroundColor = colorMap[day.name];
                      }

                      if (day.halfDay) {
                          dayElement.classList.add('halfday');
                      }
                  });
              } else {
                  document.getElementById(`${item.name}-leave`).value = item.days;
              }
          });
      };
  }

  function createGradient(names) {
      const percentage = 100 / names.length;
      return `linear-gradient(90deg, ${names.map((name, index) => `${colorMap[name]} ${index * percentage}%, ${colorMap[name]} ${(index + 1) * percentage}%`).join(', ')})`;
  }

  function loadCheckedNames() {
      const checkboxes = document.querySelectorAll('.top input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
          const name = checkbox.id;
          if (checkbox.checked) {
              document.querySelectorAll(`.days li[data-name="${name}"]`).forEach(day => {
                  day.classList.remove('inactive');
              });
          } else {
              document.querySelectorAll(`.days li[data-name="${name}"]`).forEach(day => {
                  day.classList.add('inactive');
              });
          }
      });
  }

  const nameSelect = document.getElementById('name-select');
  const colorMap = {
      osman: 'var(--osman)',
      kadir: 'var(--kadir)',
      batuhan: 'var(--batuhan)',
      mustafa: 'var(--mustafa)',
      bekir: 'var(--bekir)',
      simge: 'var(--simge)',
      hakan: 'var(--hakan)',
      yigit: 'var(--yigit)',
      ilhan: 'var(--ilhan)',
      bahar: 'var(--bahar)',
      seval: 'var(--seval)',
      omer: 'var(--omer)',
      test: 'var(--test)'
  };

  document.querySelectorAll('.days li').forEach(day => {
      day.addEventListener('click', function() {
          const selectedName = nameSelect.value;
          if (!selectedName) {
              alert('Lütfen bir isim seçin.');
              return;
          }

          const leaveInput = document.getElementById(`${selectedName}-leave`);
          const maxLeaveDays = parseInt(leaveInput.value, 10);
          const selectedDays = document.querySelectorAll(`.days li[data-names*="${selectedName}"]`).length;
          const isHalfDay = document.getElementById('day-input').checked;

          let names = day.getAttribute('data-names');
          if (names) {
              names = names.split(',');
              if (names.includes(selectedName)) {
                  names = names.filter(name => name !== selectedName);
                  day.setAttribute('data-names', names.join(','));
                  if (names.length > 0) {
                      day.style.background = createGradient(names);
                  } else {
                      day.style.backgroundColor = '';
                      day.removeAttribute('data-names');
                  }
                  day.classList.remove('halfday');
              } else {
                  if (selectedDays >= maxLeaveDays) {
                      alert('İzin günleri bitti!');
                      return;
                  }
                  names.push(selectedName);
                  day.setAttribute('data-names', names.join(','));
                  day.style.background = createGradient(names);
                  if (isHalfDay) {
                      day.classList.add('halfday');
                  }
              }
          } else {
              if (selectedDays >= maxLeaveDays) {
                  alert('İzin günleri bitti!');
                  return;
              }
              day.setAttribute('data-names', selectedName);
              day.style.backgroundColor = colorMap[selectedName];
              if (isHalfDay) {
                  day.classList.add('halfday');
              }
          }
      });
  });

  window.saveLeaveDays = function() {
      const transaction = db.transaction(['leaveDays'], 'readwrite');
      const objectStore = transaction.objectStore('leaveDays');

      document.querySelectorAll('.leave-input').forEach(inputDiv => {
          const name = inputDiv.getAttribute('data-name');
          const days = inputDiv.querySelector('input').value;
          objectStore.put({ name, days: parseFloat(days) });
      });

      const selectedDays = [];
      document.querySelectorAll('.days li[data-names]').forEach(day => {
          const monthIndex = Array.from(day.closest('.months').classList).find(cls => cls.startsWith('div')).replace('div', '') - 1;
          const date = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day.textContent).padStart(2, '0')}`;
          const names = day.getAttribute('data-names').split(',');
          const isHalfDay = day.classList.contains('halfday');
          names.forEach(name => {
              selectedDays.push({
                  date: date,
                  name: name,
                  halfDay: isHalfDay
              });
          });
      });

      objectStore.put({ name: 'selectedDays', days: selectedDays });

      transaction.oncomplete = function() {
          alert('İzin günleri kaydedildi!');
      };

      transaction.onerror = function(event) {
          console.error('Transaction error:', event.target.errorCode);
      };
  };



  window.exportData = function() {
      const transaction = db.transaction(['leaveDays'], 'readonly');
      const objectStore = transaction.objectStore('leaveDays');
      const request = objectStore.getAll();

      request.onsuccess = function(event) {
          const data = event.target.result;
          const json = JSON.stringify(data);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;

          // Tarih ve saat formatını oluşturuyoruz
          const now = new Date();
          const day = String(now.getDate()).padStart(2, '0');
          const month = String(now.getMonth() + 1).padStart(2, '0'); // Aylar 0'dan başlıyor, bu yüzden +1 ekliyoruz
          const year = now.getFullYear();
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');

          const dateTimeString = `${day}-${month}-${year} ${hours}-${minutes}.json`;

          a.download = dateTimeString;
          a.click();
          URL.revokeObjectURL(url);
      };

      request.onerror = function(event) {
          console.error('Export error:', event.target.errorCode);
      };
  };



  // Import IndexedDB data
  window.importData = function(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(event) {
          const json = event.target.result;
          const data = JSON.parse(json);

          const transaction = db.transaction(['leaveDays'], 'readwrite');
          const objectStore = transaction.objectStore('leaveDays');

          data.forEach(item => {
              objectStore.put(item);
          });

          transaction.oncomplete = function() {
              alert('Veriler başarıyla içe aktarıldı!');
              loadLeaveDays();
          };

          transaction.onerror = function(event) {
              console.error('Import error:', event.target.errorCode);
          };
      };

      reader.readAsText(file);
  };

  window.deleteAllData = function() {
      if (confirm("Bütün Veriler Silinecek Emin Misin?")) {
          const request = indexedDB.deleteDatabase('CalendarDB');
          request.onsuccess = function() {
              alert('Bütün veriler silindi.');
              location.reload();
          };
          request.onerror = function(event) {
              console.error('Veri silme hatası:', event.target.errorCode);
          };
      }
  };
});















document.addEventListener('DOMContentLoaded', function() {
const originalColors = {
  kontrol: getComputedStyle(document.documentElement).getPropertyValue('--kontrol'),
  osman: getComputedStyle(document.documentElement).getPropertyValue('--osman'),
  kadir: getComputedStyle(document.documentElement).getPropertyValue('--kadir'),
  batuhan: getComputedStyle(document.documentElement).getPropertyValue('--batuhan'),
  mustafa: getComputedStyle(document.documentElement).getPropertyValue('--mustafa'),
  bekir: getComputedStyle(document.documentElement).getPropertyValue('--bekir'),
  simge: getComputedStyle(document.documentElement).getPropertyValue('--simge'),
  hakan: getComputedStyle(document.documentElement).getPropertyValue('--hakan'),
  yigit: getComputedStyle(document.documentElement).getPropertyValue('--yigit'),
  ilhan: getComputedStyle(document.documentElement).getPropertyValue('--ilhan'),
  bahar: getComputedStyle(document.documentElement).getPropertyValue('--bahar'),
  seval: getComputedStyle(document.documentElement).getPropertyValue('--seval'),
  omer: getComputedStyle(document.documentElement).getPropertyValue('--omer'),
  test: getComputedStyle(document.documentElement).getPropertyValue('--test'),
  unchecked: getComputedStyle(document.documentElement).getPropertyValue('--unchecked')
};

const checkboxes = document.querySelectorAll('input[type="checkbox"]');
updateColors(); // Initially set colors

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', updateColors);
});

// Function to update the root CSS variables
function updateColors() {
  checkboxes.forEach((checkbox) => {
    const rootStyle = document.documentElement.style;
    if (checkbox.checked) {
      rootStyle.setProperty(`--${checkbox.id}`, originalColors[checkbox.id]);
    } else {
      rootStyle.setProperty(`--${checkbox.id}`, originalColors.unchecked);
    }
  });
}
});



















// KONTROL CHECKED İSE HEPSİNİ SEÇER
document.getElementById('kontrol').addEventListener('change', function() {
  var checkboxes = document.querySelectorAll('.top input[type="checkbox"]');
  checkboxes.forEach(function(checkbox) {
      checkbox.checked = document.getElementById('kontrol').checked;
  });
  loadCheckedNames();
});

// BASLİIK TARİH DEĞİŞTİRME
document.querySelector(".baslik").innerHTML = new Date().getFullYear() + " YILI İZİN TARİHLERİ"

/* HAMBURGER MENU İCON */
function myFunction() {
  var element = document.querySelector("#navoff");
  element.classList.toggle("active");
  var panel = document.getElementById("solgraypanel");
  if (element.classList.contains("active")) {
    panel.style.left = "0px";
  } else {
    panel.style.left = "-350px";
  }
};
/* HAMBURGER MENU İCON */







