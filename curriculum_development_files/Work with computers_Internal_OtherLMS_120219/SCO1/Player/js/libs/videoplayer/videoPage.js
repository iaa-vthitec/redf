var VideoPlayer = (function () {
    var captionsData = [];

    // returns an Azure Media Player options object with several default settings
    // the caller can get this object and selectively change some or all of the settings
    function getDefaultOptions() {
        var options = {
            autoPlay: false, // automatically plays when loaded
            controls: true, // show control
            customPlayerSettings: {},
            heuristicProfile: "Hybrid", // affects the startup quality/performance HighQuality, Hybrid or QuickStart
            // hotKeys: {},  // keyboard shortcuts - commented out to use defaults
            logo: { enabled: false }, // turn off AMP player logo
            poster: "", // no poster image
            // sdn: {}, // software defined networking - commented out to use defaults
            skinConfig: {}, // controls audio tracks UI
            // sourceList: [], // list of video sources - set these with the src() method
            traceConfig: {},
            techOrder: ["azureHtml5JS", "flashSS", "silverlightSS", "html5"],
            width: 1280, // use 16x9 dimensions to match the dimensions of SMSGR videos
            height: 720,
            nativeControlsForTouch: false,
            plugins: {},
            playbackSpeed: {
                enabled: true,
                initialSpeed: 1.0,
                speedLevels: [
                    { name: "x4.0", value: 4.0 },
                    { name: "x3.0", value: 3.0 },
                    { name: "x2.0", value: 2.0 },
                    { name: "x1.75", value: 1.75 },
                    { name: "x1.5", value: 1.5 },
                    { name: "x1.25", value: 1.25 },
                    { name: "normal", value: 1.0 },
                    { name: "x0.75", value: 0.75 },
                    { name: "x0.5", value: 0.5 },
                ]
            }
        }

        return options;
    }

    // created the Azure Media player given the <video> element ID, options and a method to call when the video is ready
    function init(videoId, options, callback) {
        // init the Azure media player, this returns the player instance
        var player = amp(videoId, options, callback);

        // return the azure media player instance
        return player;
    }

    // loads a TTML file and places the caption elements in captionsData
    function loadTTMLFile(url) {
        $.ajax({
            type: "GET",
            url: url,
            dataType: "XML",
            error: function (e) {
                captionsData = [];
            },
            async: false,
            success: function (xml) {
                var ttElem = $(xml).find("tt");
                var bodyElem = $(ttElem).find("body");
                var divElem = $(bodyElem).find("div");
                captionsData = [];
                $(divElem).children('p').each(function () {
                    var xmlP = $(this);
                    var newCaption = {};
                    newCaption.timeStart = convertTimeFormatToSecs(xmlP.attr("begin"));
                    newCaption.timeEnd = convertTimeFormatToSecs(xmlP.attr("end"));
                    //dp - these two properties are needed since amp.js used them for caption search.
                    newCaption.startTime = convertTimeFormatToSecs(xmlP.attr("begin"));
                    newCaption.endTime = convertTimeFormatToSecs(xmlP.attr("end"));

                    try {
                        var s = $("<div>").append(xmlP.clone()).remove().html();
                        newCaption.text = s.substring(s.indexOf(">") + 1, s.lastIndexOf("</"));
                    } catch (e) {
                        newCaption.text = xmlP.text();
                    }
                    captionsData.push(newCaption);
                });
            }
        });
    }

    // utility function for loadTTMLFile
    function convertTimeFormatToSecs(timeFormat) {
        if (timeFormat) {
            var timeFragments = timeFormat.split(":");
            if (timeFragments.length > 0) {
                switch (timeFragments.length) {
                    case 4: return (parseInt(timeFragments[0], 10) * 60 * 60) + (parseInt(timeFragments[1], 10) * 60) + parseInt(timeFragments[2], 10) + (timeFragments[3] / 100);
                    case 3: return (parseInt(timeFragments[0], 10) * 60 * 60) + (parseInt(timeFragments[1], 10) * 60) + parseInt(timeFragments[2], 10);
                    case 2: return parseInt(timeFragments[0], 10) * 60 + parseInt(timeFragments[1], 10);
                    case 1: return parseInt(timeFragments[0], 10);
                    default: return parseInt(timeFragments[0], 10);
                }
            }

            return parseInt(timeFormat, 10);
        }

        return 0;
    }

    // returns the current caption string for this time in the video from captionsData
    function getCurrentCaption(videoPosition) {
        // return an empty string if we have an invalid video position
        if (isNaN(videoPosition))
            return "";

        // loop through the captions data
        for (var i = 0; i < captionsData.length; i++) {
            var caption = captionsData[i];

            // see if this is the caption data
            if (videoPosition >= caption.timeStart && videoPosition <= caption.timeEnd) {
                // it is, see if we have not displayed it
                if (!caption.isDisplayed) {
                    // we have not, mark it displayed
                    caption.isDisplayed = true;

                    // replace double breaks with a single break
                    if (caption.text.indexOf('<br>') > -1)
                        caption.text = caption.text.replace('<br></br>', '<br>');
                }

                // return the caption
                return caption.text;
            } else {
                // this is not the caption, if it is marked as displayed , mark it undisplayed
                if (caption.isDisplayed) {
                    caption.isDisplayed = false;
                }
            }
        }

        // could not find a caption to display
        return "";
    }

    return {
        init: init,
        getDefaultOptions: getDefaultOptions,
        getCurrentCaption: getCurrentCaption,
        loadTTMLFile: loadTTMLFile
    };
});

var vc = null;  // the video controller
var launchPage = null; // page that launched this page in an iframe
var videoPlayer = null; // this is our object that wraps the real Azure Media Player
var azurePlayer = null; // the actual Azure Media Player object
var sources = []; // one or more video source objects
var webVTT = []; // WebVTT captions
var videoPosition = 0, maxVideoPosition = 0; // used to progress in the video
var bDomLoaded = false; // true when DOM is loaded
var origWidth = 0, origHeight = 0; // dimensions of the video as created by the author
var captionsFile = ""; // path to the captions file
var isMsitAzure = false; // true if we are running in MSIT Azure
// these vars are used to determine layout needs based on key-points
var needTop = false, needLeft = false, needRight = false;

//variable to store whether there are audio descriptions. Will throw an alert to user if true.
var hasDescriptions = false;


