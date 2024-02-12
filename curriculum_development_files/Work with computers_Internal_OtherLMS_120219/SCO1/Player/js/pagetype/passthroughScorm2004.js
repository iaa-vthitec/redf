/* Copyright 2006-2014 e-Learning Consulting. All Rights Reserved. See license agreement */
/* scorm2004.js - version 2.0 */


/**
*
* initSCORM2004API - init the SCORM 2004 API and set all of the default values based on an initial launch 
*
**/
function initSCORM2004API(API_1484_11, userID, firstName, lastName, minProgressMeasure, timeLimitAction, dataFromLMS) {
	/* init the SCORM data list */
    initScorm2004Data(userID, firstName, lastName, minProgressMeasure, timeLimitAction, dataFromLMS);

	/* create the SCORM API callbacks */
	API_1484_11.Initialize = Initialize;
	API_1484_11.Terminate = Terminate;
	API_1484_11.SetValue = SetValue;
	API_1484_11.GetValue = GetValue;
	API_1484_11.GetLastError = GetLastError;
	API_1484_11.GetErrorString = GetErrorString;
	API_1484_11.Commit = Commit;
	API_1484_11.GetDiagnostic = GetDiagnostic;
}

/**
*
* initScorm2004Data - initializes the lsit of SCORM 2004 data 
*
**/
function initScorm2004Data(userID, firstName, LastName, minProgressMeasure, timeLimitAction, dataFromLMS) {
    var sdNew;

    /* init the SCORM data list */
    sdList = new ScormData('ro', '0', 'cmi._version', 'CMIIdentifier', '', '1.0', null);
    sdNew = new ScormData('ro', '0', 'cmi.comments_from_learner._children', 'CMIString255', '"comment","location","timestamp"', 'comment,location,timestamp', sdList);
    sdNew = new ScormData('ro', '0', 'cmi.comments_from_learner._count', 'CMIInteger', '', 0, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.comments_from_lms._children', 'CMIString255', '"comment","location","timestamp"', 'comment,location,timestamp', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.comments_from_lms._count', 'CMIInteger', '', 0, sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.completion_status', 'CMIVocabulary', '"completed":"incomplete":"not attempted":"unknown"', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.completion_threshold', 'CMIInteger', '', minProgressMeasure, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.credit', 'CMIVocabulary', '"credit":"no-credit"', 'credit', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.entry', 'CMIVocabulary', '"":"ab-initio":"resume"', 'ab-initio', sdNew);
    sdNew = new ScormData('wo', '0', 'cmi.exit', 'CMIVocabulary', '"":"normal":"logout":"suspend":"time-out"', '', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.interactions._children', 'CMIString255', '"id","objectives","timestamp","type","correct_responses","weighting","learner_response","result","latency","description"', 'id,objectives,timestamp,type,correct_responses,weighting,learner_response,result,latency,description', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.interactions._count', 'CMIInteger', '', 0, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.launch_data', 'CMIString4096', '', dataFromLMS, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.learner_id', 'CMIIdentifier', '', userID, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.learner_name', 'CMIString255', '', LastName + ", " + firstName, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.learner_preference._children', 'CMIString255', '"audio_level","language","delivery_speed","audio_captioning"', 'audio_level,language,delivery_speed,audio_captioning', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.learner_preference.audio_level', 'CMIInteger', '0,100', '0', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.learner_preference.language', 'CMIString255', '', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.learner_preference.delivery_speed', 'CMIInteger', '-0,100', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.learner_preference.audio_captioning', 'CMIInteger', '-1,1', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.location', 'CMIString255', '', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.max_time_allowed', 'CMIInteger', '', '', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.mode', 'CMIVocabulary', '"normal":"review":"browse"', 'normal', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.objectives._children', 'CMIString255', '"id","score","success_status","completions_status","progress_measure",description', 'id,score,success_status,progress_measure,description', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.objectives._count', 'CMIInteger', '', 0, sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.progress_measure', 'CMIInteger', '0,1', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.scaled_passing_scoree', 'CMIInteger', '-1,1', '', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.score._children', 'CMIString255', '"scaled","max","min","raw"', 'scaled,max,min,raw', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.score.scaled', 'CMIDecimal', '0,1', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.score.max', 'CMIDecimal', '0,100', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.score.min', 'CMIDecimal', '0,100', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.score.raw', 'CMIDecimal', '0,100', '', sdNew);
    sdNew = new ScormData('wo', '0', 'cmi.session_time', 'CMITimespan', '', '', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.success_status', 'CMIVocabulary', '"passed":"failed":"unknown"', 'unknown', sdNew);
    sdNew = new ScormData('rw', '0', 'cmi.suspend_data', 'CMIString64000', '', '', sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.time_limit_action', 'CMIVocabulary', '"exit,messaged":"continue,message":"exit,no message":"continue,no message"', timeLimitAction, sdNew);
    sdNew = new ScormData('ro', '0', 'cmi.total_time', 'CMITimespan', '', 'PT0S', sdNew);
}

/**
*
*   Initialize - initialize the SCORM communications
*
**/
function Initialize(value) {
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
		sData += '<br>Your call to Initialize passed an illegal value = (' + value + ')<br>';
	}	
	
	/* build the string for the log */
	sData += 'Called Initialize(' + value + ')';
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return "true";
}

/**
*
*   Terminate - Terminate the SCORM communications
*
**/
function Terminate(value) {
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
		sData += '<br>The call to Terminate passed an illegal value = (' + value + ')<br>';
	}	

	/* build the string for the log */
	sData += 'Called Terminate(' + value + ')';

	/* update the log */
	showLog(sData);
	
	/* return the result */
	return "true";
}

