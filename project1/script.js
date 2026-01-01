// Assignment tracker with completed date support (in-memory only).

const assignmentForm = document.getElementById("assignmentForm");
const assignmentsBody = document.getElementById("assignmentsBody");
const emptyState = document.getElementById("emptyState");

const saveButton = document.getElementById("saveButton");
const resetButton = document.getElementById("resetButton");

const filterAllBtn = document.getElementById("filterAll");
const filterMeetBtn = document.getElementById("filterMeet");
const filterLateBtn = document.getElementById("filterLate");
const filterBlockedBtn = document.getElementById("filterBlocked");

let assignments = [];
let currentFilter = "all";

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeStatus(assignment) {
  if (assignment.blocked) return "blocked";

  const due = parseDate(assignment.dueDate);
  const completed = parseDate(assignment.completedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!due) return "meet"; // fallback

  if (completed) {
    // Completed vs due date
    if (completed <= due) return "meet";  // completed on time
    return "late";                        // completed late
  } else {
    // Not completed yet: compare due vs today
    if (due < today) return "late";       // overdue
    return "meet";                        // on track
  }
}

function computeSummary(assignment) {
  const due = parseDate(assignment.dueDate);
  const completed = parseDate(assignment.completedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!due) return { text: "", cssClass: "" };

  if (assignment.blocked) {
    return { text: "Blocked", cssClass: "summary-overdue" };
  }

  if (completed) {
    const diffDays = Math.round((completed - due) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return {
        text: `Completed ${Math.abs(diffDays)} day(s) early`,
        cssClass: "summary-on-time",
      };
    } else if (diffDays === 0) {
      return {
        text: "Completed on due date",
        cssClass: "summary-on-time",
      };
    } else {
      return {
        text: `Completed ${diffDays} day(s) late`,
        cssClass: "summary-late",
      };
    }
  } else {
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return {
        text: `${diffDays} day(s) left`,
        cssClass: "summary-upcoming",
      };
    } else if (diffDays === 0) {
      return {
        text: "Due today",
        cssClass: "summary-overdue",
      };
    } else {
      return {
        text: `${Math.abs(diffDays)} day(s) overdue`,
        cssClass: "summary-overdue",
      };
    }
  }
}

function renderAssignments() {
  assignmentsBody.innerHTML = "";

  let visibleAssignments = assignments;
  if (currentFilter !== "all") {
    visibleAssignments = assignments.filter((a) => computeStatus(a) === currentFilter);
  }

  if (visibleAssignments.length === 0) {
    emptyState.style.display = "block";
    return;
  } else {
    emptyState.style.display = "none";
  }

  visibleAssignments.forEach((assignment) => {
    const status = computeStatus(assignment);
    const { text: summaryText, cssClass: summaryClass } = computeSummary(assignment);

    const tr = document.createElement("tr");

    // Status cell
    const statusTd = document.createElement("td");
    const dot = document.createElement("span");
    dot.className =
      "status-dot " + (status === "meet" ? "meet" : status === "late" ? "late" : "blocked");

    const label = document.createElement("span");
    label.className = "status-label";
    if (status === "blocked") {
      label.textContent = "Blocked";
    } else if (status === "late") {
      label.textContent = assignment.completedDate ? "Completed Late" : "Late";
    } else {
      label.textContent = assignment.completedDate ? "Completed On Time" : "On Track";
    }

    statusTd.appendChild(dot);
    statusTd.appendChild(label);
    tr.appendChild(statusTd);

    // Assignment name
    const nameTd = document.createElement("td");
    nameTd.className = "assignment-name";
    nameTd.textContent = assignment.name;
    tr.appendChild(nameTd);

    // Project / course
    const projectTd = document.createElement("td");
    projectTd.className = "project-name";
    projectTd.textContent = assignment.project || "—";
    tr.appendChild(projectTd);

    // Due date
    const dueTd = document.createElement("td");
    dueTd.className = "date-text";
    dueTd.textContent = assignment.dueDate || "—";
    tr.appendChild(dueTd);

    // Completed date
    const completedTd = document.createElement("td");
    completedTd.className = "date-text";
    completedTd.textContent = assignment.completedDate || "—";
    tr.appendChild(completedTd);

    // Summary
    const summaryTd = document.createElement("td");
    const summarySpan = document.createElement("span");
    summarySpan.className = "summary-text " + summaryClass;
    summarySpan.textContent = summaryText;
    summaryTd.appendChild(summarySpan);
    tr.appendChild(summaryTd);

    // Actions
    const actionsTd = document.createElement("td");
    actionsTd.className = "actions-cell";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEditAssignment(assignment.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteAssignment(assignment.id));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    assignmentsBody.appendChild(tr);
  });
}

function startEditAssignment(id) {
  const assignment = assignments.find((a) => a.id === id);
  if (!assignment) return;

  document.getElementById("name").value = assignment.name;
  document.getElementById("project").value = assignment.project;
  document.getElementById("dueDate").value = assignment.dueDate;
  document.getElementById("completedDate").value = assignment.completedDate || "";
  document.getElementById("blocked").checked = assignment.blocked;
  document.getElementById("editId").value = assignment.id;

  saveButton.textContent = "Update assignment";
}

function deleteAssignment(id) {
  assignments = assignments.filter((a) => a.id !== id);
  if (document.getElementById("editId").value === String(id)) {
    resetForm();
  }
  renderAssignments();
}

function resetForm() {
  assignmentForm.reset();
  document.getElementById("editId").value = "";
  saveButton.textContent = "Add assignment";
}

assignmentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const project = document.getElementById("project").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const completedDate = document.getElementById("completedDate").value;
  const blocked = document.getElementById("blocked").checked;
  const editId = document.getElementById("editId").value;

  if (!name || !dueDate) {
    return;
  }

  if (editId) {
    const idx = assignments.findIndex((a) => a.id === Number(editId));
    if (idx !== -1) {
      assignments[idx] = {
        ...assignments[idx],
        name,
        project,
        dueDate,
        completedDate,
        blocked,
      };
    }
  } else {
    const newAssignment = {
      id: Date.now(),
      name,
      project,
      dueDate,
      completedDate,
      blocked,
    };
    assignments.push(newAssignment);
  }

  resetForm();
  renderAssignments();
});

resetButton.addEventListener("click", () => {
  resetForm();
});

// Filter buttons
filterAllBtn.addEventListener("click", () => {
  currentFilter = "all";
  renderAssignments();
});

filterMeetBtn.addEventListener("click", () => {
  currentFilter = "meet";
  renderAssignments();
});

filterLateBtn.addEventListener("click", () => {
  currentFilter = "late";
  renderAssignments();
});

filterBlockedBtn.addEventListener("click", () => {
  currentFilter = "blocked";
  renderAssignments();
});

// Initial render
renderAssignments();