// we need to read XML files, so use this trick to get IE 11 to read XML files when launched from the local hard drive
try {
    var aX = new window.ActiveXObject("Microsoft.XMLHTTP")
} catch (e) {
    var aX = null
}
if (aX) {
    function createActiveXHR() {
        try {
            return new window.ActiveXObject("Microsoft.XMLHTTP")
        } catch (e) { }
    }
    $.ajaxSetup({ xhr: createActiveXHR })
}

// create a handler to detect the complete loading of the DOM
// we need to wait until the DOM is loaded to make sure it is OK to access video properties
$(document).ready(function () {
    // the DOM is loaded, remember this so later on we know it is OK to proceed with video loading
    bDomLoaded = true;

    // get Launch.htm parent, notice that video page can be loaded in an iframe of a content window
    for (launchPage = parent; !launchPage.views && window != parent; launchPage = launchPage.parent);
    // check if in high contrast mode
    if (launchPage.player.courseController.course.settings.HighContrastModeActive) {
        // we are in high-contrast mode, add specific stylesheets
        $('head').append('<link rel="stylesheet" href="Player/css/highcontrast.css" type="text/css"/>');
        $('head').append('<link rel="stylesheet" href="Custom/css/highcontrast.css" type="text/css"/>');
    }

    //dp accessibility
    $('title').text("Video Page Frame");
});

// handle unload event
$(window).on('unload', function () {
    // notify video unloaded
    vc && vc.videoUnloaded();

    // kill off the active video controller
    if (vc && vc.courseController.activeVideoController === vc)
        delete vc.courseController.activeVideoController

    // reset captions display area
    if (launchPage && launchPage.player)
        //launchPage.player.courseController.showCaptions("");

    // tell the native video player to go away in role guide
    if (typeof (window.external) != 'undefined' && typeof (window.external.notify) != 'undefined')
        top.videoStopAndHide();
});

// pass key down events to the parent
function doKeyDown(e) {
    launchPage.doKeyDown(e);
}

