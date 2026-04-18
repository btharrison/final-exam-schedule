import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import asuLogo from "/ASU.png"

import './App.css'


// To start Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
// npm run dev

function App() {
  const [courseCode, setCourseCode] = useState("");
  const [courseNum, setCourseNum] = useState("");
  const [dowSelect, setDowSelect] = useState([]);
  const [rows, setRows] = useState([]);
  const [updateBox, setUpdateBox] = useState(false);

  const myMap = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday"
  };

  const mwfTimes = [
    '8:00 - 8:50 AM',
    '9:05 - 9:55 AM',
    '10:10 - 11:00 AM',
    '11:15 AM - 12:05 PM',
    '12:20 - 1:10 PM',
    '1:25 - 2:15 PM',
    '2:30 - 3:20 PM',
    '3:35 - 4:25 PM',
    '4:40 - 5:30 PM',
    '5:45 - 6:35 PM',
    '6:50 - 7:40 PM',
    '7:55 - 8:45 PM',
    '9:00 - 9:50 PM'
    ]
  
  const standardTimes = [
    '7:30 - 8:45 AM',
    '9:00 - 10:15 AM',
    '10:30 - 11:45 AM',
    '12:00 - 1:15 PM',
    '1:30 - 2:45 PM',
    '3:00 - 4:15 PM',
    '4:30 - 5:45 PM',
    '6:00 - 7:15 PM',
    '7:30 - 8:45 PM',
    '9:00 - 10:15 PM'
  ]

  let timesList = []

  const dayToNum = Object.fromEntries(
    Object.entries(myMap).map(([num, day]) => [day, parseInt(num, 10)])
  );

  function filterCode(e) {
     // Remove non-letters
    let lettersOnly = e.target.value.replace(/[^a-zA-Z]/g, "");

    // Limit length
    if (lettersOnly.length > 3) {
      lettersOnly = lettersOnly.substring(0, 3);
    }
    setCourseCode(lettersOnly.toUpperCase()); // assuming you have a useState hook
  }

  function filterNum(e) {
    let numbersOnly = e.target.value.replace(/[^0-9]/g, "")

    if (numbersOnly.length > 3) {
      numbersOnly = numbersOnly.substring(0, 3);
    }
    setCourseNum(numbersOnly);
  }

  function updateSelect(event) {
    const idDay = event.target.id;    // Getting the day of the week ID
    const day = event.target.value;
    const isChecked = event.target.checked;
    let tempDOW = [...dowSelect]; 
    if(isChecked) {
      tempDOW = [...tempDOW, day]
    }
    else{
      tempDOW = tempDOW.filter(d => d !== day)
    }

    if(tempDOW.length > 0){
      tempDOW.sort((a, b) => dayToNum[a] - dayToNum[b]);
    }

    let changeMade = false;

    if (
      tempDOW.includes("Monday") &&
      tempDOW.includes("Wednesday") &&
      tempDOW.includes("Friday") &&
      updateBox === false
    ) {
      timesList = mwfTimes;
      setUpdateBox(true);
      changeMade = true;
    }
    else if (
      updateBox === true &&
      (!tempDOW.includes("Monday") ||
      !tempDOW.includes("Wednesday") ||
      !tempDOW.includes("Friday"))
    ) {
      timesList = standardTimes;
      setUpdateBox(false);
      changeMade = true;
    }

    if(changeMade) {
      const selectBox = document.getElementById("times");
      selectBox.innerHTML = "";

      const first = new Option("Select an option", "noneSelected");
      first.disabled = true;
      first.selected = true;
      first.hidden = true;
      selectBox.add(first);

      timesList.forEach(t => {
        const option = new Option(t, t);
        selectBox.add(option);
      });
    }

    let dayStr = "";
    let sB = document.getElementById("dowSelect");

    if(tempDOW.length > 0) {
      tempDOW.forEach((v, i) => {
        dayStr += v.substring(0,3) + ", "
      })
      dayStr = dayStr.substring(0, dayStr.length - 2);
    }
    else {
      dayStr = "Select an option";
    }

    sB.textContent = dayStr;
    //console.log(tempDOW)
    setDowSelect(tempDOW)

  }

  var expanded = false;
  function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      expanded = true;
    } else {
      checkboxes.style.display = "none";
      expanded = false;
    }
  }

  const addRow = () => {
    let changed = false;
    let tempROW = [...rows];
    let cCode = document.getElementById("courseCode");
    let cNum = document.getElementById("courseNumber");
    let cTime = document.getElementById("times");

    if(cCode === "" || cCode.value.length < 3){
      changed = true;
      console.log(`Course Code error ${cCode.value}`);
    }

    rows.forEach((t) => {
      let s = `${cCode.value} ${cNum.value}`
      if((t['course'] === s)){ 
        // Maybe also add time overlapping
        changed = true;
      }
      dowSelect.forEach((g) => {
        // console.log(`${t['days'].includes(g.substring(0,3))} for compare`);
        // console.log(`${t['time']} for time ${cTime.value}`);
        // console.log(g + " dowSelect");
        // console.log(t['days']);
        // console.log(" ");

        if((t['time'] === cTime.value) && t['days'].includes(g.substring(0,3))) {
          changed = true;
        }
      })
    }); 

    console.log(changed);
    if((cNum === "" || cNum.value.length < 3 )) {
      changed = true;
      console.log(`Course Num error ${cNum.value}`)
    }

    if((cTime.value === "" || cTime.value == "noneSelected")) {
      changed = true;
      console.log(`Course time empty ${cTime.value}`);
    }

    if(dowSelect.length === 0){
      changed = true;
      console.log("Course days empty");
    }
    else if ((dowSelect.includes("Monday") || dowSelect.includes("Wednesday") || dowSelect.includes("Friday")) && (dowSelect.includes("Tuesday") || dowSelect.includes("Thursday"))) {
      changed = true;
      console.log("Course days selected invalid");
    }


    if(!changed) {
      let dayString = "";

      dowSelect.forEach((val, index) => {
        dayString += val.substring(0, 3) + ", ";
        let replaceString = val;
        console.log(replaceString);

        const checkb = document.getElementById(dayToNum[replaceString]);
        checkb.checked = false;
      });

      setDowSelect([]);
      document.getElementById("dowSelect").textContent = "Select an option";


      dayString = dayString.substring(0, dayString.length - 2);
      tempROW = [...tempROW, { course: `${courseCode} ${courseNum}`, days: dayString, time: document.getElementById("times").value, empty: "", finalDate: "", finalTime:""}]
      cCode.value = "";
      cNum.value = "";
      const timeBox = document.getElementById("times");
      timeBox.value = "noneSelected";
      setRows(tempROW);
    }
    
  };

  function callAPI() {
    console.log(rows);
    if(rows.length > 0) {
      fetch("http://localhost:8000/api/getCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(rows)
      })
      .then(res => res.json())
      .then(data => {

        //setRows(data['received']),
        let newRows = data['received'];
        console.log(newRows)
        setRows(newRows)
      });
      }
    else {
      console.log("add some rows");
    }
  }

  return (
    <>
      <div className='logos'>
        <a href="https://registrar.asu.edu/final-exam-schedule" target="_blank">
          <img src={asuLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="table-container">
        <table>
          <tr>
            <th>Course</th>
            <th>Days of Week</th>
            <th>Time</th>
            <th></th>
            <th className="final">Final Date </th>
            <th className="final">Final Time</th>
          </tr>
          {/* <tr>
            <td>CSE 240</td>
            <td>Mon, Wed, Friday</td>
            <td>8:00 - 8:50 AM</td>
            <td> </td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>CSE 310</td>
            <td>Tu, Th</td>
            <td>12:00 - 1:15 PM</td>
            <td> </td>
            <td></td>
            <td></td>
          </tr> */}
          {/* <tr>
            <td> 
            </td>
            <td> 
            </td>
            <td> 
            </td>
            <td> 
            </td>
            <td> 
            </td>
            <td> 
            </td>
          </tr> */}
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.course}</td>
              <td>{row.days}</td>
              <td>{row.time}</td>
              <td>{row.empty}</td>
              <td>{row.finalDate}</td>
              <td>{row.finalTime}</td>
            </tr>
          ))}
          <tr>
            <td>
              <input type="text" id="courseCode" name="username" className="course" value={courseCode} onChange={filterCode} placeholder="CSE"></input>
              <input type="text" id="courseNumber" name="username" className="course"value={courseNum} onChange={filterNum} placeholder="101"></input>
            </td>
            <td>
              <div className="multiselect">
                <div className="selectBox" onClick={() => showCheckboxes()}>
                  <select>
                    <option id="dowSelect" value="" selected disabled hidden>Select an option</option>
                  </select>
                  <div className="overSelect"></div>
                </div>
                <div id="checkboxes">
                  <label for="monday">
                    <input type="checkbox" id="1" value="Monday" onChange={updateSelect}/>Monday</label>
                  <label for="tuesday">
                    <input type="checkbox" id="2" value="Tuesday" onChange={updateSelect}/>Tuesday</label>
                  <label for="wednesday">
                    <input type="checkbox" id="3" value="Wednesday" onChange={updateSelect}/>Wednesday</label>
                  <label for="thursday">
                    <input type="checkbox" id="4" value="Thursday" onChange={updateSelect}/>Thursday</label>
                  <label for="friday">
                    <input type="checkbox" id="5" value="Friday" onChange={updateSelect}/>Friday</label>
                </div>
              </div>
            </td>
            <td>
              <select name="times" id="times" className="times">
                <option value="noneSelected" selected disabled hidden>Select an option</option>
                <option value="7:30 - 8:45 AM">7:30 - 8:45 AM</option>
                <option value="9:00 - 10:15 AM">9:00 - 10:15 AM</option>
                <option value="10:30 - 11:45 AM">10:30 - 11:45 AM</option>
                <option value="12:00 - 1:15 PM" >12:00 - 1:15 PM</option>
                <option value="12:20 - 1:10 PM" >12:20 - 1:10 PM</option>
                <option value="1:30 - 2:45 PM" d>1:30 - 2:45 PM</option>
                <option value="3:00 - 4:15 PM">3:00 - 4:15 PM</option>
                <option value="4:30 - 5:45 PM" >4:30 - 5:45 PM</option>
                <option value="6:00 - 7:15 PM" >6:00 - 7:15 PM</option>
                <option value="7:30 - 8:45 PM" >7:30 - 8:45 PM</option>
                <option value="9:00 - 10:15 PM" >9:00 - 10:15 PM</option>
              </select>
            </td>      
            <td id="but" className="but" colSpan="3">
              <div className="buttonContainer">
                <button className="add-button" onClick={addRow}> Add </button>
                <button className="search-button"onClick={callAPI}> Search </button>
              </div>
            </td> 
          </tr>
        </table>
      </div>
    </>
  )
}

export default App
