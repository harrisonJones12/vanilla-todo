import { formatDateId } from './util.js';
import { uuid } from './uuid.js';

export class TodoLogic {
  static initTodoData(now = new Date()) {
    return {
      items: [],
      customLists: [],
      at: formatDateId(now),
      customAt: 0,
    };
  }

  static getTodoListsByDay(data, range) {
    const listsByDay = [];

    for (let i = 0; i < 2 * range; ++i) {
      const t = new Date(data.at);
      t.setDate(t.getDate() - range + i);
      const id = formatDateId(t);

      listsByDay.push({
        id,
        items: TodoLogic.getTodoItemsForList(data, id),
        position: -range + i,
      });
    }

    return listsByDay;
  }

  static getTodoItemsForList(data, listId) {
    console.log()
    return data.items
      .filter((item) => item.listId === listId)
      .sort((a, b) => a.index - b.index);
  }

  static addTodoItem(data, input) {
    let index = 0;

    for (const item of data.items) {
      if (item.listId === input.listId) {
        index = Math.max(index, item.index + 1);
      }
    }

    return {
      ...data,
      items: [
        ...data.items,
        {
          ...input,
          id: uuid(),
          index,
          done: false,
        },
      ],
    };
  }

  static checkTodoItem(data, input) {
    return {
      ...data,
      items: data.items.map((item) =>
        item.id === input.id ? { ...item, done: input.done } : item,
      ),
    };
  }

  static editTodoItem(data, input) {
    return {
      ...data,
      items: data.items.map((item) =>
        item.id === input.id ? { ...item, label: input.label } : item,
      ),
    };
  }

  static moveTodoItem(data, input) {
    // console.log('moveTodoItem is called data', data);
    // console.log('moveTodoItem is called input', input);
    const itemToMove = data.items.find((item) => item.id === input.id);

    // Reinsert item at target list and index
    let list = data.items.filter(
      (item) => item.listId === input.listId && item.id !== input.id,
    );
    // console.log('list', list);
    list.splice(input.index, 0, { ...itemToMove, listId: input.listId });
    list = TodoLogic.setIndexes(list);

    // Reinsert updated list
    let items = data.items.filter(
      (item) => item.listId !== input.listId && item.id !== input.id,
    );
    items = [...items, ...list];
    console.log('items', items)
    return {
      ...data,
      items,
    };
  }

  static moveUnCheckedTodoItems() {
    // get local host data 
    // check local host data to seee if the dates match the current date
    // if they dont take the data that has past date set the listId to be the current data
    const TodoData = JSON.parse(localStorage.todo)
    const listOfTodoItems = TodoData.items;
    console.log('localhost todo', listOfTodoItems)
    const today = formatDateId(new Date());

    listOfTodoItems.forEach((todoItem) => {
      console.log('today', today)

      if (todoItem.listId > today && todoItem.done === false) {
        console.log(`this item "${todoItem.label}" should be moved`)
      }
    })


  }

  static deleteTodoItem(data, input) {
    return {
      ...data,
      items: data.items.filter((item) => item.id !== input.id),
    };
  }

  //

  static getCustomTodoLists(data) {
    return data.customLists
      .map((list) => ({
        id: list.id,
        index: list.index,
        title: list.title,
        items: TodoLogic.getTodoItemsForList(data, list.id),
      }))
      .sort((a, b) => a.index - b.index);
  }

  static addCustomTodoList(data) {
    let index = 0;

    for (const customList of data.customLists) {
      index = Math.max(index, customList.index + 1);
    }

    return {
      ...data,
      customLists: [
        ...data.customLists,
        {
          id: uuid(),
          index,
          title: '',
        },
      ],
    };
  }

  static editCustomTodoList(data, input) {
    return {
      ...data,
      customLists: data.customLists.map((customList) =>
        customList.id === input.id
          ? { ...customList, title: input.title }
          : customList,
      ),
    };
  }

  static moveCustomTodoList(data, input) {
    const customListToMove = data.customLists.find(
      (customList) => customList.id === input.id,
    );

    let customLists = data.customLists
      .filter((customList) => customList.id !== input.id)
      .sort((a, b) => a.index - b.index);
    customLists.splice(input.index, 0, customListToMove);
    customLists = TodoLogic.setIndexes(customLists);

    return {
      ...data,
      customLists,
    };
  }

  static deleteCustomTodoList(data, input) {
    return {
      ...data,
      customLists: data.customLists.filter(
        (customList) => customList.id !== input.id,
      ),
    };
  }

  //

  static seekDays(data, delta) {
    const t = new Date(`${data.at}T00:00:00`);
    t.setDate(t.getDate() + delta);

    return { ...data, at: formatDateId(t) };
  }

  static seekToToday(data) {
    return { ...data, at: formatDateId(new Date()) };
  }

  static seekToDate(data, date) {
    return { ...data, at: formatDateId(date) };
  }

  static seekCustomTodoLists(data, delta) {
    return {
      ...data,
      customAt: Math.max(
        0,
        Math.min(data.customLists.length - 1, data.customAt + delta),
      ),
    };
  }

  //

  static setIndexes(array) {
    return array.map((item, index) =>
      item.index === index ? item : { ...item, index },
    );
  }
}