// the video controller calls this function to show the video player
function videoView(videoController) {
    // remember the video controller to use in event handlers
    vc = videoController;

    // see if this is a right to left language
    if (vc.courseController.course.language.rtl) {
        // it is, set the direction and style of this page to RTL
        $("html").attr("dir", "rtl");
        $("html").addClass("rtl");
    }

    // see if the DOM has been loaded - we need to wait for the DOM to load before we do anything with video
    if (!bDomLoaded) {
        // it has not, lets wait and try this again
        setTimeout("videoView(vc)", 10);
        return;
    }

    // get rid of the tabstop for the video to avoid hidden focus for keyboard accessibility
    $(".azuremediaplayer").attr("tabindex", "-1");

    // instantiate the video player object that wil wrap the actual Azure Media Plater
    videoPlayer = new VideoPlayer();

    // get the options object for the Azure Media Player. This has default settings that we will configure
    var options = videoPlayer.getDefaultOptions();

    // initialize click to play
    options.autoPlay = !videoController.videoFile.videoClickToPlay;

    // see if there are chapters
    if (videoController.videoFile.chapters) {
        // there are, get the file name
        var chaptersFile = videoController.page ? videoController.page.getVideoChaptersPath(videoController.videoFile.FileName) : "";

        // load the chapters JSON file
        $.ajax({
            type: "GET",
            url: chaptersFile,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function (data) {
                // we got the chapters JSON, populate the rest of the object
                videoController.chapters = readChapters(data, videoController);

                // tell the player to use the chapters plugin
                options.plugins.apsChapters = { "options": videoController.chapters, "progress": videoController.chapterState };
            },
            error: function (response) {
            },
            complete: function () {
            }
        });
    }

    // see if there are chapters
    if (videoController.videoFile.descriptions) {
        var descriptionsFile = videoController.page ? videoController.page.getVideoDescriptionsPath(videoController.videoFile.FileName) : "";
        var data = getXmlDocument(descriptionsFile);
        // we got the descriptions XML, populate the rest of the object
        videoController.descriptions = readDescriptions(data, videoController);

        // / tell the player to use the descriptions plugin
        options.plugins.apsDescriptions = { "options": videoController.descriptions };
    }

    if (!videoController.videoFile.chapters) {
        // TODO
        // do not allow forward seeking if we want to prevent skip ahead
        // extendAMP.setAllowSeek(!vc.videoFile.videoPreventSkipAhead);

        // set the completion threshold almost all or 0% based on must play all setting
        // extendAMP.setCredibilityCompletePercentage(vc.videoFile.mustPlayAll ? 98 : 0);
    }

    // look through the keypoints to figure out what areas we need to display
    calcLayout();

    // check if video contains any captions
    if (videoController.videoFile.captions) {
        // get the captions file name from the video file name
        captionsFile = videoController.page ? videoController.page.getVideoCaptionsPath(videoController.videoFile.FileName) : "";
        // see if there is a captions file
        if (captionsFile) {
            // there is, read it in
            videoPlayer.loadTTMLFile(captionsFile);
        }
    }

    // get video manifest information
    var manifestItem = videoController.getManifestItem();

    // make sure course settings video quality is the current media one; the UI needs to display the current video quality.
    if (manifestItem) videoController.courseController.course.settings.VideoQuality = manifestItem.uiLabel;

    // get video source based on the selected manifest item
    var sSrc = videoController.videoFile.getFilePath(manifestItem);
    var sMimeType = manifestItem ? manifestItem.getMimeType() : 'video/mp4';

    // init a var to say this is not a streaming media format
    var isStreamingURL = false;

    // override the MIME type if we actually have a .ism/manifest. source (ignore-case)
    if (sSrc.search(/.ism\/manifest/i) > -1) {
        sMimeType = 'application/vnd.ms-sstr+xml';
        isStreamingURL = true;
    };

    // show transcript popup if needed
    videoTranscript();

    // see if we have clicktoplay set
    if (!vc.videoFile.videoClickToPlay) {
        // a "play" event is never triggered in this scenario so tell the listeners that video playback has begun
        vc.videoStarted();
    }

    // see if we need to pass in key points
    if (vc.videoFile.hasKeypoints) {
        // provide the localized text strings
        var oTextString = {};
        oTextString.getYourScore = launchPage.Resources.keypoints_textString_getYourScore;
        oTextString.goBackToVideo = launchPage.Resources.keypoints_textString_goBackToVideo;
        oTextString.finalScore = launchPage.Resources.keypoints_textString_finalScore;
        oTextString.start = launchPage.Resources.keypoints_textString_start;
        oTextString.next = launchPage.Resources.keypoints_textString_next;
        oTextString.question = launchPage.Resources.keypoints_textString_question;
        oTextString.resources = launchPage.Resources.ResourcesDialog_Title_Text;
        oTextString.view = launchPage.Resources.keypoints_textString_view;
        oTextString.download = launchPage.Resources.VideoPlayer_DownloadVideo_Text;

        // fix up the paths to the resources (page links) - the first line gets a deep copy of the array
        var pl = JSON.parse(JSON.stringify(vc.page.getPageLinkArray()));
        for (var i = 0; i < pl.length; i++) {
            if (pl[i].type === "File") {
                pl[i].source = vc.page.course.getContentFolderPath() + "Resources/" + pl[i].source;
            }
        }

        // we do, send the key points and the ID of the div to display video to the key points plug-in
        options.plugins.apsKeyPoints = {
            "options": {
                kp: vc.keyPointsArray,
                id: "myVideoPlayer",
                pl: pl,
                ts: oTextString
            }
        };
    }

    try {
        // see if we can find the MSIT Azure signature
        //if (parent.parent && parent.parent.courseDataService || parent.parent.parent && parent.parent.parent.courseDataService) {
        if (videoController.courseController.course.settings.HostingLocation == "azure") {

            // found the signature, try to read the media manifest
            // look in the new rgmedia/buildID location first, look in the old location next
            if (!location.origin) { location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '') }

            //dp - get the media location from path in courseDataService (courseDataService.MediaLocation, example will be "/lmsmedia/99434")
            var mediaLocation = videoController.courseController.course.settings.AzureMediaLocation;
            var oImsmanifestXML = getXmlDocument(location.origin + mediaLocation + "/mediamanifest.xml");

            // if we found the media manifest, this must be MSIT Azure
            if (oImsmanifestXML) isMsitAzure = true;
        }
    } catch (e) {
        // LC Role Guide gets and error looking at parents
    }

    // see if we have MSIT Azure
    if (isMsitAzure) {
        // it is, just get the video file name minus the path
        sSrc = videoController.videoFile.FileName;

        // find the manifest tags
        var manifestElem = $(oImsmanifestXML).find("Manifest");

        // these are the URLs for DASH and SmoothStreaming video
        var urlVideo = "", urlLicense = "", urlDash = "";

        // loop through the manifest tags
        manifestElem.each(function () {
            // get the XML of this manifest tag
            var xmlManifest = $(this);

            // get the filename for this item
            var fileName = xmlManifest.find("FileName").text();

            // see if it matches the video we are looking for
            if (fileName == sSrc) {
                // it matches, get the URLs and stop looking
                urlVideo = xmlManifest.find("ManifestUrl").text();
                urlLicense = xmlManifest.find("AssetPath").text();
                urlDash = xmlManifest.find("DASHManifestUrl").text();
                return false;
            }
        });

        // the paths in mediamanifest.xml can have white space characters, check and remove them
        if (urlDash.length < 11) urlDash = "";
        if (urlVideo.length < 11) urlVideo = "";
        if (urlLicense.length < 11) urlLicense = "";

        // dp- just use the progressive directly from storage via URL without getting media storage token first
        var mstSrc = location.origin + mediaLocation + "/" + sSrc;

        // see if we have a valid streaming media URL
        if (urlVideo) {
            // we do, call the web service to get the token from the license key
            var jqXML = $.ajax({
                type: 'GET',
                url: location.protocol + "//" + location.host + "/api/license/token/" + urlLicense,
                async: false
            });
            var token = "Bearer=" + jqXML.responseText.replace(/"/g, "");

            // init 2 sources, one for the streaming manifest and one for the .mp4 file
            sources.push(
                {
                    src: urlVideo,
                    type: "application/vnd.ms-sstr+xml",
                    protectionInfo: [{
                        "type": "AES",
                        "authenticationToken": token
                    }],
                    streamingFormats: ["SMOOTH", "DASH"] //dp - limit to DASH/SMOOTH to avoid AMP rewriter from creating HLS, which isn't supported in MSIT Azure yet.
                }
            );
            sources.push(
                {
                    src: mstSrc,
                    type: "video/mp4"
                }
            );
        } else {
            // no streaming media, this happens when the uploaded video is not processed yet, so just load the .mp4
            sources.push(
                {
                    src: mstSrc,
                    type: "video/mp4"
                }
            );
        }
    } else {
        // play MP4
        sources.push(
            {
                src: sSrc,
                type: "video/mp4"
            }
        );

        /*
        sources.push(
            {
                src: "http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest",
                type: "application/vnd.ms-sstr+xml"
            }
        );
        */
    }

    // init the array of video sources and the WebVTT captions
    /*
    webVTT = [
                {
                    src: "https://ams-samplescdn.streaming.mediaservices.windows.net/11196e3d-2f40-4835-9a4d-fc52751b0323/TOS-en.vtt",
                    //src: "sample.vtt",
                    srclang: "en",
                    kind: "subtitles",
                    label: "english"
                }
    ];
    */

    // set the speed and the "normal" setting in the speed menu
    options.playbackSpeed.initialSpeed = vc.courseController.course.settings.MediaPlaybackRate;
    options.playbackSpeed.speedLevels[6].name = launchPage.Resources.VideoPlayer_VideoSpeedNormal_Text;

    // initialize the video player - returns the actual azure media player
    // params are the id of the <video> element and the options
    azurePlayer = videoPlayer.init("myVideoPlayer", options, handlePlayerReady);
}

