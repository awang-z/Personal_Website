/**
 * Simple in-memory assignment tracker.
 * Data is not stored permanently; refreshing the page will clear it.
 */

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

function computeStatus(assignment) {
  if (assignment.blocked) return "blocked";

  const today = new Date();
  const due = new Date(assignment.dueDate);
  // Clear time for reliable comparison
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) return "late";
  return "meet";
}

function computeDaysDiff(assignment) {
  const today = new Date();
  const due = new Date(assignment.dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffMs = due - today;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
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
    const days = computeDaysDiff(assignment);

    const tr = document.createElement("tr");

    // Status cell
    const statusTd = document.createElement("td");
    const dot = document.createElement("span");
    dot.className = "status-dot " + (status === "meet" ? "meet" : status === "late" ? "late" : "blocked");

    const label = document.createElement("span");
    label.className = "status-label";
    label.textContent = status === "meet" ? "On Track" : status === "late" ? "Late" : "Blocked";

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
    dueTd.textContent = assignment.dueDate;
    tr.appendChild(dueTd);

    // Days difference
    const daysTd = document.createElement("td");
    const daysSpan = document.createElement("span");
    if (days > 0) {
      daysSpan.className = "days-positive";
      daysSpan.textContent = days + " days left";
    } else if (days === 0) {
      daysSpan.className = "days-zero";
      daysSpan.textContent = "Due today";
    } else {
      daysSpan.className = "days-negative";
      daysSpan.textContent = Math.abs(days) + " days late";
    }
    daysTd.appendChild(daysSpan);
    tr.appendChild(daysTd);

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
  const blocked = document.getElementById("blocked").checked;
  const editId = document.getElementById("editId").value;

  if (!name || !dueDate) {
    return;
  }

  if (editId) {
    // Update existing
    const idx = assignments.findIndex((a) => a.id === Number(editId));
    if (idx !== -1) {
      assignments[idx] = {
        ...assignments[idx],
        name,
        project,
        dueDate,
        blocked,
      };
    }
  } else {
    // Create new
    const newAssignment = {
      id: Date.now(),
      name,
      project,
      dueDate,
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
