var ExtendAMP = (function () {
    var mediaDetails = { id: 101288 };
    var azurePlayer = null;
    var credibilityCompletePercentage = 0;
    var isXApiReported = false;
    var apiSpanInSeconds = 60;//Call ipma service span
    var lastConsumptionSec = 0;
    var streamSource = "channel9";
    var techOrder = ["azureHtml5JS", "flashSS", "silverlightSS", "html5"];
    var playerSource = "";
    var isPaused = false;
    var isPlaying = false;
    var isCompleted = false;
    var captionsUrl = "";
    var captionsData = [];
    var useTrendsService = false; // set to false since this service causes a cross-domain error
    // the behavior of the player is controlled by these externally settable variables
    var autoPlay = false; // autoplays if true
    var volume = 1.0; // volume of audio from 0-100 as a percentage
    var poster = ""; // URL to poster image
    var placeHolder = "azuremediaplayer"; // IF of <video> element
    var tracks = null; // URL to vtt files
    var annotations = null; // annotations that appear over the top of video
    var allowSeek = true; // true if forward seeking is allowed past maximum played position
    var heuristicProfile = "Hybrid"; // affects the startup quality/performance HighQuality, Hybrid or QuickStart 
    var handlePlay = null; // external functions to handle events thrown by the player
    var handlePause = null;
    var handleLoadedData = null;
    var handleLoadedMetaData = null;
    var handleTimeUpdate = null;
    var handleEnded = null;
    var handleError = null;
    var handleVolumeChange = null;
    var keyPoints = null;
    var descriptions = null;
    var chapterOptions = null;  // the settings for chapters
    var chapterState = null; // the previous state of chapters
    var videoId = null;

    // set the video source
    function setPlayerSource(source) {
        playerSource = source;
    }

    // set the tech order
    function setTechOrder(order) {
        techOrder = order;
    }

    // set the completion percentage
    function setCredibilityCompletePercentage(p) {
        credibilityCompletePercentage = p;
    }

    // set the autoplay
    function setAutoPlay(a) {
        autoPlay = a;
    }

    // set the volume
    function setVolume(v) {
        volume = v;
    }

    // set the poster
    function setPoster(p) {
        poster = p;
    }

    // set the <video> id
    function setPlaceHolder(p) {
        placeHolder = p;
    }

    // set tracks
    function setTracks(t) {
        tracks = t;
    }

    // set chapters
    function setChapters(o, s) {
        chapterOptions = o;
        chapterState = s;
    }

    // set annotations
    function setAnnotations(a) {
        annotations = a;
    }

    // set allow seek
    function setAllowSeek(a) {
        allowSeek = a;
    }

    // set key points
    function setKeyPoints(kp) {
        keyPoints = kp;
    }

    function setDescriptions(ds) {
        descriptions = ds;
    }

    // gets the azure player
    function getAzurePlayer() { return azurePlayer }

    // set event handlers
    function setHandlePlay(h) {
        handlePlay = h;
    }
    function setHandlePause(h) {
        handlePause = h;
    }
    function setHandleLoadedData(h) {
        handleLoadedData = h;
    }
    function setHandleLoadedMetaData(h) {
        handleLoadedMetaData = h;
    }
    function setHandleTimeUpdate(h) {
        handleTimeUpdate = h;
    }
    function setHandleEnded(h) {
        handleEnded = h;
    }
    function setHandleError(h) {
        handleError = h;
    }
    function setHandleVolumeChange(h) {
        handleVolumeChange = h;
    }
    function setHeuristicProfile(h) {
        heuristicProfile = h;
    }

    // initializes all values and kicks off the presentation of the video player
    function init(videoId) {
        // make sure we have a valid value for completion playback
        if (isNaN(credibilityCompletePercentage) || credibilityCompletePercentage > 100)
            credibilityCompletePercentage = 100;

        // make sure we have a valid value for API call frequency
        if (isNaN(apiSpanInSeconds))
            apiSpanInSeconds = 60;
        // dp - set the id for the video (for bookmarking locally)
        videoId = videoId;

        // set plugins
        var oPlugins = {};
        if (keyPoints)
            oPlugins.apsKeyPoints = { "options": keyPoints };
        if (chapterOptions)
            oPlugins.apsChapters = { "options": chapterOptions, "progress": chapterState };
        if (descriptions)
            oPlugins.apsDescriptions = { "options": descriptions };

        // create the objects to control the video behavior
        // Before setting the player options, please make sure you have data for videoID, poster, src, tracks, chapters and events
        var playerOptions = {
            //defines player behavior
            settings: {
                autoPlay: autoPlay,
                techOrder: techOrder,
                poster: poster,
                width: 1280, // use 16x9 dimensions to match the dimensions of SMSGR videos
                height: 720,
                customPlayerSettings: {},
                heuristicProfile: heuristicProfile,
                logo: { enabled: false },
                skinConfig: {},
                volume: volume
            },
            //defines player controls
            controls: {
                show: true,
                progress: true,
                captions: {
                    show: true,
                    search: true
                },
                fullscreen: true,
                chapters: false,  // we do not use the chapter feature built into extend amp
                volume: true,
                quality: true,
                moreOptions: true,
                audioTracks: true,
                seek: allowSeek,
                playback: true
            },
            //other player configuration
            placeHolder: placeHolder,
            videoID: videoId,
            logging: {
                player: false,
                custom: false
            },
            cookieExpiresInMinutes: 7 * 24 * 60,
            minCharCountToSearchCaptions: 3,
            enableDoubleClickForFullscreen: true,
            credibilityCompletePercentage: credibilityCompletePercentage,
            streamSource: streamSource,
            source: playerSource,
            ttmlCaptions: captionsData, //For TTML files
            tracks: tracks,
            chapters: [], // we do not use the chapter feature built into extend amp
            annotations: annotations,
            events: {
                playerPlayEvent: extendAMP.azurePlayerPlay,
                playerPauseEvent: extendAMP.azurePlayerPause,
                playerLoadedDataEvent: extendAMP.azurePlayerLoadedData,
                playerLoadedMetadataEvent: extendAMP.azurePlayerLoadedMetaData,
                playerTimeUpdateEvent: extendAMP.azurePlayerTimeUpdate,
                playerEndedEvent: extendAMP.azurePlayerEnded,
                playerErrorEvent: extendAMP.azurePlayerError,
                playerVolumeChangeEvent: extendAMP.azurePlayerVolumeChange
            },
            plugins: oPlugins
        }

        azurePlayer = new AMPPlayer(playerOptions);
        azurePlayer.render();
        window.onbeforeunload = azurePlayerDispose;
    }
    function loadTTMLFile(url) {
        // remember the captions file
        captionsUrl = url;

        $.ajax({
            type: "GET",
            url: captionsUrl,
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
    // returns the current caption string for this time in the video
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
    function azurePlayerPlay() {
        if (handlePlay) handlePlay();
        var actionId = trendsService.userAction.PodcastView;
        if (!isPlaying)
            actionId = trendsService.userAction.PodcastView;
        else if (isPaused) {
            actionId = trendsService.userAction.PodcastView_Resume;
            isPaused = false;
        }
        if (useTrendsService) {
            trendsService.processAnalytics({
                requestItem: mediaDetails.id,
                actionId: actionId,
                resumeLocation: Math.floor(azurePlayer.getPosition()),
                bitrate: azurePlayer.playbackBitrate()
            }, true);
        }

        isCompleted = false;
        isPlaying = true;
        isPaused = false;
    }
    function azurePlayerPause() {
        if (handlePause) handlePause();
        isPlaying = true;
        isPaused = true;
        isCompleted = false;
        if (useTrendsService) {
            if (!azurePlayer.ended()) {
                trendsService.processAnalytics({
                    requestItem: mediaDetails.id,
                    actionId: trendsService.userAction.PodcastView_Pause,
                    resumeLocation: Math.floor(azurePlayer.getPosition()),
                    bitrate: azurePlayer.playbackBitrate()
                }, true);
            }
        }
        //console.log("custom event player is paused");
    }
    function azurePlayerTimeUpdate() {
        var percentCompleted = parseInt((Math.floor(azurePlayer.getWatchedTime()) / azurePlayer.getVideoDuration()) * 100, 10);
        //console.log(percentCompleted);
        if (percentCompleted >= (credibilityCompletePercentage - 2)) {
            if (useTrendsService) {
                if (!trendsService.isXAPIReported) {
                    trendsService.callXAPI = true;
                    trendsService.processAnalytics({
                        requestItem: mediaDetails.id,
                        actionId: trendsService.userAction.PodcastView_Completed,
                        resumeLocation: Math.floor(azurePlayer.getPosition()),
                        bitrate: azurePlayer.playbackBitrate()
                    }, true);
                }
            }
        }
        var currentTime = parseInt(Math.floor(azurePlayer.getPosition()));
        if (handleTimeUpdate) handleTimeUpdate(azurePlayer.getPosition());
        if (currentTime % apiSpanInSeconds === 0 && !azurePlayer.ended() && currentTime !== lastConsumptionSec) {
            lastConsumptionSec = currentTime;
            //console.log(azurePlayer.getPosition());
            if (useTrendsService) {
                trendsService.processAnalytics({
                    requestItem: mediaDetails.id,
                    actionId: trendsService.userAction.PodcastView_InProgess,
                    resumeLocation: currentTime,
                    bitrate: azurePlayer.playbackBitrate()
                }, true);
            }
        }
    }
    function azurePlayerLoadedData() {
        if (handleLoadedData) handleLoadedData();
    }
    function azurePlayerLoadedMetaData() {
        if (handleLoadedMetaData) handleLoadedMetaData();
    }
    function azurePlayerEnded() {
        if (handleEnded) handleEnded();
        if (!isCompleted) {
            if (useTrendsService) {
                trendsService.callXAPI = false;
                trendsService.processAnalytics({
                    requestItem: mediaDetails.id,
                    actionId: trendsService.userAction.PodcastView_Completed,
                    resumeLocation: Math.floor(azurePlayer.getPosition()),
                    bitrate: azurePlayer.playbackBitrate()
                }, true);
            }
        }
        isCompleted = true;
        isPlaying = false;
        isPaused = true;
    }
    function azurePlayerError(error) {
        if (handleError) handleError(error);
        var errorDetails = "";
        if (error)
            errorDetails = error.message + " error_code: " + error.code;

        if (useTrendsService) {
            trendsService.processAnalytics({
                requestItem: mediaDetails.id,
                actionId: "error",
                resumeLocation: "",
                bitrate: errorDetails
            });
        }
    }
    function azurePlayerVolumeChange() {
        if (handleVolumeChange) handleVolumeChange();
    }
    function azurePlayerDispose() {
        //console.log(azurePlayer.getWatchedTime());
        //call trend service.
    }

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
            else
                return parseInt(timeFormat, 10);
        }

        return 0;
    }

    return {
        init: init,
        getAzurePlayer: getAzurePlayer,
        azurePlayerLoadedData: azurePlayerLoadedData,
        azurePlayerLoadedMetaData: azurePlayerLoadedMetaData,
        azurePlayerEnded: azurePlayerEnded,
        azurePlayerPlay: azurePlayerPlay,
        azurePlayerPause: azurePlayerPause,
        azurePlayerError: azurePlayerError,
        azurePlayerTimeUpdate: azurePlayerTimeUpdate,
        azurePlayerVolumeChange: azurePlayerVolumeChange,
        setPlayerSource: setPlayerSource,
        setTechOrder: setTechOrder,
        setCredibilityCompletePercentage: setCredibilityCompletePercentage,
        setAutoPlay: setAutoPlay,
        setVolume: setVolume,
        setPoster: setPoster,
        setPlaceHolder: setPlaceHolder,
        setTracks: setTracks,
        setChapters: setChapters,
        setAnnotations: setAnnotations,
        setAllowSeek: setAllowSeek,
        setKeyPoints: setKeyPoints,
        setDescriptions: setDescriptions,
        setHeuristicProfile: setHeuristicProfile,
        setHandlePlay: setHandlePlay,
        setHandlePause: setHandlePause,
        setHandleLoadedData: setHandleLoadedData,
        setHandleLoadedMetaData: setHandleLoadedMetaData,
        setHandleTimeUpdate: setHandleTimeUpdate,
        setHandleEnded: setHandleEnded,
        setHandleError: setHandleError,
        setHandleVolumeChange: setHandleVolumeChange,
        getCurrentCaption: getCurrentCaption,
        loadTTMLFile: loadTTMLFile
    };
});