// called when the AMP player calls its ready function
function handlePlayerReady() {
    // set the video source - can be more than one source for DRM video
    azurePlayer.src(sources);
    //azurePlayer.src(sources, webVTT);

    // set the volume from the saved volume level
    azurePlayer.volume(vc.volume / 100);

    // if we have video descriptions, put an alert in the videoAlert container so it is announced.
    if (hasDescriptions) {
       // $('#videoAlert').html('<p class="visuallyhidden">This video has descriptions.</p>');
        launchPage.player.courseController.screenReaderAlert('This video has descriptions.');
    }

    // wire up the event handler for ended
    azurePlayer.addEventListener(amp.eventName.ended, handleOnendedEvent);

    //wire up event handler for play and paused
    azurePlayer.addEventListener(amp.eventName.play, handlePlayEvent)
    azurePlayer.addEventListener(amp.eventName.pause, handlePauseEvent)

    // wire up the event handler for error
    azurePlayer.addEventListener(amp.eventName.error, handleOnerrorEvent);

    // wire up the event handler for volume change
    azurePlayer.addEventListener(amp.eventName.volumechange, handleOnVolumeChangeEvent);

    // handle the speed change selected by the user
    azurePlayer.addEventListener(amp.eventName.ratechange, function (t) {
        // keep track of the current speed so we can restore it next time
        vc.courseController.course.settings.MediaPlaybackRate = azurePlayer.playbackRate();
        console.log("ratechange: " + azurePlayer.playbackRate());
        //   launchPage.player.courseController.screenReaderAlert('Playback rate changed to ' + azurePlayer.playbackRate());
    });

    // wire up the seeked and seeking events
    azurePlayer.addEventListener(amp.eventName.seeking, function () {
        console.log("seeking...");
    })

    // wire up the seeked and seeking events
    azurePlayer.addEventListener(amp.eventName.seeked, function () {
        console.log("seeked...");
    })

    // wire up the event handler to get the lodeddata event - this is when we can set add controls
    azurePlayer.addEventListener(amp.eventName.loadedmetadata, function () {
        // add controls
        addControls();

        // wire up the event handler for current position
        azurePlayer.addEventListener(amp.eventName.timeupdate, handleOntimeupdateEvent);
    });

    // wire up the event handler to get the lodeddata event - this is when we can set parameters for the video
    azurePlayer.addEventListener(amp.eventName.loadeddata, function () {
        // add the listener for chapter progress
        azurePlayer.addEventListener("chapterProgress", handleChapterProgress);
        //azurePlayer.addEventListener("descriptionButtonClicked", function () {
        //    vc.courseController.course.settings.ShowVideoDescriptions = !vc.courseController.course.settings.ShowVideoDescriptions
       // });

        // see if we have a video position from the last time we played video
        if (vc.videoPosition && !isNaN(vc.videoPosition)) {
            // we do, set the video position
            videoPosition = vc.videoPosition - 0;
            azurePlayer.currentTime(videoPosition);

            // see if we are restricting scrub ahead
            if (vc.videoFile.videoPreventSkipAhead) {
                // we are, set the max played
                maxVideoPosition = videoPosition;
            }
        }

        // set the initial size of the video and set the onresize handler
        setSize();
        window.onresize = setSize;
    });

    //wire up seeking
    azurePlayer.addEventListener(amp.eventName.seeking, handleOnSeekingEvent)

    //wire up seeked
    azurePlayer.addEventListener(amp.eventName.seeked, handleOnSeekedEvent)
}

