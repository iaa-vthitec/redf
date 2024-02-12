// apsDescriptions plugin
// this block of code extends the AMP plugin code
var Amp;
(function (Amp) {
    var Plugin;
    (function (Plugin) {
        var apsDescriptions;
        (function (apsDescriptions) {
            // defines all of the funcitonality for this amp plugin
            function ampPlugin(param) {
                var options = param.options;
                // do nothing if we do not have options data
                if (!options) return;

                // make the descriptions enables based on options passed to us
                apsDescriptions.enabled = options.enabled;
                apsDescriptions.setValue = options.setValue;

                // create a flag to signal initialization is complete - set to true in loadedmetadata handler
                AmpService.initComplete = false;

                // wait until the AMP code is ready before initializing
                var player = this;
                player.ready(function () {
                    // load the specific functionality for this plugin
                    apsDescriptions.AmpService.addToPlayer(player, options);
                });
            }
            apsDescriptions.ampPlugin = ampPlugin;

            // the Descriptions object for this plugin. The caller instantiates this object and then populates 
            // the object to control the content and behavior of this plugin
            var Descriptions = function () {
                return {
                    "descriptions": [],
                    "enabled": false,
                    "setValue": null,
                    "textString": new TextString,
                    "focusToAudioDescription": function () { document.getElementById("vjs-description-container").focus() }
                };
            }
            apsDescriptions.Descriptions = Descriptions;

            // this is the TextString object used as an element of the descriptions object to set text used in the plugin
            var TextString = function () {
                return {
                    "buttonLabel": "Toggle audio descriptions",
                    "resumePlayback": "Resume playback",
                    "descriptionsOff": "Descriptions off",
                    "descriptions": "Descriptions"
                }
            }
            apsDescriptions.TextString = TextString;

            // the AmpService class defines the properties and methods for our plugin
            var AmpService = (function () {
                // init function for the object
                function AmpService() {
                }

                // sets the description based on the current time of the video
                function setDescription(player, options) {
                    // get DOM containers
                    var d_container = document.getElementById("vjs-description-container");
                    var d_text = document.getElementById("vjs-description-text");
                    //var d_resumeButton = document.getElementById("vjs-description-resumeplayback-button");
                    var ds = options.descriptions;

                    if (ds && apsDescriptions.enabled()) {
                        // get the current time
                        var t = player.currentTime();

                        // loop through the list of descriptions
                        for (var i = 0; i < ds.length; i++) {
                            // see if we are in this description
                            if (t >= ds[i].timeStart && t <= ds[i].timeEnd) {
                                // see if we have not shown the description
                                if (!ds[i].isDisplayed) {
                                    // we have not shown the description, see if we want a pause


                                    //todo: do create (attempt one - create everything
                                   // var d_container = document.createElement('div');
                                    //d_container.setAttribute('class', "vjs-description-container");
                                    //d_container.setAttribute('id', "vjs-description-container");
                                    //d_container.setAttribute('style', "display:inline;");
                                    //d_container.setAttribute("aria-live", "assertive");
                                    //content container for text alert

                                    /*
                                    this.contentEl_.setAttribute("role", "alert");
                                    this.el().style.clip = "auto";
                                    this.el().style.height = "96px";
                                    this.el().style.width = "96px";
                                    var alertText = _globalDocument2['default'].createTextNode("video loading");
                                    this.contentEl_.appendChild(alertText);
                                    this.contentEl_.style.visibility = "hidden";
                                    this.contentEl_.style.visibility = "visible";
                                    */


                                    if (ds[i].pause) {
                                        // we do, pause the video if not already paused
                                        if (!ds[i].paused) {
                                            player.pause();
                                            ds[i].paused = true;
                                        }

                                    }

                                    var d_container = document.getElementById("vjs-description-container")
                                    var d_text = document.createElement('div');
                                //    d_text.setAttribute("role", "alert");
                               //     d_container.style.clip = "auto";
                               //     d_container.style.height = "96px";
                                //    d_container.style.width = "96px";

                                    d_text.setAttribute('id', "vjs-description-text");
                                    d_text.setAttribute('class', "vjs-description-text");
                                    d_text.innerHTML = ds[i].text;

                                    //put this in a setTimeout, which seems to help it get read by everything.
                                    setTimeout(function () { d_container.appendChild(d_text); }, 100);
                                    //d_container.style.visibility = "hidden";
                                    //d_container.style.visibility = "visible";

                                   // player.el().appendChild(d_container);




 
 
 
 
 
 

 
                                       
                                        // show the resume video button
                                        //d_resumeButton.style.display = "block";
                                        //d_resumeButton.focus();
                                        //d_resumeButton.setAttribute("aria-hidden", "false");
                                        //d_resumeButton.innerHTML = options.textString.resumePlayback;

                                        // set the role of the description to dialog because we have a button to resume
                                        //d_container.setAttribute("aria-live", "assertive");
                                        //d_container.setAttribute("role", "dialog");
                                        //d_container.setAttribute("aria-labelledby", "vjs-description-text");
                                    //} else {
                                    //    // not pausing, hide the resume button
                                    //    //d_resumeButton.style.display = "none";
                                    //    //d_resumeButton.setAttribute("aria-hidden", "true");
                                    //    //d_resumeButton.innerHTML = ""; // make NVDA stop reading this button when invisible

                                    //    // set the role to alert to make sure the user hears this description
                                    //    d_container.setAttribute("role", "alert");
                                    //}

                                    // show the description and mark the description as displayed
                                    //d_container.style.display = "block";
                                    //d_text.innerHTML = ds[i].text;
                                    ds[i].isDisplayed = true;
                                }
                            } else {
                                ds[i].paused = false;
                                if (ds[i].isDisplayed) {
                                    ds[i].isDisplayed = false;
                                    // no match, hide the description

                                    //to: remove the container
                                    //check to see if we have a container, if so remove it.
                                    var delContainer = document.getElementById("vjs-description-text");
                                    if (delContainer) {
                                        delContainer.parentNode.removeChild(delContainer);
                                    }

                                    //d_container.style.display = "none";
                                    //d_text.innerHTML = "";
                                    //d_resumeButton.style.display = "none";
                                }
                            }
                        }
                    } else {
                        if (ds) {
                            for (var i = 0; i < ds.length; i++) {
                                ds[i].isDisplayed = false;
                            }
                        }
                        

                        //check to see if we have a container, if so remove it.
                        var delContainer = document.getElementById("vjs-description-text");
                        if (delContainer) {
                            delContainer.parentNode.removeChild(delContainer);
                        }
                        //d_container.style.display = "none";
                        //d_text.innerHTML = "";
                    }
                }

                // add the functionality for the plugin
                AmpService.addToPlayer = function (player, options) {
                    // create a button to add to the play bar
                    AmpService.registerButton(options, player);

                    // create a handler for the player ready event - for AMP beta 2.0.0 need to use loadedmetadata
                    // called as soon as the player has been fully initialized
                    player.addEventListener(amp.eventName.loadedmetadata, function () {
                        // create the button to insert into the play bar
                        var dbutton = new amp.DPluginButton(player, options);
                        // get the children of the playbar
                        var controlBarChildren = player.controlBar.children();
                        var dpluginButton;
                        for (var i = 0; i < controlBarChildren.length; i++) {
                            // see if we could the right control bar
                            if (controlBarChildren[i].el() && controlBarChildren[i].el().className === "amp-controlbaricons-right") {
                                // we did, add our plugin button
                                dbutton.el().setAttribute("title", options.textString.buttonLabel);
                                var rightControlBar = player.controlBar.children()[i];
                                dpluginButton = rightControlBar.addChild(dbutton);

                                // move the plugin button to the first of right control bar
                                if (rightControlBar.children().length > 1) {
                                    var domRightControlBar = rightControlBar.el();
                                    domRightControlBar.insertBefore(domRightControlBar.children[domRightControlBar.children.length - 1], domRightControlBar.children[0]);
                                }
                                break;
                            }
                        }

                        // if we created the button, add it to the control bar object, else complain
                        if (dpluginButton) {
                            player.controlBar.pluginDescriptionsButton = dpluginButton;

                            // add the click handler
                            dpluginButton.el_.addEventListener("click", AmpService.handleClick, false);

                            //adds to the more options menu
                            //player.options_.plugins.moreOptions.controls.push("pluginDescriptionsButton");
                        } else {
                            apsDescriptions.defaultMessageLoggerMethod("apsDescriptions.addDPluginButtonToPlayer: unable to find the right control bar", true);
                        }

                        // create the description element markup
                        AmpService.element = document.createElement('div');
                        AmpService.element.setAttribute('class', "vjs-description-container");
                        AmpService.element.setAttribute('id', "vjs-description-container");
                       // AmpService.element.style.clip = "rect(0px,0px,0px,0px)";
                        AmpService.element.setAttribute('aria-live', "polite");
                        AmpService.element.setAttribute('aria-relevant', "additions");
                        AmpService.element.setAttribute('aria-atomic', "true");
                        AmpService.element.setAttribute('tabindex', "-1");

                        player.el().appendChild(AmpService.element);

                        // init is complete
                        AmpService.initComplete = true;
                    });

                    // add an event listener to get the time updates
                    player.addEventListener(amp.eventName.timeupdate, function (e) {
                        // show the appropriate description after initialization is complete
                        if (AmpService.initComplete) setDescription(player, options);
                    });
                };

                // register our button
                AmpService.registerButton = function (options, player) {
                    if (amp.DPluginButton) return;

                    // tell the player about our button
                    //  var MenuButton = amp.getComponent('MenuButton');
                    var Button = amp.getComponent('Button');
                    amp.DPluginButton = amp.extend(Button,{
                        init: function (player, options) {
                            options = options || {};
                            options.name = "DPluginButton";
                            Button.call(this, player, options);
                        }
                    });


                    // give the button a label that will be read by the screen reader
                    amp.DPluginButton.prototype.buttonText = options.textString.buttonLabel;

                    // creates the CSS for the button so we can style it
                    amp.DPluginButton.prototype.buildCSSClass = function () {
                        var Button = amp.getComponent('Button');
                        var r = Button.prototype.buildCSSClass.call(this);

                        return "amp-apsdescriptions-control " + r + " ";
                    };

                    // click handler for the chapter control bar button
                    AmpService.handleClick = function () {
                        //console.log('clicked app descritions')
                        //toggle state of audio descriptions
                        apsDescriptions.setValue(!apsDescriptions.enabled());
                    }
                };

 
                return AmpService;
                
            })();
            apsDescriptions.AmpService = AmpService;

            function defaultMessageLoggerMethod(msg, isError) {
                console.log(msg);
            }
            apsDescriptions.defaultMessageLoggerMethod = defaultMessageLoggerMethod;
        })(apsDescriptions = Plugin.apsDescriptions || (Plugin.apsDescriptions = {}));
    return apsDescriptions.Descriptions})(Plugin = Amp.Plugin || (Amp.Plugin = {}));
})(Amp || (Amp = {}));

// register this AMP plugin - the AMP.js code has already been loaded in the script tag
((function (mediaPlayer) {
    // register the plugin name with the function to handle the plugin
    mediaPlayer.plugin("apsDescriptions", Amp.Plugin.apsDescriptions.ampPlugin);
})(window.amp));