/**
*
*   SGetValue - get the value of a SCORM data item
*		sName - the name of the SCORM data item
*
**/
function GetValue(sName) {
    var sReturn, sdCur, sPart;
	
    /* init the string to send to the log */
    var sData = '';
	
    /* assume we have no error unless we learn otherwise */
    sLastError = '0';
	
    // see if this is cmi.objectives.n.score._children
    if (sName.indexOf("cmi.objectives") == 0 && sName.indexOf("score._children") > -1) {
        // it is, return the objective score values
        sData += 'Called GetValue(' + sName + ') - returned: "' + 'raw,min,max,scaled' + '"';
        showLog(sData);
        return "raw,min,max,scaled";
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

    // see if this is 'cmi.completion_status' AND the SCO has never set a value
    if (sName == 'cmi.completion_status' && sReturn == "") {
        // it is, get the values of completion theshold and progress measure
	    var sdThreshold = locateData('cmi.completion_threshold');
	    var sdProgress = locateData('cmi.progress_measure');

	    // see if threshold OR measure are not set
	    if (sdThreshold.value == "" || sdProgress.value == "") {
	        // at least one is not set, set the return to unknown
	        sReturn = "unknown";
	    } else {
	        // see if both the threshold AND measure are set
	        if (sdThreshold.value != "" && sdProgress.value != "") {
	            // both set, see if theshold is mathmatically less than progress
	            if (sdThreshold.value - 0 < sdProgress.value - 0) {
	                // it is, set the return value to completed
	                sReturn = "completed";
	            } else {
	                // threshold is mathmatically >= progress, set the return value to incomplete
	                sReturn = "incomplete";
	            }
	        } else {
	            // only one of threshold and progress are set, set to unknown
	            sReturn = "unknown";
	        }

	        // init the value of completion status
	        sdCur.value = sReturn;
	    }
    }

	/* check to see if initialize was called */
	sData = checkInit(sData);
	
	/* build the string for the log */
	sData += 'Called GetValue(' + sName + ') - returned: "' + sReturn + '"';
	
	/* update the log */
	showLog(sData);
	
	/* return the result always as a string */
	return sReturn + '';
}

/**
*
*   SetValue - set the value of a SCORM data item
*		sName - the name of the SCORM data item
*		sValue - the new value
*
**/
function SetValue(sName, sValue) {
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
    sData += 'Called SetValue(' + sName + ', "' + sValue + '") - returned: ' + sReturn;

    /* update the log */
    showLog(sData);

    /* return the result */
    return sReturn;
}


/**
*
*   GetLastError - get the last SCORM communcations error
*
**/
function GetLastError() {
	/* init the string to send to the log */
	var sData = '';

	/* build the string for the log */
	sData += 'Called GetLastError() - returned: ' + sLastError;
	
	/* update the log */
	showLog(sData);
	
	return sLastError;
}

/**
*
*   GetErrorString - get the string describing the last SCORM communications error
*
**/
function GetErrorString(value) {
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
		sData +='<br>Illegal value passed to GetErrorString, value = (' + value + ')<br>';
	}
	
	/* build the string for the log */
	sData += 'Called GetErrorString(' + value + ') - returned: ' + sReturn;
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return sReturn;
}

