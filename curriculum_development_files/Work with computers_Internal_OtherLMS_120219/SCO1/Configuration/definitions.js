// GENERAL CONFIGURATION SETTINGS FOR THE ENTIRE COURSE (SCO)
var _sVersion = "9.292";
var _sPlayerPath  = "https://az690692.vo.msecnd.net/commonfiles/" + _sVersion + "/";
var _sCdnPath  = "https://ajax.aspnetcdn.com/ajax/";
// use CDN values from course data service if we find them
try { for (var w = window.parent; ;) { if (w.courseDataService && w.courseDataService.CDNAPSPlayer) { _sPlayerPath = w.courseDataService.CDNAPSPlayer + _sVersion + "/", _sCdnPath = w.courseDataService.CDNLibrary; break } if (w == w.parent) break; w = w.parent } } catch (e) { }
var _bDisableCDN  = false;
var _bVideoLowres = true; // true if the low res video is the default
var _bShowCaptions = true; // true if course videos require captioning
var _sDiscussionLink = ""; // the URL of the discussion group for this course
var _bUserCanToggleOptional = false; //If set to true the user can toggle the _bHideOptionalContent setting.
var _bShowGlossary  = false;
var _bShowResources  = false;
var _displayExitCompleteMsg  = false;
var _displayExitIncompleteMsg  = false;
var _sStartWelcome = "";
var _sStartTestOut = "";
var _nTrackSelectionMin = 0;
var _nTrackSelectionMax = 2;
var _sTableOfContentsStyle = "None";
var _bHideHeader  = false;
var _bHideFooter  = false;
var _sTheme = "Light"; // use the set theme for the UI
var _nEvalPlayerVersion = 1;
var _sEvalContentKey = "CONT01592";

//TRACK SETTINGS
var _bDisableTrackSelection = true; // Hide the track selection dialog from the learner (track selection will be set by the author)

// LANGUAGE SETTINGS, this is the list of available languages within the course
var _aLanguages = new Array();
_aLanguages["en-us"] = "English";
var _sLanguageDefault = "en-us"; // the default language

