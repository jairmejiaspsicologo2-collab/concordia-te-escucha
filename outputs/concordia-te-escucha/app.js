const municipalProfile = {
  fuente: "SISPRO - Ficha territorial de indicadores",
  municipio: "Concordia",
  departamento: "Magdalena",
  codigo: "47205",
  periodoBase: "2020-2026",
  corteSolicitado: "2026",
  poblacion2023: 11618,
  cabecera2023: 4328,
  resto2023: 7290,
  hombres2023: 6108,
  mujeres2023: 5510,
  ipsPublicas2023: 4,
  ipsPrivadas2023: 1,
  totalIps2023: 5,
  ipsLocalValidada: 1,
  ipsReferencia: "ESE Hospital Local de Concordia",
  afiliadosSubsidiado2023: 9440,
  afiliadosContributivo2023: 366,
  afiliadosExcepcion2023: 7,
  afiliadosIndeterminado2023: 1,
  totalAfiliados2023: 9814,
  mortalidadInfantil: [
    { periodo: "2020", valor: 16.67 },
    { periodo: "2021", valor: 20.62 }
  ],
  mortalidadGeneral: [
    { periodo: "2020", valor: 4.72 },
    { periodo: "2021", valor: 4.82 }
  ],
  bajoPesoNacer: [
    { periodo: "2020", valor: 5.04 },
    { periodo: "2021", valor: 6.19 }
  ]
};

let cases = [];

const zoneFilter = document.querySelector("#zoneFilter");
const ageFilter = document.querySelector("#ageFilter");
const serviceFilter = document.querySelector("#serviceFilter");
const riskFilter = document.querySelector("#riskFilter");
const views = document.querySelectorAll(".view");
const navItems = document.querySelectorAll(".nav-item");

const riskColors = {
  Alto: "#c75b46",
  Medio: "#d5972c",
  Bajo: "#7a9b44"
};

const defaultMapQuery = "Concordia, Magdalena, Colombia";
const minAnonymousYear = 2020;
const maxAnonymousYear = 2026;

const officialSources = [
  {
    name: "SISPRO",
    use: "Atenciones en salud, RIPS, aseguramiento, ficha municipal, prestadores, indicadores y visor geográfico.",
    level: "Municipal y departamental",
    access: "Público y consultas institucionales",
    status: "Cargado: ficha territorial pública disponible; complementar 2024-2026 con fuentes anónimas",
    tags: ["RIPS", "Indicadores", "Mapas"]
  },
  {
    name: "SI-APS",
    use: "Información de Atención Primaria en Salud: componente poblacional nominal, gestión técnica y financiero.",
    level: "Personas, familias y comunidad",
    access: "Requiere usuario institucional para datos nominales",
    status: "Pendiente: exporte anónimo 2020-2026",
    tags: ["APS", "Nominal", "Territorio"]
  },
  {
    name: "SIVIGILA / INS",
    use: "Eventos de interés en salud pública: intento de suicidio, violencias y otros eventos vigilados.",
    level: "Evento, semana epidemiológica y territorio",
    access: "Reportes públicos y gestión territorial",
    status: "Pendiente: reporte agregado 2020-2026",
    tags: ["Vigilancia", "Alertas", "Eventos"]
  },
  {
    name: "SIHO",
    use: "Gestión hospitalaria de la ESE Hospital Local de Concordia: producción, atenciones, capacidad, finanzas y administración.",
    level: "Única IPS/ESE municipal validada",
    access: "Público e institucional según consulta",
    status: "Pendiente: cruce con ESE Hospital Local de Concordia",
    tags: ["ESE", "Producción", "Gestión"]
  },
  {
    name: "REPS / RETHUS",
    use: "Validación de servicios habilitados y talento humano disponible en la ESE Hospital Local de Concordia.",
    level: "Prestador local de referencia",
    access: "Consulta pública",
    status: "Validar contra REPS: una IPS local reportada por el municipio",
    tags: ["Oferta", "Servicios", "Red"]
  },
  {
    name: "Secretaría Departamental",
    use: "ASIS, PIC, vigilancia departamental, red de prestación, reportes de salud pública y planes territoriales.",
    level: "Magdalena y municipios",
    access: "Solicitud formal o datos abiertos disponibles",
    status: "Pendiente: datos departamentales 2020-2026",
    tags: ["ASIS", "PIC", "Departamento"]
  },
  {
    name: "ICBF",
    use: "Restablecimiento de derechos, violencia contra niñas, niños y adolescentes, protección familiar, abandono, maltrato y riesgo psicosocial.",
    level: "Niñez, adolescencia y familia",
    access: "Datos agregados por solicitud institucional",
    status: "Pendiente: solo agregado/anonimizado",
    tags: ["Niñez", "Protección", "Familia"]
  },
  {
    name: "Comisaría de Familia",
    use: "Violencia intrafamiliar, medidas de protección, conflictos familiares, violencia basada en género y casos con afectación emocional.",
    level: "Familia, caso y territorio",
    access: "Datos agregados y anonimizados",
    status: "Pendiente: solo agregado/anonimizado",
    tags: ["Violencia", "Medidas", "Familia"]
  },
  {
    name: "Secretaría Municipal",
    use: "PIC, programas sociales, educación, adulto mayor, juventud, discapacidad, comunidad rural y rutas locales de atención.",
    level: "Municipio, corregimiento y vereda",
    access: "Gestión municipal directa",
    status: "Pendiente: programas 2020-2026",
    tags: ["PIC", "Programas", "Rutas"]
  },
  {
    name: "Policía Nacional",
    use: "Llamadas, reportes y casos asociados a convivencia, violencia, lesiones, consumo, riñas, riesgo suicida y activación de rutas.",
    level: "Evento, zona y convivencia",
    access: "Reporte agregado por coordinación institucional",
    status: "Pendiente: reporte agregado 2020-2026",
    tags: ["Convivencia", "Alertas", "Seguridad"]
  }
];

