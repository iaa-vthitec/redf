// apsChapters plugin for the Azure Media Player

// this block of code extends the AMP plugin code
var Amp;
(function (Amp) {
    var Plugin;
    (function (Plugin) {
        var apsChapters;
        (function (apsChapters) {
            // this is the chapter state object. We need this to handle multiple instances of the plugin
            var State = function () {
                return {
                    "playerEl" : null,  // the video player element
                    "player" : null,    // the amp player
                    "playerElId" : "",  // the id of the video player elements
                    "options" : null,   // chapter options
                    "progress" : null,  // chapter progress 
                    "progressControlSlider" : null,  // the progress slider of this video player elements
                    "chapterShowing": -1, // the current chapter showing for the popup cards
                    "handledDuration": false,  // the duration for this video has been handled
                    "setInterval": null // an interval timer used to resize the chapter panel
                }
            }
            var stateArray = [];
            function getState(id) {
                // loop through the stateArray until we find the matching id
                for (var i = 0; i < stateArray.length; i++) {
                    if (stateArray[i].playerElId == id) {
                        return stateArray[i];
                    }
                }
            }

            // defines all of the funcitonality for this amp plugin
            function ampPlugin(param) {
                // do nothing if we do not have options data
                if (!param.options) return;

                // create a new state object, partially fill it and push it on the array
                var state = new State;
                state.playerEl = this.playerElement();
                //state.playerElId = state.playerEl.getAttribute("id");  worked in 2.0.0
                state.playerElId = this.id_;  // works in 2.1.1
                state.player = this;
                state.options = param.options;
                stateArray.push(state);

                // load the specific functionality for this plugin
                apsChapters.AmpService.addToPlayer(state.options, param.progress, state.playerElId);
            }
            apsChapters.ampPlugin = ampPlugin;

            // the options object for this plugin. The caller instantiates this object and then populates 
            // the object to control the content and behavior of this plugin
            var Chapters = function () {
                return {
                    "required": false,
                    "chapterMode": false,
                    "chapterLinear": false,
                    "style": "1",
                    "chapters": [],
                    "textString": new TextString
                };
            }
            apsChapters.Chapters = Chapters;

            // this is the chapter object used as an element of the chapters array in the preceeding object
            var Chapter = function (s, e, d, p, r, m, i, t, desc) {
                return {
                    "timeStart": charTimeToSeconds(s),
                    "timeEnd": charTimeToSeconds(e),
                    "duration": charTimeToSeconds(d),
                    "completionPercentage": p ? p : 0.95,
                    "required": r,
                    "mustViewAll": m,
                    "image": i,
                    "title": t,
                    "description": desc
                }
            }
            apsChapters.Chapter = Chapter;

            // this is the TextString object used as an element of the Chapter object to set text used in the plugin
            var TextString = function () {
                return {
                    "buttonLabel": "Show chapter list",
                    "close": "Close chapter list",
                    "duration": "Duration: {0} Seconds",
                    "durationMinutes": "Duration: {0} Minutes",
                    "status": "Status: ",
                    "statusLocked": "Locked",
                    "statusNotStarted": "Not Started",
                    "statusStarted": "Started",
                    "statusComplete": "Complete",
                    "restrictionMustViewAll": "Scrubbing ahead is not permitted here.<br>Please finish viewing the current chapter to proceed.",
                    "restrictionCompletePrior": "This chapter is currently locked.<br>Please finish viewing the current chapter to proceed.",
                    "view": "WATCH",
                    "share": "SHARE",
                    "chapterOverview": "Chapter Overview",
                    "gotIt": "GOT IT",
                    "completePrevious": "COMPLETE PREVIOUS CHAPTER TO UNLOCK"
                }
            }
            apsChapters.TextString = TextString;

            // this is the Progress object used to keep track of playback within a chapter
            var Progress = function () {
                return {
                    "current": -1,
                    "max": -1,
                    "status": 1,
                    "locked": false
                }

                // there are 3 status values
                // 0 - locked
                // 1 - not started
                // 2 - started
                // 3 - complete
            }

            // converts a time string in the format 0:0:5.0 to an time in seconds
            charTimeToSeconds = function (charTime) {
                // break the character time into parts
                var aParts = charTime.split(":");

                // add the parts together
                return (aParts[0] * 60 * 60) + (aParts[1] * 60) + (aParts[2] - 0);
            }

            // the AmpService class defines the properties and methods for our plugin
            var AmpService = (function () {
                // init function for the object
                function AmpService() {
                }

                // return the chapter completion as an xAPI object
                AmpService.getChapterCompletion = function (id) {
                    // get the state
                    var state = getState(id);

                    // see if we have no newly completed progress
                    if (state.chapterComplete == null) return null;

                    // return an xAPI object with the chapter completion
                    return {
                        "actor": {},
                        "verb": {
                            "id": "http://amp.plugin.microsoft.com/verbs/chapter-completion"
                        },
                        "object": {
                            "id": state.chapterComplete,
                            "type": "http://amp.plugin.microsoft.com/activities/chapter-completion",
                            "chapter": state.options.chapters[state.chapterComplete]
                        }
                    }
                }

                // return the video completion as an xAPI object
                AmpService.getVideoCompletion = function (id ) {
                    // get the state
                    var state = getState(id);

                    // return an xAPI object with video completion
                    return {
                        "actor": {},
                        "verb": {
                            "id": "http://amp.plugin.microsoft.com/verbs/video-completion"
                        },
                        "object": {
                            "id": state.player.currentSrc(),
                            "type": "http://amp.plugin.microsoft.com/activities/video-completion"
                        },
                        "result": {
                            "complete": state.progress.complete
                        }
                    }
                }

                // return the chapter progress as a xAPI object
                AmpService.getProgress = function (id) {
                    // get the state
                    var state = getState(id);

                    // return the xAPI object
                    return {
                        "actor": {},
                        "verb": {
                            "id": "http://amp.plugin.microsoft.com/verbs/chapter-progress"
                        },
                        "object": {
                            "id": state.player.currentSrc(),
                            "type": "http://amp.plugin.microsoft.com/activities/chapter-progress",
                            "options": state.options
                        },
                        "result": {
                            "complete": state.progress.complete,
                            "current": state.options.current,
                            "progress": state.progress
                        }
                    }
                }

                // add the functionality for the plugin
                AmpService.addToPlayer = function (options, prevProgress, id) {
                    // get the state object
                    state = getState(id);

                    // see if we have previous progress
                    if (prevProgress) {
                        // we do, get it
                        state.options.current = prevProgress.current;
                        state.progress = prevProgress.progress;
                    } else {
                        // we do not have previous, create a progress array
                        state.progress = [];

                        // loop through and fill the empty progress array
                        var c = state.options.chapters;
                        for (var i = 0; i < c.length; i++) {
                            // get a new progress object
                            var p = new Progress;

                            // see if linear nav required AND this chapter is required
                            if (options.chapterLinear && c[i].required) {
                                // it is, set the progress as locked for now
                                // can be unlocked when the user has completed all previously required chapters
                                p.locked = true;
                                p.status = 0;
                            }
                            state.progress.push(p);
                        }

                        // see if this video is required
                        if (!state.options.required) {
                            // it is not, set the complete to true and report it
                            state.progress.complete = true;
                            //this.player().trigger("videoCompletion");
                            state.player.trigger("videoCompletion");
                        }
                    }

                    // init the chapter progress value - null means we have no new progress to report
                    state.chapterComplete = null;

                    // create a button to add to the play bar
                    AmpService.registerButton(state.options, state.progress);

                    // create a panel that we will place over the top of the video image
                    AmpService.registerPanel(state.options, state.progress, state.playerElId);

                    // create a handler for the player ready event
                    // called as soon as the player has been fully initialized (for now using loadedmetadata instead of ready)
                    state.player.player().addEventListener(amp.eventName.loadedmetadata, function () {
                        try {
                            // Give the player a unique name for the panel so we can retrieve the panel later
                            // the first parameter name is must be xPanel where "x" is a single word
                            // that is matches the name of the selector in AmpService.registerPanel 
                            state.player.addChild("apschaptersPanel", state.options);

                            // add an attribute to the panel to make sure we know what panel to handle
                            state.playerEl.getElementsByClassName("vjs-apschapterspanel")[0].setAttribute("data-id", state.playerElId);

                            // create the button to insert into the play bar
                            var button = new amp.PluginButton(state.player, state.options);

                            // get the children of the playbar
                            var controlBarChildren = state.player.controlBar.children();

                            // loop through the control bar's children
                            var pluginButton;
                            for (var i = 0; i < controlBarChildren.length; i++) {
                                // see if we could the left control bar
                                if (controlBarChildren[i].el() && controlBarChildren[i].el().className === "amp-controlbaricons-left") {
                                    // we did, add our plugin button and add the title to the button for a tooltip
                                    button.el().setAttribute("title", options.textString.buttonLabel);
                                    var leftControlBar = state.player.controlBar.children()[i];
                                    pluginButton = leftControlBar.addChild(button);
                                    break;
                                }
                            }

                            // if we created the playbutton, add it to the control bar object, else complain
                            if (pluginButton) {
                                // add the button to the control bar object
                                state.player.controlBar.pluginButton = pluginButton;

                                // add the click handler
                                pluginButton.el_.addEventListener("click", AmpService.handleClick, false);

                                // add an attribute to the button so we can make sure we are adjusting the correct state
                                state.playerEl.getElementsByClassName("amp-apschapters-control")[0].setAttribute("data-id", state.playerElId);
                            } else {
                                apsChapters.defaultMessageLoggerMethod("apsChapters.addPluginButtonToPlayer: unable to find the left control bar", true);
                            }
                        }
                        catch (exception) {
                            apsChapters.defaultMessageLoggerMethod("apsChapters.addPluginButtonToPlayerWithException: " + exception.message, true);
                        }
                    });

                    // add a handler for the duration change so we can decide where to place the chapter markers
                    state.player.player().addEventListener(amp.eventName.timeupdate, function (e) {
                        // get the state of this video player
                        //var state = getState(this.el_.getAttribute("id")); // worked in 2.0.0
                        var state = getState(this.id_);  // works in 2.1.1

                        // get the current time
                        var t = state.player.currentTime();

                        // see if this is a valid time
                        if (t > 0) {
                            // it is, get some shorthand variables
                            var c = state.options.chapters;
                            var allowScrub = true;

                            // see if we have never assigned a value to the current time in the entire movie
                            if (!state.options.current) {
                                // we never have, use this time
                                state.options.current = t;
                            }

                            // loop through the chapters
                            for (var i = 0; i < c.length; i++) {
                                // see if the current time is in this chapter
                                if (t >= c[i].timeStart && t <= c[i].timeEnd) {
                                    // it is, see if the required chapters can only be visited in order
                                    if (state.options.chapterLinear) {
                                        // they can, loop to see if there are any previous chapters that have not been completed
                                        var prevNotVisited = false;
                                        for (var j = 0; j < i; j++) {
                                            // see if this chapter is required
                                            if (c[j].required) {
                                                // it is, see if it is complete
                                                if (state.progress[j].status != 3) {
                                                    // it is not complete, remember and stop looking
                                                    prevNotVisited = true;
                                                    break;
                                                }
                                            }
                                        }

                                        // see if there was an incomplete, required previous chapter
                                        if (prevNotVisited) {
                                            // there was, warn and do not allow this to be a successful scrub
                                            showTimedAlert(state.options.textString.restrictionCompletePrior, 5000, "&#xf023;", state);
                                            allowScrub = false;
                                            break;
                                        }
                                    }

                                    // see if we have a must view all restriction for this chapter AND
                                    // the chapter is not complete
                                    if (c[i].mustViewAll && state.progress[i].status != 3) {
                                        // we do, see if the scrub ahead is more than 5 seconds beyond the max
                                        if (t > state.progress[i].max + 5 && state.progress[i].max != -1) {
                                            // too far ahead, warn and do not allow it
                                            showTimedAlert(state.options.textString.restrictionMustViewAll, 5000, "&#xf05c;", state);
                                            allowScrub = false;
                                            break;
                                        }
                                    }
                                    
                                    // see if we are past the max
                                    if (t > state.progress[i].max) {
                                        // we are, update the max
                                        state.progress[i].max = t;
                                    }

                                    // update the current time
                                    state.progress[i].current = t;
                                    state.options.current = t;

                                    // if the progress is locked or not stated, set the progress to started
                                    if (state.progress[i].status == 0 || state.progress[i].status == 1) {
                                        state.progress[i].status = 2;
                                        state.progress[i].locked = false;
                                    }

                                    // see if we have just completed the chapter - elapsed time >= duration * required %
                                    if (state.progress[i].status < 3 && t - c[i].timeStart >= c[i].duration * c[i].completionPercentage) {
                                        // it has, mark the chapter as complete
                                        state.progress[i].status = 3;

                                        // remember which chapter was complete
                                        state.chapterComplete = i;

                                        // send out a message to report this chapter as complete
                                        //this.player().trigger("chapterCompletion");
                                        state.player.trigger("chapterCompletion");

                                        // see if this video is required and the video is not already complete
                                        if (state.options.required && !state.progress.complete) {
                                            // it is, set the complete to true for now
                                            state.progress.complete = true;

                                            // loop through all of the progress on chapters to find chapter required but not
                                            for (var i = 0; i < state.options.chapters.length; i++) {
                                                if (state.options.chapters[i].required && state.progress[i].status != 3) {
                                                    // this required chapter is not complete, so mark the video as not complete
                                                    state.progress.complete = false;
                                                    break;
                                                }
                                            }

                                            // see if the video is complete
                                            if (state.progress.complete) {
                                                // it is, report the video as complete
                                                state.player.trigger("videoCompletion");
                                            }
                                        }
                                    }

                                    // jump out
                                    break;
                                }
                            }

                            // see if we have a successful scrub
                            if (allowScrub) {
                                // we do, record this time in the entire movie
                                state.options.current = t;

                                // keep track of the current chapter
                                state.options.currentChapter = i;

                                // dispatch an event to signal an update in progress
                                //this.player().trigger("chapterProgress");
                                state.player.trigger("chapterProgress");
                            } else {
                                // scrub not allowed, set it back to the last location
                                //this.currentTime(options.current);
                                state.player.currentTime(options.current);
                            }
                        }
                    });

                    // add a handler for the loadeddata so we can set the current time based on the recorded bookmark
                    state.player.player().addEventListener(amp.eventName.loadeddata, function () {
                        // if we have state info on the current playback time, set it
                        if (state.options.current) state.player.currentTime(state.options.current);
                    });

                    // show a timed alert message
                    showTimedAlert = function (message, time, icon, state) {
                        // see if we have already created the alert div
                        if (!state.alert) {
                            // we have not, create the container
                            state.alertContainer = document.createElement('div');
                            state.alertContainer.setAttribute('class', "amp-chapter-alert-container");
                            state.alertContainer.setAttribute('style', "display:none;");
                            state.alertContainer.setAttribute('role', "dialog");
                            state.alertContainer.setAttribute('aria-describedby', "amp-chapter-alert");

                            // create the message
                            state.alert = document.createElement('div');
                            state.alert.setAttribute('class', "amp-chapter-alert");
                            state.alert.setAttribute('id', "amp-chapter-alert");
                            state.alert.setAttribute('aria-live', "assertive");

                            // create the icon
                            state.alertIcon = document.createElement('div');
                            state.alertIcon.setAttribute('class', "amp-chapter-alert-icon");
                            state.alertIcon.setAttribute('aria-hidden', true);

                            // create the button
                            state.alertButton = document.createElement('a');
                            state.alertButton.setAttribute('class', "amp-chapter-alert-button");
                            state.alertButton.setAttribute('href', "#");
                            state.alertButton.innerHTML = options.textString.gotIt;
                            state.alertButton.addEventListener("click", function () {
                                state.alertContainer.style.display = "none";
                            }, false);
                            state.alertButton.addEventListener("keydown", function (e) {
                                // do not allow tab to leave modal
                                if (e.which == 9) {
                                    if (e.preventDefault) {
                                        e.preventDefault();
                                    }
                                    return false;
                                }
                            }, false);

                            // assemble the parts and inject into DOM
                            state.alertContainer.appendChild(state.alertIcon);
                            state.alertContainer.appendChild(state.alert);
                            state.alertContainer.appendChild(state.alertButton);
                            state.playerEl.appendChild(state.alertContainer);
                        }

                        // set the text, icon and show the alert container
                        state.alert.innerHTML = message;
                        state.alertIcon.innerHTML = icon;
                        state.alertContainer.style.display = "block";

                        // give the button focus
                        state.alertButton.focus();

                        // pause the playback
                        setTimeout(function () { state.player.pause(); }, 200);
                    }

                    // add a handler for the duration change so we can decide where to place the chapter markers
                    state.player.player().addEventListener(amp.eventName.durationchange, function () {
                        // get the state of this video player
                        // var state = getState(this.el_.getAttribute("id")); // worked in 2.0.0
                        var state = getState(this.id_);  // works in 2.1.1

                        // get the video duration
                        var duration = state.player.duration();

                        // if there is no duration, do nothing, this event will get called again
                        if (duration == 0) return;

                        // do nothing if we already handled the duration change
                        if (state.handledDuration) return;
                        state.handledDuration = true;

                        // get a handle to the scrubber
                        state.progressControlSlider = state.playerEl.getElementsByClassName("vjs-slider")[0];

                        // set an attribute of the progress control to allow us to fetch the correct state data
                        state.progressControlSlider.setAttribute("data-id", state.playerElId);

                        // see if we found the scrubber bar
                        if (state.progressControlSlider) {
                            state.chapterShowing = -1;
                            state.progressControlSlider.onmousemove = function (e) {
                                // get the state
                                var state = getState(this.getAttribute("data-id"));

                                // get the mouse left location. the mouse may be overing over a chapter marker
                                // so we need to get the position relative to the  scrubber.
                                var mouseLeft = (e.srcElement.getBoundingClientRect().left - this.getBoundingClientRect().left) + e.offsetX;

                                var secs = mouseLeft / this.clientWidth * duration;
                                var c = state.options.chapters;

                                // hide the card
                                if (state.chapterShowing > -1) {
                                    var card = state.playerEl.getElementsByClassName("apsChapterCard" + state.chapterShowing)[0];
                                    card.style.display = "none";
                                }
                                for (var i = 0; i < c.length; i++) {
                                    if (secs >= c[i].timeStart && secs <= c[i].timeEnd) {
                                        var chapter = i;

                                        // get the card
                                        var card = state.playerEl.getElementsByClassName("apsChapterCard" + chapter)[0];

                                        // get the left edge of the card making sure it does not go negative
                                        var nLeft = mouseLeft - 110 < 0 ? 0 : mouseLeft - 110;

                                        // make sure the right side of the card does not go off the right edge of the video
                                        var nLeft = nLeft + 219 > state.playerEl.clientWidth ? state.playerEl.clientWidth - 219 : nLeft;

                                        // position the card
                                        card.style.left = nLeft + "px";

                                        // get the position for the pointer
                                        var pointerPos = mouseLeft - nLeft - 9;

                                        // position the bottom arrow of the card
                                        state.playerEl.getElementsByClassName("apsChapterArrow" + chapter)[0].style.left = pointerPos + "px";

                                        // show its card
                                        card.style.display = "block";

                                        // size the card
                                        var itemHeight = state.playerEl.clientHeight - 110;
                                        card.style.height = itemHeight + "px";
                                        var imageEl = state.playerEl.getElementsByClassName("apsChapterImage" + chapter)[0];
                                        if (!c[i].image) {
                                            imageEl.style.height = "0px";
                                        }
                                        var image = imageEl.clientHeight;
                                        var title = state.playerEl.getElementsByClassName("apsChapterTitle" + chapter)[0].clientHeight;
                                        var dur = state.playerEl.getElementsByClassName("apsChapterDuration" + chapter)[0].clientHeight;
                                        var status = state.playerEl.getElementsByClassName("apsChapterStatus" + chapter)[0].clientHeight;
                                        var total = image + title + dur + status;
                                        //var desHeight = Math.min((itemHeight - total), 600);
                                        var desHeight = (itemHeight - total);
                                        var description = state.playerEl.getElementsByClassName("apsChapterDescription" + chapter)[0];
                                        var container = state.playerEl.getElementsByClassName("apsChapterDescriptionContainer" + chapter)[0];

                                        container.style.height = desHeight + "px";

                                        // see if the height of the description is the same as last time
                                        if (state.options.chapters[i].desHeight != desHeight) {
                                            // it is not, remember the height
                                            state.options.chapters[i].desHeight = desHeight;

                                            // reset the description
                                            description.innerHTML = state.options.chapters[i].description;
                                        }

                                        // add ellipsis to the description if needed to fit the content in the space we have
                                        var containerHeight = container.clientHeight;
                                        while (description.clientHeight > containerHeight && desHeight > 20) {
                                            description.innerText = description.innerText.replace(/\W*\s(\S)*$/, '...');
                                        }

                                        // see if we have room for description, duration and status
                                        if (desHeight <= 20) {
                                            // we don't
                                            description.innerHTML = "";
                                            state.playerEl.getElementsByClassName("apsChapterStatus" + chapter)[0].innerHTML = "";
                                        } else {
                                            // update the status of the card
                                            state.playerEl.getElementsByClassName("apsChapterStatus" + chapter)[0].innerHTML = state.options.textString.status + AmpService.getStatusText(state.options.textString, state.progress[chapter].status);
                                        }
                                        
                                        state.chapterShowing = i;
                                        break;
                                    }
                                }
                            }

                            state.progressControlSlider.onmouseleave = function (e) {
                                // get the state
                                var state = getState(this.getAttribute("data-id"));

                                // hide the card
                                if (state.chapterShowing > -1) {
                                    var card = state.playerEl.getElementsByClassName("apsChapterCard" + state.chapterShowing)[0];
                                    card.style.display = "none";
                                }
                            }

                            // we did, go through the list of chapter times
                            for (var index = 0; index < state.options.chapters.length; index++) {
                                // get the start time of this chapter
                                var secs = state.options.chapters[index].timeStart;

                                // see if we have a valid time
                                if (!isNaN(secs)) {
                                    // we do, see if this start time fits within the time of the video
                                    if (secs >= 0 && secs <= duration) {
                                        // it does, create the markup for this chapter and place it on the scrubber bar
                                        var markerLeftPosition = (secs / duration * 100);
                                        var div = document.createElement('div');
                                        div.className = "amp-chapter-marker";
                                        div.style.left = markerLeftPosition + "%";
                                        div.innerHTML = "&nbsp;&nbsp;"
                                        div.setAttribute('data-chapter', index + '');
                                        state.progressControlSlider.appendChild(div);

                                        // create the card to show when the user hovers over the marker
                                        var card = document.createElement('div');
                                        card.style.display = 'none';
                                        card.style.left = markerLeftPosition + "%";
                                        card.className = "amp-chapter-card" + options.style + " apsChapterCard" + index;
                                        card.setAttribute('id', "amp-chapter-card" + index);
                                        var c = state.options.chapters[index];
                                        var p = state.progress[index];
                                        var s = '<img class="amp-chapter-card-image apsChapterImage' + index + '" src="' + c.image + '" alt=""></img>';
                                        s += '<div class="amp-chapter-card-title apsChapterTitle' + index + '">' + c.title + '</div>';
                                        s += '<div class="amp-chapter-card-description-container apsChapterDescriptionContainer' + index + '">';
                                        s += '<div class="amp-chapter-card-description apsChapterDescription' + index + '">' + c.description + '</div>';
                                        s += '</div>';
                                        if (c.duration <= 60) var min = state.options.textString.duration.replace(/\{0\}/g, Math.round(c.duration));
                                        else var min = state.options.textString.durationMinutes.replace(/\{0\}/g, Math.round(c.duration/60));
                                        s += '<div class="amp-chapter-card-duration apsChapterDuration' + index + '">' + min + '</div>';
                                        s += '<div class="amp-chapter-card-status apsChapterStatus' + index + '"></div>';
                                        s += '<div class="amp-chapter-card-arrow apsChapterArrow' + index + '"></div>';
                                        card.innerHTML = s;
                                        state.playerEl.appendChild(card);
                                    }
                                }
                            }
                        }
                    });
                };

                // get the status text string
                AmpService.getStatusText = function (textString, status) {
                    switch (status) {
                        case 0: return textString.statusLocked; break;
                        case 1: return textString.statusNotStarted; break;
                        case 2: return textString.statusStarted; break;
                        case 3: return textString.statusComplete; break;
                    }
                }

                // handle the panel closing
                AmpService.panelCloseButtonClick = function (component) {
                    // get the state from the panel's id
                    var state = getState(component.el_.getAttribute("data-id"));

                    // show the play bar again
                    state.playerEl.getElementsByClassName("vjs-control-bar")[0].style.display = "table";

                    // see if our interval timer exists
                    if (state.setInterval) {
                        clearInterval(state.setInterval);
                        state.setInterval = null;
                    }

                    // hide the panel
                    component.hide();

                    // see if we were playing
                    if (!AmpService.paused) {
                        // we were, continue playing
                        state.player.play();
                    }
                };

                // jump to a new time in the video
                AmpService.goto = function (timeStart, id) {
                    // get the state for this video
                    var state = getState(id);

                    // jump to the location and start playing
                    state.player.currentTime(timeStart);
                    state.player.play();

                    // show the play bar again
                    state.playerEl.getElementsByClassName("vjs-control-bar")[0].style.display = "table";

                    // hide the panel
                    var pluginPanel = state.player.getChild("apschaptersPanel");
                    pluginPanel.hide();
                };

                // register our button
                AmpService.registerButton = function (options, progress) {
                    if (amp.PluginButton) {
                        return;
                    }

                    // tell the player about our button
                    var Button = amp.getComponent('Button');
                    amp.PluginButton = amp.extend(Button,
                        {
                            init: function (player, options) {
                                options = options || {};
                                options.name = "pluginButton";
                                Button.call(this, player, options);
                            }
                        });

                    // give the button a label that will be read by the screen reader
                    amp.PluginButton.prototype.buttonText = options.textString.buttonLabel;

                    // creates the CSS for the button so we can style it
                    amp.PluginButton.prototype.buildCSSClass = function () {
                        var Button = amp.getComponent('Button');
                        var r = Button.prototype.buildCSSClass.call(this);

                        return "amp-apschapters-control " + r + " ";
                    };

                    // click handler for the chapter control bar button
                    AmpService.handleClick = function () {
                        // get the correct state for this player
                        var state = getState(this.getAttribute("data-id"));

                        // set the focus to the close button in the dialog
                        setTimeout(function () {
                            state.player.el().getElementsByClassName("vjs-apschapterspanel-close-button")[0].focus();
                        }, 1);

                        // get the current state of the player
                        AmpService.paused = state.player.paused();
                                                                            
                        // pause the video
                        state.player.pause();

                        // get our panel
                        var pluginPanel = state.player.getChild("apschaptersPanel");

                        // show the panel
                        pluginPanel.show();

                        // fix up the incorrect reference to the player
                        AmpService.playerHeight = -1;

                        // resize the panel elements
                        AmpService.resizePanel(state.playerElId);

                        // if needed, set up and interval timer to look for size changes to the video to make sure
                        // our panel covers the video
                        if (!state.setInterval) {
                            state.setInterval = setInterval(AmpService.resizePanel, 500, state.playerElId);
                        }

                        // temporarily hide the play bar
                        state.playerEl.getElementsByClassName("vjs-control-bar")[0].style.display = "none";

                        // loop through the chapters
                        for (var i = 0; i < state.options.chapters.length; i++) {
                            // get the current indicator element
                            var el = state.playerEl.getElementsByClassName("apsChapterTocCurrent" +i)[0];

                            // see if this is the current chapter
                            if (state.options.currentChapter === i) {
                                // this is the current chapter, show the current indicator
                                el.style.display = "block";
                            } else {
                                // not in this chapter
                                el.style.display = "none";
                            }

                            // see if this chapter is locked
                            if (state.progress[i].locked) {
                                // it is, show the locked panel and hide the buttons
                                state.playerEl.getElementsByClassName("apsChapterTocLocked" +i)[0].style.display = "block";
                                state.playerEl.getElementsByClassName("apsChapterTocButtons" +i)[0].style.display = "none";
                            } else {
                                // show the buttons, hide the locked panel
                                state.playerEl.getElementsByClassName("apsChapterTocLocked" + i)[0].style.display = "none";
                                state.playerEl.getElementsByClassName("apsChapterTocButtons" + i)[0].style.display = "block";
                            }
                        }
                    };
                };

                AmpService.resizePanel = function (id) {
                    // get the correct state
                    var state = getState(id);

                    // get our panel
                    var pluginPanel = state.player.getChild("apschaptersPanel");

                    // get the height of the video
                    var playerHeight = state.playerEl.clientHeight;

                    // see if the player dimensions have changed
                    if (playerHeight == AmpService.playerHeight) {
                        // no change, sizing already done
                        return;
                    } else {
                        AmpService.playerHeight = playerHeight;
                    }

                    // update the height of the card container to be the height of the video - height of the header
                    var containerHeight = playerHeight - 40;
                    var itemHeight = (containerHeight - 80) + "px";
                    var itemWidth = 219;
                    var container = state.playerEl.getElementsByClassName("amp-chapter-toc" + state.options.style)[0];
                    state.playerEl.getElementsByClassName("vjs-apschapterspanel-controls")[0].style.height = (containerHeight + 1) + "px";
                    container.style.height = containerHeight + "px";

                    // update the status for all of the cards and set the absolute position
                    var currentPosition = 20;
                    for (var i = 0; i < state.options.chapters.length; i++) {
                        // update the status
                        state.playerEl.getElementsByClassName("apsChapterTocStatus" + i)[0].innerHTML = state.options.textString.status + AmpService.getStatusText(state.options.textString, state.progress[i].status);

                        // get the item
                        var item = state.playerEl.getElementsByClassName("apsChapterTocItem" + i)[0];

                        // position the item
                        item.style.top = "20px";
                        item.style.height = itemHeight;
                        item.style.left = currentPosition + "px";
                        currentPosition += itemWidth + 20;
                    }

                    // update the width of the toc container
                    container.style.width = currentPosition + "px";

                    // Set the height of the toc portion of the panel to be the size of the 
                    // video player minus the panel header
                    var header = state.playerEl.querySelector(".vjs-apschapterspanel-header");
                    var toc = state.playerEl.querySelector(".amp-chapter-toc" + state.options.style);
                    toc.style.height = (state.playerEl.clientHeight - header.clientHeight - 46) + "px";

                    // get the height of the card container
                    itemHeight = state.playerEl.getElementsByClassName("apsChapterTocItem0")[0].clientHeight;

                    var duration = state.playerEl.getElementsByClassName("apsChapterTocDuration0")[0].clientHeight;
                    var status = state.playerEl.getElementsByClassName("apsChapterTocStatus0")[0].clientHeight;
                    var buttons = state.playerEl.getElementsByClassName("apsChapterTocButtons0")[0].clientHeight;
                    var bottom = state.playerEl.getElementsByClassName("apsChapterTocBottom0")[0].clientHeight;

                    for (var i = 0; i < state.options.chapters.length; i++) {
                        // calc the height of the description
                        var imageEl = state.playerEl.getElementsByClassName("apsChapterTocImage" + i)[0];
                        if (!state.options.chapters[i].image) {
                            imageEl.style.height = "0px";
                        }
                        var image = imageEl.clientHeight;
                        var title = state.playerEl.getElementsByClassName("apsChapterTocTitle" +i)[0].clientHeight;

                        var total = image + title + duration + status + buttons + bottom + 20;
                        state.playerEl.getElementsByClassName("apsChapterTocDescription" + i)[0].style.height = (itemHeight - total) + "px";
                    }
                }

                // handles the registration of the "ApschaptersPanel" 
                AmpService.registerPanel = function (options, progress, id) {
                    var rp = this;
                    this.options = options;
                    this.progress = progress;
                    this.id = id;

                    if (videojs.ApschaptersPanel) {
                        return;
                    }

                    var Component = amp.getComponent('Component');
                    videojs.ApschaptersPanel = amp.extend(Component,
                        {
                        init: function (player, options) {
                            videojs.getComponent('Component').call(this, player, options);
                            this.hide();
                            AmpService.updatePluginPanel(this, options);
                        }
                    });

                    // create the panel
                    videojs.ApschaptersPanel.prototype.createEl = function () {
                        var element = videojs.getComponent('Component').prototype.createEl.call(this, "div", {
                            className: "vjs-apschapterspanel",
                            id: "vjs-apschapterspanel",
                            innerHTML: AmpService.getPluginPanelTemplate(this, rp.options, rp.progress, rp.id)
                        });
                        element.setAttribute("role", "dialog");
                        element.setAttribute("aria-labelledby", "vjs-apschapterspanel-title");
                        return element;
                    };
                };

                // called to manage any last minute changes to the panel
                AmpService.updatePluginPanel = function (component, options) {
                    // add a click handler to the close button
                    var close = component.el().querySelector(".vjs-apschapterspanel-close > a");
                    videojs.on(close, "click", function () {
                        AmpService.panelCloseButtonClick(component);
                    });

                    setTimeout(function () {
                        // get the dialog box
                        var d = component.el();

                       // get all focusable elements plus first and last focusable element
                        AmpService.focusableEls = d.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]');
                        AmpService.firstFocusableEl = AmpService.focusableEls[0];
                        AmpService.lastFocusableEl = AmpService.focusableEls[AmpService.focusableEls.length - 1];

                        // put keydown handler on dialog box
                        d.addEventListener('keydown', function (e) {
                            var KEY_TAB = 9;
                            var KEY_ESC = 27;

                            function handleBackwardTab() {
                                if (document.activeElement === AmpService.firstFocusableEl) {
                                    e.preventDefault();
                                    AmpService.lastFocusableEl.focus();
                                }
                            }

                            function handleForwardTab() {
                                if (document.activeElement === AmpService.lastFocusableEl) {
                                    e.preventDefault();
                                    AmpService.firstFocusableEl.focus();
                                }
                            }

                            switch (e.keyCode) {
                                case KEY_TAB:
                                    if (AmpService.focusableEls.length === 1) {
                                        e.preventDefault();
                                        break;
                                    }

                                    if (e.shiftKey) {
                                        handleBackwardTab();
                                    } else {
                                        handleForwardTab();
                                    }
                                    break;

                                case KEY_ESC:
                                    AmpService.panelCloseButtonClick(component);
                                    break;

                                default:
                                    break;

                            }
                        });
                    },1);
                    

                };

                // return the markup we want in our panel
                AmpService.getPluginPanelTemplate = function (component, options, progress, id) {
                    // add the wrapper and the header
                    var s = '<div class="vjs-apschapterspanel-header">' +
                                '<div class="vjs-apschapterspanel-title" id="vjs-apschapterspanel-title">' + options.textString.chapterOverview + '</div>' +
                                '<div class="vjs-apschapterspanel-close">' +
                                    '<a class="vjs-apschapterspanel-close-button" href="#">' +
                                        '<span class="vjs-apschapterspanel-close-image" aria-label="' + options.textString.close + '"></span>' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="vjs-apschapterspanel-controls" id="vjs-apschapterspanel-controls">';

                    // loop through the chapters to add the body wrapped in the selected style
                    s += '<div class="amp-chapter-toc' + options.style + '" id="amp-chapter-toc' + options.style + '" role="list">';
                    for (var index = 0; index < options.chapters.length; index++) {
                        var c = options.chapters[index];
                        s += '<div class="amp-chapter-tocitem apsChapterTocItem' + index + '" id="amp-chapter-tocitem' + index + '" role="listitem">';
                        s += '<img class="amp-chapter-card-image apsChapterTocImage' + index + '" id="amp-chapter-card-image' + index + '" src="' + c.image + '" alt=""></image>';
                        s += '<div class="amp-chapter-card-title apsChapterTocTitle' + index + '" id="amp-chapter-card-title' + index + '"><span>' + c.title + '</span></div>';
                        s += '<div class="amp-chapter-card-description apsChapterTocDescription' + index + '" id="amp-chapter-card-description' + index + '">' + c.description + '</div>';
                        if (c.duration <= 60) var min = options.textString.duration.replace(/\{0\}/g, Math.round(c.duration));
                        else var min = options.textString.durationMinutes.replace(/\{0\}/g, Math.round(c.duration/60));
                        s += '<div class="amp-chapter-card-duration apsChapterTocDuration' + index + '" id="amp-chapter-card-duration' + index + '">' + min + '</div>';
                        s += '<div class="amp-chapter-card-status apsChapterTocStatus' + index + '" id="amp-chapter-card-status' + index + '"></div>';
                        s += '<div class="amp-chapter-card-current apsChapterTocCurrent' + index + '" id="amp-chapter-card-current' + index + '" style="display:none;"></div>';
                        s += '<div class="amp-chapter-card-buttons apsChapterTocButtons' + index + '" id="amp-chapter-card-buttons' + index + '">';
                        s += '<a class="amp-chapter-card-view apsChapterTocView' + index + '" id="amp-chapter-card-view' + index + '" href="#" onclick="Amp.Plugin.apsChapters.AmpService.goto(' + c.timeStart + ',\'' + id + '\');return false;" title="' + c.title + '" apschaptercontrol="true">' + options.textString.view + '</a>';
                        s += '<a class="amp-chapter-card-share apsChapterTocShare' + index + '" id="amp-chapter-card-share' + index + '" href="mailto:?subject=' + c.title + '&body=' + location.href + '?showChapter=' + index + '" title="' + c.title + '" apschaptercontrol="true">' + options.textString.share + '</a>';
                        s += '</div>';
                        s += '<div class="amp-chapter-card-bottom apsChapterTocBottom' + index + '" id="amp-chapter-card-bottom' + index + '"></div>';
                        s += '<div class="amp-chapter-card-fill"></div>';
                        s += '<div class="amp-chapter-card-locked apsChapterTocLocked' + index + '" id="amp-chapter-card-locked' + index + '" style="display:none;"><div class="amp-chapter-card-locked-icon"></div><div class="amp-chapter-card-locked-text">' + options.textString.completePrevious + '</div></div>';
                        s += '</div>';
                    }
                    s += '</div>';  // end of class="amp-chapter-tocN"

                    // add the end of the wrapper
                    s+= '</div>';  // end of class="vjs-apschapterspanel-controls"

                    return s;
                };

                // this style is added/removed by the show/hide methods to show and hide the panel
                AmpService.vjsHiddenClassName = "vjs-hidden";

                return AmpService;
            })();
            apsChapters.AmpService = AmpService;


            function defaultMessageLoggerMethod(msg, isError) {
                console.log(msg);
            }
            apsChapters.defaultMessageLoggerMethod = defaultMessageLoggerMethod;
        })(apsChapters = Plugin.apsChapters || (Plugin.apsChapters = {}));
    })(Plugin = Amp.Plugin || (Amp.Plugin = {}));
})(Amp || (Amp = {}));

// register this AMP plugin - the AMP .js code has already been loaded in the script tag
((function (mediaPlayer) {
    // register the plugin name with the function to handle the plugin
    mediaPlayer.plugin("apsChapters", Amp.Plugin.apsChapters.ampPlugin);
})(window.amp));