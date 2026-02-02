const logEl = document.getElementById("log");
const tokenEl = document.getElementById("token");
const apiBaseUrlEl = document.getElementById("apiBaseUrl");

const api = {
  get baseUrl() {
    return apiBaseUrlEl.value.replace(/\/$/, "");
  },
  headers() {
    const token = tokenEl.value.trim();
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  },
};

const appendLog = (title, payload) => {
  const stamp = new Date().toLocaleTimeString();
  const message = `[${stamp}] ${title}\n${JSON.stringify(payload, null, 2)}\n`;
  logEl.textContent = `${message}\n${logEl.textContent}`;
};

const parseJsonField = (value) => {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (error) {
    appendLog("JSON parse error", { error: error.message, value });
    return {};
  }
};

document.getElementById("saveBaseUrl").addEventListener("click", () => {
  localStorage.setItem("apiBaseUrl", apiBaseUrlEl.value);
  appendLog("Base URL saved", { baseUrl: apiBaseUrlEl.value });
});

apiBaseUrlEl.value = localStorage.getItem("apiBaseUrl") || apiBaseUrlEl.value;

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const response = await fetch(`${api.baseUrl}/auth/register`, {
    method: "POST",
    headers: api.headers(),
    body: JSON.stringify(data),
  });
  const payload = await response.json();
  if (payload.token) tokenEl.value = payload.token;
  appendLog("Register response", payload);
});

document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const response = await fetch(`${api.baseUrl}/auth/login`, {
    method: "POST",
    headers: api.headers(),
    body: JSON.stringify(data),
  });
  const payload = await response.json();
  if (payload.token) tokenEl.value = payload.token;
  appendLog("Login response", payload);
});

document.getElementById("profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const payload = {
    ...data,
    cgpa: Number(data.cgpa),
    portfolioLinks: data.portfolioLinks
      ? data.portfolioLinks.split(",").map((item) => item.trim())
      : [],
  };
  const response = await fetch(`${api.baseUrl}/students/me`, {
    method: "PUT",
    headers: api.headers(),
    body: JSON.stringify(payload),
  });
  appendLog("Profile saved", await response.json());
});

document.getElementById("loadProfile").addEventListener("click", async () => {
  const response = await fetch(`${api.baseUrl}/students/me`, {
    headers: api.headers(),
  });
  appendLog("Profile loaded", await response.json());
});

document.getElementById("companyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const payload = {
    ...data,
    minCgpa: Number(data.minCgpa),
    allowedBranches: data.allowedBranches.split(",").map((item) => item.trim()),
    applicationStart: new Date(data.applicationStart).toISOString(),
    applicationDeadline: new Date(data.applicationDeadline).toISOString(),
    isPublished: data.isPublished === "on",
  };
  const response = await fetch(`${api.baseUrl}/companies`, {
    method: "POST",
    headers: api.headers(),
    body: JSON.stringify(payload),
  });
  appendLog("Company created", await response.json());
});

document.getElementById("loadCompanies").addEventListener("click", async () => {
  const response = await fetch(`${api.baseUrl}/companies`, {
    headers: api.headers(),
  });
  const companies = await response.json();
  appendLog("Companies loaded", companies);

  const list = document.getElementById("companiesList");
  list.innerHTML = "";
  companies.forEach((company) => {
    const item = document.createElement("li");
    item.textContent = `${company.name} (${company.id})`;
    list.appendChild(item);
  });
});

document.getElementById("fieldForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const payload = {
    ...data,
    options: data.options
      ? data.options.split(",").map((item) => item.trim())
      : [],
    displayOrder: Number(data.displayOrder),
    required: data.required === "on",
  };
  const response = await fetch(
    `${api.baseUrl}/companies/${data.companyId}/fields`,
    {
      method: "POST",
      headers: api.headers(),
      body: JSON.stringify(payload),
    }
  );
  appendLog("Dynamic field created", await response.json());
});

document
  .getElementById("eligibilityForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const response = await fetch(
      `${api.baseUrl}/companies/${data.companyId}/eligibility`,
      { headers: api.headers() }
    );
    appendLog("Eligibility result", await response.json());
  });

document.getElementById("applyForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target).entries());
  const payload = {
    responses: parseJsonField(data.responses),
    fileUrls: parseJsonField(data.fileUrls),
  };
  const response = await fetch(
    `${api.baseUrl}/companies/${data.companyId}/apply`,
    {
      method: "POST",
      headers: api.headers(),
      body: JSON.stringify(payload),
    }
  );
  appendLog("Application submitted", await response.json());
});

document
  .getElementById("exportCsvForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const url = `${api.baseUrl}/exports/companies/${data.companyId}/applications/csv`;
    window.open(url, "_blank");
  });

document
  .getElementById("exportSheetsForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    const response = await fetch(
      `${api.baseUrl}/exports/companies/${data.companyId}/applications/sheets`,
      { headers: api.headers() }
    );
    appendLog("Sheets payload", await response.json());
  });