function byFilters(record) {
  const zoneOk = zoneFilter.value === "all" || record.zona === zoneFilter.value;
  const serviceOk = serviceFilter.value === "all" || record.servicio === serviceFilter.value;
  const riskOk = riskFilter.value === "all" || record.riesgo === riskFilter.value;
  const age = Number(record.edad);
  let ageOk = true;

  if (ageFilter.value === "0-17") ageOk = age <= 17;
  if (ageFilter.value === "18-28") ageOk = age >= 18 && age <= 28;
  if (ageFilter.value === "29-59") ageOk = age >= 29 && age <= 59;
  if (ageFilter.value === "60+") ageOk = age >= 60;

  return zoneOk && serviceOk && riskOk && ageOk;
}

function filteredCases() {
  return cases.filter(byFilters);
}

function setOptions(select, values) {
  const current = select.value;
  const first = select.querySelector("option").outerHTML;
  select.innerHTML = first + values.map((value) => `<option value="${value}">${value}</option>`).join("");
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function setupFilters() {
  setOptions(zoneFilter, [...new Set(cases.map((item) => item.zona))].sort());
  setOptions(serviceFilter, [...new Set(cases.map((item) => item.servicio))].sort());
}

function countBy(records, keyGetter) {
  return records.reduce((acc, record) => {
    const key = keyGetter(record);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function monthName(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("es-CO", { month: "short" }).replace(".", "");
}

function renderMetrics(records) {
  const cards = document.querySelectorAll(".metric-card");
  if (!records.length) {
    cards[0].querySelector("span").textContent = "Población total";
    cards[0].querySelector("small").textContent = "Proyección municipal SISPRO/DANE 2023";
    cards[1].querySelector("span").textContent = "Población rural";
    cards[1].querySelector("small").textContent = "Resto municipal 2023";
    cards[2].querySelector("span").textContent = "IPS local";
    cards[2].querySelector("small").textContent = municipalProfile.ipsReferencia;
    cards[3].querySelector("span").textContent = "Afiliación";
    cards[3].querySelector("small").textContent = "Total afiliados 2023";
    document.querySelector("#totalCases").textContent = formatNumber(municipalProfile.poblacion2023);
    document.querySelector("#highRisk").textContent = formatNumber(municipalProfile.resto2023);
    document.querySelector("#activeZones").textContent = formatNumber(municipalProfile.ipsLocalValidada);
    document.querySelector("#ruralShare").textContent = formatNumber(municipalProfile.totalAfiliados2023);
    return;
  }

  cards[0].querySelector("span").textContent = "Atenciones revisadas";
  cards[0].querySelector("small").textContent = "Registros anónimos 2020-2026";
  cards[1].querySelector("span").textContent = "Riesgo alto";
  cards[1].querySelector("small").textContent = "Priorizan seguimiento humano";
  cards[2].querySelector("span").textContent = "Zonas reportadas";
  cards[2].querySelector("small").textContent = "Cabecera, corregimientos y veredas";
  cards[3].querySelector("span").textContent = "Barrera rural";
  cards[3].querySelector("small").textContent = "Registros fuera de cabecera";
  const zones = new Set(records.map((item) => item.zona));
  const rural = records.filter((item) => item.zona !== "Cabecera municipal").length;
  document.querySelector("#totalCases").textContent = formatNumber(records.length);
  document.querySelector("#highRisk").textContent = formatNumber(records.filter((item) => item.riesgo === "Alto").length);
  document.querySelector("#activeZones").textContent = formatNumber(zones.size);
  document.querySelector("#ruralShare").textContent = records.length ? `${Math.round((rural / records.length) * 100)}%` : "0%";
}

function renderMonthChart(records) {
  if (!records.length) {
    const entries = [
      ["Cabecera", municipalProfile.cabecera2023],
      ["Rural", municipalProfile.resto2023],
      ["Hombres", municipalProfile.hombres2023],
      ["Mujeres", municipalProfile.mujeres2023]
    ];
    const max = Math.max(...entries.map((entry) => entry[1]));
    document.querySelector("#monthChart").innerHTML = entries.map(([label, value]) => `
      <div class="bar-row">
        <strong>${label}</strong>
        <div class="bar-track"><div class="bar-fill" style="width:${(value / max) * 100}%"></div></div>
        <span>${formatNumber(value)}</span>
      </div>
    `).join("");
    return;
  }

  const monthly = countBy(records, (item) => monthName(item.fecha));
  const order = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];
  const entries = order.filter((month) => monthly[month]).map((month) => [month, monthly[month]]);
  const max = Math.max(1, ...entries.map((entry) => entry[1]));
  document.querySelector("#monthChart").innerHTML = entries.length
    ? entries.map(([month, value]) => `
      <div class="bar-row">
        <strong>${month}</strong>
        <div class="bar-track"><div class="bar-fill" style="width:${(value / max) * 100}%"></div></div>
        <span>${value}</span>
      </div>
    `).join("")
    : `<p>No hay registros con estos filtros.</p>`;
}

function renderRiskDonut(records) {
  if (!records.length) {
    const counts = {
      "Subsidiado": municipalProfile.afiliadosSubsidiado2023,
      "Contributivo": municipalProfile.afiliadosContributivo2023,
      "Otros": municipalProfile.afiliadosExcepcion2023 + municipalProfile.afiliadosIndeterminado2023
    };
    const total = Math.max(1, Object.values(counts).reduce((sum, value) => sum + value, 0));
    const sub = (counts.Subsidiado / total) * 100;
    const con = (counts.Contributivo / total) * 100;
    const otros = (counts.Otros / total) * 100;
    document.querySelector("#riskDonut").style.background = `conic-gradient(
      ${riskColors.Alto} 0 ${sub}%,
      ${riskColors.Medio} ${sub}% ${sub + con}%,
      ${riskColors.Bajo} ${sub + con}% ${sub + con + otros}%
    )`;
    document.querySelector("#riskLegend").innerHTML = Object.entries(counts).map(([name, value], index) => {
      const color = [riskColors.Alto, riskColors.Medio, riskColors.Bajo][index];
      return `<div class="legend-item"><span><i class="dot" style="background:${color}"></i>${name}</span><strong>${formatNumber(value)}</strong></div>`;
    }).join("");
    return;
  }

  const counts = countBy(records, (item) => item.riesgo);
  const total = Math.max(1, records.length);
  const alto = ((counts.Alto || 0) / total) * 100;
  const medio = ((counts.Medio || 0) / total) * 100;
  const bajo = ((counts.Bajo || 0) / total) * 100;
  document.querySelector("#riskDonut").style.background = `conic-gradient(
    ${riskColors.Alto} 0 ${alto}%,
    ${riskColors.Medio} ${alto}% ${alto + medio}%,
    ${riskColors.Bajo} ${alto + medio}% ${alto + medio + bajo}%
  )`;
  document.querySelector("#riskLegend").innerHTML = ["Alto", "Medio", "Bajo"].map((risk) => `
    <div class="legend-item">
      <span><i class="dot" style="background:${riskColors[risk]}"></i>${risk}</span>
      <strong>${counts[risk] || 0}</strong>
    </div>
  `).join("");
}

function renderDiagnosis(records) {
  if (!records.length) {
    const indicators = [
      ["Población total 2023", municipalProfile.poblacion2023],
      ["Resto rural 2023", municipalProfile.resto2023],
      ["Total afiliados 2023", municipalProfile.totalAfiliados2023],
      ["IPS local validada", municipalProfile.ipsLocalValidada],
      ["Prestador de referencia", municipalProfile.ipsReferencia],
      ["Mortalidad general 2021", municipalProfile.mortalidadGeneral[1].valor]
    ];
    document.querySelector("#diagnosisList").innerHTML = indicators.map(([name, value]) => `
      <div class="rank-item"><span>${name}</span><strong>${formatNumber(value)}</strong></div>
    `).join("");
    return;
  }

  const entries = Object.entries(countBy(records, (item) => item.diagnostico)).sort((a, b) => b[1] - a[1]).slice(0, 6);
  document.querySelector("#diagnosisList").innerHTML = entries.length
    ? entries.map(([name, value]) => `<div class="rank-item"><span>${name}</span><strong>${value}</strong></div>`).join("")
    : `<p>No hay diagnósticos con estos filtros.</p>`;
}

function renderTable(records) {
  if (!records.length) {
    document.querySelector("#caseTable").innerHTML = `
      <tr>
        <td>2023</td>
        <td>Concordia</td>
        <td>-</td>
        <td>SISPRO</td>
        <td>Base pública cargada y validación local: la IPS municipal de referencia es la ESE Hospital Local de Concordia.</td>
        <td><span class="risk-pill risk-Bajo">Oficial</span></td>
      </tr>
    `;
    return;
  }

  document.querySelector("#caseTable").innerHTML = records.slice().reverse().slice(0, 8).map((record) => `
    <tr>
      <td>${record.fecha}</td>
      <td>${record.zona}</td>
      <td>${record.edad}</td>
      <td>${record.servicio}</td>
      <td>${record.diagnostico}</td>
      <td><span class="risk-pill risk-${record.riesgo}">${record.riesgo}</span></td>
    </tr>
  `).join("");
}

function renderTerritory(records) {
  const territoryRecords = records.length ? records : [
    { zona: "Cabecera municipal", riesgo: "Bajo", lat: 10.255, lng: -74.833 },
    { zona: "Resto rural", riesgo: "Medio", lat: 10.24, lng: -74.84 }
  ];
  const zones = Object.entries(countBy(territoryRecords, (item) => item.zona)).sort((a, b) => b[1] - a[1]);
  const positions = {
    "Cabecera municipal": [47, 42],
    Bellavista: [26, 24],
    Rosario: [70, 28],
    Bálsamo: [64, 70]
  };

  document.querySelector("#territoryMap").innerHTML = zones.map(([zone, count], index) => {
    const [x, y] = positions[zone] || [25 + index * 16, 55];
    const high = territoryRecords.filter((item) => item.zona === zone && item.riesgo === "Alto").length;
    const labelCount = records.length ? `${count} registros` : `${zone === "Cabecera municipal" ? formatNumber(municipalProfile.cabecera2023) : formatNumber(municipalProfile.resto2023)} personas`;
    return `
      <div class="map-node" style="left:${x}%;top:${y}%">
        <strong>${zone}</strong>
        <span>${labelCount} · SISPRO 2023</span>
      </div>
    `;
  }).join("");

  document.querySelector("#priorityList").innerHTML = zones.map(([zone, count]) => {
    const high = territoryRecords.filter((item) => item.zona === zone && item.riesgo === "Alto").length;
    const zoneRecords = territoryRecords.filter((item) => item.zona === zone);
    const location = getZoneLocation(zone, zoneRecords);
    const note = zone === "Cabecera municipal"
      ? "Cabecera municipal según ficha territorial SISPRO."
      : "Resto rural: priorizar carga anónima de corregimientos y veredas.";
    return `
      <button class="priority-item" data-map-query="${location.query}">
        <div>
          <strong>${zone}</strong>
          <small>${note}</small>
          <small>${location.label}</small>
        </div>
        <span class="risk-pill ${high ? "risk-Alto" : "risk-Bajo"}">${records.length ? (high ? `${high} alto` : "vigilar") : "SISPRO"}</span>
      </button>
    `;
  }).join("");

  document.querySelectorAll("[data-map-query]").forEach((button) => {
    button.addEventListener("click", () => updateGoogleMap(button.dataset.mapQuery));
  });
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return value ?? "-";
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(number);
}

function getZoneLocation(zone, records) {
  const withCoords = records.find((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)));
  if (withCoords) {
    return {
      query: `${withCoords.lat},${withCoords.lng}`,
      label: `Coordenadas: ${Number(withCoords.lat).toFixed(3)}, ${Number(withCoords.lng).toFixed(3)}`
    };
  }

  const query = `${zone}, Concordia, Magdalena, Colombia`;
  return {
    query,
    label: "Ubicación aproximada por nombre de zona"
  };
}

function updateGoogleMap(query = defaultMapQuery) {
  const encoded = encodeURIComponent(query);
  document.querySelector("#googleMapFrame").src = `https://www.google.com/maps?q=${encoded}&output=embed`;
  document.querySelector("#openGoogleMaps").href = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  document.querySelector("#mapHint").textContent = `Mapa centrado en: ${query}`;
}

function renderReport(records) {
  const total = records.length;
  const high = records.filter((item) => item.riesgo === "Alto").length;
  const topZone = Object.entries(countBy(records, (item) => item.zona)).sort((a, b) => b[1] - a[1])[0];
  const topDx = Object.entries(countBy(records, (item) => item.diagnostico)).sort((a, b) => b[1] - a[1])[0];
  const rural = records.filter((item) => item.zona !== "Cabecera municipal").length;

  document.querySelector("#reportText").innerHTML = `
    <p>Con los filtros actuales se revisan <strong>${total}</strong> registros relacionados con salud mental en Concordia, Magdalena, para el periodo 2020-2026.</p>
    <p>Se identifican <strong>${high}</strong> registros de riesgo alto. La zona con más registros es <strong>${topZone ? topZone[0] : "sin datos"}</strong> y la señal más frecuente es <strong>${topDx ? topDx[0] : "sin datos"}</strong>.</p>
    <p>El <strong>${total ? Math.round((rural / total) * 100) : 0}%</strong> de los registros proviene de zonas fuera de cabecera. Esto debe leerse junto con barreras de transporte, distancia y acceso real a consulta.</p>
    <p>Recomendación inicial: priorizar búsqueda activa y encuesta comunitaria en corregimientos con registros de alto riesgo o con bajo registro en la ESE Hospital Local de Concordia.</p>
  `;
}

function renderSources() {
  document.querySelector("#sourceGrid").innerHTML = officialSources.map((source) => `
    <article class="source-card">
      <strong>${source.name}</strong>
      <span>${source.use}</span>
      <span><strong>Estado:</strong> ${source.status}</span>
      <div class="source-meta">
        ${source.tags.map((tag) => `<span class="source-tag">${tag}</span>`).join("")}
      </div>
    </article>
  `).join("");

  document.querySelector("#sourceTable").innerHTML = officialSources.map((source) => `
    <tr>
      <td>${source.name}</td>
      <td>${source.use}</td>
      <td>${source.level}</td>
      <td>${source.access}. ${source.status}</td>
    </tr>
  `).join("");
}

function renderAll() {
  const records = filteredCases();
  renderMetrics(records);
  renderMonthChart(records);
  renderRiskDonut(records);
  renderDiagnosis(records);
  renderTable(records);
  renderTerritory(records);
  renderReport(records);
  renderSources();
}

function changeView(viewId) {
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",").map((header) => header.trim().toLowerCase());
  const forbidden = ["nombre", "nombres", "apellido", "apellidos", "documento", "cedula", "cédula", "identificacion", "identificación", "telefono", "teléfono", "direccion", "dirección", "historia"];
  const detected = headers.filter((header) => forbidden.some((term) => header.includes(term)));
  if (detected.length) {
    throw new Error(`El archivo trae campos identificables: ${detected.join(", ")}. Carga una versión anónima o agregada.`);
  }

  return lines.map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    const fecha = row.fecha || row.date || row.periodo || "2020-01-01";
    const year = Number(String(fecha).slice(0, 4));
    if (Number.isFinite(year) && (year < minAnonymousYear || year > maxAnonymousYear)) return null;
    return {
      fecha,
      zona: row.zona || row.corregimiento || row.vereda || "Sin zona",
      edad: Number(row.edad || row.age || 0),
      sexo: row.sexo || row.sex || "",
      servicio: row.servicio || row.service || "Sin servicio",
      diagnostico: row.diagnostico || row.diagnóstico || row.dx || "Sin clasificar",
      fuente: row.fuente || row.origen || "Base cargada",
      riesgo: ["Alto", "Medio", "Bajo"].includes(row.riesgo) ? row.riesgo : "Medio",
      lat: row.lat || row.latitud || "",
      lng: row.lng || row.longitud || row.lon || ""
    };
  }).filter(Boolean);
}

