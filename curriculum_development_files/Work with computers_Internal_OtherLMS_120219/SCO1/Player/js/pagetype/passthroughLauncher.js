/* Copyright 2006-2014 e-Learning Consulting. All Rights Reserved. See license agreement */
/* Version 2.0 */

///////// DEBUG FLAG - set to true to show debug information in a popup window
var _debug = false;

/**
*
* Global Variables
*
**/

bInitialized = false; /* LMS Init was called */
bFinish = false; /* we finished the session */
sdList = null; /* the top of the scorm data item list */
sLastError = '0'; /* the last error code returned by a SCORM API call */
launchData = null; /* course launch data */
oData = null; /* SCORM data */

function LaunchData() {
    {
        // userID
        this.UserID = parent.courseController.getUserId();

        //learner name
        var sName = parent.course.scormState.getLearnerName();
        if (sName.indexOf(',') > 0) {
            var aParts = sName.split(',');
            if (aParts[1]) aParts[1] = jQuery.trim(aParts[1]);
            this.FirstName = aParts[1];
            this.LastName = aParts[0];
        }
        this.CourseLocation = "course";

        this.CurrentPage = null;
    }
}


$(document).ready(function () {

    launchData = new LaunchData();

    // get azure course data service if course is launched on azure
    azureCDS = parent.course.settings.courseDataService;
    //wsUrl = parent.GetLMSServiceEndpoint && parent.GetLMSServiceEndpoint();

    //if (!wsUrl) wsUrl = 'http://learningcentral/Training/LDService.aspx';

    // resizing window may trigger JS error so protect with try-catch
    try {
        // see if the admin wants to control the size of this window
        if (launchData.LaunchMediaDefaultSize != "DefaultSize") {
            // verify we have resonable sizes
            if (launchData.LaunchMediaWidth && launchData.LaunchMediaHeight && !isNaN(launchData.LaunchMediaWidth) && !isNaN(launchData.LaunchMediaWidth)) {
                // we do, resize
                window.resizeTo(launchData.LaunchMediaWidth, aunchData.LaunchMediaHeight);
            }
        } else {
            // wants to maxmimize
            window.moveTo(0, 0);
            window.resizeTo(screen.width, screen.height);
        }
    } catch (e) {
    }

    // init course adapter
    InitAdapter();
});

/**
*
* readManifest - validates course manifest
*
**/
function readManifest() {

    // read course manifest file
    var oImsmanifestXML = getXmlDocument(launchData.CourseLocation + "/imsmanifest.xml");

    if (!oImsmanifestXML) {
        alert("The imsmanifest.xml file course cannot be read.");
        return null;
    }

    var aScormVersion = $(oImsmanifestXML).find("schemaversion");
    if (!aScormVersion.length) {
        alert("The version of SCORM could not be determined.");
        return null;
    } else {
        launchData.ScormVersion = $(aScormVersion[0]).text();
        if (!launchData.ScormVersion) {
            alert("The version of SCORM could not be determined.");
            return null;
        }
    }

    // check the number of SCOs by counting organization item tags
    var SCOs = $(oImsmanifestXML).find("organizations organization item");
    if (!SCOs.length || SCOs.length > 1) {
        alert("The manifest file has an invalid number of SCOs.");
        return null;
    }
    // get the course title from the item title child element
    launchData.CourseTitle = $("title", SCOs[0]).text();
    // get the launch URL
    launchData.LaunchURL = $(oImsmanifestXML).find("resources resource[identifier=" + $(SCOs[0]).attr("identifierref") + "]").attr("href");
    // everything looks good so far, return true if we found a valid SCORM version in the manifest
    if (launchData.ScormVersion == "1.2" || launchData.ScormVersion == "CAM 1.3" || launchData.ScormVersion == "2004 3rd Edition" || launchData.ScormVersion == "2004 4th Edition") {
        return SCOs[0];
    } else {
        // invalid SCORM version
        alert("The version of SCORM could not be determined.");
    }
    return null;
}

