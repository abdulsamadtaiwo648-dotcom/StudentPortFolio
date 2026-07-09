/* ===================================================
   planner.js – Academic Planner Task Management
   COS 106 Term Project | Abdulsamad Taiwo
   ===================================================
   Demonstrates:
   ✓ Arrays and functions
   ✓ Event handling
   ✓ DOM manipulation
   ✓ Dynamic content updates
   ✓ Interactive task management system
   ✓ localStorage persistence
   =================================================== */

// ── Task array (loaded from localStorage) ──
var tasks = [];
var currentFilter = 'all';

// ── Load tasks from localStorage ──
function loadTasks() {
  try {
    var stored = localStorage.getItem('at_planner_tasks');
    if (stored) {
      tasks = JSON.parse(stored);
    }
  } catch (e) {
    tasks = [];
  }
}

// ── Save tasks to localStorage ──
function saveTasks() {
  try {
    localStorage.setItem('at_planner_tasks', JSON.stringify(tasks));
  } catch (e) { /* Storage unavailable */ }
}

// ── Generate a unique ID ──
function generateId() {
  return 'task_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

// ── Format a date string for display ──
function formatDate(dateStr) {
  if (!dateStr) return '';
  var parts = dateStr.split('-');
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
}

// ── Check if a task is overdue ──
function isOverdue(dateStr, completed) {
  if (!dateStr || completed) return false;
  var today = new Date();
  today.setHours(0,0,0,0);
  var due = new Date(dateStr);
  return due < today;
}

// ── Add a new task ──
function addTask(title, dueDate, priority, note) {
  var task = {
    id:        generateId(),
    title:     title,
    dueDate:   dueDate,
    priority:  priority,
    note:      note,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(task); // add to beginning of array
  saveTasks();
  renderTasks();
  updateStats();
}

// ── Toggle task completion ──
function toggleTask(id) {
  tasks = tasks.map(function(task) {
    if (task.id === id) {
      return Object.assign({}, task, { completed: !task.completed });
    }
    return task;
  });
  saveTasks();
  renderTasks();
  updateStats();
}

// ── Delete a task ──
function deleteTask(id) {
  tasks = tasks.filter(function(task) {
    return task.id !== id;
  });
  saveTasks();
  renderTasks();
  updateStats();
}

// ── Clear all tasks ──
function clearAllTasks() {
  if (!confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) return;
  tasks = [];
  saveTasks();
  renderTasks();
  updateStats();
}

// ── Filter tasks based on current filter ──
function getFilteredTasks() {
  return tasks.filter(function(task) {
    switch (currentFilter) {
      case 'pending':   return !task.completed;
      case 'completed': return  task.completed;
      case 'high':      return  task.priority === 'high' && !task.completed;
      default:          return  true;
    }
  });
}

// ── Create a task DOM element ──
function createTaskElement(task) {
  var item = document.createElement('div');
  item.className = 'task-item' + (task.completed ? ' completed' : '');
  item.setAttribute('data-id', task.id);

  var overdueHtml = '';
  if (isOverdue(task.dueDate, task.completed)) {
    overdueHtml = '<span style="color:var(--danger); font-size:0.72rem; font-weight:600;">⚠ Overdue</span>';
  }

  var dueDateHtml = '';
  if (task.dueDate) {
    dueDateHtml = `<span class="task-due">
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      ${formatDate(task.dueDate)}
    </span>`;
  }

  var noteHtml = '';
  if (task.note && task.note.trim()) {
    noteHtml = `<p style="font-size:0.78rem; color:var(--text-muted); margin-top:6px; font-style:italic;">${escapeHtml(task.note)}</p>`;
  }

  item.innerHTML = `
    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
         role="button"
         tabindex="0"
         aria-label="${task.completed ? 'Mark incomplete' : 'Mark complete'}"
         data-action="toggle"
         data-id="${task.id}">
    </div>
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-meta">
        ${dueDateHtml}
        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
        ${overdueHtml}
      </div>
      ${noteHtml}
    </div>
    <button class="task-delete"
            aria-label="Delete task"
            data-action="delete"
            data-id="${task.id}"
            title="Delete task">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  `;

  return item;
}

// ── Escape HTML to prevent XSS ──
function escapeHtml(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ── Render task list to DOM ──
function renderTasks() {
  var list = document.getElementById('taskList');
  var empty = document.getElementById('taskEmpty');
  var clearWrapper = document.getElementById('clearAllWrapper');

  if (!list) return;

  var filtered = getFilteredTasks();

  // Clear current list
  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.style.display = 'block';
    if (clearWrapper) clearWrapper.style.display = 'none';
  } else {
    empty.style.display = 'none';
    if (clearWrapper) clearWrapper.style.display = tasks.length > 0 ? 'block' : 'none';

    filtered.forEach(function(task) {
      var el = createTaskElement(task);
      list.appendChild(el);
    });
  }
}

// ── Update statistics display ──
function updateStats() {
  var total     = tasks.length;
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var pending   = total - completed;
  var pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

  var statTotal   = document.getElementById('statTotal');
  var statPending = document.getElementById('statPending');
  var statDone    = document.getElementById('statDone');
  var progressFill= document.getElementById('progressFill');
  var progressText= document.getElementById('progressText');

  if (statTotal)    statTotal.textContent   = total;
  if (statPending)  statPending.textContent  = pending;
  if (statDone)     statDone.textContent     = completed;
  if (progressFill) progressFill.style.width = pct + '%';
  if (progressText) progressText.textContent  = completed + ' of ' + total + ' tasks completed';
}

// ── Form validation ──
function validateTaskForm() {
  var title = document.getElementById('taskTitle').value.trim();
  var due   = document.getElementById('taskDue').value;
  var valid = true;

  var titleError = document.getElementById('titleError');
  var dueError   = document.getElementById('dueError');

  // Reset errors
  titleError.classList.remove('visible');
  dueError.classList.remove('visible');
  document.getElementById('taskTitle').style.borderColor = '';
  document.getElementById('taskDue').style.borderColor   = '';

  if (!title) {
    titleError.classList.add('visible');
    document.getElementById('taskTitle').style.borderColor = 'var(--danger)';
    valid = false;
  }

  if (!due) {
    dueError.classList.add('visible');
    document.getElementById('taskDue').style.borderColor = 'var(--danger)';
    valid = false;
  }

  return valid;
}

// ── Event Delegation for task actions ──
function initTaskListEvents() {
  var list = document.getElementById('taskList');
  if (!list) return;

  list.addEventListener('click', function(e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;

    var action = target.dataset.action;
    var id     = target.dataset.id;

    if (action === 'toggle') toggleTask(id);
    if (action === 'delete') deleteTask(id);
  });

  list.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var target = e.target.closest('[data-action="toggle"]');
    if (target) {
      e.preventDefault();
      toggleTask(target.dataset.id);
    }
  });
}