/**
*
*   Commit - commit the SCORM data to the server
*
**/
function Commit(value) {
    // store scorm data to storage
    storeScormData();

	/* init the string to send to the log */
	var sData = '';
	
	/* see if this is a legal value */
	if (value != "") {
		/* it is not, tell the user */
		sData += '<br>Commit passed an illegal value = (' + value + ')<br>';
	}	
	
	/* build the string for the log */
	sData += 'Called Commit(' + value + ')';
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return "true";
}

/**
*
*   GetDiagnostic - get a diagnostic error for a SCORM communications problem
*
**/
function GetDiagnostic(value) {
	/* init the string to send to the log */
	var sData = '';
	
	/* build the string for the log */
	sData += 'Called GetDiagnostic(' + value + ')';
	
	/* update the log */
	showLog(sData);
	
	/* return the result */
	return 'REPLY HAZY, TRY AGAIN';
}

/**
*
*   addTimes - add session time to total time return the result
*		timeTotal, timeSession - SCORM 2004 formatted times
*
**/
function addTimesSCORM2004(timeTotal, timeSession) {
    // convert the session time str (PT0H0M0S) to elapsed 1/10 seconds */
    var session_time = ValTimeSpan(timeSession);

    // convert the total time too
    var total_time = ValTimeSpan(timeTotal);

    // add the times together
    total_time += session_time;

    // convert the time back to the SCORM 2004 time format
    return SecsToIntervalStr(total_time);
}

/*****************************************************************************************************

Name:	ValTimeSpan()

		Validate interval time.

		The timeinterval (second, 10, 2) denotes that the value for the data model 
		element timeinterval represents elapsed time with a precision of 0.01 seconds[1]. 
		The SCORM dot-notation binding defines a particular format for a characterstring 
		to represent a timeinterval.

		The format of the characterstring shall be as follows:

		P[yY][mM][dD] [T[hH][mM][s[.s]S]] where:

		y: The number of years (integer, >= 0, not restricted)
		m: The number of months (integer, >=0, not restricted)
		d: The number of days (integer, >=0, not restricted)
		h: The number of hours (integer, >=0, not restricted)
		n: The number of minutes (integer, >=0, not restricted)
		s: The number of seconds or fraction of seconds (real or integer, >=0,
			 not restricted). If fractions of a second are used, 
			 SCORM further restricts the string to a maximum of 2 digits

		The character literals designators P,Y,M,D,T,H,M,S 
			shall appear if the corresponding non-zero value is present.

		Example:
		P1Y3M2DT3H indicates a period of time of 1 year, 3 months, 2 days and 3 hours
		PT3H5M indicates a period of time of 3 hours and 5 minutes

		Implementers should be aware that the format and binding is for the communication of the 
		data between a SCO and a LMS. Since the format is representing a period of time, then 
		durations like PT5M is equivalent to PT300S

return:
		-1	- Failed
		N	- convert total time to 1/10 of seconds

*****************************************************************************************************/