/**
*
* InitAdapter - init the SCORM adapter plus the SCPRM data for this course
*
**/
function InitAdapter() {
    // get current page
    if (!this.parent.course.currentPopupPageId)
        launchData.CurrentPage = this.parent.course.getCurrentPage();
    else
        launchData.CurrentPage = this.parent.courseController.getPageFromId(this.parent.course.currentPopupPageId);

    if (!launchData.CurrentPage.MagazineCourseUrl) {
        // get the item tag from the imsmanifest.xml file
        var itemTag = readManifest();

        // return if we could not get a valid item tag because of an imsmanifest.xml format problem
        if (!itemTag) return;

        // see what SCORM version we have
        if (launchData.ScormVersion == "1.2") {
            // we have SCORM 1.2, init the SCORM 1.2 object
            window.API = new Object;

            // an <item> tag may contain these tags
            /*
                <adlcp:maxtimeallowed>00:30:00</adlcp:maxtimeallowed>
                <adlcp:timelimitaction>exit,no message</adlcp:timelimitaction>
                <adlcp:datafromlms>Some information about the learning resource</adlcp:datafromlms>
                <adlcp:masteryscore>90</adlcp:masteryscore>
            */

            // get the data if these tags exist
            var maxtimeallowed = $(itemTag).find("adlcp\\:maxtimeallowed").text();
            var timelimitaction = $(itemTag).find("adlcp\\:timelimitaction").text();
            var datafromlms = $(itemTag).find("adlcp\\:datafromlms").text();
            var masteryscore = $(itemTag).find("adlcp\\:masteryscore").text();

            // init the SCORM 1.2 data
            initSCORM12API(API, launchData.UserID, launchData.FirstName, launchData.LastName, maxtimeallowed, timelimitaction, datafromlms, masteryscore);
        } else {
            // we have SCORM 2004, init the SCORM 2004 object
            window.API_1484_11 = new Object;

            // an <item> tag may contain these tags
            /*
              <adlcp:completionThreshold completedByMeasure="true" minProgressMeasure="0.8" />
              <adlcp:timeLimitAction>exit,no message</adlcp:timeLimitAction>
              <adlcp:dataFromLMS>Some SCO Information</adlcp:dataFromLMS>
            */

            // get the data if these tags exist
            var completionThreshold = $(itemTag).find("adlcp\\:completionThreshold");
            if (completionThreshold.length)
                var minProgressMeasure = completionThreshold.attr("minProgressMeasure");
            else
                var minProgressMeasure = "";
            var timeLimitAction = $(itemTag).find("adlcp\\:timeLimitAction").text();
            var dataFromLMS = $(itemTag).find("adlcp\\:dataFromLMS").text();

            // init the SCORM 1.2 data
            initSCORM2004API(API_1484_11, launchData.UserID, launchData.FirstName, launchData.LastName, minProgressMeasure, timeLimitAction, dataFromLMS);
        }

        // restore the SCORM data from the previous launch
        getAllLMSData();

        // launch the SCO
        launchIt(launchData.CourseLocation + "/" + launchData.LaunchURL);
    }
    else {
        // restore the SCORM data from the previous launch
        getAllLMSData();

        // launch the course from magazine
        launchIt(launchData.CurrentPage.MagazineCourseUrl);
    }
}

/**
*
*  ScormData - a user defined object creation function
*	mode - is the data read-only (ro), read-write (rw) or write-only
*	lastError - the last error returned by the LMS for this data item
*	name - the name of this item, for example cmi.suspend_data
*	type - the type of data, for example CMIString4096
*	range - the range of the data, for example the allowable values for _children
*	value - the value of the data item
*	prev - the previous object in the list, if not null, we insert our new object after the previous one
*
**/
function ScormData(mode, lastError, name, type, range, value, prev) {
    /* set data items */
    this.mode = mode;
    this.lastError = lastError;
    this.name = name;
    this.type = type;
    this.range = range;
    this.value = value;

    /* see if the previous item is null */
    if (prev == null) {
        /* it is, we don't need to point this object to anything */
        this.next = null;
    } else {
        /* insert this object in the list */
        this.next = prev.next;
        prev.next = this;
    }

    /* set functions */
    this.setValue = setValue;
    this.insertAlpha = insertAlpha;
}

