var browserInfo = (function () {
    //private variable
    var appVersion = navigator.appVersion;
    var userAgent = navigator.userAgent;
    var nameOffset = '';
    var versionOffset = '';
    var indexOfCharInString = '';
    var unknown = '-';
    //browser details to be returned
    var browser = {
        name: '',
        version: '' + parseFloat(navigator.appVersion),
        language: '',
        width: screen.width,
        height: screen.height,
        os: {
            name: '',
            version: ""
        },
        device: {
            name: ''
        },
        netFrameworkVersion: 0
    };
    var clientOsStrings = [
       { s: 'Windows 10', r: /(Windows 10.0|Windows NT 10.0)/ },
       { s: 'Windows 8.1', r: /(Windows 8.1|Windows NT 6.3)/ },
       { s: 'Windows 8', r: /(Windows 8|Windows NT 6.2)/ },
       { s: 'Windows 7', r: /(Windows 7|Windows NT 6.1)/ },
       { s: 'Windows Vista', r: /Windows NT 6.0/ },
       { s: 'Windows Server 2003', r: /Windows NT 5.2/ },
       { s: 'Windows XP', r: /(Windows NT 5.1|Windows XP)/ },
       { s: 'Windows 2000', r: /(Windows NT 5.0|Windows 2000)/ },
       { s: 'Windows ME', r: /(Win 9x 4.90|Windows ME)/ },
       { s: 'Windows 98', r: /(Windows 98|Win98)/ },
       { s: 'Windows 95', r: /(Windows 95|Win95|Windows_95)/ },
       { s: 'Windows NT 4.0', r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
       { s: 'Windows CE', r: /Windows CE/ },
       { s: 'Windows 3.11', r: /Win16/ },
       { s: 'Windows Phone', r: /Windows Phone|Windows Phone OS/ },
       { s: 'Android', r: /Android/ },
       { s: 'Open BSD', r: /OpenBSD/ },
       { s: 'Sun OS', r: /SunOS/ },
       { s: 'Linux', r: /(Linux|X11)/ },
       { s: 'iOS', r: /(iPhone|iPad|iPod)/ },
       { s: 'Mac OS X', r: /Mac OS X/ },
       { s: 'Mac OS', r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
       { s: 'QNX', r: /QNX/ },
       { s: 'UNindexOfCharInString', r: /UNindexOfCharInString/ },
       { s: 'BeOS', r: /BeOS/ },
       { s: 'OS/2', r: /OS\/2/ },
       { s: 'RIM Tablet OS', r: /RIM Tablet OS/ },
       { s: 'BlackBerry OS 10', r: /BB10/ },
       { s: 'MeeGO OS', r: /MeeGo/ },
       { s: 'Search Bot', r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/ }
    ];
    var clientMobileDeviceStrings = [
        { s: 'Mobile', r: /Mobile/i },
        { s: 'iPhone', r: /iPhone/i },
        { s: 'iPod', r: /iPod/i },
        { s: 'IEMobile', r: /IEMobile/i },
        { s: 'Windows Phone', r: /Windows Phone/i },
        { s: 'Android', r: /Android/i },
        { s: 'BlackBerry', r: /BlackBerry/i },
        { s: 'webOS', r: /webOS/i }
    ];
    var clientTabletDeviceStrings = [
            { s: 'Tablet', r: /Tablet/i },
            { s: 'iPad', r: /iPad/i },
            { s: 'iPad', r: /iPad/ },
            { s: 'Nexus 7', r: /Nexus 7/i },
            { s: 'Nexus 10', r: /Nexus 10/i },
            { s: 'KFAPWI', r: /KFAPWI/i }
    ];
    var browserNames = {
        opera: 'Opera',
        ie: 'Microsoft Internet Explorer',
        edge: 'Microsoft Edge',
        chrome: 'Chrome',
        iemobile: 'Internet Explorer Mobile',
        safari: 'Safari',
        firefox: 'Firefox'
    };
    var dotNetVersionRegx = {
        regxForOld: /\.NET CLR [0-9.]+/g,
        regxForNew: /\.NET[0-9].[0-9][A-Z]+/g
    };
    var mobileDeviceVersionRegx = {
        macos: /Mac OS X (10[\.\_\d]+)/,
        android: /Android ([\.\_\d]+)/,
        iOS: /OS (\d+)_(\d+)_?(\d+)?/,
        windowsPhone: /Windows Phone ([\.\_\d]+)/,
        windowsPhoneOs: /Windows Phone OS ([\.\d]+)/
    };

    function getBrowserProps() {
        // Opera
        if ((versionOffset = userAgent.indexOf('Opera')) != -1) {
            browser.name = browserNames.opera;
            browser.version = userAgent.substring(versionOffset + 6);
            if ((versionOffset = userAgent.indexOf('Version')) != -1) {
                browser.version = userAgent.substring(versionOffset + 8);
            }
        }
            // Opera Next
        else if ((versionOffset = userAgent.indexOf('OPR')) != -1) {
            browser.name = browserNames.opera;
            browser.version = userAgent.substring(versionOffset + 4);
        }
            // MSIE
        else if ((versionOffset = userAgent.indexOf('MSIE')) != -1) {
            browser.name = browserNames.IE;
            browser.version = userAgent.substring(versionOffset + 5);
        }
            // edge
        else if ((versionOffset = userAgent.indexOf('Edge')) != -1) {

            browser.name = browserNames.edge;
            browser.version = userAgent.substring(versionOffset + 5);
        }
            // Chrome
        else if ((versionOffset = userAgent.indexOf('Chrome')) != -1) {
            browser.name = browserNames.chrome;
            browser.version = userAgent.substring(versionOffset + 7);
        }
        else if ((versionOffset = userAgent.indexOf('IEMobile')) != -1) {
            browser.name = browserNames.iemobile;
            browser.version = userAgent.substring(versionOffset + 9);
        }
            // Safari
        else if ((versionOffset = userAgent.indexOf('Safari')) != -1) {
            browser.name = browserNames.safari;
            browser.version = userAgent.substring(versionOffset + 7);
            if ((versionOffset = userAgent.indexOf('Version')) != -1) {
                browser.version = userAgent.substring(versionOffset + 8);
            }
        }
            // Firefox
        else if ((versionOffset = userAgent.indexOf('Firefox')) != -1) {
            browser.name = browserNames.firefox;
            browser.version = userAgent.substring(versionOffset + 8);
        }
            // MSIE 11+
        else if (userAgent.indexOf('Trident/') != -1) {
            browser.name = browserNames.ie;
            browser.version = userAgent.substring(userAgent.indexOf('rv:') + 3);
        }
            // Other browsers
        else if ((nameOffset = userAgent.lastIndexOf(' ') + 1) < (versionOffset = userAgent.lastIndexOf('/'))) {
            browser.name = userAgent.substring(nameOffset, versionOffset);
            browser.version = userAgent.substring(versionOffset + 1);
            if (browser.name.toLowerCase() == browser.name.toUpperCase()) {
                browser = navigator.appName;
            }
        }
        return getBrowserVersion();
    }
    //get browser information from user string
    function getBrowserVersion() { // trim the version string
        if ((indexOfCharInString = browser.version.indexOf(';')) > -1)
            browser.version = browser.version.substring(0, indexOfCharInString);
        if ((indexOfCharInString = browser.version.indexOf(' ')) > -1)
            browser.version = browser.version.substring(0, indexOfCharInString);
        if ((indexOfCharInString = browser.version.indexOf(')')) > -1)
            browser.version = browser.version.substring(0, indexOfCharInString);

        return getOS();
    }
    //get os information
    function getOS() {
        for (var id in clientOsStrings) {
            var currentClinetString = clientOsStrings[id];
            if (currentClinetString.r.test(userAgent)) {
                browser.os.name = currentClinetString.s;
                break;
            }
        }
        //get Windows os 
        if (browser.os.name !== "Windows Phone") {
            if (/Windows/.test(browser.os)) {
                osVersion = /Windows (.*)/.exec(browser.os.name)[1];
                browser.os.name = 'Windows';
            }
        }
        else
            browser.os.name = 'Windows Phone';

        //get version of mobile os
        switch (browser.os.name) {
            case 'Mac OS X':
                browser.os.version = mobileDeviceVersionRegx.macos.exec(userAgent)[1];
                break;

            case 'Android':
                browser.os.version = mobileDeviceVersionRegx.android.exec(userAgent)[1];
                break;

            case 'iOS':
                browser.os.version = mobileDeviceVersionRegx.iOS.exec(appVersion);
                browser.os.version = browser.os.version[1] + '.' + browser.os.version[2] + '.' + (browser.os.version[3] | 0);
                break;
            case 'Windows Phone':
                browser.os.version = mobileDeviceVersionRegx.windowsPhone.exec(appVersion);
                if (browser.os.version != null) {
                    browser.os.version = browser.os.version[1];
                } else {
                    browser.os.version = mobileDeviceVersionRegx.windowsPhoneOs.exec(appVersion);
                    if (browser.os.version != null)
                        browser.os.version = browser.os.version[1];
                }
                break;
        }
        return getBrowserLanguage();
    }
    //get language
    function getBrowserLanguage() {
        if (versionOffset = userAgent.indexOf("MSIE") > -1)
            browser.language = navigator.browserLanguage;
        else
            browser.language = navigator.language;

        return getBrowserDeviceName();
    }
    //get device
    function getBrowserDeviceName() {
        for (var id in clientMobileDeviceStrings) {
            var currentClinetMobileDeviceString = clientMobileDeviceStrings[id];
            if (currentClinetMobileDeviceString.r.test(userAgent)) {
                browser.device.name = currentClinetMobileDeviceString.s;

                for (var id in clientTabletDeviceStrings) {
                    var currentClinetTabletDeviceString = clientTabletDeviceStrings[id];
                    if (currentClinetTabletDeviceString.r.test(userAgent)) {
                        browser.device.name = currentClinetTabletDeviceString.s;
                        break;
                    }
                }
                break;
            }
        }
        if (browser.device.name === "")
            browser.device.name = "Desktop";

        return getBrowserDotNetFrameworkVersion();
    }
    //get .net framework version
    function getBrowserDotNetFrameworkVersion() {
        //.Netframework version
        var version = "";
        var netVersionArray = userAgent.match(dotNetVersionRegx.regxForOld);
        if (netVersionArray != null) {
            for (i = 0; i < netVersionArray.length; i++) {
                version = netVersionArray[i].substring(9, 12);
                if (version > browser.netFrameworkVersion)
                    browser.netFrameworkVersion = version;
            }
        }
        var netVersionArrayNew = userAgent.match(dotNetVersionRegx.regxForNew);
        if (netVersionArrayNew != null) {
            for (i = 0; i < netVersionArrayNew.length; i++) {
                if (netVersionArrayNew[i] == ".NET4.0E")
                    version = 4.5;
                else if (netVersionArrayNew[i] == ".NET4.0C")
                    version = 4.0;
                else
                    version = netVersionArrayNew[i].substring(4, 7);

                if (version > browser.netFrameworkVersion)
                    browser.netFrameworkVersion = version;
            }
        }

        return browser;
    }
    //call methods and return object
    function getBrowserDetails() {
        return getBrowserProps();
    }

    return {
        getBrowserDetails: getBrowserDetails
    }
})();
var trendsService = (function () {
    var urls = {
        evp: {
            url: "https://evp.cloudapp.net",
        },
        ipma: {
            url: "https://ipadev.cloudapp.net",
            recommendations: {
                get: "/activity/GetUserRecommendations?userAlias=&date=",
            },
            activityRelativeUrl: "/activity/add?userAlias={{user}}&podcastId={{podcastId}}&platForm=SPO&resumeLocation={{resumeLocation}}",
        },
        microsoftOnlineLoginUrl: "//login.microsoftonline.com/login.srf",
        msftADFSLoginUrl: "//msft.sts.microsoft.com/adfs/ls",
        msOnlineLogonUrl: "https://login.microsoftonline.com/",
        msStsLogonUrl: "https://corp.sts.microsoft.com/adfs/ls/",
        trendsServiceUrl: '/Trends/add?applicationId={{applicationId}}&userAlias={{user}}&actionId={{actionId}}&actionDateTime={{actionDate}}&requestUrl={{requestUrl}}&sessionId={{sessionId}}&externalServiceId=0&requestDataXml={{requestDataXml}}&requestDataXmlAsString={{requestDataXmlAsString}}&requestView={{requestView}}&requestDescription={{requestDescription}}&requestItem={{requestItem}}&requestContext={{requestContext}}' +
            '&requestLocation=' + escape(window.location.toString()) + '&result=&responseTime=0&browserName={{browserName}}&browserVersion={{browserVersion}}&browserResolution={{browserResolution}}&browserLanguage={{browserLanguage}}&referrerUrl={{referrelUrl}}&netFrameworkVersion={{netFrameworkVersion}}&silverlightVersion={{silverLightVersion}}&osName={{osName}}&osVersion={{osVersion}}'
    };
    var pageMode = "";
    var applicationId = 999;
    var docIdPrefix = "aevd-3-";
    var isXAPIReported = false;
    var callXAPI = false;
    var trendsOptions = {
        actionId: 2,
        actionDateTime: (new Date()).toISOString(),
        externalServiceId: "",
        requestUrl: "",
        requestDataXml: "",
        requestDataXmlAsString: "",
        requestView: "",
        requestDescription: "",
        requestItem: "",
        requestContext: "",
        responseTime: 0,
        result: "",
        channelPageId: "",
        topicPageId: ""
    };
    var userAction = {
        LoginSuccess: 1,
        PageView: 2,
        VideoPlayer: 10,
        PodcastView: 11,
        PodcastView_InProgess: 12,
        PodcastView_Completed: 13,
        PodcastDownload: 14,
        EmailResources: 15,
        ResumeDownload: 17,
        DownloadDelete: 18,
        PopupPlayerClick: 19,
        PodcastView_Resume: 22,
        AdditionalContentDownload: 26,
        ActionLike: 27,
        ActionUnLike: 28,
        ActionCopyShortcut: 29,
        ActionCopyEmbed: 30,
        AddToPlaylist: 31,
        RenamePlaylist: 32,
        DeleteFromPlaylist: 33,
        DeletePlaylist: 34,
        CreateNewPlaylist: 35,
        SubscribeChannel: 41,
        UnSubscribeChannel: 42,
        Settings: 45,
        ChangeSubscriptionSettings: 46,
        Action_Search: 51,
        PinToStartScreen: 52,
        Share: 53,
        Feedback: 61,
        pubdash_editTemplate: 62,
        pubdash_deleteTemplate: 63,
        pubdash_updateTaxonomy: 64,
        pubdash_tabchange: 65,
        pubdash_search: 66,
        pubdash_newTemplate: 67,
        pubdash_savePodcast: 68,
        pubdash_deletePodcast: 69,
        pubdash_saveChannel: 70,
        pubdash_saveFail: 71,
        pubdash_taxSugg: 72,
        YammerPost: 81,
        YammerReply: 82,
        YammerLike: 83,
        YammerPersonLinkClick: 84,
        YammerButtonClick: 85,
        ChannelGridWhatsNew: 91,
        ChanneGridMostDownloaded: 92,
        ChanneGridMostPopular: 93,
        ChannelGridSearch: 94,
        PodcastEdit: 111,
        ManageSupportMaterial: 113,
        PodcastDelete: 112,
        NullRecommended: 556,
        PodcastView_Pause: 121,
        PlayerPopOutControl: 122,
        PlayerFullScreenControl: 123,
        PlayerBitRateControl: 124
    };
    //All analytics methods
    function processAnalytics(options, isPlayer) {
        if (isPlayer) {
            var replaceKeys = {
                user: "",
                podcastId: options.requestItem,
                resumeLocation: options.resumeLocation
            };
            if (!isNaN(options.resumeLocation)) {
                var url = replaceAll(urls.ipma.activityRelativeUrl, replaceKeys);
                var obj = { url: (urls.ipma.url + url), callbackMethod: "addActivityCallback" };
                //postMessagetoIframe(obj);
                console.log("Activity Url: " + obj.url);
            }
            options.requestDescription = 'position=' + options.resumeLocation + ';' + "bitrate=" + options.bitrate;
            
            if (options.actionId === userAction.PodcastView_InProgess ||
                options.actionId === userAction.PodcastView_Pause ||
                options.actionId === userAction.PodcastView_Resume ||
                (options.actionId === userAction.PodcastView_Completed && trendsService.isXAPIReported))
                submitAnalytics(options, false);
            else
                submitAnalytics(options, true);
        }
        else
            submitAnalytics(options, false);
    }
    function submitAnalytics(options, isXAPI) {
        options = extendDefaults(trendsOptions, options);
        var obj = {
            url: (urls.ipma.url + getTrendsUrl(options, isXAPI)),
            callbackMethod: "callbackMethodName"
        };
        console.log("Trends Url: " + obj.url);
        if (isXAPI && options.actionId === userAction.PodcastView_Completed) {
            trendsService.isXAPIReported = true;
            trendsService.callXAPI = false;
        }
    }

    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                if (properties[property] !== undefined && properties[properties] !== null)
                    source[property] = properties[property];
            }
        }
        return source;
    }
    function getTrendsUrl(options, isXPI) {
        var browser = browserInfo.getBrowserDetails();
        var replaceKeys = {
            sessionId: getSessionId(),
            applicationId: applicationId,
            user: "",
            actionId: options.actionId,
            actionDate: (new Date()).toISOString(),
            requestUrl: (options.requestUrl ? options.requestUrl : escape(window.location.toString())),
            requestDataXml: "",
            requestDataXmlAsString: "",
            requestView: "",
            requestDescription: options.requestDescription,
            requestItem: options.requestItem,
            result: "",
            browserName: browser.name,
            browserVersion: browser.version,
            browserResolution: (browser.width + "x" + browser.height),
            browserLanguage: browser.language,
            referrelUrl: getReferrelLocation(),
            netFrameworkVersion: browser.netFrameworkVersion,
            silverLightVersion: getSilverLightVersion(),
            osName: browser.os.name,
            osVersion: browser.os.version,
            responseTime: options.responseTime,
            requestContext: getQueryStringByName("c")
        };
        var url = replaceAll(urls.trendsServiceUrl, replaceKeys);
        if (isXPI) {
            var externalId = options.requestItem ? options.requestItem.toString() : "";
            if (externalId.toLowerCase().indexOf(docIdPrefix) > -1)
                externalId = options.requestItem.toUpperCase();
            else
                externalId = docIdPrefix.toUpperCase() + options.requestItem;

            var consumptionStatus = "Not Started";
            var actionVerb = "Play";
            switch (options.actionId) {
                case 11:
                    actionVerb = "Play";
                    consumptionStatus = "In Progress";
                    break;
                case 12:
                case 22:
                    consumptionStatus = "In Progress";
                    actionVerb = "In Progress";
                    break;
                case 13:
                    consumptionStatus = "Completed";
                    actionVerb = "Completed";
                    break;
            }
            url += "&xAPIActionVerb=" + actionVerb + "&xAPISourceSystemID=3&xAPIExtenralID=" + externalId + "&xAPIConsumptionStatus=" + consumptionStatus + "&xAPIGuid=" + (options.actionId === userAction.PodcastView_Completed ? getGuid() : "");
        }

        return url;
    }
    function replaceAll(str, obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                obj["{{" + i + "}}"] = obj[i];
                delete obj[i];
            }
        }
        var rex = new RegExp(Object.keys(obj).join("|"), "gi");

        return str.replace(rex, function (matched) {
            return obj[matched];
        });
    }
    function getPageLoadTime() {
        var now = new Date().getTime();

        return parseInt(now - performance.timing.navigationStart);
    }
    function getReferrelLocation() {
        var refKey = escape(window.location);
        var refLocation = document.referrer;
        var refVal = getCookie(refKey);
        if (refLocation.indexOf(urls.msOnlineLogonUrl) < 0 && refLocation.indexOf(urls.ipma.url) < 0 &&
        refLocation.indexOf(urls.msStsLogonUrl) < 0) {
            if (!refVal) {
                refVal = refLocation;
                setCookie(refKey, refLocation);
            }
            else {
                if (refLocation && refVal !== refLocation) {
                    refVal = refLocation;
                    setCookie(refKey, refLocation);
                }
            }
            return escape(refVal);
        }
        else {
            if (!refVal)
                return escape(window.location.toString());
            else
                return escape(refVal);
        }
    }
    function getSilverLightVersion() {
        var browser = navigator.appName;
        if (browser === 'Microsoft Internet Explorer') {
            try {
                var control = new ActiveXObject('AgControl.AgControl');
                if (control.IsVersionSupported("6.0"))
                    return '6';
                else if (control.IsVersionSupported("5.0"))
                    return '5';
                else if (control.IsVersionSupported("4.0"))
                    return '4';
                else if (control.IsVersionSupported("3.0"))
                    return '3';
                else if (control.IsVersionSupported("2.0"))
                    return '2';
                else
                    return '0';

            } catch (e) {
                return 'NA';
            }
        }
        else {
            try {
                var silverLight = navigator.plugins["Silverlight Plug-In"];
                if (silverLight)
                    return silverLight.description;
                else
                    return 'NA';
            }
            catch (e) {
                return 'NA';
            }
        }
        return 'NA';
    }
    function getQueryStringByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    function setCookie(name, value) {
        var expiredate = new Date();
        var timeToAdd = expiredate.getTime() + (60 * 60 * 1000);
        var timeToDeduct = expiredate.getTime() - (60 * 60 * 1000);
        if (value)
            expiredate.setTime(timeToAdd);
        else
            expiredate.setTime(timeToDeduct);
        var cookieValue = escape(value) + "; expires=" + expiredate.toUTCString();
        document.cookie = name + "=" + cookieValue;
    }
    function getCookie(name) {
        var i, x, y, allCookies = document.cookie.split(";");
        for (i = 0; i < allCookies.length; i++) {
            x = allCookies[i].substr(0, allCookies[i].indexOf("="));
            y = allCookies[i].substr(allCookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x === name)
                return unescape(y);
        }
    }
    function getGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }
    function getSessionId() {
        var refLocation = document.referrer;
        var guidVal = getCookie("Academy");
        if (refLocation.indexOf(urls.evp.url) < 0 && refLocation.indexOf(urls.msftADFSLoginUrl) < 0 &&
            refLocation.indexOf(urls.microsoftOnlineLoginUrl) < 0 && guidVal) {
            return guidVal;
        }
        else {
            var newGuid = getGuid();
            setCookie("Academy", newGuid, 8 * 60 * 60 * 1000);
            return newGuid;
        }
    }

    return {
        processAnalytics: processAnalytics,
        getGuid: getGuid,

        isXAPIReported: isXAPIReported,
        callXAPI: callXAPI,
        userAction: userAction
    }
})();