// add controls to the play bar
function addControls() {
    // see if we have clicktoplay
    if (vc.videoFile.videoClickToPlay) {
        // we do, show the big play button
     //   $(".vjs-big-play-button").show();

    } else {
        // we do not, hide the big play button
    //   $(".vjs-big-play-button").hide();

        // make sure we are really playing
        azurePlayer.play();
    }

    // see if we have captions
    if (captionsFile) {
        // we do, see if we should show captions
        if (vc.courseController.course.settings.ShowCaptions) {
            // we should, turn on the settings for video captions
            vc.courseController.course.settings.ShowVideoCaptions = true;

            // create the captions button
            var captionsButton = $('<button tabindex="0" class="vjs-control apsCaptions outline-enabled-control" role="button" aria-live="polite" style="display: inline-block;" aria-label="' + launchPage.Resources.VideoPlayer_VideoCaptionsButton_Text + '"></button>');
            var captionsText = $('<span class="vjs-control-text">' + launchPage.Resources.VideoPlayer_VideoCaptionsButton_Text + '</span>');
            captionsButton.append(captionsText);
            $(".amp-controlbaricons-right").append(captionsButton);

            // add the click handler for the captions button
            captionsButton.on('click', function () {
                // toggle the caption settings
                vc.courseController.course.settings.ShowCaptions == !vc.courseController.course.settings.ShowCaptions;
                vc.courseController.course.settings.ShowVideoCaptions = !vc.courseController.course.settings.ShowVideoCaptions;

                if (vc.courseController.course.settings.ShowCaptions && vc.courseController.course.settings.ShowVideoCaptions) {
                    launchPage.player.courseController.screenReaderAlert('Captions turned on.');
                } else {
                    launchPage.player.courseController.screenReaderAlert('Captions turned off.');
                }

                // if captions are turned off, put an empty string in the captions box
                if (!vc.courseController.course.settings.ShowVideoCaptions) {
                    launchPage.player.courseController.showCaptions("");
                   // $("#videoAlert").text("captions are off")
                   // launchPage.player.courseController.screenReaderAlert('Captions turned off.');
                } else {
                  //  $("#videoAlert").text("captions are on")
                   // launchPage.player.courseController.screenReaderAlert('Captions turned on.');
                }
            });
        }

        // we have captions so the transcript button will be enabled, remember this so we can show/hide it later with the full screen button
        vc.hasTranscriptButton = true;
    } else {
        // no captions, so we cannot auto generate a transcripe, see if we have a transcript file
        var useTranscript = vc.videoFile ? vc.videoFile.UseTranscript : false;

        // see if we want to use the video transcript
        if (useTranscript) {
            // we do, remember this so we can show/hide it later with the full screen button
            vc.hasTranscriptButton = true;
        } else {
            // no transcript button used, remember
            vc.hasTranscriptButton = false;
        }
    }

    // see if we want the transcript button
    if (vc.hasTranscriptButton) {
        // we do, create the transcript button
        var transcriptButton = $('<button tabindex="0" class="vjs-control apsTranscript outline-enabled-control" role="button" aria-live="polite" style="display: inline-block;" aria-label="' + launchPage.Resources.VideoPlayer_TranscriptShow_Text + '"></button>');
        var transcriptText = $('<span class="vjs-control-text">' + launchPage.Resources.VideoPlayer_TranscriptShow_Text + '</span>');
        transcriptButton.append(transcriptText);
        $(".amp-controlbaricons-right").append(transcriptButton);

        // add the click handler for the transcript button
        transcriptButton.on('click', function () {
            // show video transcript dialog
            videoTranscript(true);
            //launchPage.player.courseController.screenReaderAlert('Transcript toggled');
        });
    }

    // create the download button
    var downloadButton = $('<button tabindex="0" class="vjs-control apsDownload outline-enabled-control" role="button" aria-live="polite" style="display: inline-block;" aria-label="' + launchPage.Resources.VideoPlayer_Download_Text + '"></button>');
    var downloadText = $('<span class="vjs-control-text">' + launchPage.Resources.VideoPlayer_Download_Text + '</span>');
    downloadButton.append(downloadText);
    $(".amp-controlbaricons-right").append(downloadButton);

    // add the click handler for the download button
    downloadButton.on('click', function () {
        if (isMsitAzure) {
            // we do, get the rgmedia path
            if (!location.origin) { location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '') }

            //dp - we have a to get path from courseDataService window.open(location.origin + "/rgmedia/" + vc.courseController.course.buildId + "/" + vc.videoFile.FileName);
            window.open(location.origin + vc.courseController.course.settings.AzureMediaLocation + "/" + vc.videoFile.FileName);
        } else
            window.open(vc.videoFile.getFilePath(vc.getDownloadableManifestItem()));
    });

    // hide the native volume button
    $(".vjs-volume-menu-button").addClass("vjs-hidden").hide();

    

    //also hide the button to allow changing audio quality.
    $(".amp-audiotracks-control").addClass("vjs-hidden").hide();

    //also hide the button to allow changing video quality.
    $(".amp-quality-control").addClass("vjs-hidden").hide();


    // create the volume button
    // use aria-haspopup="true" to get the screen reader to tell the user there is a popup menu
    var volumeButton = $('<button tabindex="0" title="' + launchPage.Resources.AudioPlayer_VolumeButton_Text + '" class="vjs-control apsVolume outline-enabled-control" role="button" aria-expanded="false" aria-live="polite" aria-haspopup="true" onclick="handleVolumeClick()"/>');

    // create the volume menu elements
    var volumeMenu = $('<div class="aps-volume-menu-container"/>');
    var volumeContent = $('<div class="aps-volume-menu-container-content"/>');
    var volumeSlider = $("<div id='volumeMenu' class='aps-volume-menu'></div>")
    var volumeText = $('<span class="vjs-control-text">' + launchPage.Resources.AudioPlayer_VolumeButton_Text + '</span>');
    volumeContent.append(volumeSlider);
    volumeContent.append(volumeText);
    volumeMenu.append(volumeContent);

    // create the jQuery volume slider
    volumeSlider.slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: vc.volume,
        step: 10,
        slide: function (event, ui) {
            // user is sliding the volume slider, set the volume
            //console.log("uivalue: " + ui.value);
            //console.log("pmenuslider: " + volumeSlider.slider("option", "value"))
            azurePlayer.volume(ui.value / 100);

            // add the values to the slider handle to make the screen reader read the values
            $(this).find(".ui-slider-handle").attr("aria-valuenow", ui.value)
                .attr("aria-value-min", volumeSlider.slider("option", "min"))
                .attr("aria-value-max", volumeSlider.slider("option", "max"))
                .attr("aria-valuetext", ui.value + " percent")
                .attr("title", launchPage.Resources.AudioPlayer_VolumeButton_Text);
        },
        create: function (event, ui) {
            // tell the screen reader that we have a slider
            // this also tells the screen reader to treat this as an application that can use arrow keys
            $(this).find(".ui-slider-handle").attr("role", "slider");
        }
    });

    // attach the volue button to the play bar
    $(".amp-controlbaricons-right").append(volumeButton);

    // attach the volume menu to the play bar
    // the display is absolute so it will have no visual space on the playbar
    $(".amp-controlbaricons-right").append(volumeMenu);

    // called when the volume button is clicked (or user presses enter or space)
    window.handleVolumeClick = function () {
        // get the volume button
        var volumeButton = $(".apsVolume");

        // mark the volume button as an item with an expanded menu
        volumeButton.attr("aria-expanded", true);

        // get the position of the volume button
        var position = volumeButton.position();

        // get the volume menu container
        var volumeMenu = $(".aps-volume-menu-container");

        // align the left side of the volume menu to the left side of the volume button
        volumeMenu.css("left", position.left);

        // show the volume menu
        volumeMenu.show();

        // get the slider handle
        var sliderHandle = volumeMenu.find(".ui-slider-handle");

        // give the slider handle focus
        sliderHandle.focus();

        // when the slider loses focus, hide the menu
        sliderHandle.one("blur", function () { hideVolumeMenu(); });

        // get the key up events for the slider handle
        sliderHandle.keydown(function (e) {
            // hide the menu if user hits escape key
            if (e.which == 27) {
                hideVolumeMenu();
            }
        });
    }

    function hideVolumeMenu() {
        //get the volume button
        var volumeButton = $(".apsVolume");

        // get the volume menu container
        var volumeMenu = $(".aps-volume-menu-container");

        // set the value of the volume button to volume NN percent
        volumeButton.attr("title", launchPage.Resources.AudioPlayer_VolumeButton_Text + " " + volumeMenu.find(".ui-slider-handle").attr("aria-valuetext"));

        // hide the volume menu
        volumeMenu.hide();

        // give the volume button focus
        volumeButton.focus();

        // mark the menu button as not expanded (popup menu closed)
        volumeButton.attr("aria-expanded", false);
    }

    // hide the 'change quality' button since the button does not really change the quality
    $(".amp-quality-control").hide();

    //dp - fix the missing tabIndex for the speed control so that it appears in tab order
    $('.amp-playbackspeed-control').attr('tabindex', "0");
    //dp - change the role of playback speed button from menuitem to button so that it passes MAS - can have menuitem role and expanded=true
    $('.amp-playbackspeed-control-normal:first').attr('role', "button");

    //dp - put title's on the buttons to make the browser show a tooltip
    $(".vjs-play-control").attr("title", $(".vjs-control-text", ".vjs-play-control").text());
   // $(".amp-playbackspeed-control").attr("title", $(".vjs-control-text", ".amp-playbackspeed-control").text());
    $(".vjs-playback-rate").attr("title", $(".vjs-control-text", ".vjs-playback-rate").text());
    $(".amp-apsdescriptions-control").attr("title", $(".vjs-control-text", ".amp-apsdescriptions-control").text());
    $(".amp-audiotracks-control").attr("title", $(".vjs-control-text", ".amp-audiotracks-control").text());
    $(".vjs-subtitles-button").attr("title", $(".vjs-control-text", ".vjs-subtitles-button").text());
    $(".apsCaptions").attr("title", $(".vjs-control-text", ".apsCaptions").text());
    $(".amp-quality-control").attr("title", $(".vjs-control-text", ".amp-quality-control").text());
    $(".amp-moreoptions-control").attr("title", $(".vjs-control-text", ".amp-moreoptions-control").text());
    //$(".vjs-volume-menu-button").attr("title", $(".vjs-control-text", ".vjs-volume-menu-button").text());
    $(".vjs-fullscreen-control").attr("title", $(".vjs-control-text", ".vjs-fullscreen-control").text());
    $(".apsTranscript").attr("title", "Toggle between contents and transcript"); //hard coding a custom string to toggle between contents and transcript
    $(".apsDownload").attr("title", $(".vjs-control-text", ".apsDownload").text());
    $(".amp-apsdescriptions-control").attr("title", "Toggle audio descriptions")//$(".vjs-control-text", ".amp-apsdescriptions-control").text()); //there seems to be no text for description controls
    $(".amp-playbackspeed-control-normal:first").attr("title", $(".amp-menu-header", ".amp-playbackspeed-control-normal:first").text());
    // chapter button already has the title set - do not change here

    //the amp player doesn't outline the play button first time, and also doesn't show the control bar when play gets focus. That's what these do.
    $("[title='Play']").on('focus', function () { $("[title='Play']").addClass('outline-enabled-control'); azurePlayer.userActive(true); })




}

