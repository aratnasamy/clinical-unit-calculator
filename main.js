let startDate, endDate, breakRows;
let breaks = [];
let nextBreakId = 0;

window.addEventListener('DOMContentLoaded', () => {
    startDate = document.getElementById("start-date");
    endDate = document.getElementById("end-date");
    breakRows = document.getElementById("breaks");
    startDate.valueAsDate = new Date();
    startDate.setAttribute("max", startDate.value);
    endDate.valueAsDate = new Date();
    attachValidationListeners();
});

function validateChronologicalOrder() {
    // Helper to get date+time as Date object
    function getDateTime(dateId, timeId) {
        const dateInput = document.getElementById(dateId);
        const timeInput = document.getElementById(timeId);
        const date = dateInput?.value;
        const time = timeInput?.value;
        if (!date || !time) return {dt: null, dateInput, timeInput};
        return {dt: new Date(`${date}T${time}`), dateInput, timeInput};
    }

    // Clear all custom validity and validation-state
    function clearValidity(inputs) {
        for (const inp of inputs) {
                if (inp) {
                    inp.setCustomValidity("");
                    inp.removeAttribute("validation-state");
                }
            }
    }

    function setValidity(object, message) {
        object.setAttribute("validation-state", "warning");
    }

    // Get appt start and end
    const apptStartObj = getDateTime('start-date', 'start-time');
    const apptEndObj = getDateTime('end-date', 'end-time');
    const apptStart = apptStartObj.dt;
    const apptEnd = apptEndObj.dt;
    clearValidity([apptStartObj.dateInput, apptStartObj.timeInput, apptEndObj.dateInput, apptEndObj.timeInput]);
    let valid = true;
    if (!apptStart || !apptEnd) {
        if (!apptStart) {
            setValidity(apptStartObj.dateInput, "Please enter a valid start date.");
            setValidity(apptStartObj.timeInput, "Please enter a valid start time.");
        }
        if (!apptEnd) {
            apptEndObj.dateInput?.setAttribute("validation-state", "warning");
            apptEndObj.timeInput?.setAttribute("validation-state", "warning");
        }
        valid = false;
    } else if (apptStart >= apptEnd) {
        setValidity(apptStartObj.timeInput, "Please enter a valid start time.");
        setValidity(apptEndObj.timeInput, "Please enter a valid end time.");
        if (apptStartObj.dateInput.value > apptEndObj.dateInput.value) {
            setValidity(apptStartObj.dateInput, "Please enter a valid start date.");
            setValidity(apptEndObj.dateInput, "Please enter a valid end date.");
            }
        valid = false;
    }

    // Gather all breaks
    for (let i = 0; i < breaks.length; i++) {
        const id = breaks[i];
        const bStartObj = getDateTime(`start-date-${id}`, `start-time-${id}`);
        const bEndObj = getDateTime(`end-date-${id}`, `end-time-${id}`);
        clearValidity([bStartObj.dateInput, bStartObj.timeInput, bEndObj.dateInput, bEndObj.timeInput]);
        const bStart = bStartObj.dt;
        const bEnd = bEndObj.dt;
        if (!bStart || !bEnd) {
            if (!bStart) {
                bStartObj.dateInput?.setAttribute("validation-state", "warning");
                bStartObj.timeInput?.setAttribute("validation-state", "warning");
            }
            if (!bEnd) {
                bEndObj.dateInput?.setAttribute("validation-state", "warning");
                bEndObj.timeInput?.setAttribute("validation-state", "warning");
            }
            valid = false;
            continue;
        }
        if (bStart >= bEnd) {
            bStartObj.timeInput?.setAttribute("validation-state", "warning");
            bEndObj.timeInput?.setAttribute("validation-state", "warning");
            if (bStartObj.dateInput.value > bEndObj.dateInput.value) {
                bStartObj.dateInput?.setAttribute("validation-state", "warning");
                bEndObj.dateInput?.setAttribute("validation-state", "warning");
            }
            valid = false;
        }
        if (apptStart && (bStart < apptStart || bStart > apptEnd)) {
            bStartObj.timeInput?.setAttribute("validation-state", "warning");
            if (bStartObj.dateInput.value < apptStartObj.dateInput.value || bStartObj.dateInput.value > apptEndObj.dateInput.value) {
                bStartObj.dateInput?.setAttribute("validation-state", "warning");
            }
            valid = false;
        }
        if (apptEnd && (bEnd > apptEnd || bEnd < apptStart)) {
            bEndObj.timeInput?.setAttribute("validation-state", "warning");
            if (bEndObj.dateInput.value > apptEndObj.dateInput.value || bEndObj.dateInput.value < apptStartObj.dateInput.value) {
                bEndObj.dateInput?.setAttribute("validation-state", "warning");
            }
            valid = false;
        }
    }

    for (let i = 1; i < breaks.length; i++) {
        currBreakStartObj = getDateTime(`start-date-${breaks[i]}`, `start-time-${breaks[i]}`);
        currBreakEndObj = getDateTime(`end-date-${breaks[i]}`, `end-time-${breaks[i]}`);
        prevBreakEndObj = getDateTime(`end-date-${breaks[i-1]}`, `end-time-${breaks[i-1]}`);
        currBreakStart = currBreakStartObj.dt;
        currBreakEnd = currBreakEndObj.dt;
        prevBreakEnd = prevBreakEndObj.dt;
        if (currBreakStart <= prevBreakEnd) {
            currBreakStartObj.timeInput?.setAttribute("validation-state", "warning");
            prevBreakEndObj.timeInput?.setAttribute("validation-state", "warning");
            if (currBreakStartObj.dateInput.value < prevBreakEndObj.dateInput.value) {
                currBreakStartObj.dateInput?.setAttribute("validation-state", "warning");
                prevBreakEndObj.dateInput?.setAttribute("validation-state", "warning");
            }
            valid = false;
        }
        if (currBreakEnd <= prevBreakEnd) {
            currBreakEndObj.timeInput?.setAttribute("validation-state", "warning");
            prevBreakEndObj.timeInput?.setAttribute("validation-state", "warning");
            if (currBreakEndObj.dateInput.value < prevBreakEndObj.dateInput.value) {
                currBreakEndObj.dateInput?.setAttribute("validation-state", "warning");
                prevBreakEndObj.dateInput?.setAttribute("validation-state", "warning");
            }
            valid = false;
        }
    }

    // No native validation UI needed; handled by validation-state attribute
    return valid;
}

