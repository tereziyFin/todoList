//чтобы наш глобальные перменные не были дсотупны, можно весь кодус обернуть в функцию, которую мы сразу же и вызываем

// Globals
const todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo');
const form = document.querySelector('form'); //форма у на содна => можем 
let users = [];
let todos = [];

// Attach event
document.addEventListener('DOMContentLoaded', initApp); //когда вся страница прогрузилась
form.addEventListener('submit', handleSubmit);

// Basic logic (add smth on screen)
function addTodo({id, userId, title, completed}){
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b> </span>`; // <i> курсив, <b> жирьний
    
    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('change', handleTodoChange);

    const close = document.createElement('span');
    close.innerHTML = '&times;'; //спец символ, преобразующийся в крестик, посему и треба innerHTML, а не innerText
    close.className = 'close';
    close.addEventListener('click', handleClose);

    li.prepend(status);
    li.append(close);
    
    todoList.prepend(li);
}

function createUserOption(user){
    const option = document.createElement('option');
    option.value = user.id;
    option.innerText = user.name;

    userSelect.append(option);
}

function getUserName(userId){
    const user = users.find(u => u.id === userId); //здесь строгое, посему ниже изменяем строку на числ
    return user.name;
}

function removeTodo(todoId){
    todos = todos.filter(todo => todo.id !== todoId);

    const todo = todoList.querySelector(`[data-id="${todoId}"]`);
    todo.querySelector('input').removeEventListener('change', handleTodoChange);
    todo.querySelector('.close').removeEventListener('click', handleClose);

    todo.remove();

}

function alertError(error){
    alert(error.message);
}

// Event logic
function initApp(){
    Promise.all([getAllTodos(), getAllUsers()]).then(values =>{
        [todos, users] = values;
        //отобразить на экранидзе
        todos.forEach(el => addTodo(el));
        users.forEach(user => createUserOption(user));
    });
}

function handleSubmit(event){
    event.preventDefault(); //чтобы форма не отправилась синхронно с перезагрузкой стр
    //console.log(form.todo); //выведиц конкретный селектор
    //console.log(form.user.value); //значение селектора
    addTodo({
        userId: Number(form.user.value), //тк в бдшке це числа, а у нас строка
        title: form.todo.value,
        completed: false,
    });
}

function handleTodoChange(){
    const todoId = this.parentElement.dataset.id;
    const completed = this.checked;

    toggleTodoComplete(todoId, completed);
}

function handleClose(){
    const todoId = this.parentElement.dataset.id;
    deleteTodo(todoId);
}


// Async logic
async function getAllTodos(){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=15'); //сервис позволяет сделать так ?_limit=15
    const data = await response.json();
    return data;
    } catch (error) {
        alertError(error);
    }
    
}

async function getAllUsers(){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();
    return data;
    } catch (error) {
        alertError(error);
    }
    
}

async function createTodo(todo){
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify(todo),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const newTodo = await response.json();
    addTodo(newTodo);
    } catch (error) {
        alertError(error);
    }
    
}

async function toggleTodoComplete(todoId, completed){
    try {
        const response = await fetch (`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: 'PATCH',
        body: JSON.stringify({completed: completed}), //можн прост:
        //body: JSON.stringify({completed}), тк js поймет, що це completed со знач completed
        headers: {
            'Content-Type': 'application/json'
        }
    }); 
    if (!response.ok){
        throw new Error('Failed to connect with server, try later...');
    }
    } catch (error) {
        alertError(error);
    }
    

}

async function deleteTodo(todoId){
    try {
        const response = await fetch (`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }); 
    if (response.ok){
        removeTodo(todoId);
    }
    else{
        throw new Error('Failed to connect with server, try later...');
    }
    } catch (error) {
        alertError(error);
    }
    
}
