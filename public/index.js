class TodoList {
  constructor(options) {
    const {selector} = options;

    this.container = document.querySelector(selector);
    this.init();
  }

  init() {
    const {container} = this,
      tasksCollection = container.querySelectorAll('.todo__list-item');

    console.log(tasksCollection);
    tasksCollection.forEach(function(taskContainer) {
      const taskStatusEl = taskContainer.querySelector('.todo__list-item-status'),
        taskTextEl = taskContainer.querySelector('.todo__list-item-text'),
        task = {
          completed: taskStatusEl.checked,
          text: taskTextEl.innerText,
          id: Date.now()
        };

      console.log(task);
    });
  }
}

const todoList = new TodoList({
  selector: '.todo__list'
});

console.log(todoList);
