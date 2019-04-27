class TodoList {
  constructor(options) {
    const {
      selector,
      storageKey
    } = options;

    this.storageKey = storageKey;
    this.container = document.querySelector(selector);
    this.tasks = [];
    this.init();
    this.connectToStorage();
  }

  init() {
    const {
      container,
      tasks
      } = this,
      tasksCollection = container.querySelectorAll('.todo__list-item');

    tasksCollection.forEach((taskContainer, idx) => {
      const taskStatusEl = taskContainer.querySelector('.todo__list-item-status'),
        taskTextEl = taskContainer.querySelector('.todo__list-item-text'),
        removeBtnEl = taskContainer.querySelector('.todo__list-item-remove'),
        task = {
          completed: taskStatusEl.checked,
          text: taskTextEl.innerText,
          id: `${idx}-${Date.now()}`
        };

      taskStatusEl.addEventListener('change', this.completeTask.bind(this, task.id));
      removeBtnEl.addEventListener('click', this.removeTask.bind(this, task.id));

      tasks.push(task);
    });
  }

  connectToStorage() {
    const {
        storageKey,
        tasks
      } = this;

    try {
      const storageTasks = JSON.parse(window.localStorage[storageKey]);

      if (Array.isArray(storageTasks)) {
        const tasksToAdd = storageTasks.filter(task => {
            const correct = 'completed' in task && !!task.text && 'id' in task,
              inMarkup = tasks.find(t => t.text === task.text);

            if (inMarkup && inMarkup.completed !== task.completed) {
              const markupIndex = tasks.findIndex(t => t === inMarkup),
                tasksCollection = this.container.querySelectorAll('.todo__list-item');

              tasksCollection[markupIndex].querySelector('.todo__list-item-status').checked = task.completed;
              inMarkup.completed = task.completed;
            }

            return correct && !inMarkup;
          });

        tasks.push.apply(tasks, tasksToAdd);
        this.saveToStorage();
        this.container.append.apply(this.container, tasksToAdd.map(this.createTaskContainer.bind(this)));
      }
    } catch(ex) {
      console.warn('Error', ex);
    }
  }

  saveToStorage() {
    const {
        storageKey,
        tasks
      } = this;

    window.localStorage[storageKey] = JSON.stringify(tasks);
  }

  completeTask(id, e) {
    // const task = this.tasks.find(function(t) {
    //   return t.id === id
    // });
    const task = this.tasks.find(t => t.id === id),
      taskStatusEl = e.target,
      completed = taskStatusEl.checked;

    if (task) {
      task.completed = completed;
    }

    this.saveToStorage();
  }

  removeTask(id, e) {
    const removeBtnEl = e.currentTarget,
      taskContainer = removeBtnEl.closest('.todo__list-item');

    this.tasks = this.tasks.filter(task => task.id !== id);
    this.saveToStorage();
    taskContainer.remove();
  }

  createTaskContainer(task) {
    const container = document.createElement('li'),
      labelEl = document.createElement('label'),
      removeBtnEl = document.createElement('button'),
      taskStatusEl = document.createElement('input'),
      taskTextEl = document.createElement('span');

    container.classList.add('todo__list-item');

    labelEl.classList.add('todo__list-item-task');

    taskStatusEl.classList.add('todo__list-item-status');
    taskStatusEl.setAttribute('type', 'checkbox');
    taskStatusEl.checked = task.completed;

    taskTextEl.classList.add('todo__list-item-text');
    taskTextEl.innerText = task.text;

    removeBtnEl.classList.add('todo__list-item-remove');
    removeBtnEl.innerText = 'Del';

    labelEl.append(taskStatusEl, taskTextEl);
    container.append(labelEl, removeBtnEl);

    taskStatusEl.addEventListener('change', this.completeTask.bind(this, task.id));
    removeBtnEl.addEventListener('click', this.removeTask.bind(this, task.id));

    return container;
  }

  addTask(taskText) {
    const task = {
        text: taskText,
        completed: false,
        id: Date.now()
      },
      taskEl = this.createTaskContainer(task);

    this.tasks.push(task);
    this.saveToStorage();
    this.container.append(taskEl);
  }
}

class AddTodoForm {
  constructor({
      selector,
      submitHandler
    }) {
    this.submitHandler = submitHandler;
    this.container = document.querySelector(selector);

    this.init();
  }

  init() {
    const {container} = this,
      taskInputEl = container.querySelector('[name="task"]');

    this.taskInputEl = taskInputEl;

    container.addEventListener('submit', this.addTask.bind(this));
  }

  addTask(evt) {
    evt.preventDefault();

    const taskText = this.taskInputEl.value;

    if (this.submitHandler) {
      this.submitHandler(taskText);
    }

    this.container.reset();
  }
}

const todoList = new TodoList({
    selector: '.todo__list',
    storageKey: 'todo'
  }),
  addTodoForm = new AddTodoForm({
    selector: '.todo__add-form',
    submitHandler: function(taskText) {
      todoList.addTask(taskText);
    }
  });

console.log({
  todoList,
  addTodoForm
});