// ── Filter button events ──
function initFilterEvents() {
  var filterBtns = document.querySelectorAll('#taskFilters .filter-btn');
  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      currentFilter = this.dataset.filter;
      renderTasks();
    });
  });
}

// ── Form submit event ──
function initFormEvents() {
  var form = document.getElementById('taskForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validateTaskForm()) return;

    var title    = document.getElementById('taskTitle').value.trim();
    var dueDate  = document.getElementById('taskDue').value;
    var priority = document.getElementById('taskPriority').value;
    var note     = document.getElementById('taskNote').value.trim();

    addTask(title, dueDate, priority, note);

    // Reset form
    form.reset();
    document.getElementById('taskTitle').style.borderColor = '';
    document.getElementById('taskDue').style.borderColor   = '';

    // Brief success flash on button
    var btn = document.getElementById('addTaskBtn');
    btn.textContent = '✓ Task Added!';
    btn.style.background = 'var(--success)';
    setTimeout(function() {
      btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg> Add Task`;
      btn.style.background = '';
    }, 1500);
  });
}

// ── Clear all event ──
function initClearAll() {
  var btn = document.getElementById('clearAllBtn');
  if (!btn) return;
  btn.addEventListener('click', clearAllTasks);
}

// ── Set today as default date ──
function setDefaultDate() {
  var duePicker = document.getElementById('taskDue');
  if (!duePicker) return;
  var today = new Date();
  var yyyy  = today.getFullYear();
  var mm    = String(today.getMonth() + 1).padStart(2, '0');
  var dd    = String(today.getDate()).padStart(2, '0');
  duePicker.min   = yyyy + '-' + mm + '-' + dd;
  duePicker.value = yyyy + '-' + mm + '-' + dd;
}

// ── Initialise planner ──
(function init() {
  loadTasks();
  setDefaultDate();
  renderTasks();
  updateStats();
  initFormEvents();
  initTaskListEvents();
  initFilterEvents();
  initClearAll();

  // Seed with sample tasks if empty (first visit)
  if (tasks.length === 0) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var tStr = tomorrow.toISOString().split('T')[0];

    var nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    var nStr = nextWeek.toISOString().split('T')[0];

    addTask('Complete COS 106 Term Project', tStr, 'high', 'Submit HTML, CSS, JS portfolio website');
    addTask('Study for Software Engineering exam', nStr, 'medium', 'Review data structures and algorithms');
    addTask('Read Golang documentation chapter 4', nStr, 'low', 'Goroutines and channels');
  }
})();
