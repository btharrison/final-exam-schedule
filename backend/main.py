from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import requests, os, re, json, copy
from bs4 import BeautifulSoup
from datetime import datetime, date
from pathlib import Path

app = FastAPI()

# To start fastApi uvicorn main:app --reload

# Define origins that are allowed to make requests (your React app's URL)
origins = [
    "http://localhost:5173", # Default port for Vite React app
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"], # Allows all headers
)

def caller():
    finalExamSchLink = "https://registrar.asu.edu/final-exam-schedule"
    req = requests.get(finalExamSchLink)
    return req

def get_data(semest, yer, finalSch, htmlCode):
    #Checking if one of the files exist
    if not (Path(f"{semest.lower()}{yer}/{finalSch}.json").exists()):
        parseTable(htmlCode, semest, yer)  # Parse the html

def groupClass():
    x = 1

def writeJSON(stringName, fold, tableN):
    rows = tableN.find_all("tr")
    rows = rows[1:] # removing first element because it is the names. Not the actual needed info
    d = {}

    for row in rows:
        
        identifier, date, time = row.find_all('td') # Getting the 3 columns from the table

        if ('(' in identifier.text):        # Removing the location from the first column
            
            p = identifier.text.split('(') # Getting rid of the location (Tempe)
            
            if(',' in p[0]):        # Spliting the course if they are grouped together
                courses = p[0].split(',')               # Splitting to get the list of numbers. 320, 230, 420, 550
                courseCode = courses[0][0:3]            # Adding the course code        ex. CSE
                if(courses[0] not in d):
                    d[courses[0]] = [date.text.strip(), time.text.strip()]        # For the first instance
                for i in range(1,len(courses)):
                    store = courseCode + " " + courses[i].strip()   # For all the following numbers to create course code Like CSE 320
                    if(store not in d):
                        d[store] = [date.text.strip(), time.text.strip()]         # Storing in the dict
            else:
                if(p[0].strip() not in d):
                    d[p[0].strip()] = [date.text.strip(),time.text.strip()]       # Storing normally if no issues
        else:
            d[identifier.text.strip().replace("\u00a0", "")] = [date.text.strip(), time.text.strip()]
    with open(f'{fold}/{stringName}.json', 'w') as f:
        json.dump(d, f, indent=3)

def parseTable(request, sem, yr):
    folder = f"{sem.lower()}{yr}"

    s = BeautifulSoup(request.text, "html.parser")
    cYear = datetime.now().year
    uniqueString= f"#Spring {cYear}"

    # Gets the fall year header
    x = s.find("h3")

    # Checking if the first header found is the correct one
    if(sem not in x.text and str(yr) not in x.text):
        x = x.find_next("h3")   # else get the other one
    
    pattern=re.compile(r"(?=.*Common)(?=.*Finals)")     # Searching for strong tags with common and finals occuring within them
    commonFinals = x.find_next("strong", string=pattern)

    table1 = commonFinals.find_next("table")
    writeJSON("commonFinals", folder, table1)

    pattern=re.compile(r"(?=.*Monday)(?=.*Wednesday)(?=.*Friday)")     # Searching for strong tags with monday, wednesday, and friday occuring within them
    mwfFinals = commonFinals.find_next("strong", string=pattern)

    table2 = mwfFinals.find_next("table")
    writeJSON("mwfFinals", folder, table2)

    pattern=re.compile(r"(?=.*Monday)(?=.*Wednesday)(?!=.*Friday)")     # Searching for strong tags with monday, wednesday and not friday occuring within them
    mwFinals = mwfFinals.find_next("strong", string=pattern)

    table3 = mwFinals.find_next("table")
    writeJSON("mwFinals", folder, table3)

    pattern=re.compile(r"(?=.*Tuesday)(?=.*Thursday)")     # Searching for strong tags with common and finals occuring within them
    tuThFinals = mwFinals.find_next("strong", string=pattern)

    table4 = tuThFinals.find_next("table")
    writeJSON("tuThFinals", folder, table4)

def initSearch(cCode, dow, time):
    today = date.today()
    target = date(today.year, 8, 1)
    year1 = year2 = useYear = semester = ""      # Initializing

    #Setting the years
    if today < target:
        useYear = today.year
        semester = "Spring"
    else:

        useYear = today.year
        semester = "Fall"

    # Making directories for each semester
    # Making folder for semYear. EX: fall2025
    os.makedirs(f"{semester.lower()}{useYear}", exist_ok=True)
    #os.makedirs(f"spring{year2}", exist_ok=True)

    r = caller()   # Call the link and get the html

    days = ""

    commonDict = mwfDict = mwDict = tuThDict = None     # Need to change so it is not iniatialized each run
    useDict = {}
    # Get the common finals first
    get_data(semester, useYear, "commonFinals", r)

    if commonDict is None:
        with open(f"{semester.lower()}{useYear}/commonFinals.json") as x:
            commonDict = json.load(x)
    
    if(cCode in commonDict):
        return [cCode, commonDict[cCode]]
    else:
        if "Monday" in dow and "Wednesday" in dow and "Friday" in dow:
            days = "mwfFinals"
            get_data(semester, useYear, days, r)    # This function creates the json if it does not exist
            
            if mwfDict is None:
                with open(f"{semester.lower()}{useYear}/{days}.json") as x:
                    mwfDict = json.load(x)
            else:
                useDict = mwfDict
            
            return [cCode, mwfDict[time]]

        elif "Monday" in dow or "Wednesday" in dow:
            days = "mwFinals"
            get_data(semester, useYear, days, r)    # This function creates the json if it does not exist

            if mwDict is None:
                with open(f"{semester.lower()}{useYear}/{days}.json") as y:
                    mwDict = json.load(y)
            
            return [cCode, mwDict[time]]

        elif "Tuesday" in dow or "Thursday" in dow:
            days = "tuThFinals"
            get_data(semester, useYear, days, r)    # This function creates the json if it does not exist

            if tuThDict is None:
                with open(f"{semester.lower()}{useYear}/{days}.json") as z:
                    tuThDict = json.load(z)
            
            return [cCode, tuThDict[time]]

@app.post("/api/getCourse")
def getCourse(data: List[dict]):
    tempData = copy.deepcopy(data)
    for i in range(len(tempData)):
        arrDays = []
        d = tempData[i]

        if('Mon' in d['days']):
            arrDays.append("Monday")
        if("Tue" in d['days']):
            arrDays.append("Tuesday")
        if("Wed" in d['days']):
            arrDays.append("Wednesday")
        if("Thu" in d['days']):
            arrDays.append("Thursday")
        if("Fri" in d['days']):
            arrDays.append("Friday")

        tempData[i]['days'] = arrDays
        returnVal = initSearch(tempData[i]['course'],arrDays, tempData[i]['time'])
        data[i]['finalDate'] = returnVal[1][0]
        data[i]['finalTime'] = returnVal[1][1]
        #print(returnVal)

    print(data)


    return {"received": data}
    