/**
*
*  getAllLMSData - gets the data available from the LMS 
*
**/
function getAllLMSData() {
    try {
        // create web service param objectst
        var serviceScormInfo = {
            "UserID": launchData.UserID,
            "CourseLocation": launchData.CourseLocation,
            "ScormVersion": launchData.ScormVersion
        }

        var oDataCurrent = null;
        oData = {}; oData.Data = [];
        // get previosly recorderd state data from non-SCORM webservice
        azureCDS && azureCDS.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: azureCDS.LdServiceBaseUrl + "consumptions/nonscorm/" + launchData.UserID + "/" + azureCDS.CourseID + "/" + this.parent.course.settings.AttemptId,
            processData: false,
            data: "{}",
            async: false,
            crossDomain: true,
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + parent.parent.GetTokenToClient())
            }, success: function (data) {
                if (data && data.Data && data.Data.$values && data.Data.$values.length) {
                    for (i = 0; i < data.Data.$values.length; i++) {
                        var current = data.Data.$values[i];
                        oData.Data.push({ Key: current.Key, Value: current.Value });
                        if (current.Key == launchData.CurrentPage.id) {
                            oDataCurrent = current.Value;
                        }
                    }
                }
            }, error: function () {
            }, complete: function () {
            }
        });

        if (oDataCurrent) {
            // parse local scorm data
            var aScormData = JSON.parse(oDataCurrent);
            // restore scorm data
            restoreBuff(aScormData);
        } else {
            oData.Data.push({ Key: launchData.CurrentPage.id, Value: null });
        }
    } catch (e) { }
}

/**
*
*   locateData - find the SCORM data item in the list
*		sName - the name of the data item
**/
function locateData(sName) {
    for (var sdCur = sdList; sdCur != null; sdCur = sdCur.next) {
        if (sdCur.name == sName)
            return sdCur;
    }
    return null;
}

/**
*
*   setValue - store the data value and check to make sure the data format is correct
*		sData - the data to set
**/
function setValue(sData) {
    var aParts, sVal;

    /* set the data, we'll keep track of it no matter what it is */
    sData += "";
    this.value = sData;

    /* set the lmsError to '0' for now, if it fails a test it will be set to the proper error code */
    this.lastError = '0';

    // see if status is changed to complete page
    if (launchData.ScormVersion == "1.2") {
        // see if cmi.core.lesson.status is "completed", "passed" or "failed"
        if (this.name == "cmi.core.lesson_status" && (sData == "completed" || sData == "passed" || sData == "failed")) {
            launchData.CurrentPage.setComplete();
        }
    } else {
        // 2004 3rd Edition
        // see if cmi.completion_status is completed
        if (this.name == "cmi.completion_status" && sData == "completed") {
            launchData.CurrentPage.setComplete();
        }
    }


    /* see what kind of data we are expecting */
    if (this.type == 'CMIString4096') {
        /* see if the length is the right size */
        if (sData.length > 4096)
            this.lastError = '405';
    } else if (this.type == 'CMIString64000') {
        /* see if the length is the right size */
        if (sData.length > 64000)
            this.lastError = '405';
    } else if (this.type == 'CMIString255') {
        /* see if the length is the right size */
        if (sData.length > 255)
            this.lastError = '405';
    } else if (this.type == 'CMIIdentifier') {
        /* see if the length is the right size */
        if (sData.length > 255)
            this.lastError = '405';

        /* see if there are any spaces */
        if (sData.indexOf(' ') >= 0)
            this.lastError = '405';
    } else if (this.type == 'CMITimespan' || this.type == 'CMITime') {
        /* data can be blank */
        if (sData == "")
            return;

        // see what SCORM version we have
        if (launchData.ScormVersion == "1.2") {
            /* see if the time format is correct, check that h:m:s fields are all there, are the 
		    *  minimum length and all represent numbers */
            aParts = sData.split(':');
            if (aParts.length < 3 || aParts[0].length < 2 || aParts[1].length < 2 || aParts[2].length < 2 ||
		        isNaN(aParts[0]) == true || isNaN(aParts[1]) == true || isNaN(aParts[2]) == true) {
                this.lastError = '205';
            } else {
                /* format seems good so far, break the seconds in whole and fractional parts */
                aParts = aParts[2].split('.');

                /* see if there is a fractional part */
                if (aParts.length > 1) {
                    /* there is, see if there are too many digits in the fractional part */
                    if (aParts[1].length > 2) {
                        /* there are, set the error */
                        this.lastError = '205';
                    }
                }
            }
        } else {
            // SCORM 2004, see if there is an error
            if (ValTimeSpan(sData) == -1) {
                // there is, remember it
                this.lastError = '205';
            }
        }
    } else if (this.type == 'CMIInteger') {
        /* data can be blank */
        if (sData == "")
            return;

        /* see if this is a number and an integer*/
        if (isNaN(sData) == true || sData != Math.floor(sData))
            this.lastError = '405';
    } else if (this.type == 'CMIDecimal') {
        /* data can be blank */
        if (sData == "")
            return;

        /* see if this is a number */
        if (isNaN(sData) == true)
            this.lastError = '405';
    } else if (this.type == 'CMIVocabulary') {
        /* break apart the range string into an array */
        aParts = this.range.split(':');

        /* loop until we have looked through all of the range items */
        for (i = 0; i < aParts.length; i++) {
            /* strip the quotes from the range value */
            if (aParts[i] == '""')
                sVal = '';
            else
                sVal = aParts[i].substring(1, aParts[i].length - 1);

            /* see if we found a match */
            if (sVal == sData)
                return;

            /* see if this could be a decimal value */
            if (sVal == 'CMIDecimal' && isNaN(sData) == false)
                return;
        }

        /* never found a match, must not have been a valid vocabulary value */
        this.lastError = '405';
    }
}