// handle click on video transcript button
function videoTranscript(selectTab) {
    // get a shortcut to the course controller
    var cc = launchPage.player.courseController;
    var transcriptFile = vc.videoFile.UseTranscript ? vc.page.getVideoTranscriptPath(vc.videoFile.FileName) : vc.page.getVideoCaptionsPath(vc.videoFile.FileName);
    cc.showTranscriptView(transcriptFile, vc.videoFile.UseTranscript);
    selectTab && cc.selectTranscriptTab();
}

function handleChapterProgress() {
    // get the progress
    var p = Amp.Plugin.apsChapters.AmpService.getProgress("myVideoPlayer");

    // see if the video is complete
    if (p.result.complete) {
        // it is, tell the video controller
        vc.setComplete();
    }
}

// hide the error message
function hideError() {
    $("#showit").hide();
    location.reload();
}

// handle the error event
function handleOnerrorEvent(error) {
    // see if the video is in the rgmedia folder in Azure
    if (!location.origin) { location.origin = location.protocol + "//" + location.hostname + (location.port ? ':' + location.port : '') }
    var sSrc = location.origin + "/rgmedia/" + vc.courseController.course.buildId + "/" + vc.videoFile.FileName;

    // increment the count or retries to load video
    vc.courseController.course.settings.videoRetry++;

    // show the error message including a hyperlink to the video and the number of retries
    var s = '<div class="ErrorNumber">' + launchPage.Resources.VideoPlayer_ErrorNumber_Text + "</div>";
    s += '<div class="ErrorRetry">' + launchPage.Resources.VideoPlayer_ErrorRetry_Text + vc.courseController.course.settings.videoRetry + "</div>";
    s += '<div class="ErrorFile">' + launchPage.Resources.VideoPlayer_ErrorFile_Text + '<a href="' + sSrc + '" target="_blank">' + vc.videoFile.FileName + '</a></div>';

    // Allow 2 attempts to fail trying to load a video.
    // On the second failed attempt, check to see if the video quality the user is trying to load has required="yes" in mediaManifest.xml.
    // If not, remember the problem by setting a flag in the video controller object to remember record this problem.
    if (vc.courseController.course.settings.videoRetry == 2) {
        var mediaManifestItem = vc.getManifestItem();
        if (mediaManifestItem && !mediaManifestItem.required)
            vc.courseController.course.settings.errorOnVideoRetry = true;
    }

    // see if we have retried this more less than 5 times
    if (vc.courseController.course.settings.videoRetry < 5) {
        // it is, wait 2 seconds and then hide the error and reload to try to load the video again
        setTimeout('hideError()', 5000);
    } else {
        // see if this video has to be completed in order to show a link that allows the user to complete the video and the page
        if (vc.videoFile.mustPlayAll)
            s += '<div class="ErrorComplete"><a href="" onclick="vc.videoEnded();return false;">' + launchPage.Resources.VideoPlayer_ErrorMark_Text + '</a></div>';
    }

    // show the error
    $("#showit").html(s);
    $("#showit").show();
}

// handle the ontimeupdate event
function handleOntimeupdateEvent() {
    // remember the video position
    var currentPos = azurePlayer.currentTime();

    // see if the currentTime is a valid value, if it is not, ignore this time event to avoid a problem
    if (isNaN(currentPos)) return;

    // see if we are NOT in chapter mode AND need to prevent forward scrubbing AND the user is jumping past the max time AND 
    if (!vc.videoFile.chapters && vc.videoFile.videoPreventSkipAhead && currentPos > maxVideoPosition + 1) {
        // we are, reset the scrub position and do not update other items
        azurePlayer.currentTime(videoPosition);
        return;
    }

    // video position is OK, remember it
    videoPosition = currentPos;

    // reset video retry counter
    if (vc) vc.courseController.course.settings.videoRetry = 0;

    // update the maximum time played
    if (videoPosition > maxVideoPosition) maxVideoPosition = videoPosition;

    // show the caption for this time interval if captions are selected
    var captionText = videoPlayer.getCurrentCaption(videoPosition);
    if (vc.courseController.course.settings.ShowVideoCaptions && captionText) {
        launchPage.player.courseController.showCaptions(captionText);
    }

    // notify time changed in the video controller
    //if (console && console.log) console.log("--> VIDEO TIME: " + videoPosition);
    vc.timeChanged(Math.floor(videoPosition));
}

