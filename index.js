class TodoList {
  constructor(options) {
    const {
      selector,
      storageKey,
      getTasksURL,
      putTask,
      deleteTask,
      createTask
    } = options;

    this.getTasksURL = getTasksURL;
    this.putTask = putTask;
    this.deleteTask = deleteTask;
    this.createTask = createTask;
    this.storageKey = storageKey;
    this.container = document.querySelector(selector);
    this.tasks = [];
    this.init();

    if (storageKey) {
      this.connectToStorage();
    }

    if (getTasksURL) {
      this.getTasksFromURL();
    }
  }

  async getTasksFromURL() {
    const { getTasksURL } = this;

    this.setLoading(true);

    return fetch(getTasksURL)
      .then(response => response.json())
      .then(data => {
        this.setLoading(false);

        return data.map(task => {
          const {title, ...rest} = task; // title = task.title

          return {
            ...rest,
            text: title
          };
        });
      })
      .then(data => {
        const tasksColl = data.map(this.createTaskContainer.bind(this));

        this.tasks = this.tasks.concat(data);
        this.saveToStorage();
        this.container.append.apply(this.container, tasksColl);
      })
      .catch(error => {
        this.setLoading(false);
        console.log(`Error fetching data from ${getTasksURL}: `, error);
      });
  }

  setLoading(loading) {
    this.loading = loading;

    if (loading) {
      const loadingEl = document.createElement('li');

      loadingEl.classList.add('loading');
      loadingEl.innerText = 'loading...';

      this.container.append(loadingEl);
    } else {
      const loadingEl = this.container.querySelector('li.loading');

      if (loadingEl) {
        loadingEl.remove();
      }
    }
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

    if (storageKey) {
      window.localStorage[storageKey] = JSON.stringify(tasks);
    }
  }

  async completeTask(id, e) {
    const task = this.tasks.find(t => t.id === id),
      taskStatusEl = e.target,
      completed = taskStatusEl.checked,
      { putTask } = this;

    if (!task) {
      console.log(`Can't complete uncknown task`, id);
      return ;
    }

    const updatetedTask = {
        ...task,
        completed
      };

    let updateTaskPromise;

    if (putTask) {
      updateTaskPromise = putTask(updatetedTask);
    } else {
      updateTaskPromise = Promise.resolve(updatetedTask);
    }

    return updateTaskPromise
        .then(newTask => {
          const taskIndex = this.tasks.findIndex(t => t.id === newTask.id);

          this.tasks[taskIndex] = newTask;
          taskStatusEl.checked = newTask.completed;
          this.saveToStorage();
        })
        .catch(error => console.log(error));
  }

  // completeTask(id, e) {
  //   const task = this.tasks.find(t => t.id === id),
  //     taskStatusEl = e.target,
  //     completed = taskStatusEl.checked;

  //   if (task) {
  //     task.completed = completed;
  //   }

  //   this.saveToStorage();
  // }

  async removeTask(id, e) {
    const removeBtnEl = e.currentTarget,
      taskContainer = removeBtnEl.closest('.todo__list-item'),
      { deleteTask } = this,
      deleteTaskHandler = deleteTask
        ? deleteTask(id)
        : Promise.resolve();

    deleteTaskHandler
      .then(() => {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveToStorage();
        taskContainer.remove();
      })
      .catch(error => console.error(error));
  }

  // removeTask(id, e) {
  //   const removeBtnEl = e.currentTarget,
  //     taskContainer = removeBtnEl.closest('.todo__list-item');

  //   this.tasks = this.tasks.filter(task => task.id !== id);
  //   this.saveToStorage();
  //   taskContainer.remove();
  // }

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

  async addTask(taskText) {
    const { createTask } = this,
      createTaskPromise = createTask
        ? createTask(taskText)
        : Promise.resolve({
            text: taskText,
            completed: false,
            id: Date.now()
          });

    createTaskPromise
          .then(task => {
            const taskEl = this.createTaskContainer(task);

            this.tasks.push(task);
            this.saveToStorage();
            this.container.append(taskEl);
          })
          .catch(error => console.error(error));
  }

  // addTask(taskText) {
  //   const task = {
  //       text: taskText,
  //       completed: false,
  //       id: Date.now()
  //     },
  //     taskEl = this.createTaskContainer(task);

  //   this.tasks.push(task);
  //   this.saveToStorage();
  //   this.container.append(taskEl);
  // }
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
  }),
  asyncTodo = new TodoList({
    selector: '.async-todo > .todo__list',
    getTasksURL: 'https://jsonplaceholder.typicode.com/todos?userId=1',
    putTask: async function( task ) {
      return fetch(`https://jsonplaceholder.typicode.com/todos/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      }).then(response => response.json());
    },
    deleteTask: async function(id) {
      return fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'DELETE'
      });
    },
    createTask: async function(taskText) {
      return fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: taskText,
          userId: 1
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8'
        }
      })
        .then(response => response.json())
        .then(task => ({
          ...task,
          text: task.title
        }));
    }
  });

// eslint-disable-next-line no-unused-expressions
new AddTodoForm({
  selector: '.async-todo > .todo__add-form',
  submitHandler: function(taskText) {
    asyncTodo.addTask(taskText);
  }
}),

console.log({
  addTodoForm,
  asyncTodo
});

// fetch('https://jsonplaceholder.typicode.com/users')
//   .then(function (response) {
//     return response.json();
//   })
//   .then(function (data) {
//     console.log(data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