document.querySelectorAll("[data-view], [data-view-link]").forEach((button) => {
  button.addEventListener("click", () => changeView(button.dataset.view || button.dataset.viewLink));
});

[zoneFilter, ageFilter, serviceFilter, riskFilter].forEach((filter) => {
  filter.addEventListener("change", renderAll);
});

document.querySelector("#resetData").addEventListener("click", () => {
  cases = [];
  setupFilters();
  renderAll();
  document.querySelector("#uploadStatus").textContent = "Indicadores públicos SISPRO restaurados. Carga archivos anónimos 2020-2026 para complementar esta base.";
});

document.querySelector("#fileInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    cases = parseCsv(text);
    setupFilters();
    renderAll();
    document.querySelector("#uploadStatus").textContent = `Archivo anónimo cargado: ${file.name}. Registros 2020-2026 leídos: ${cases.length}.`;
    changeView("dashboard");
  } catch (error) {
    document.querySelector("#uploadStatus").textContent = error.message;
  }
});

document.querySelector("#surveyForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const score = ["animo", "ansiedad", "sueno", "autolesion"].reduce((sum, key) => sum + Number(form.get(key)), 0) + (2 - Number(form.get("apoyo")));
  const riesgo = score >= 6 ? "Alto" : score >= 3 ? "Medio" : "Bajo";
  const newCase = {
    fecha: new Date().toISOString().slice(0, 10),
    zona: form.get("zona"),
    edad: Number(form.get("edad")),
    sexo: "",
    servicio: "Encuesta comunitaria",
    diagnostico: riesgo === "Alto" ? "Tamizaje comunitario prioritario" : "Tamizaje comunitario",
    riesgo,
    lat: "",
    lng: ""
  };
  cases.push(newCase);
  setupFilters();
  renderAll();
  document.querySelector("#surveyResult").innerHTML = `Respuesta guardada en este prototipo. Resultado orientativo: <strong>${riesgo}</strong>.`;
  event.currentTarget.reset();
});

document.querySelector("#copyReport").addEventListener("click", async () => {
  const text = document.querySelector("#reportText").innerText;
  await navigator.clipboard.writeText(text);
  document.querySelector("#copyReport").textContent = "Resumen copiado";
  setTimeout(() => (document.querySelector("#copyReport").textContent = "Copiar resumen"), 1600);
});

setupFilters();
renderAll();