/**
*
*   insertAlpha - insert a ScormData object in an alphabetically sorted list
*		sdTheList - the top of the list
*
**/
function insertAlpha(sdTheList) {
    /* see if the list is emplty */
    if (sdTheList == null) {
        /* it is, return this object as the top of the list */
        return this;
    }

    /* see if this object should is alphabetically before the first item in the list */
    if (this.name < sdTheList.name) {
        /* it is, insert it in the begining of the list and return the object as the head of the list */
        this.next = sdTheList;
        return this;
    }

    var sdNext;

    /* look through the list until we find where it fits in alphabetically */
    for (var sdCur = sdTheList; sdCur != null; sdCur = sdCur.next) {
        /* see if this is the end of the list */
        if (sdCur.next == null) {
            /* it is, insert the object at the end of the list */
            sdCur.next = this;
            return sdTheList;
        }

        /* see if it fits after this item */
        sdNext = sdCur.next;
        if (this.name < sdNext.name) {
            /* it does, insert it */
            this.next = sdNext;
            sdCur.next = this;
            return sdTheList;
        }
    }
}

/**
*
*   storeScormData - called when we are ready to store data on the server
*
**/
function storeScormData(force) {
    // check if store scorm data should be forced
    if (!force) {
        // store scorm data only if it changed
        if (bFinish || !bScormDataChanged) return;
    }

    /* get SCORM data in an array */
    var scormData = [];
    // it is, loop through all of the scorm data
    for (var sdCur = sdList; sdCur != null; sdCur = sdCur.next) {
        // see what SCORM version we have
        if (launchData.ScormVersion == "1.2") {
            if (sdCur.name == "cmi.core.lesson_location" || sdCur.name == "cmi.core.lesson_status" || sdCur.name == "cmi.suspend_data" || sdCur.name == "cmi.core.entry" || sdCur.name == "cmi.core.total_time") {
                var scormItem = {
                    "name": sdCur.name,
                    "value": sdCur.value
                };
                // push the name/value pair into the array
                scormData.push(scormItem);
            }
        } else {
            // SCORM 2004
            if (sdCur.name == "cmi.location" || sdCur.name == "cmi.completion_status" || sdCur.name == "cmi.suspend_data" || sdCur.name == "cmi.entry" || sdCur.name == "cmi.total_time") {
                var scormItem = {
                    "name": sdCur.name,
                    "value": sdCur.value
                };
                // push the name/value pair into the array
                scormData.push(scormItem);
            }
        }
    }

    if (scormData.length) {
        for (var i = 0; i < oData.Data.length; i++) {
            if (oData.Data[i].Key == launchData.CurrentPage.id) {
                oData.Data[i].Value = JSON.stringify(scormData);
            }
        }
    }
    // store state data in non-SCORM webservice
    var sData = JSON.stringify(oData);
    azureCDS && azureCDS.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: azureCDS.LdServiceBaseUrl + "consumptions/nonscorm/" + launchData.UserID + "/" + azureCDS.CourseID + "/" + this.parent.course.settings.AttemptId,
        data: sData,
        processData: false,
        crossDomain: true,
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + parent.parent.GetTokenToClient())
        }, success: function (data) {
        }, error: function () {
        }, complete: function () {
        }
    });

    // mark scorm data as saved
    bScormDataChanged = false;
}