// handle the onended event
function handleOnendedEvent() {

    // reset the position to 0 seconds. Need this for video embedded in tabs with autocomplete to all
    // the video to be viewed again
    videoPosition = 0;
    azurePlayer.currentTime(videoPosition);

    // tell the video controller the movie has ended
    vc.videoEnded();
    // if (console && console.log) console.log("--> VIDEO ENDED");

    // in this version of the player, we get the ended event after the timeupdate events are complete, so send one last timeupdate
    vc.timeChanged(Math.floor(videoPosition));
    // if (console && console.log) console.log("--> FINAL VIDEO TIME: " + videoPosition);
    // launchPage.player.courseController.screenReaderAlert('Video has finished.');
}

// handle the onvolumechange event
function handleOnVolumeChangeEvent() {
    // tell the video controller the new volume
    var volume = azurePlayer.volume();
    vc.volumeChanged(volume * 100);

    // launchPage.player.courseController.screenReaderAlert('Volume is ' + (volume * 100) + ' percent');
}

function handlePlayEvent() {
    // tell the video controller the movie has ended
    vc.videoStarted();
    //if (console && console.log) console.log("--> VIDEO started");
}

function handlePauseEvent() {
    // tell the video controller the movie has ended
    vc.videoStopped();
    // throw an alert
    //  $("#videoAlert").text("video player paused")
    //if (console && console.log) console.log("--> VIDEO paused");

    //  launchPage.player.courseController.screenReaderAlert('Video is paused.');
}

function handleOnSeekingEvent() {
    //console.log ("seeking... pause: " + amp.Player.paused)
}

function handleOnSeekedEvent() {
    //console.log ("seek complete...play: " + amp.Player.paused)
}

// calculate the layout based on the keypoints we have
function calcLayout() {
    // see if we have any keypoints
    if (vc.videoFile.hasKeypoints) {
        // we do, loop through the array of keypoints to see what layout we need
        for (var i = 0; i < vc.keyPointsArray.length; i++) {
            // update layout vars based on the position of this keypoint
            switch (vc.keyPointsArray[i].position) {
                case "OutsideLeft":
                    needLeft = true;
                    break;
                case "OutsideTop":
                    needTop = true;
                    break;
                case "OutsideRight":
                    needRight = true;
                    break;
            }
        }
    }
}

// adjusts the size of the video - called after the video player is loaded an onresize
function setSize() {
    try {
        // get the containers for the video and key point areas
        var videoContainer = $('#videoContainer'), videoOutsideLeft = $('#videoOutsideLeft'), videoOutsideRight = $('#videoOutsideRight'), videoOutsideTop = $('#videoOutsideTop');

        // set the available space to the space inside the iframe
        var iframeWindow = $(vc.iframeWindow);
        var containerDimensions = { width: iframeWindow.innerWidth(), height: iframeWindow.innerHeight() };

        //size outside keypoint regions to a percentage of the overall height and width
        videoOutsideLeft.css('width', 0.1 * containerDimensions.width);
        videoOutsideRight.css('width', 0.1 * containerDimensions.width);
        videoOutsideTop.css('height', 0.15 * containerDimensions.height);

        //adjust available space to accommodate key point regions outside the video container
        needTop && (containerDimensions.height -= $('#videoOutsideTop').outerHeight());
        (needLeft || needRight) && (containerDimensions.width -= $('#videoOutsideLeft').outerWidth());
        (needLeft || needRight) && (containerDimensions.width -= $('#videoOutsideRight').outerWidth());

        // get the aspect ratio of the div we have to show the player
        var aspectScreen = containerDimensions.width / containerDimensions.height;

        // get the video aspect ratio - adjust the video height to handle the additional height for the captions
        var aspectVideo = getVideoWidth() / getVideoHeight();

        // see if the div aspect ratio is greater than the video aspect ratio
        if (aspectScreen > aspectVideo) {
            // it is, this means we cannot use the full width of widthCenter - if we did we would cut off the bottom of the video
            // so adjust the width
            containerDimensions.width = Math.floor(containerDimensions.height * aspectVideo);
        }

        // see if we do not want to stretch the video
        if (!vc.videoFile.videoStretchToFit) {
            // we do not, see if the width available for the video is greater than the width we have available
            if (containerDimensions.width > getVideoWidth()) {
                // it is, reduce the width to the actual width of the video
                containerDimensions.width = getVideoWidth();
            }
        }

        // set the container height to respect aspect ratio
        containerDimensions.height = Math.floor(containerDimensions.width / aspectVideo);

        var containerTop = needTop ? $('#videoOutsideTop').outerHeight() : 0;

        // apply the calculated dimensions to all of the tags containing the video
        videoContainer.css({ width: containerDimensions.width + 'px', height: containerDimensions.height + 'px', left: Math.floor((iframeWindow.innerWidth() - containerDimensions.width) / 2) + 'px', top: containerTop + 'px' });

        // set the video to the proper width and height
        azurePlayer.width(containerDimensions.width);
        azurePlayer.height(containerDimensions.height);
        videoContainer.find('.pf-video').css('width', containerDimensions.width + 'px');
        videoContainer.find('.pf-video').css('height', containerDimensions.height + 'px');

        var myVideoContainer = $('#myVideoContainer');
        myVideoContainer.css('width', containerDimensions.width + 'px');
        myVideoContainer.css('height', containerDimensions.height + 'px');

        if (containerDimensions.width >= 725) {
            if (videoContainer.hasClass('miniVideo') || videoContainer.hasClass('tinyVideo')) {
                videoContainer.removeClass('miniVideo').removeClass('tinyVideo');
            }
        } else {
            if (!videoContainer.hasClass('miniVideo')) {
                videoContainer.addClass('miniVideo');
            }
            videoContainer.toggleClass('tinyVideo', containerDimensions.width < 275);
        }
    } catch (e) {
    }

    // hide the X/Y time display when the video window is very small
    // this keeps the controls from overlapping on top of the X/Y
    if (containerDimensions.width < 320) {
        $(".vjs-current-time-display").hide();
        $(".vjs-time-divider").hide();
        $(".vjs-duration-display").hide();
    } else {
        $(".vjs-current-time-display").show();
        $(".vjs-time-divider").show();
        $(".vjs-duration-display").show();
    }
}

// return true if the XML file exists
function xmlFileExists(sFile) {
    // get the object that reads in the XML file
    var xml = getXmlDocument(sFile);

    // return true if we got a valid object and there was XML data inside it
    if (xml)
        return true;

    return false;
}

function getVideoWidth() {
    // return the original width if we have already got it
    if (origWidth > 1) return origWidth;
    try {
        if (azurePlayer) {
            origWidth = azurePlayer.videoWidth();
            // console.log("origWidth: " + origWidth);
            return origWidth;
        }
    } catch (e) { }

    return null;
}