var TICKS_IN_A_SECOND = (10);
var TICKS_IN_A_MINUTE = (60 * TICKS_IN_A_SECOND);
var TICKS_IN_A_HOUR = (60 * TICKS_IN_A_MINUTE);
var TICKS_IN_A_DAY = (24 * TICKS_IN_A_HOUR);
var TICKS_IN_A_YEAR = (365 * TICKS_IN_A_DAY);

var TIMESPAN_FAILED = -1;

function ValTimeSpan(data) {
    var val;
    var designator;
    var total;
    var pos;
    var df;

    total = 0;
    pos = 0;

    while (pos < data.length) {
        designator = data.charAt(pos++);

        if (designator == 'P') {
            while (pos < data.length && data.charAt(pos) != 'T') {
                val = "";
                while (pos < data.length && isNaN(data.charAt(pos)) == 0)
                    val += data.charAt(pos++);

                switch (data.charAt(pos++)) {
                    case 'Y':
                        total += (val * TICKS_IN_A_YEAR);
                        break;

                    case 'M':
                        total += (val * 30 * TICKS_IN_A_DAY);
                        break;

                    case 'D':
                        total += (val * TICKS_IN_A_DAY);
                        break;

                    case 'T':
                        break;

                    default:
                        return TIMESPAN_FAILED;
                }
            }
        }
        else if (designator == 'T') {
            /* shoud be a p before t */

            df = 0;
            while (pos < data.length) {
                val = "";
                while (pos < data.length
				&& (isNaN(data.charAt(pos)) == 0 || data.charAt(pos) == '.')) {
                    val += data.charAt(pos++);
                }

                switch (data.charAt(pos++)) {
                    case 'H':
                        total += (val * TICKS_IN_A_HOUR);
                        df++;
                        break;

                    case 'M':
                        total += (val * TICKS_IN_A_MINUTE);
                        df++;
                        break;

                    case 'S':
                        val *= TICKS_IN_A_SECOND;
                        total += val;
                        df++;
                        break;

                    default:
                        return TIMESPAN_FAILED;
                }
            }

            if (df == 0) {
                return TIMESPAN_FAILED;
            }
        }
        else {
            return TIMESPAN_FAILED;
        }
    }

    return Math.floor(total);
}

/*****************************************************************************************************

Func:	SecsToIntervalStr()

Desc:	Convert seconds to an iso time interval string of the form
		"PnYnMnDTnHnMnS"

		The Seconds paramter is 1/10 of seconds (TICKS_IN_A_SECOND) 
		(converted from ValTimeSpan())

*****************************************************************************************************/
function SecsToIntervalStr(sec) {
    var s;
    var yrs, mon, day, hrs, min;

    yrs = Math.floor(sec / TICKS_IN_A_YEAR);
    sec -= (yrs * TICKS_IN_A_YEAR);

    mon = Math.floor(sec / (TICKS_IN_A_DAY * 30));
    sec -= mon * (TICKS_IN_A_DAY * 30);

    day = Math.floor(sec / TICKS_IN_A_DAY);
    sec -= (day * TICKS_IN_A_DAY);

    hrs = Math.floor(sec / TICKS_IN_A_HOUR);
    sec -= (hrs * TICKS_IN_A_HOUR);

    min = Math.floor(sec / TICKS_IN_A_MINUTE);

    sec -= (min * TICKS_IN_A_MINUTE);

    sec = sec / TICKS_IN_A_SECOND;

    /* just get 2 sig digits */

    sec *= 100;
    sec = Math.floor(sec) / 100;

    s = "P";

    if (yrs)
        s += (yrs + "Y");

    if (mon)
        s += (mon + "M");

    if (day)
        s += (day + "D");

    if (hrs || min || sec) {
        s += "T";

        if (hrs)
            s += (hrs + "H");

        if (min)
            s += (min + "M");

        if (sec)
            s += (sec + "S");
    }

    return (s);
}