/**
*
*   restoreBuff - called when we are ready to restore the data stored on the server
*		aData - an array of name value pairs
*
**/
function restoreBuff(aState) {
    /* see if we have enough data */
    if (!aState || !aState.length) return;

    var sdCur, sdNew;

    /* loop through the data to restore the SCORM data */
    for (var i = 0; i < aState.length; i++) {
        // don't overwrite the value of these data items
        if (aState[i].name == "cmi.launch_data") continue;

        // locate the SCORM data item in the list
        sdCur = locateData(aState[i].name);

        // see if we can found the SCORM item
        if (sdCur != null) {
            // we did, add the value to our list
            sdCur.value = aState[i].value;
        } else {
            // does not exist, create the item
            sdNew = createScormData(aState[i].name);

            // see if we were able to create it
            if (sdNew != null) {
                // we did, insert it alphabetically into the list
                sdNew.insertAlpha(sdList);

                // set the value
                sdNew.value = aState[i].value;
            }
        }
    }
}

/**
*
*   showLog - show the log of scorm data calls in the log window
*		sData - data to add to this window
*
**/
var logWindowPassthrough = null;
function showLog(sData) {
    // see if debug is enabled
    if (_debug) {
        // it is, see if the log window exists
        if (logWindowPassthrough == null) {
            // it does not, create it
            logWindowPassthrough = open('', 'logWindowPassthrough', 'width=600,height=600,scrollbars=yes,resizable=yes');
        }

        // write the info to the log window
        if (logWindowPassthrough && !logWindowPassthrough.closed) logWindowPassthrough.document.write(sData + '</br />');
    }
}

/**
*
*   launchIt - the code to actually launch a course
*
**/
function launchIt(sFile) {
    // set document title
    document.title = launchData.CourseTitle;
    // launch the course in the iframe
    document.getElementById("SCO").src = sFile;
}

// get the XML document from a file name
function getXmlDocument(sFile) {
    // get course manifest file
    var jqXML = $.ajax({
        type: 'GET',
        url: sFile,
        dataType: 'xml',
        async: false
    });

    //return XML
    return jqXML.responseText;
}

/**
*
*   checkInit - see if LMSInitialize has been called, if not add an error to the log string
*		sData - the error log string
*
**/
function checkInit(sData) {
    if (!bInitialized) {
        sData += '<br><b>Error:</b>Illegal Function call before LMSInitialize.<br>';
        sLastError = '301';
    }
    return sData;
}