function getVideoHeight() {
    // return the original width if we have already got it
    if (origHeight > 1) return origHeight;
    try {
        if (azurePlayer) {
            origHeight = azurePlayer.videoHeight();
            // console.log("origHeight: " + origHeight);
            return origHeight;
        }
    } catch (e) { }

    return null;
}

// create the descriptions object based on the descriptions XML file, videoController data and text resources
function readDescriptions(xml, vc) {
    try {
        // instantiate the descriptions object
        var o = new Amp.Plugin.apsDescriptions.Descriptions;
        // find root elem
        var scriptCommandsElem = $(xml).find("ScriptCommand");
        var descriptions = [];

        // we did, loop through the list of descripitions in the XML file to fill in the array
        $(scriptCommandsElem).each(function () {
            // get this ScriptCommand XML tag
            var scriptCommandElem = $(this);

            // create a description object
            var newDescription = {};

            // the Command parameter looks like this: Command="[This is description text]|[0:0:5.0]|[Pause]"
            // get the command parameter and break out its parts and then loop through to get the contents inside the square brackets
            var command = scriptCommandElem.attr("Command");
            var aCommand = command.split("|");
            for (var i = 0; i < aCommand.length; i++) {
                if (aCommand[i].length > 2) {
                    aCommand[i] = aCommand[i].substring(1, aCommand[i].length - 1);
                } else {
                    aCommand[i] = "";
                }
            }

            // fill in the object using the attributes and tag-values from the XML
            newDescription.timeStart = vc.charTimeToSeconds(scriptCommandElem.attr("Time"));
            newDescription.type = scriptCommandElem.attr("Type");
            newDescription.text = aCommand[0];
            newDescription.timeEnd = newDescription.timeStart + vc.charTimeToSeconds(aCommand[1]);
            newDescription.pause = aCommand[2].toLowerCase() == "true";
            descriptions.push(newDescription);
        });

        // fill the descriptions array with the data
        o.descriptions = descriptions;
        o.enabled = function () { return vc.courseController.course.settings.ShowVideoDescriptions };
        o.setValue = function setValue(newValue) {
            vc.courseController.course.settings.ShowVideoDescriptions = newValue;
            if (vc.courseController.course.settings.ShowVideoDescriptions) {
                vc.courseController.screenReaderAlert("Audio descriptions on");
            }
            else {
                vc.courseController.screenReaderAlert("Audio descriptions off")
            }
        }

        //dp set the hasDescriptions flag.
        hasDescriptions = true;
        vc.focusToAudioDescription = o.focusToAudioDescription;

        //hook up videoController to the description element so we can focus it if needed for screen reader
     //   vc.focusAudioDescriptionElement = o.setFocusToAudioDescription

        // fill the text strings
        if (launchPage) {
            o.textString.buttonLabel = launchPage.Resources.descriptions_textString_buttonLabel;
            o.textString.resumePlayback = launchPage.Resources.descriptions_textString_resumePlayback_buttonLabel;
            o.textString.descriptionsOff = launchPage.Resources.descriptions_textString_descriptionsOff_buttonLabel;
            o.textString.descriptions = launchPage.Resources.descriptions_textString_descriptions_label;
        }
    } catch (e) {
        o.descriptions = []; o.textString = {};
    }

    return o;
}

// create the chapters object based on the chapters JSON file, videoController data and text resources
function readChapters(chapters, videoController) {
    // instantiate the chapter object
    var o = new Amp.Plugin.apsChapters.Chapters;

    // loop through the chapters
    for (var i = 0; i < chapters.length; i++) {
        // turn the character time hh:mm:ss into numbers
        chapters[i].timeStart = videoController.charTimeToSeconds(chapters[i].timeStart);
        chapters[i].timeEnd = videoController.charTimeToSeconds(chapters[i].timeEnd);
        chapters[i].duration = videoController.charTimeToSeconds(chapters[i].duration);

        // replace the relative path with the absolute path
        chapters[i].image = videoController.page.getPageContentFolderPath() + chapters[i].image;
    }

    // fill the chapter array with the JSON data
    o.chapters = chapters;

    // fill the high level ptoperites from the video controller video file
    var f = videoController.videoFile;
    o.required = videoController.page.isRequired();
    o.chapterLinear = f.linearChapters;
    o.style = f.chapterStyle;

    // fill the text strings
    r = launchPage.Resources;
    o.textString.buttonLabel = r.chapters_textString_buttonLabel; // "Show chapter list"
    o.textString.close = r.chapters_textString_close; // "Close chapter list"
    o.textString.duration = r.chapters_textString_duration; // "Duration: {0} Seconds"
    o.textString.durationMinutes = r.chapters_textString_durationMinutes; // "Duration: {0} Minutes"
    o.textString.status = r.chapters_textString_status; // "Status: "
    o.textString.statusLocked = r.chapters_textString_statusLocked; // "Locked"
    o.textString.statusNotStarted = r.chapters_textString_statusNotStarted; // "Not Started"
    o.textString.statusStarted = r.chapters_textString_statusStarted; // "Started"
    o.textString.statusComplete = r.chapters_textString_statusComplete; // "Complete"
    o.textString.restrictionMustViewAll = r.chapters_textString_restrictionMustViewAll; // "You must view all of the video in this chapter.";
    o.textString.restrictionCompletePrior = r.chapters_textString_restrictionCompletePrior; // "You must complete the required chapters in order";
    o.textString.view = r.chapters_textString_view; // "WATCH"
    o.textString.share = r.chapters_textString_share; // "SHARE"
    o.textString.chapterOverview = r.chapters_textString_chapterOverview; // "Chapter Overview"
    o.textString.gotIt = r.chapters_textString_gotIt; // "GOT IT";
    o.completePrevious = r.chapters_textString_completePrevious; // "COMPLETE PREVIOUS CHAPTER TO UNLOCK"

    return o;
}

// synchrously load a file with AJAX
function getXmlDocument(sFile) {
    // get course manifest file
    var jqXML = $.ajax({
        type: 'GET',
        url: sFile,
        dataType: 'xml',
        async: false
    });

    // return null if we cannot find the file
    if (jqXML.status == 404) return null;

    //return XML
    return jqXML.responseText;
}