function attachValidationListeners() {
    // Appt date/time
    document.getElementById('start-date').addEventListener('change', calculateClinicalUnits);
    document.getElementById('end-date').addEventListener('change', calculateClinicalUnits);
    document.getElementById('start-time').addEventListener('change', calculateClinicalUnits);
    document.getElementById('end-time').addEventListener('change', calculateClinicalUnits);
    // Breaks
    for (let i = 0; i < breaks.length; i++) {
        const id = breaks[i];
        const sDate = document.getElementById(`start-date-${id}`);
        const eDate = document.getElementById(`end-date-${id}`);
        const sTime = document.getElementById(`start-time-${id}`);
        const eTime = document.getElementById(`end-time-${id}`);
        if (sDate) sDate.addEventListener('change', calculateClinicalUnits);
        if (eDate) eDate.addEventListener('change', calculateClinicalUnits);
        if (sTime) sTime.addEventListener('change', calculateClinicalUnits);
        if (eTime) eTime.addEventListener('change', calculateClinicalUnits);
    }
}

function reCalcMinDate() {
    for (let i=0; i<breaks.length; i++) {
        document.getElementById(`start-date-${breaks[i]}`).setAttribute("min", i == 0 ? startDate.value : (startDate.value > document.getElementById(`end-date-${breaks[i-1]}`).value ? startDate.value : document.getElementById(`end-date-${breaks[i-1]}`).value));
        document.getElementById(`end-date-${breaks[i]}`).setAttribute("min", i == 0 ? startDate.value : (startDate.value > document.getElementById(`end-date-${breaks[i-1]}`).value ? startDate.value : document.getElementById(`end-date-${breaks[i-1]}`).value));
    }
}

function reCalcMaxDate() {
    for (let i=breaks.length-1; i>=0; i--) {
        document.getElementById(`start-date-${breaks[i]}`).setAttribute("max", i == breaks.length-1 ? endDate.value : (endDate.value < document.getElementById(`start-date-${breaks[i+1]}`).value ? endDate.value : document.getElementById(`start-date-${breaks[i+1]}`).value));
        document.getElementById(`end-date-${breaks[i]}`).setAttribute("max", i == breaks.length-1 ? endDate.value : (endDate.value < document.getElementById(`start-date-${breaks[i+1]}`).value ? endDate.value : document.getElementById(`start-date-${breaks[i+1]}`).value));
    }
}