/**
*
*   finishSession - the SCO window has gone away, make sure we complete the session
* XXX - modify to handle SCORM 2004
**/
function finishSession(e) {
    var sdStatus, sdRaw, sdMastery, sdExit, sdEntry, sdSession, sdTotal;

    // do not do anything if we have an invalid SCORM version
    if (!launchData.ScormVersion) return;

    // see what SCORM version we have
    if (launchData.ScormVersion == "1.2") {
        /* SCORM 1.2, see if this has been called */
        if (!bFinish) {
            /* it has not, remember it */
            bFinish = true;

            /* get the lesson status */
            sdStatus = locateData('cmi.core.lesson_status');

            /* see if this value has been set */
            if (sdStatus.value == 'not attempted') {
                /* it has not been set so set it to completed */
                sdStatus.value = 'completed';
            }

            /* see if a raw score was set */
            sdRaw = locateData('cmi.core.score.raw');
            if (sdRaw.value != "") {
                /* it was, get the mastery score */
                sdMastery = locateData('cmi.student_data.mastery_score');

                /* see if it has a value */
                if (sdMastery.value != '') {
                    /* see if the raw score is greater than or equal to the mastery score */
                    if (parseFloat(sdRaw.value) >= parseFloat(sdMastery.value)) {
                        /* it is, set the status to passed */
                        sdStatus.value = 'passed';
                    } else {
                        /* it's less, set status to failed */
                        sdStatus.value = 'failed';
                    }
                }
            }

            /* see if the exit was set */
            sdExit = locateData('cmi.core.exit');
            sdEntry = locateData('cmi.core.entry');
            if (sdExit.value == 'suspend') {
                sdEntry.value = 'resume';
            } else {
                sdEntry.value = '';
            }

            //set status to resume
            if (sdStatus.value == "completed" || sdStatus.value == "passed" || sdStatus.value == "failed") {
                sdEntry.value = '';
            } else {
                sdEntry.value = 'resume';
            }

            /* get the session and total times */
            sdSession = locateData('cmi.core.session_time');
            sdTotal = locateData('cmi.core.total_time');
            sdTotal.value = addTimesSCORM12(sdTotal.value, sdSession.value);
        }
    } else {
        // SCORM 2004, see if this has been called */
        if (!bFinish) {
            /* it has not, remember it */
            bFinish = true;

            // get the completion status to make sure it is set to a value by either the LMS or the SCO
            API_1484_11.GetValue('cmi.completion_status');

            sdStatus = locateData('cmi.completion_status');
            /* see if the exit was set */
            sdExit = locateData('cmi.exit');
            sdEntry = locateData('cmi.entry');
            if (sdExit.value == 'suspend') {
                sdEntry.value = 'resume';
            } else {
                sdEntry.value = '';
            }

            //set status to resume
            if (sdStatus.value == "completed" || sdStatus.value == "passed" || sdStatus.value == "failed") {
                sdEntry.value = '';
            } else {
                sdEntry.value = 'resume';
            }

            /* get the session and total times */
            sdSession = locateData('cmi.session_time');
            sdTotal = locateData('cmi.total_time');
            sdTotal.value = addTimesSCORM2004(sdTotal.value, sdSession.value);
        }
    }

    // force store scorm data to storage
    storeScormData(true);
}

