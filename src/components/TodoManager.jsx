import { useState, useEffect, useContext, createContext } from "react";

const Utils = createContext();

const TodoManager = () => {
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem("todos")) || []);

  const todoExist = todoTitle => {
    for (const todo of [...todos]) {
      if (todo.title.toLowerCase() === todoTitle.toLowerCase()) {
        alert("Todo already exits!");
        return true;
      }
    }
    return false;
  };

  const addTodo = title => {
    if (!todoExist(title)) {
      setTodos([...todos, { id: (new Date()).getTime(), title: title, completed: false }]);
    }
  };

  const updateCheckBox = id => {
    setTodos([...todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo)]);
  };

  const editTodo = (id, title) => {
    if (!todoExist(title)) {
      setTodos(prevTodos => prevTodos.map(todo => todo.id === id ? { ...todo, title: title } : todo));
    }
  };

  const delTodo = id => setTodos([...todos.filter(todo => todo.id !== id)]);
  
  const markUnmarkAllTodos = (mark = true) => {
    setTodos([...todos.map(todo => ({...todo, completed: mark}))]);
  };

  const delAllMarkedTodos = (all = true) => {
    setTodos(() => all ? [] : [...todos.filter(todo => !todo.completed)]);
  };

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos]);

  return (
    <Utils.Provider value={[editTodo, updateCheckBox, delTodo]}>
      <div className="w-[85%] max-w-xl flex flex-col justify-center items-center p-3">
        <Header/>
        <Input addTodo={addTodo}/>
        <Todos props={[todos, markUnmarkAllTodos, delAllMarkedTodos]}/>
      </div>
    </Utils.Provider>
  );
};

// Header Component
const Header = () => (
  <div className="flex bg-blue-300 p-3 w-full rounded-t-xl">
    <h1 className="m-auto text-white font-bold text-5xl">TODOS</h1>
  </div>
);

// input Component
const Input = ({ addTodo }) => {
  const [title, setTitle] = useState("");

  const onChange = e => setTitle(e.target.value);
  
  const onSubmit = e => {
    e.preventDefault();
    title.trim() ? addTodo(title) : alert("Error, cannot submit empty form!");
    setTitle("");
  };

  return (
    <form className="p-3 flex justify-center bg-gray-400 w-full drop-shadow-xl shadow-white md:text-base text-[11px]" onSubmit={onSubmit}>
      <input type="text" className="px-2 mr-3 w-2/3 rounded focus:outline-none" name="title" placeholder="Add todo..." value={title} onChange={onChange} maxLength="150" minLength="3"/>
      <input type="submit" className="bg-emerald-300 py-1 px-4 rounded" value="Submit"/>
    </form>
  );
};

// Todos Component
const Todos = ({props: [todos, markUnmarkAllTodos, delAllMarkedTodos]}) => {
  const orderedTodos = todos.sort((a, b) => b.id - a.id).sort((a, b) => a.completed - b.completed);

  const TodoList = orderedTodos.map(todo => <Todo key={todo.id} todo={todo}/>);
  const onClearMarked = () => {
    if(window.confirm("Are you sure to clear marked?")) delAllMarkedTodos(false);
  };

  const onClearAll = () => {
    if(window.confirm("Are you sure to clear all?")) delAllMarkedTodos();
  };

  const NoTodo = (
    <div className="p-3 md:text-base text-[11px]">
      <p className="text-center text-md text-red-500 font-bold">Currently Empty!</p>
      <p className="text-center text-black">
        <span>***</span>
        <small>Add some Todos</small>
        <span>***</span>
      </p>
    </div>
  );

  return (
    <div className="flex flex-col justify-start items-center w-full rounded-b-xl shadow-md bg-gray-200 md:text-base text-[11px]">
      <div className="text-3xl text-center font-bold">
        Todo Lists
      </div>
      <div className="rounded-md w-full">
        {TodoList.length ? TodoList : NoTodo}
      </div>
      <div className="p-3 flex justify-between space-x-1 md:space-x-4 w-auto md:text-base text-[11px]">
        { todos.some(todo => todo.completed) &&
          <button className="rounded-md shadow-md bg-yellow-600 py-1 px-2" onClick={onClearMarked}>Clear Marked</button>
        }
        { (todos.length > 1 && !todos.every(todo => todo.completed)) &&
          <button className="rounded-md shadow-md bg-red-800 py-1 px-2 text-white" onClick={onClearAll}>Clear All</button>
        }
        { (todos.some(todo => todo.completed) && !todos.every(todo => todo.completed)) &&
          <button className="rounded-md shadow-md bg-violet-700 py-1 px-2 text-yellow-200" onClick={() => markUnmarkAllTodos()}>Mark All</button>
        }
        { todos.filter(todo => todo.completed).length > 1 &&
          <button className="rounded-md shadow-md bg-gray-400 py-1 px-2" onClick={() => markUnmarkAllTodos(false)}>Unmark All</button>
        }
      </div>
      <div className="text-center w-[92.5%] py-3 border-t border-gray-300">
        <small className="text-blue-400">&copy; 2022 Aro@Code. All rights reserved.
        </small>
      </div>
    </div>
  );
};

// Todo Component
const Todo = ({ todo }) => {
  const [editTodo, updateCheckBox, delTodo] = useContext(Utils);

  const [editMode, setMode] = useState(false);

  const [title, setTitle] = useState(todo.title);

  const onToggleBox = () => updateCheckBox(todo.id);

  const onChangeEdit = e => setTitle(e.target.value);

  const onClickDel = () => {
    if(window.confirm("Are you sure to delete it?")) delTodo(todo.id);
  };

  const onSubmit = e => {
    e.preventDefault();
    title.trim() ? editTodo(todo.id, title) : alert("Error, cannot submit empty form!");
    setMode(false);
  };

  const onDoubleClickEdit = () => {
    setTitle(todo.title);
    setMode(true);
  };

  const onBlur = () => setTimeout(() => {
    setMode(false);
    setTitle(todo.title);
    }, 100
  );

  const sentenceCase = s => {
    const words = s.split(" "); const word = words[0];
    words[0] = word[0].toUpperCase() + word.slice(1);
    return words.join(" ");
  };

  return (
    <>
      <div className={`p-3 flex items-center justify-between md:text-base text-[11px] ${editMode ? "hidden" : ""}`}>
        <div className="flex items-center break-all w-full mr-2">
            <input type="checkbox" className="mr-2" checked={todo.completed} onChange={onToggleBox}/>
            <p className={`p-2 overflow-y-auto bg-gray-100 bg-opacity-60 rounded shadow-sm w-full max-h-[7.5rem] ${todo.completed ? "line-through decoration-double decoration-gray-500 italic text-red-500 bg-red-300" : ""}`} onDoubleClick={onDoubleClickEdit}>{sentenceCase(todo.title)}</p>
        </div>
        <input type="button" className="bg-red-600 text-white rounded shadow-lg py-1 px-2" value="Delete" onClick={onClickDel}/>
      </div>
      <form className={`${editMode ? "p-3 flex w-full flex items-center justify-end space-x-5" : "hidden"}`} onSubmit={onSubmit}>
        <input type="text" className="px-2 rounded w-full bg-gray-200 italic focus:outline-none focus:bg-purple-200 p-1.5" name="title" value={title} ref={input => input && input.focus()} onChange={onChangeEdit} onBlur={onBlur} style={{ boxShadow: "none" }} maxLength="150" minLength="3"/>
        <input type="submit" className="bg-yellow-500 rounded py-1 px-2" value="Edit"/>
      </form>
    </>
  );
};

export default TodoManager;