function createBreak() {
    if (breaks.length >= 5) {
        return;
    }
    // Save current break input values
    const breakValues = breaks.map(id => {
        return {
            id,
            startDate: document.getElementById(`start-date-${id}`)?.value || "",
            startTime: document.getElementById(`start-time-${id}`)?.value || "",
            endDate: document.getElementById(`end-date-${id}`)?.value || "",
            endTime: document.getElementById(`end-time-${id}`)?.value || ""
        };
    });

    let breakNumber = nextBreakId + 1;
    let text = breakRows.innerHTML.replace(/<p hidden=""><\/p>/,`
        <div id="break-row-${nextBreakId}" class="breakRow" style="display: flex; align-items: stretch; justify-content: space-between; gap: 1rem;">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
                <div style="width: 100%; text-align: center;">
                    <h2>Break ${breakNumber}</h2>
                </div>
                <div>
                    <h3 style="display: inline;">Start Time: </h3>
                    <input type="date" id="start-date-${nextBreakId}" value="${breaks.length == 0 ? startDate.value : document.getElementById(`end-date-${breaks[breaks.length-1]}`)?.value || startDate.value}"/>
                    <time-input id="start-time-${nextBreakId}"></time-input>
                </div>
                <div>
                    <h3 style="display: inline;">End Time: </h3>
                    <input type="date" id="end-date-${nextBreakId}" value="${breaks.length == 0 ? startDate.value : document.getElementById(`end-date-${breaks[breaks.length-1]}`)?.value || startDate.value}"/>
                    <time-input id="end-time-${nextBreakId}"></time-input>
                </div>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; min-width: 80px; cursor:pointer; font-weight: bold; border-left: 2px solid #eee; padding-left: 4px;" onclick="removeBreak(${nextBreakId})">
                Remove
            </div>
        </div>
        <p hidden=""></p>`);
    breaks.push(nextBreakId);
    nextBreakId++;
    breakRows.innerHTML = text;

    // Restore previous break input values
    breakValues.forEach(bv => {
        const sDate = document.getElementById(`start-date-${bv.id}`);
        const sTime = document.getElementById(`start-time-${bv.id}`);
        const eDate = document.getElementById(`end-date-${bv.id}`);
        const eTime = document.getElementById(`end-time-${bv.id}`);
        if (sDate) sDate.value = bv.startDate;
        if (sTime) sTime.value = bv.startTime;
        if (eDate) eDate.value = bv.endDate;
        if (eTime) eTime.value = bv.endTime;
    });

    // Disable the create button if 5 breaks
    if (breaks.length >= 5) {
        const createBtn = document.querySelector('.createButton');
        if (createBtn) {
            createBtn.style.pointerEvents = 'none';
            createBtn.style.opacity = '0.5';
        }
    }
    // Attach validation listeners to new break inputs
    attachValidationListeners();
    calculateClinicalUnits();
}

function removeBreak(id) {
    // Remove the break from the breaks array
    breaks = breaks.filter(bid => bid !== id);
    // Remove the break row from the DOM
    const row = document.getElementById(`break-row-${id}`);
    if (row) row.remove();
    // If there are no breaks left, reset nextBreakId
    if (breaks.length === 0) {
        nextBreakId = 0;
    }
    // Re-enable the create button if less than 5 breaks
    if (breaks.length < 5) {
        const createBtn = document.querySelector('.createButton');
        if (createBtn) {
            createBtn.style.pointerEvents = '';
            createBtn.style.opacity = '';
        }
    }
    // Re-attach validation listeners after DOM change
    attachValidationListeners();
    calculateClinicalUnits();
}

function calculateClinicalUnits() {
    if (validateChronologicalOrder()) {
        const startTime = new Date(`${startDate.value}T${document.getElementById("start-time").value}`);
        const endTime = new Date(`${endDate.value}T${document.getElementById("end-time").value}`);
        // Calculate appointment duration in minutes
        const apptMinutes = Math.round((endTime - startTime) / 60000);
        let totalBreakMinutes = 0;
        let breakdown = `<strong>Breakdown:</strong><br/>`;
        breakdown += `Appointment: ${formatMinutes(apptMinutes)}<br>`;

        // Each break
        for (let i = 0; i < breaks.length; i++) {
            const id = breaks[i];
            const bStartDate = document.getElementById(`start-date-${id}`)?.value;
            const bStartTime = document.getElementById(`start-time-${id}`)?.value;
            const bEndDate = document.getElementById(`end-date-${id}`)?.value;
            const bEndTime = document.getElementById(`end-time-${id}`)?.value;
            if (bStartDate && bStartTime && bEndDate && bEndTime) {
                const bStart = new Date(`${bStartDate}T${bStartTime}`);
                const bEnd = new Date(`${bEndDate}T${bEndTime}`);
                const bMinutes = Math.round((bEnd - bStart) / 60000);
                totalBreakMinutes += bMinutes;
                breakdown += `Break ${i+1}: ${formatMinutes(bMinutes)}<br>`;
            }
        }

        // Calculate net duration and clinical units
        const netMinutes = apptMinutes - totalBreakMinutes;
        const clinicalUnits = Math.round(netMinutes / 15);

        // Show breakdown in a new or existing element
        let breakdownElem = document.getElementById("breakdown");
        breakdownElem.innerHTML = breakdown;

        // Also update clinicalUnits element with summary
        document.getElementById("billableTime").textContent = `Billable Time: ${formatMinutes(netMinutes)}`;
        document.getElementById("clinicalUnits").textContent = `Clinical Units: ${clinicalUnits}`;
    }
}

// Helper to format minutes as H:MM or MM min
function formatMinutes(mins) {
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}