/**
*
*   createScormData - tries to create a SCORM data item given a name of a data item
*		sName - the name of the data item
*
**/
function createScormData(sName) {
    var nNum, sMode, sType, sdCur, nCurCount;

    /* set an error for an illegal value. This will remain set if we return a null */
    sLastError = '201';
    var sRange = ''; /* default range of the new object */

    /* see if this is a potential match for an objectives item */
    if (sName.match(/^cmi\.objectives\.(\d{1,})\./)) {
        /* it is a potential objectives item, remember the number */
        nNum = RegExp.$1 - 0;
        sMode = 'rw'; /* default mode of the new object */

        /* find the specific data item */
        if (sName.match(/^cmi\.objectives\.\d{1,}\.id$/)) {
            /* cmi.objectives.n.id */
            sType = 'CMIIdentifier';
        } else if (sName.match(/^cmi\.objectives\.\d{1,}\.score\.(min|max|raw|scaled)$/)) {
            /* cmi.objectives.n.min max or raw */
            sType = 'CMIDecimal';
            sRange = '-1,100';
        } else if (sName.match(/^cmi\.objectives\.\d{1,}\.status$/)) {
            /* cmi.objectives.n.status */
            sType = 'CMIVocabulary';
            sRange = '"passed":"completed":"failed":"incomplete":"browsed":"not attempted"';
        } else if (sName.match(/^cmi\.objectives\.\d{1,}\.completion_status$/)) {
            /* cmi.objectives.n.completion_status */
            sType = 'CMIVocabulary';
            sRange = '"completed":"incomplete":"unknown":"not attempted"';
        } else if (sName.match(/^cmi\.objectives\.\d{1,}\.success_status$/)) {
            /* cmi.objectives.n.success_status */
            sType = 'CMIVocabulary';
            sRange = '"passed":"failed":"unknown":"not attempted"';
        } else if (sName.match(/^cmi\.objectives\.\d{1,}\.progress_measure$/)) {
            /* cmi.objectives.n.progress_measure */
            sType = 'CMIDecimal';
            sRange = '-0,1';
        } else if (sName.match(/^cmi\.objectives\.\d{1,}\.description$/)) {
            /* cmi.objectives.n.description */
            sType = 'CMIIdentifier';
        } else {
            /* not a match, return null */
            return null;
        }

        /* get the current count of objectives */
        sdCur = locateData('cmi.objectives._count');
        nCurCount = sdCur.value - 0;

        /* see if the number passed is too high, that is, is it more that one past the current count */
        if (nNum > (nCurCount + 1)) {
            /* it is, this makes it an illegal value */
            return null;
        }

        /* see if we need to increment the count */
        if (nNum == nCurCount)
            sdCur.value = (sdCur.value - 0) + 1;

        /* return the created object */
        return new ScormData(sMode, '0', sName, sType, sRange, '', null);
    } else if (sName.match(/^cmi\.interactions\.(\d{1,})\./)) {
        /* its a potential match for an interactions item, remember the number */
        nNum = RegExp.$1 - 0;

        if (launchData.ScormVersion == "1.2") {
            sMode = 'wo'; /* interactions are write only in SCORM 1.2 */
        } else {
            sMode = 'rw'; /* interactions are read-write in SCORM 2004 */
        }

        /* find the specific data item */
        if (sName.match(/^cmi\.interactions\.\d{1,}\.id$/)) {
            /* cmi.interactions.n.id */
            sType = 'CMIIdentifier';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.objectives._count$/)) {
            /* cmi.interactions.n.objectives._count */
            /* this is a read-only field */
            sLastError = '403';
            return null;
        } else if (sName.match(/^cmi\.interactions\.(\d{1,})\.objectives.(\d{1,}).id$/)) {
            /* cmi.interactions.n.objectives.n.id */
            /* see if the count data item exists */
            sCount = 'cmi.interactions.' + RegExp.$1 + '.objectives._count';
            sdCur = locateData(sCount);
            if (sdCur == null) {
                /* it doesn't, see if this is the 0 index objective */
                if (RegExp.$2 == 0) {
                    /* it does, we will need to create the count */
                    sdCur = new ScormData('r', '0', sCount, 'CMIInteger', '', 1, null);
                    sdCur.insertAlpha(sdList);
                } else {
                    /* this is an invalid data item */
                    return null;
                }
            } else {
                /* get the current count of objectives */
                nCurCount = sdCur.value - 0;

                /* see if the number passed is too high, that is, is it more that one past the current count */
                if (RegExp.$2 > (nCurCount + 1)) {
                    /* it is, this makes it an illegal value */
                    return null;
                }

                /* see if we need to increment the count */
                if (nNum == nCurCount)
                    sdCur.value = (sdCur.value - 0) + 1;
            }

            /* set the values to insert this item */
            sType = 'CMIIdentifier';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.time$/)) {
            /* cmi.interactions.n.time */
            sType = 'CMITime';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.timestamp$/)) {
            /* cmi.interactions.n.timestamp */
            sType = 'CMITime';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.type$/)) {
            /* cmi.interactions.n.type */
            sType = 'CMIVocabulary';
            sRange = '"true-false":"choice":"fill-in":"long-fill-in":"matching":"performance":"likert":"sequencing":"numeric":"other"';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.correct_responses._count$/)) {
            /* cmi.interactions.n.correct_responses._count */
            /* this is a read-only field */
            sLastError = '403';
            return null;
        } else if (sName.match(/^cmi\.interactions\.(\d{1,})\.correct_responses.(\d{1,}).pattern$/)) {
            /* cmi.interactions.n.correct_responses.n.pattern */
            /* see if the count data item exists */
            sCount = 'cmi.interactions.' + RegExp.$1 + '.correct_responses._count';
            sdCur = locateData(sCount);
            if (sdCur == null) {
                /* it doesn't, see if this is the 0 index objective */
                if (RegExp.$2 == 0) {
                    /* it does, we will need to create the count */
                    sdCur = new ScormData('r', '0', sCount, 'CMIInteger', '', '1', null);
                    sdCur.insertAlpha(sdList);
                } else {
                    /* this is an invalid data item */
                    return null;
                }
            } else {
                /* get the current count of objectives */
                nCurCount = sdCur.value - 0;

                /* see if the number passed is too high, that is, is it more that one past the current count */
                if (RegExp.$2 > (nCurCount + 1)) {
                    /* it is, this makes it an illegal value */
                    return null;
                }

                /* see if we need to increment the count */
                if (nNum == nCurCount)
                    sdCur.value = (sdCur.value - 0) + 1;
            }

            /* set the values to insert this item */
            sType = 'CMIFeedback';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.weighting$/)) {
            /* cmi.interactions.n.weighting */
            sType = 'CMIDecimal';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.student_response$/)) {
            /* cmi.interactions.n.student_response */
            sType = 'CMIFeedback';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.learner_response$/)) {
            /* cmi.interactions.n.learner_response */
            sType = 'CMIFeedback';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.result$/)) {
            /* cmi.interactions.n.result */
            sType = 'CMIVocabulary';
            sRange = '"correct":"wrong":"unanticipated":"neutral":"CMIDecimal"';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.latency$/)) {
            /* cmi.interactions.n.latency */
            sType = 'CMITimespan';
        } else if (sName.match(/^cmi\.interactions\.\d{1,}\.description$/)) {
            /* cmi.interactions.n.latency */
            sType = 'CMIIdentifier';
        } else {
            /* not a match, return null */
            return null;
        }

        /* get the current count of interactions */
        sdCur = locateData('cmi.interactions._count');
        nCurCount = sdCur.value - 0;

        /* see if the number passed is too high, that is, is it more that one past the current count */
        if (nNum > (nCurCount + 1)) {
            /* it is, this makes it an illegal value */
            return null;
        }

        /* see if we need to increment the count */
        if (nNum == nCurCount)
            sdCur.value = (sdCur.value - 0) + 1;

        /* return the created object */
        return new ScormData(sMode, '0', sName, sType, sRange, '', null);
    } else if (sName.match(/^cmi\.comments_from_learner\.(\d{1,})\./)) {
        /* its a potential match for an comments_from_learner item, remember the number */
        nNum = RegExp.$1 - 0;

        sMode = 'rw'; /* comments_from_learner are read-write in SCORM 2004 */

        /* find the specific data item */
        if (sName.match(/^cmi\.comments_from_learner\.\d{1,}\.comment$/)) {
            /* cmi.comments_from_learner.n.comment */
            sType = 'CMIString4096';
        } else if (sName.match(/^cmi\.comments_from_learner\.\d{1,}\.location$/)) {
            /* cmi.comments_from_learner.n.location */
            sType = 'CMIIdentifier';
        } else if (sName.match(/^cmi\.comments_from_learner\.\d{1,}\.timestamp$/)) {
            /* cmi.comments_from_learner.n.timestamp */
            sType = 'CMITime';
        } else {
            /* not a match, return null */
            return null;
        }

        /* get the current count of comments_from_learner */
        sdCur = locateData('cmi.comments_from_learner._count');
        nCurCount = sdCur.value - 0;

        /* see if the number passed is too high, that is, is it more that one past the current count */
        if (nNum > (nCurCount + 1)) {
            /* it is, this makes it an illegal value */
            return null;
        }

        /* see if we need to increment the count */
        if (nNum == nCurCount)
            sdCur.value = (sdCur.value - 0) + 1;

        /* return the created object */
        return new ScormData(sMode, '0', sName, sType, sRange, '', null);
    }

    /* it's none of these, set the error and bail out */
    sLastError = '201';
    return null;
}