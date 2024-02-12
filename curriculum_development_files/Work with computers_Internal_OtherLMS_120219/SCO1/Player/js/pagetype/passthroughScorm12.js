/* Copyright 2006-2014 e-Learning Consulting. All Rights Reserved. See license agreement */
/* scorm12.js - version 2.0 */


/**
*
* initSCORM12API - init the SCORM 1.2 API and set all of the default values based on an initial launch 
*
**/
function initSCORM12API(API, userID, firstName, lastName, maxtimeallowed, timelimitaction, datafromlms, masteryscore) {
	/* init the SCORM data list */
    initScorm12Data(userID, firstName, lastName, maxtimeallowed, timelimitaction, datafromlms, masteryscore);

	/* create the SCORM API callbacks */
	API.LMSInitialize     = LMSInitialize;
	API.LMSFinish         = LMSFinish;
	API.LMSSetValue       = LMSSetValue;
	API.LMSGetValue       = LMSGetValue;
	API.LMSGetLastError   = LMSGetLastError;
	API.LMSGetErrorString = LMSGetErrorString;	
	API.LMSCommit         = LMSCommit;
	API.LMSGetDiagnostic  = LMSGetDiagnostic;
}

/**
*
* initScorm12Data - initializes the lsit of SCORM 1.2 data 
*
**/
function initScorm12Data(userID, firstName, LastName, maxtimeallowed, timelimitaction, datafromlms, masteryscore) {
    var sdNew;

    /* init the SCORM data list */
    sdList = new ScormData('rw', '0', 'cmi.comments', 'CMIString4096', '', '', null);
    sdNew = new ScormData('ro', '0', 'cmi.comments_from_lms', 'CMIString4096', '', '', sdList);
    sdNew = new ScormData('ro', '0', 'cmi.core._children', 'CMIString255', '"credit","entry","exit","lesson_location","lesson_mode","lesson_status","score","session_time","student_id","student_name","total_time"', 'credit,entry,exit,lesson_location,lesson_mode,lesson_status,score,session_time,student_id,student_name,total_time', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.core.credit', 'CMIVocabulary', '"credit":"no-credit"', 'credit', sdNew);
    sdNew.storeLocal = true;
    sdNew = new ScormData('ro', '0', 'cmi.core.entry', 'CMIVocabulary', '"":"ab-initio":"resume"', 'ab-initio', sdNew);
    sdNew.storeLocal = true;
    sdNew = new ScormData('wo', '0', 'cmi.core.exit', 'CMIVocabulary', '"":"logout":"suspend":"time-out"', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.core.lesson_location', 'CMIString255', '', '', sdNew);
    sdNew.storeLocal = true;
    sdNew = new ScormData('ro', '0', 'cmi.core.lesson_mode', 'CMIVocabulary', '"normal":"review":"browse"', 'normal', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.core.lesson_status', 'CMIVocabulary', '"passed":"completed":"failed":"incomplete":"browsed":"not attempted"', 'not attempted', sdNew);
    sdNew.storeLocal = true;
    sdNew = new ScormData('ro', '0', 'cmi.core.score._children', 'CMIString255', '"max","min","raw"', 'max,min,raw', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.core.score.max', 'CMIDecimal', '0,100', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.core.score.min', 'CMIDecimal', '0,100', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.core.score.raw', 'CMIDecimal', '0,100', '', sdNew);
    sdNew = new ScormData('wo', '0', 'cmi.core.session_time', 'CMITimespan', '', '', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.core.student_id', 'CMIIdentifier', '', userID, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.core.student_name', 'CMIString255', '', LastName + ", " + firstName, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.core.total_time', 'CMITimespan', '', '0000:00:00', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.interactions._children', 'CMIString255', '"id","objectives","time","type","correct_responses","weighting","student_response","result","latency"', 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.interactions._count', 'CMIInteger', '', 0, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.launch_data', 'CMIString4096', '', datafromlms, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.objectives._children', 'CMIString255', '"id","score","status"', 'id,score,status', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.objectives._count', 'CMIInteger', '', 0, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.student_data._children', 'CMIString255', '"mastery_score","max_time_allowed","time_limit_action"', '', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.student_data.mastery_score', 'CMIDecimal', '', masteryscore, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.student_data.max_time_allowed', 'CMITimespan', '', maxtimeallowed, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.student_data.time_limit_action', 'CMIVocabulary', '"exit,message":"exit,no message":"continue,message":"continue,no message"', timelimitaction, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.student_preference._children', 'CMIString255', '"audio","language","speed","text"', 'audio,language,speed,text', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.student_preference.audio', 'CMIInteger', '-9999,100', '0', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.student_preference.language', 'CMIString255', '', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.student_preference.speed', 'CMIInteger', '-100,100', '0', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.student_preference.text', 'CMIInteger', '', '0', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.suspend_data', 'CMIString4096', '-1,1', '', sdNew);
    sdNew.storeLocal = true;
}



/**
*
*   addTimes - add session time to total time return the result
*		timeTotal, timeSession - SCORM formatted times (HHHH:MM:SS.)
*
**/
function addTimesSCORM12(timeTotal, timeSession)
{
	/* see if there is a session time */
	if (timeSession == '')
		return timeTotal;
	
	/* break apart the times */
	var aTotal = timeTotal.split(':');
	var aSession = timeSession.split(':');
	for (var i=0; i<3; i++)
	{
		aTotal[i] -= 0;
		aSession[i] -= 0;
	}
	var nMin = 0;
	var nHour = 0;
	
	/* add the seconds */
	aTotal[2] += aSession[2];
	if (aTotal[2] > 60)
	{
		nMin = 1;
		aTotal[2] -= 60;
	}
	/* add the minutes */
	aTotal[1] += aSession[1] + nMin;
	if (aTotal[1] > 60)
	{
		nHour = 1;
		aTotal[1] -= 60;
	}
	/* add the hours */
	aTotal[0] += aSession[0] + nHour;
	
	// format
	for (i=0; i<3; i++)
	{
		/* avoid math round off problems */
		aTotal[i] = Math.floor((aTotal[i] - 0) * 100) / 100;
		
		/* convert to character */
		aTotal[i] += "";
		
		/* pad with leading 0 if needed */
		if (aTotal[i].length < 2)
			aTotal[i] = '0' + aTotal[i];
	}

    // format the hours to have 4 characters
	while (aTotal[0].length < 4) {
	    aTotal[0] = '0' + aTotal[0];
	}
	
	/* reassemble and return */
	return aTotal.join(':');
}


/**
*
*   LMSInitialize - the visualizer function to handle LMSInitialize
*
**/
function LMSInitialize(value) {
	/* set a global variable to remmember this call was made */
	bInitialized = true;
	var sData = '';
		
	/* see if this is a legal value */
	if (value != "")
	{
		/* it is not, set the error */
		sLastError = '201';
	}
	else
	{
		sLastError = '0';
	}

	
	/* see if this is a legal value */
	if (value != "") {
		/* it is not, tell the user */
		sData += '<br>Your call to LMSInitialize passed an illegal value = (' + value + ')<br>';
	}	
	
	/* build the string for the log */
	sData += 'Called LMSInitialize(' + value + ')';
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return "true";
}

/**
*
*   LMSFinish - the visualizer function to handle LMSFinish
*
**/
function LMSFinish(value) {
    // store scorm data to storage
    storeScormData();

    /* see if this is a legal value */
    if (value != "") {
        /* it is not, set the error */
        sLastError = '201';
    } else {
        sLastError = '0';
    }

    /* check to see if initialize was called */
    var sData = checkInit("");

    /* see if this is a legal value */
    if (value != "") {
        /* it is not, tell the user */
        sData += '<br>The call to LMSFinish passed an illegal value = (' + value + ')<br>';
    }

    /* build the string for the log */
    sData += 'Called LMSFinish(' + value + ')';

    /* update the log */
    showLog(sData);

    /* return the result */
    return "true";
}

/**
*
*   LMSGetValue - the visualizer function to handle LMSGetValue
*		sName - the name of the SCORM data item
*
**/
function LMSGetValue(sName) {
	var sReturn, sdCur, sPart;
	
	/* init the string to send to the log */
	var sData = '';
	
	/* assume we have no error unless we learn otherwise */
	sLastError = '0';
	
	// see if this is cmi.objectives.n.score._children
	if (sName.indexOf("cmi.objectives") == 0 && sName.indexOf("score._children") > -1) {
		// it is, return the objective score values
		sData += 'Called LMSGetValue(' + sName + ') - returned: "' + 'raw,min,max' + '"';
		showLog(sData);
		return "raw,min,max";
	}

	// see if this data already exists */
	sdCur = locateData(sName);
	sReturn = '';
	if (sdCur != null) {
		/* it is, see if it was write only data */
		if (sdCur.mode == 'wo') {
			/* it was, give back an error */
			sLastError = '404';
		} else {
			/* must be a legal call, return the value and set the error */
			sReturn = sdCur.value;
		}
	} else {
		/* we don't have this data so it must be invalid */
		/* see if it is an attempt to look for children */
		if (sName.indexOf('._children') > -1) {
			/* it is, break off the last part and see if we can find it in our array */
			sPart = sName.substring(0,sName.lastIndexOf('._children'));
			sdCur = locateData(sPart);
			if (sdCur != null) {
				/* attempted to get children of a non-array value */
				sLastError = '202';
			}
		} else if (sName.indexOf('._count') > -1) {
			/* looking for count break off the last part and see if we can find it in our array */
			sPart = sName.substring(0,sName.lastIndexOf('._count'));
			sdCur = locateData(sPart);
			if (sdCur != null) {
				/* attempted to get children of a non-array value */
				sLastError = '203';
			} else {
				/* this _count is for an array but the _count does not exist yet, create it */
				var sdNew = new ScormData('ro','0',sName,'CMIInteger','',0,null);
				if (sdNew != null) {
					/* it does, insert it alphabetically into the list */
					sdNew.insertAlpha(sdList);
				}
				sReturn = '0';
			}
		}
			
		/* see if we set an error */
		if (sLastError == '0') {
			/* we did not, set it for an incorrect name */
			sLastError = '201';
		}			
	}

	/* check to see if initialize was called */
	sData = checkInit(sData);
	
	/* build the string for the log */
	sData += 'Called LMSGetValue(' + sName + ') - returned: "' + sReturn + '"';
	
	/* update the log */
	showLog(sData);
	
	/* return the result always as a string */
	return sReturn + '';
}

/**
*
*   LMSSetValue - the visualizer function to handle LMSSetValue
*		sName - the name of the SCORM data item
*		sValue - the new value
*
**/
function LMSSetValue(sName, sValue) {
    var sdCur, sdNew, sReturn;

    /* init the string to send to the log */
    var sData = '';

    /* see if the data item already exists */
    sdCur = locateData(sName);
    sReturn = 'false';
    if (sdCur != null) {
        /* it does, see if this data can be written */
        if (sdCur.mode == 'wo' || sdCur.mode == 'rw') {
            /* it can, set the data */
            sdCur.setValue(sValue);

            /* set the global error value to the format error in this item */
            sLastError = sdCur.lastError;

            /* see if there was an error */
            if (sLastError == '0') {
                /* no error, return true */
                sReturn = 'true';
            }
        } else {
            /* item is read-only, it cannot be written */
            sLastError = '403';
        }
    } else {
        /* the name is not in the list, see if it has a legal format */
        sdNew = createScormData(sName)
        if (sdNew != null) {
            /* it does, insert it alphabetically into the list */
            sdNew.insertAlpha(sdList);

            /* set the value */
            sdNew.setValue(sValue);
            sLastError = sdNew.lastError;
            sReturn = 'true';
        } else {
            /* illegal data item  */
            sLastError = "201";
        }
    }

    /* check to see if initialize was called */
    sData = checkInit(sData);

    // mark SCORM data as changed
    bScormDataChanged = true;

    /* build the string for the log */
    sData += 'Called LMSSetValue(' + sName + ', "' + sValue + '") - returned: ' + sReturn;

    /* update the log */
    showLog(sData);

    /* return the result */
    return sReturn;
}


/**
*
*   LMSGetLastError - the visualizer function to handle LMSGetLastError
*
**/
function LMSGetLastError() {
	/* init the string to send to the log */
	var sData = '';

	/* build the string for the log */
	sData += 'Called LMSGetLastError() - returned: ' + sLastError;
	
	/* update the log */
	showLog(sData);
	
	return sLastError;
}

/**
*
*   LMSGetErrorString - the visualizer function to handle LMSGetErrorString
*
**/
function LMSGetErrorString(value) {
	var sReturn = "";
	
	/* init the string to send to the log */
	var sData = '';

	if (value == "0")   sReturn = "No error";
	else if (value == "101") sReturn = "General exception";
	else if (value == "201") sReturn = "Invalid argument error";
	else if (value == "202") sReturn = "Element cannot have children";
	else if (value == "203") sReturn = "Element not an array – cannot have count";
	else if (value == "301") sReturn = "Not initialized";
	else if (value == "401") sReturn = "Not implemented error";
	else if (value == "402") sReturn = "Invalid set value, element is a keyword";
	else if (value == "403") sReturn = "Element is read only";
	else if (value == "404") sReturn = "Element is write only";
	else if (value == "405") sReturn = "Incorrect Data Type";
	else {
		sData +='<br>Illegal value passed to LMSGetErrorString, value = (' + value + ')<br>';
	}
	
	/* build the string for the log */
	sData += 'Called LMSGetErrorString(' + value + ') - returned: ' + sReturn;
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return sReturn;
}

/**
*
*   LMSCommit - the visualizer function to handle LMSCommit
*
**/
function LMSCommit(value) {
    // store scorm data to storage
    storeScormData();

	/* init the string to send to the log */
	var sData = '';
	
	/* see if this is a legal value */
	if (value != "") {
		/* it is not, tell the user */
		sData += '<br>LMSCommit passed an illegal value = (' + value + ')<br>';
	}	
	
	/* build the string for the log */
	sData += 'Called LMSCommit(' + value + ')';
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return "true";
}

/**
*
*   LMSGetDiagnostic - the visualizer function to handle LMSGetDiagnostic
*
**/
function LMSGetDiagnostic(value) {
	/* init the string to send to the log */
	var sData = '';
	
	/* build the string for the log */
	sData += 'Called LMSGetDiagnostic(' + value + ')';
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return 'REPLY HAZY, TRY AGAIN';
}