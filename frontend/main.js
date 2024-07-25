
const SERVER_URL = 'http://localhost:3000'

async function serverAddStudent(obj) {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
  })
  let date = await response.json()
  return date
}

async function serverGetStudent() {
  let response = await fetch(SERVER_URL + '/api/students', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  let date = await response.json()
  return date
}
let serverData = await serverGetStudent();
let array = []
if (serverData) {
  array = serverData
}

async function serverDeleteStudent(id) {
  let response = await fetch(SERVER_URL + '/api/students/' + id, {
    method: 'DELETE',
  })
  let date = await response.json()
  return date
}

// Функция отрисовки одного студента
function getStudentItem(student, fio, formatDate, age, ageLearn) {
  let tBody = document.getElementById('tbody');
  let tableRow = document.createElement('tr');
  let fullNameTd = document.createElement('td');
  let birthdayTd = document.createElement('td');
  let studyStartTd = document.createElement('td');
  let facultyTd = document.createElement('td');
  let deleteTd = document.createElement('td');
  let btnDeleteTd = document.createElement('button');
  btnDeleteTd.classList.add('btn', 'btn-danger', 'w-100')
  btnDeleteTd.textContent = 'Удалить'
  btnDeleteTd.addEventListener('click', async function () {
    await serverDeleteStudent(student.id)
    tableRow.remove()
  })
  fullNameTd.textContent = fio(student);
  birthdayTd.textContent = formatDate(student.birthday) + ' (' + `${age(student)}` + ')';
  studyStartTd.textContent = student.studyStart + '-' + (Number(student.studyStart) + 4) + ' (' + `${ageLearn(student)}` + ')';
  facultyTd.textContent = student.faculty;
  deleteTd.append(btnDeleteTd);
  tableRow.append(fullNameTd);
  tableRow.append(birthdayTd);
  tableRow.append(studyStartTd);
  tableRow.append(facultyTd);
  tableRow.append(deleteTd);
  tBody.append(tableRow);
}

// Функция отрисовки всех студентов
function renderStudentsTable(studentsArray, createStudent) {
  document.getElementById('tbody').innerHTML = ''
  studentsArray = sortStudent(column, columnDir)
  for (const studentObj of studentsArray) {
    createStudent(studentObj, getFIO, getFormatDate, getAge, getAgeLearn);
  }
}

// Функция создания ФИО
function getFIO(object) {
  return object.surname + ' ' + object.name + ' ' + object.lastname;
}

// Функция форматирования даты
function getFormatDate(object) {
  var dateString = ("0" + new Date(object).getDate()).slice(-2) + "." + ("0" + (new Date(object).getMonth() + 1)).slice(-2) + "." + new Date(object).getFullYear();
  return dateString
}

// Функция получения возраста
function getAge(object) {
  var today = new Date();
  var age = new Date(today).getFullYear() - new Date(object.birthday).getFullYear();
  var m = new Date(today).getMonth() - new Date(object.birthday).getMonth();
  if (m < 0 || (m === 0 && new Date(today).getDate() < new Date(object.birthday).getDate())) {
    age--;
  }
  let txt = '';
  let count = age % 100;
  if (count >= 5 && count <= 20) {
    txt = 'лет';
  } else {
    count = count % 10;
    if (count == 1) {
      txt = 'год';
    } else if (count >= 2 && count <= 4) {
      txt = 'года';
    } else {
      txt = 'лет';
    }
  }
  return age + ' ' + txt;
}

// Функция получения лет обучения
function getAgeLearn(object) {
  var today = new Date();
  var ageLearn = today.getFullYear() - Number(object.studyStart);
  if ((today.getMonth() > 9 && ageLearn == 4) || ageLearn > 4) {
    return 'закончил'
  } else {
    return ageLearn + ' курс'
  }
}

// Валидация формы
function validation(form) {

  function removeError(input) {
    const parent = input.parentNode;
    if (parent.classList.contains('error')) {
      parent.classList.remove('error');
      const errorLabel = parent.querySelector('.error-label')
      errorLabel.textContent = ''
      input.style.removeProperty('border-color')
    }
  }

  function createError(input, text) {
    const parent = input.parentNode;
    parent.classList.add('error');
    const errorLabel = parent.querySelector('.error-label')
    errorLabel.style.cssText = 'color: red; display: block; margin-bottom: 10px'
    errorLabel.textContent = text
    input.style.borderColor = 'red';
  }

  let result = true;
  const allInputs = form.querySelectorAll('.form-control');

  for (const input of allInputs) {
    removeError(input)
    if (input.dataset.year) {
      if (new Date(input.value).getFullYear() < input.dataset.year || new Date(input.value) > new Date()) {
        createError(input, 'Дата рождения должна находится в диапазоне от 01.01.1900 до текущей даты')
        result = false
      }
    }
    if (input.dataset.yearLearn) {
      if (input.value < input.dataset.yearLearn || input.value > new Date().getFullYear()) {
        createError(input, 'Год начала обучения должен находится в диапазоне от 2000-го до текущего года')
        result = false
      }
    }
    if (input.dataset.minLenght) {
      if (input.value.length < input.dataset.minLenght) {
        createError(input, `Минимальное количество символов: ${input.dataset.minLenght}`)
        result = false
      }
    }
    if (input.dataset.maxLenght) {
      if (input.value.length > input.dataset.maxLenght) {
        createError(input, `Максимальное количество символов: ${input.dataset.maxLenght}`)
        result = false
      }
    }
    if (input.value == '') {
      createError(input, 'Поле не заполнено!')
      result = false
    }
  }
  return result
}

// Добавление студента
document.getElementById('form').addEventListener('submit', async function (event) {
  event.preventDefault()
  if (validation(this) == true) {
    let objectStudent = {
      surname: document.getElementById('surname').value,
      name: document.getElementById('name').value,
      lastname: document.getElementById('lastname').value,
      birthday: new Date(document.getElementById('birthday').value),
      studyStart: document.getElementById('studyStart').value,
      endLearn: String(Number(document.getElementById('studyStart').value) + 4),
      faculty: document.getElementById('faculty').value,
    }
    let serverDataObj = await serverAddStudent(objectStudent);
    array.push(serverDataObj);
    renderStudentsTable(array, getStudentItem)
    event.target.reset();
  }
})

// Сортировка массива
let column = 'surname';
let columnDir = false;
const workerList = document.getElementById('thead'),
  workerListAll = workerList.querySelectorAll('th')
function sortStudent(prop, dir) {
  return array.sort(function (a, b) {
    let dirIf = a[prop] < b[prop];
    if (dir == true) dirIf = a[prop] > b[prop]
    if (dirIf == true) return -1;
  });
}

workerListAll.forEach(element => {
  element.addEventListener('click', function () {
    column = this.dataset.column;
    columnDir = !columnDir;
    renderStudentsTable(array, getStudentItem)
  })
})

// Фильтрация массива
function filter(arr, value, prop) {
  let result = []

  for (const item of arr) {
    if (String(item[prop]).includes(value) == true) {
      result.push(item)
    }
  }
  return result
}

const newArr = array;
document.getElementById('form-second').addEventListener('submit', function (event) {
  event.preventDefault()
  array = newArr;
  let nameVal = document.getElementById('name-second').value,
    surnameVal = document.getElementById('surname-second').value,
    lastnameVal = document.getElementById('lastname-second').value,
    studyStartVal = document.getElementById('studyStart-second').value,
    endLearnVal = document.getElementById('endLearn-second').value,
    facultyVal = document.getElementById('faculty-second').value;
  if (nameVal != '') array = filter(array, nameVal, 'name')
  if (surnameVal != '') array = filter(array, surnameVal, 'surname')
  if (lastnameVal != '') array = filter(array, lastnameVal, 'lastname')
  if (studyStartVal != '') array = filter(array, studyStartVal, 'studyStart')
  if (endLearnVal != '') array = filter(array, endLearnVal, 'endLearn')
  if (facultyVal != '') array = filter(array, facultyVal, 'faculty')
  renderStudentsTable(array, getStudentItem);
});

renderStudentsTable(array, getStudentItem);
