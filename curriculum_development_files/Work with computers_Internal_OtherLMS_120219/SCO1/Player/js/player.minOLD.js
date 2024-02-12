var common = common || {};
common.getAlphabetLettersArray = function()
{
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
};
common.getParameterByName = function(name, href)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(href);
    if (results == null)
        return "";
    return decodeURIComponent(results[1].replace(/\+/g, " "))
};
common.zeroFill = function(number, width)
{
    if (number)
    {
        width -= number.toString().length;
        if (width > 0)
        {
            return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number
        }
        return number
    }
    return ""
};
common.convertStringToEmbeddedEvaluation = function(s)
{
    if (!s || s == "false")
        return "ShowInModal";
    if (s == "true")
        return "Disabled";
    return s
};
Array.prototype.shuffle = function()
{
    for (var i = 0; i < this.length; i++)
    {
        var r = parseInt(Math.random() * this.length);
        var obj = this[r];
        this[r] = this[i];
        this[i] = obj
    }
};
common.getFileNameWithoutExtension = function(fullPath)
{
    if (fullPath)
    {
        var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
        var filename = fullPath.substring(startIndex);
        if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0)
        {
            filename = filename.substring(1)
        }
        if (filename.lastIndexOf('.') >= 0)
        {
            filename = filename.substring(0, filename.lastIndexOf('.'))
        }
        return filename
    }
    return ""
};
common.isSilverlightInstalled = function(version)
{
    if (version == undefined)
        version = null;
    var isVersionSupported = false;
    var container = null;
    try
    {
        var control = null;
        var tryNS = false;
        if (window.ActiveXObject)
        {
            try
            {
                control = new ActiveXObject('AgControl.AgControl');
                if (version === null)
                {
                    isVersionSupported = true
                }
                else if (control.IsVersionSupported(version))
                {
                    isVersionSupported = true
                }
                control = null
            }
            catch(e)
            {
                tryNS = true
            }
        }
        else
        {
            tryNS = true
        }
        if (tryNS)
        {
            var plugin = navigator.plugins["Silverlight Plug-In"];
            if (plugin)
            {
                if (version === null)
                {
                    isVersionSupported = true
                }
                else
                {
                    var actualVer = plugin.description;
                    if (actualVer === "1.0.30226.2")
                        actualVer = "2.0.30226.2";
                    var actualVerArray = actualVer.split(".");
                    while (actualVerArray.length > 3)
                    {
                        actualVerArray.pop()
                    }
                    while (actualVerArray.length < 4)
                    {
                        actualVerArray.push(0)
                    }
                    var reqVerArray = version.split(".");
                    while (reqVerArray.length > 4)
                    {
                        reqVerArray.pop()
                    }
                    var requiredVersionPart;
                    var actualVersionPart;
                    var index = 0;
                    do
                    {
                        requiredVersionPart = parseInt(reqVerArray[index]);
                        actualVersionPart = parseInt(actualVerArray[index]);
                        index++
                    } while (index < reqVerArray.length && requiredVersionPart === actualVersionPart);
                    if (requiredVersionPart <= actualVersionPart && !isNaN(requiredVersionPart))
                    {
                        isVersionSupported = true
                    }
                }
            }
        }
    }
    catch(e)
    {
        isVersionSupported = false
    }
    return isVersionSupported
};
common.convertTimeFormatToSecs = function(timeFormat)
{
    if (timeFormat)
    {
        var timeFragments = timeFormat.split(":");
        if (timeFragments.length > 0)
        {
            switch (timeFragments.length)
            {
                case 4:
                    return (parseInt(timeFragments[0], 10) * 60 * 60) + (parseInt(timeFragments[1], 10) * 60) + parseInt(timeFragments[2], 10) + (timeFragments[3] / 100);
                case 3:
                    return (parseInt(timeFragments[0], 10) * 60 * 60) + (parseInt(timeFragments[1], 10) * 60) + parseInt(timeFragments[2], 10);
                case 2:
                    return parseInt(timeFragments[0], 10) * 60 + parseInt(timeFragments[1], 10);
                case 1:
                    return parseInt(timeFragments[0], 10);
                default:
                    return parseInt(timeFragments[0], 10)
            }
        }
        return parseInt(timeFormat, 10)
    }
    return 0
};
common.supportsDashPlayReady = function()
{
    if (!window.MediaSource)
    {
        return false
    }
    var playready = false;
    if (window.MSMediaKeys)
    {
        try
        {
            playready = new MSMediaKeys("com.microsoft.playready")
        }
        catch(e) {}
    }
    return playready
};
common.getCourseDataService = function()
{
    try
    {
        for (var w = window.parent; ; )
        {
            if (w.courseDataService)
            {
                return w.courseDataService
            }
            if (w == w.parent || !w.parent)
            {
                break
            }
            w = w.parent
        }
    }
    catch(e) {}
    return null
};
var CourseParser = CourseParser || {};
CourseParser.parsePageTypesXml = function(xml, course)
{
    function parseDefinition(newType, typeElem)
    {
        newType.canSendCompletion = typeElem.attr("canSendCompletion") == "true";
        newType.PlaybackSource = typeElem.attr("playbackSource");
        newType.PlaybackFile = typeElem.attr("playbackFile");
        newType.HideContentsWidget = typeElem.attr("hideContentsWidget") == "true";
        newType.behavior = typeElem.attr("behavior");
        if (!newType.behavior)
            newType.behavior = "None";
        newType.isValid = true
    }
    try
    {
        var rootElem = $(xml).find("types");
        course.combinedXmls = rootElem.attr("combined") == "true";
        if (course.combinedXmls)
            CourseParser.parseMediaManifest(rootElem, course);
        var typesElem = rootElem.find("type");
        typesElem.each(function()
        {
            var xmlType = $(this);
            var newType = new PageType;
            newType.id = xmlType.attr("id");
            if (course.combinedXmls)
            {
                parseDefinition(newType, xmlType)
            }
            else
            {
                jQuery.ajax({
                    type: "GET", url: 'Types/Pages/' + newType.id + "/definition.xml", dataType: "XML", async: false, success: function(definitionXml)
                        {
                            var typeElem = $(definitionXml).find("type");
                            parseDefinition(newType, typeElem)
                        }
                })
            }
            course.pageTypesArray.push(newType)
        })
    }
    catch(e)
    {
        courseController.alert("error with pagetypes:" + e.message)
    }
};
CourseParser.parseObjectivesXml = function(xml, course)
{
    var parentObjectivesElem = $(xml).find("parentObjective");
    if (parentObjectivesElem.length > 0)
    {
        parentObjectivesElem.each(function()
        {
            var xmlParentObjective = $(this);
            var newParentObjective = new ParentObjective;
            newParentObjective.Name = xmlParentObjective.text();
            newParentObjective.Id = xmlParentObjective.attr("id");
            course.parentObjectives.push(newParentObjective)
        })
    }
    var objectivesElem = $(xml).find("objective");
    if (objectivesElem.length > 0)
    {
        objectivesElem.each(function()
        {
            var xmlObjective = $(this);
            var newObjective = new Objective;
            newObjective.Name = xmlObjective.attr("name");
            newObjective.Id = xmlObjective.attr("id");
            newObjective.ParentObjectiveId = xmlObjective.attr("parentObjectiveId");
            newObjective.IntroductionPageId = xmlObjective.attr("introductionPageId");
            for (var i = 0; i < course.parentObjectives.length; i++)
            {
                if (course.parentObjectives[i].Id == newObjective.ParentObjectiveId)
                {
                    newObjective.ParentObjective = course.parentObjectives[i];
                    break
                }
            }
            var scenarioElem = xmlObjective.children("scenario");
            newObjective.Scenario.Title = scenarioElem.children("title").text();
            newObjective.Scenario.Text = scenarioElem.children("text").text();
            newObjective.Scenario.Type = scenarioElem.attr("type");
            var audioKey = scenarioElem.children("audio").attr("key");
            if (audioKey)
            {
                newObjective.Scenario.AudioFile = audioKey
            }
            var questionsElem = xmlObjective.children("question");
            questionsElem.each(function()
            {
                var xmlQuestion = $(this);
                var newQuestion = new Question(newObjective);
                newQuestion.Id = xmlQuestion.attr("id");
                newQuestion.Type = xmlQuestion.attr("type");
                newQuestion.RadioButtonStyle = xmlQuestion.attr("radioButtonStyle");
                newQuestion.FeedbackStyle = xmlQuestion.attr("feedbackStyle");
                newQuestion.CheckedImage = xmlQuestion.attr("checkedImage");
                newQuestion.CustomStyle = xmlQuestion.attr("customStyle") == "true";
                newQuestion.CustomStyleName = xmlQuestion.attr("style");
                newQuestion.UncheckedImage = xmlQuestion.attr("uncheckedImage");
                newQuestion.Timing = xmlQuestion.attr("timing");
                newQuestion.SecondsDelay = +xmlQuestion.attr("seconds") || 0;
                CourseParser.parseMedia(newQuestion.Prompt, xmlQuestion.children("prompt"));
                CourseParser.parseMedia(newQuestion.FeedbackCorrect, xmlQuestion.children("feedbackCorrect"));
                CourseParser.parseMedia(newQuestion.FeedbackIncorrect, xmlQuestion.children("feedbackIncorrect"));
                newQuestion.Hint = xmlQuestion.children("hint").text();
                if (!course.settings.ReviewMode)
                {
                    newQuestion.DistractorsCount = xmlQuestion.attr("distractorsCount");
                    newQuestion.Randomize = xmlQuestion.attr("randomize") == "true"
                }
                var questionChoicesElems = xmlQuestion.children("choice");
                questionChoicesElems.each(function()
                {
                    var xmlChoice = $(this);
                    var newChoice = new QuestionChoice(newQuestion);
                    newChoice.Correct = xmlChoice.attr("correct") == "true";
                    if (xmlChoice.children("text").length)
                    {
                        newChoice.Text = xmlChoice.children("text").text()
                    }
                    else
                    {
                        newChoice.Text = xmlChoice.text()
                    }
                    var answerElems = xmlChoice.children("answer");
                    answerElems.each(function(answerIndex)
                    {
                        var xmlAnswer = $(this);
                        var newAnswer = new QuestionChoiceAnswer(newChoice);
                        newAnswer.Text = xmlAnswer.text();
                        newAnswer.FileName = xmlAnswer.attr("file");
                        if (newQuestion.Type == "matching" && answerIndex > 0)
                            newAnswer.Distractor = true;
                        newChoice.Answers.push(newAnswer)
                    });
                    var xmlChoicePoints = xmlChoice.attr("points");
                    if (xmlChoicePoints)
                        newChoice.Points = xmlChoicePoints - 0;
                    newQuestion.Choices.push(newChoice);
                    newChoice.Id = newQuestion.Choices.length + ""
                });
                var questionFeedbacksElems = xmlQuestion.children("feedback");
                questionFeedbacksElems.each(function()
                {
                    var xmlFeedback = $(this);
                    var newFeedbackMedia = new QuestionMedia;
                    CourseParser.parseMedia(newFeedbackMedia, xmlFeedback);
                    newQuestion.Feedbacks.push(newFeedbackMedia)
                });
                newObjective.Questions.push(newQuestion);
                if (!newQuestion.Id)
                    newQuestion.Id = newObjective.Questions.length
            });
            course.objectives.push(newObjective);
            if (!newObjective.Id)
                newObjective.Id = course.objectives.length
        })
    }
};
CourseParser.parseMedia = function(obj, xml)
{
    if (obj && xml)
    {
        obj.Text = xml.text();
        obj.Image = xml.attr("image");
        obj.ImageAltText = xml.attr("imageAltText");
        obj.AudioFile = xml.attr("audioFile");
        obj.PageId = xml.attr("pageId")
    }
};
CourseParser.parseTracksXml = function(xml, course)
{
    try
    {
        var tracksElem = $(xml).find("tracks");
        if (tracksElem)
        {
            course.tracks.mapType = tracksElem.attr("mapType");
            course.tracks.trackSelectionMin = _nTrackSelectionMin;
            course.tracks.trackSelectionMax = _nTrackSelectionMax;
            course.tracks.canUserSelect = _bDisableTrackSelection == false;
            $(tracksElem).children('track').each(function()
            {
                var xmlTrack = $(this);
                var newTrack = new Track;
                newTrack.description = xmlTrack.find("description").text();
                newTrack.modules = xmlTrack.find("modules").text();
                newTrack.name = xmlTrack.find("name").text();
                newTrack.objectives = xmlTrack.find("objectives").text();
                newTrack.required = xmlTrack.attr("required") == "true";
                newTrack.state.isSelectedByAuthor = xmlTrack.attr("selected") == "true";
                newTrack.state.isSelected = newTrack.state.isSelectedByAuthor;
                course.tracks.items.push(newTrack)
            });
            course.settings.hasTracks = course.tracks.items.length > 0
        }
    }
    catch(e) {}
};
CourseParser.parsePagesXml = function(xml, course)
{
    if (course.combinedXmls)
        CourseParser.parseObjectivesXml($(xml).find("objectives"), course);
    var navigationElem = $(xml).find("navigation");
    course.name = navigationElem.attr("name");
    course.buildId = navigationElem.attr("buildId");
    course.settings.courseDataService = common.getCourseDataService();
    var settingsElem = navigationElem.find("settings");
    course.settings.MediaURL = settingsElem.find("mediaURL").text();
    course.settings.MediaLocation = settingsElem.attr("mediaLocation");
    course.settings.CourseTranscript = settingsElem.find("courseTranscript").text();
    course.settings.EmbeddedEvaluation = common.convertStringToEmbeddedEvaluation(settingsElem.attr("evaluationsDisabled"));
    course.settings.Mercury.ShowURL = settingsElem.find("mercury").attr("showUrl") === "true";
    course.settings.Mercury.URL = settingsElem.find("mercury").children("url").text();
    if (settingsElem.attr("mustAnswerAllEvalQuestions"))
        course.settings.MustAnswerAllEvalQuestions = settingsElem.attr("mustAnswerAllEvalQuestions") === "true";
    if (settingsElem.attr("mustAnswerAllEvalQuestionsPre"))
        course.settings.MustAnswerAllEvalQuestionsPre = settingsElem.attr("mustAnswerAllEvalQuestionsPre") === "true";
    course.settings.EvaluationForm = settingsElem.attr("evaluationForm");
    course.settings.EvaluationFormPre = settingsElem.attr("evaluationFormPre");
    course.settings.ReviewMode = settingsElem.attr("reviewMode") === "true";
    if (course.settings.courseDataService)
    {
        course.settings.HostingLocation = "azure";
        course.settings.AzureMediaLocation = course.settings.courseDataService.MediaLocation
    }
    else
    {
        course.settings.HostingLocation = "other";
        course.settings.AzureMediaLocation = ""
    }
    if (course.settings.courseDataService)
    {
        course.settings.AttemptId = course.settings.courseDataService.attemptId || course.settings.courseDataService.AttemptId
    }
    else
    {
        course.settings.AttemptId = null;
        if (parent.MSAccessPointStudioSCORMPlayer != null)
        {
            if (parent.MSAccessPointStudioSCORMPlayer != "undefined")
                course.settings.AttemptId = parent.MSAccessPointStudioSCORMPlayer.attemptId
        }
    }
    course.settings.ShowResources = _bShowResources;
    course.settings.DiscussionLink = _sDiscussionLink;
    course.settings.ShowCaptions = _bShowCaptions;
    course.settings.ShowVideoCaptions = _bShowCaptions;
    if (typeof _displayExitCompleteMsg != 'undefined')
        course.settings.DisplayExitCompleteMsg = _displayExitCompleteMsg;
    if (typeof _displayExitIncompleteMsg != 'undefined')
        course.settings.DisplayExitIncompleteMsg = _displayExitIncompleteMsg;
    course.settings.HideHeader = _bHideHeader;
    course.settings.HideFooter = _bHideFooter;
    course.settings.ShowGlossary = _bShowGlossary;
    course.settings.UserCanToggleOptional = _bUserCanToggleOptional;
    course.settings.DisplayContentsWidget = _sTableOfContentsStyle !== "None";
    course.settings.EvalContentKey = typeof _sEvalContentKey != 'undefined' ? _sEvalContentKey : "CONT01592";
    course.settings.EvalPlayerVersion = typeof _nEvalPlayerVersion != 'undefined' ? _nEvalPlayerVersion : "1";
    this.parsePages($(xml).find("private").children(), course.privatePages, null, course);
    this.parsePages($(xml).find("level0"), course.pageTree, null, course);
    this.parseHeaderLinks(settingsElem.find("headerLinks").children(), course.settings.HeaderLinks);
    this.parseHeaderLinks(settingsElem.find("apiLinks").children(), course.settings.ApiLinks);
    course.settings.SkipWelcomePage = course.welcomePage ? false : true;
    if (course.combinedXmls)
    {
        CourseParser.parseTracksXml(xml, course);
        CourseParser.parsePageLinksXml(xml, course);
        CourseParser.parseResourcesXml($(xml).find("resources"))
    }
};
CourseParser.parseHeaderLinks = function(xml, links)
{
    xml.each(function()
    {
        var xmlLink = $(this);
        var oLink = new HeaderLink;
        oLink.IsActive = xmlLink.attr("active") === "true";
        oLink.CssStyle = xmlLink.attr("cssStyle");
        oLink.Id = xmlLink.attr("id");
        oLink.Name = xmlLink.children("name").text();
        oLink.Url = xmlLink.children("url").text();
        links.push(oLink)
    })
};
CourseParser.parsePages = function(xml, pages, parent, course)
{
    xml.each(function()
    {
        if (this.nodeName.substring(0, 5) != "level")
            return true;
        var xmlPage = $(this);
        var newPage = new Page;
        CourseParser.parsePage(newPage, xmlPage, parent, course);
        if (newPage.pageType.id == "6E490590-D15D-4B4A-894B-DB4B14936FA3")
        {
            course.welcomePage = newPage;
            pages.push(newPage)
        }
        else if (newPage.isTestOut())
        {
            newPage.actualId = newPage.id;
            newPage.id = "test-out";
            course.testOutPage = newPage;
            pages.push(newPage)
        }
        else
        {
            pages.push(newPage)
        }
        if (newPage.isModule)
        {
            course.modules.push(newPage);
            newPage.moduleIndex = course.modules.length - 1;
            newPage.id = "M" + newPage.moduleIndex
        }
        CourseParser.parsePages(xmlPage.children(), newPage.pages, newPage, course)
    })
};
CourseParser.parsePage = function(newPage, xmlPage, parent, course)
{
    newPage.course = course;
    newPage.name = xmlPage.attr("name");
    newPage.id = xmlPage.attr("pageId");
    if (newPage.id == undefined)
        newPage.id = "";
    newPage.time = xmlPage.attr("time") - 0;
    newPage.contribute = xmlPage.attr("contribute");
    newPage.isModule = !newPage.id;
    newPage.videoWidth = xmlPage.attr("videoWidth") - 0;
    newPage.videoHeight = xmlPage.attr("videoHeight") - 0;
    var xmlPagePoints = xmlPage.attr("points");
    if (xmlPagePoints)
        newPage.points = xmlPagePoints - 0;
    newPage.navRestrictionMsg = xmlPage.children('navRestrictionMsg').text();
    var pageVideoFile = xmlPage.attr("videoFile");
    if (pageVideoFile)
    {
        var newMediaFile = new MediaFile(course, pageVideoFile);
        newMediaFile.videoClickToPlay = xmlPage.attr("videoClickToPlay") == "true";
        newMediaFile.videoAutoNavigate = xmlPage.attr("videoAutoNavigate") == "true";
        newMediaFile.videoPreventSkipAhead = xmlPage.attr("videoPreventSkipAhead") == "true";
        newMediaFile.videoStretchToFit = xmlPage.attr("videoStretchToFit") == "true";
        newMediaFile.mustPlayAll = xmlPage.attr("videoMustPlayAll") == "true";
        newPage.videoFiles.push(newMediaFile)
    }
    xmlPage.children('video').each(function()
    {
        var xmlMediaFile = $(this);
        var newMediaFile = new MediaFile(course, xmlMediaFile.attr("fileName"));
        newMediaFile.videoClickToPlay = xmlMediaFile.attr("videoClickToPlay") == "true";
        newMediaFile.videoAutoNavigate = xmlMediaFile.attr("videoAutoNavigate") == "true";
        newMediaFile.videoPreventSkipAhead = xmlMediaFile.attr("videoPreventSkipAhead") == "true";
        newMediaFile.videoStretchToFit = xmlMediaFile.attr("videoStretchToFit") == "true";
        newMediaFile.mustPlayAll = xmlMediaFile.attr("videoMustPlayAll") == "true";
        newMediaFile.UseTranscript = xmlMediaFile.attr("useTranscript") == "true";
        newMediaFile.azureAsset = xmlMediaFile.attr("azureAsset");
        newMediaFile.chapterStyle = xmlMediaFile.attr("chapterStyle");
        newMediaFile.linearChapters = xmlMediaFile.attr("linearChapters") == "true";
        newMediaFile.chapters = xmlMediaFile.attr("chapters") == "true";
        newMediaFile.descriptions = xmlMediaFile.attr("descriptions") == "true";
        newMediaFile.hasKeypoints = xmlMediaFile.attr("keypoints") == "true";
        newMediaFile.captions = xmlMediaFile.attr("captions") == "true";
        newPage.videoFiles.push(newMediaFile)
    });
    var pageAudioFile = xmlPage.attr("audioFile");
    if (pageAudioFile)
    {
        newPage.audioFiles.push(new MediaFile(course, pageAudioFile))
    }
    xmlPage.children('audio').each(function()
    {
        var xmlMediaFile = $(this);
        var newMediaFile = new MediaFile(course, xmlMediaFile.attr("fileName"));
        newMediaFile.PlayOnPageDisplay = xmlMediaFile.attr("playOnPageDisplay") == "true";
        newMediaFile.audioAutoNavigate = xmlMediaFile.attr("audioAutoNavigate") == "true";
        newMediaFile.audioPreventSkipAhead = xmlMediaFile.attr("audioPreventSkipAhead") == "true";
        newMediaFile.UseTranscript = xmlMediaFile.attr("useTranscript") == "true";
        newMediaFile.mustPlayAll = xmlMediaFile.attr("mustPlayAll") == "true";
        newPage.audioFiles.push(newMediaFile)
    });
    newPage.mustCompletePrevModules = xmlPage.attr("mustCompletePrevModules") == "true";
    newPage.modulesToComplete = xmlPage.attr("modulesToComplete");
    newPage.mustCompleteRequiredPages = xmlPage.attr("mustCompleteRequiredPages") == "true";
    newPage.objectives = xmlPage.attr("objectives");
    newPage.parent = parent;
    var guid = xmlPage.attr("typeId");
    for (var i = 0; i < course.pageTypesArray.length; i++)
    {
        if (course.pageTypesArray[i].id == guid)
        {
            newPage.pageType = course.pageTypesArray[i];
            break
        }
    }
    if (!newPage.pageType)
    {
        newPage.pageType = new PageType
    }
    if (newPage.pageType.id == "")
    {
        newPage.pageType.id = guid
    }
    switch (newPage.pageType.PlaybackSource)
    {
        case"KnowledgeCheck":
        case"PostTest":
        case"StandAloneAssessment":
        case"StandAloneQuestion":
            jQuery.ajax({
                type: "GET", url: newPage.getPageContentFolderPath() + "page.xml", dataType: "XML", async: false, success: function(xml)
                    {
                        newPage.Assessment = CourseParser.parseAssessmentXml(xml, course, newPage);
                        if (newPage.Assessment)
                        {
                            course.Assessments.push(newPage.Assessment);
                            newPage.Assessment.Type = newPage.pageType.PlaybackSource;
                            CourseParser.parseTestOutAssessment(newPage.Assessment, course)
                        }
                    }
            });
            break;
        case"Branching":
            jQuery.ajax({
                type: "GET", url: newPage.getPageContentFolderPath() + "page.xml", dataType: "XML", async: false, success: function(xml)
                    {
                        newPage.BranchingGraph = CourseParser.parseBranchingXml(xml, course, newPage)
                    }
            });
            break
    }
    if (newPage.contribute == "o")
    {
        newPage.pageState.isOptionalByAuthor = true;
        newPage.isOptional = true
    }
};
CourseParser.parseAssessmentXml = function(xml, course, page)
{
    var assessment = new Assessment(course, page);
    try
    {
        assessment.Type = page.pageType.PlaybackSource;
        var assessmentElem = $(xml).find("assessment");
        if (assessmentElem)
        {
            assessment.QuestionSelection = assessmentElem.attr("questionSelection");
            if (!assessment.QuestionSelection)
                assessment.QuestionSelection = "Random";
            assessment.PassingMethod = assessmentElem.attr("passingMethod");
            if (!assessment.PassingMethod)
                assessment.PassingMethod = "MustAnswerAll";
            assessment.PreTestType = assessmentElem.attr("preTestType");
            assessment.ShowTestedOutContent = assessmentElem.attr("showTestedOutContent") == "true";
            if (assessment.Type == "StandAloneAssessment" || assessment.isTestOut())
            {
                assessment.CompletesCourse = true
            }
            else
            {
                assessment.CompletesCourse = assessmentElem.attr("completesCourse") == "true"
            }
            assessment.PassingPercentage = +assessmentElem.attr("passingPercentage");
            assessment.TimeLimit = +assessmentElem.attr("timeLimit") * 60;
            assessment.TimeRemaining = assessment.TimeLimit;
            if (!course.settings.ReviewMode)
            {
                assessment.Order = assessmentElem.attr("orderOfQuestions");
                if (!assessment.Order)
                    assessment.Order = "Random";
                assessment.FeedbackType = assessmentElem.attr("feedbackType");
                if (!assessment.FeedbackType)
                    assessment.FeedbackType = "Immediate";
                assessment.AttemptsToPass = +assessmentElem.attr("attemptsToPass");
                assessment.AttemptsToAnswer = +assessmentElem.attr("attemptsToAnswer");
                assessment.HideAnswers = assessmentElem.attr("hideAnswers") == "true";
                var hoursBeforeNextAttempt = assessmentElem.attr("hoursBeforeNextAttempt");
                if (hoursBeforeNextAttempt)
                {
                    assessment.HoursBeforeNextAttemptList = hoursBeforeNextAttempt.split(',')
                }
            }
            else
            {
                assessment.Order = "None";
                assessment.FeedbackType = "Immediate"
            }
            assessment.IntroductionText = assessmentElem.children("introductionText").text();
            assessment.Description = assessmentElem.children("description").text();
            assessment.ReviewPassedText = assessmentElem.children("reviewPassedText").text();
            assessment.ReviewFailedText = assessmentElem.children("reviewFailedText").text();
            assessment.ReviewIncompleteText = assessmentElem.children("reviewIncompleteText").text();
            var objectivesElem = assessmentElem.find("objective");
            objectivesElem.each(function()
            {
                var objectiveXml = $(this);
                var objective = course.getObjective(objectiveXml.attr("id"));
                var newAssObjective = new AssessmentObjective(objective, assessment);
                newAssObjective.QuestionsToAnswer = +objectiveXml.attr("questionsToAnswer");
                switch (assessment.QuestionSelection)
                {
                    case"Random":
                        newAssObjective.StandAloneQuestion = objective.getQuestion(+objectiveXml.attr("questionId"));
                        if (newAssObjective.StandAloneQuestion)
                        {
                            newAssObjective.QuestionsToUse = 1;
                            assessment.AttemptsToPass = 0
                        }
                        else
                        {
                            if (course.settings.ReviewMode)
                            {
                                newAssObjective.QuestionsToUse = objective.Questions.length
                            }
                            else
                            {
                                newAssObjective.QuestionsToUse = +objectiveXml.attr("questionsToUse");
                                if (newAssObjective.QuestionsToUse > objective.Questions.length)
                                {
                                    newAssObjective.QuestionsToUse = objective.Questions.length
                                }
                            }
                        }
                        break;
                    case"Manual":
                        var attemptsElem = objectiveXml.find('attempt');
                        attemptsElem.each(function()
                        {
                            var attemptXml = $(this);
                            var newAttempt = new AssessmentAttempt(+attemptXml.attr('number'));
                            var questionsXml = attemptXml.children('question');
                            questionsXml.each(function()
                            {
                                var questionXml = $(this);
                                var newQuestion = objective.getQuestion(+questionXml.attr('id'));
                                newAttempt.Questions.push(newQuestion)
                            });
                            newAssObjective.Attempts.push(newAttempt)
                        });
                        break
                }
                assessment.Objectives.push(newAssObjective)
            })
        }
    }
    catch(e) {}
    return assessment
};
CourseParser.parseTestOutAssessment = function(testOutAssessment, course)
{
    if (testOutAssessment && testOutAssessment.isTestOut())
    {
        testOutAssessment.Type = "Test-out";
        course.settings.ShowTestedOutContent = testOutAssessment.ShowTestedOutContent;
        if (course.settings.UserCanToggleOptional)
        {
            if (!course.settings.ShowTestedOutContent)
            {
                course.settings.ShowOptionalContent = false
            }
        }
    }
};
CourseParser.parseBranchingXml = function(xml, course, page)
{
    var graph = new BranchingGraph(course, page);
    try
    {
        var graphElem = $(xml).find("graph");
        if (graphElem)
        {
            graph.navigation = (graphElem.attr("navigation") === "biDirectional") ? BranchingGraphNavigation.BiDirectional : BranchingGraphNavigation.ForwardOnly;
            graph.usePlayerNavigation = (graphElem.attr("usePlayerNavigation") === "true");
            graph.completion = (graphElem.attr("completion") === "firstAttempt") ? BranchingGraphCompletion.FirstAttempt : BranchingGraphCompletion.FinalAttempt;
            graph.maxAttempts = +graphElem.attr("maxAttempts") || 0;
            (graph.maxAttempts >= 0) || (graph.maxAttempts = 0);
            var startBranchId = +graphElem.attr("startBranchId");
            var branchesElem = graphElem.find("branch");
            branchesElem.each(function()
            {
                var branchElem = $(this);
                var branchId = +branchElem.attr("id");
                if (!branchId)
                    return;
                var branch = new BranchingPoint(graph);
                branch.id = branchId;
                branch.ui = branchElem.attr("ui");
                var pageId = branchElem.attr("pageId");
                pageId && (branch.contentPageId = pageId);
                branch.isCompletionPoint = branchElem.attr("completionPoint") === "true";
                branch.mustCompleteContent = branchElem.attr("mustCompleteContent") === "true";
                var questionId = branchElem.attr("questionId");
                branch.question = courseController.getQuestionFromId(questionId);
                if (branch.question)
                {
                    var showAlternatives = branchElem.attr("showAlternatives");
                    branch.showAlternativeResults = ((showAlternatives === "onPass") ? BranchingPointShowAlternativeResults.OnPass : (showAlternatives === "always") ? BranchingPointShowAlternativeResults.Always : BranchingPointShowAlternativeResults.Never);
                    branch.mustPass = branchElem.attr("mustPass") === "true";
                    branch.mustCompleteFeedback = branchElem.attr("mustCompleteFeedback") === "true";
                    var feedbackContentPosition = branchElem.attr("feedbackContentPosition");
                    if (feedbackContentPosition === "beforeFeedback")
                        branch.feedbackContentPosition = BranchingPointFeedbackContentPosition.BeforeFeedback;
                    else if (feedbackContentPosition === "afterFeedback")
                        branch.feedbackContentPosition = BranchingPointFeedbackContentPosition.AfterFeedback;
                    else if (feedbackContentPosition === "skipFeedback")
                        branch.feedbackContentPosition = BranchingPointFeedbackContentPosition.SkipFeedback;
                    if (branch.question.Type === "choice")
                    {
                        for (var i = 0, feedbackBranchId; i < Math.min(branchElem.find("feedback").length, branch.question.Feedbacks.length); i++)
                        {
                            feedbackBranchId = +branchElem.find("feedback").eq(i).attr("branchId");
                            feedbackBranchId && branch.forwardArcs.push(new BranchingArc(graph, branchId, feedbackBranchId, branch.question.Feedbacks[i]))
                        }
                    }
                    else
                    {
                        var feedbackIncorrectBranchId = +branchElem.find("feedbackIncorrect").first().attr("branchId");
                        var feedbackCorrectBranchId = +branchElem.find("feedbackCorrect").first().attr("branchId");
                        feedbackIncorrectBranchId && branch.forwardArcs.push(new BranchingArc(graph, branchId, feedbackIncorrectBranchId, branch.question.FeedbackIncorrect));
                        feedbackCorrectBranchId && branch.forwardArcs.push(new BranchingArc(graph, branchId, feedbackCorrectBranchId, branch.question.FeedbackCorrect))
                    }
                }
                else
                {
                    var nextBranchId = +branchElem.attr("nextBranchId");
                    if (nextBranchId)
                    {
                        var arc = new BranchingArc(graph, branchId, nextBranchId, null);
                        branch.forwardArcs.push(arc);
                        branch.activeArc = arc
                    }
                }
                graph.branchingPoints.push(branch);
                (branchId === startBranchId) && (graph.startPoint = branch)
            })
        }
    }
    catch(e) {}
    return graph
};
CourseParser.parsePageLinksXml = function(xml, course)
{
    try
    {
        var pageLinksListElem = $(xml).find("pageLinksList");
        if (pageLinksListElem)
        {
            $(pageLinksListElem).children('pageLinks').each(function()
            {
                var pageLinksElem = $(this);
                var id = pageLinksElem.attr("id");
                var resourcePath = location.href.substring(0, location.href.indexOf('Launch.htm')) + course.getContentFolderPath() + "Resources/";
                $(pageLinksElem).children('pageLink').each(function()
                {
                    var pageLinkElem = $(this);
                    var newPageLink = new PageLink;
                    newPageLink.id = id;
                    newPageLink.type = pageLinkElem.attr("type");
                    newPageLink.source = (newPageLink.type == "File") ? resourcePath + pageLinkElem.attr("source") : pageLinkElem.attr("source");
                    newPageLink.duration = pageLinkElem.attr("duration") - 0;
                    newPageLink.name = pageLinkElem.find("name").text();
                    newPageLink.description = pageLinkElem.find("description").text();
                    if (newPageLink.type === "File")
                    {
                        var ext = newPageLink.source.substring(newPageLink.source.indexOf(".") + 1).toLowerCase();
                        switch (ext)
                        {
                            case"pdf":
                                newPageLink.icon = "&#xf1c1;";
                                break;
                            case"pptx":
                                newPageLink.icon = "&#xf1c4;";
                                break;
                            case"docx":
                                newPageLink.icon = "&#xf1c2;";
                                break;
                            case"zip":
                                newPageLink.icon = "&#xf1c6;";
                                break;
                            case"xlsx":
                                newPageLink.icon = "&#xf1c3;";
                                break;
                            case"jpg":
                                newPageLink.icon = "&#xf1c5;";
                                break;
                            case"mp3":
                                newPageLink.icon = "&#xf1c7;";
                                break;
                            case"mp4":
                                newPageLink.icon = "&#xf1c8;";
                                break;
                            default:
                                newPageLink.icon = "&#xf016;";
                                break
                        }
                    }
                    else
                    {
                        newPageLink.icon = "&#xf08e;"
                    }
                    course.PageLinkArray.push(newPageLink)
                })
            });
            course.settings.hasTracks = course.tracks.items.length > 0
        }
    }
    catch(e) {}
};
var Resources = [];
CourseParser.parseResourcesXml = function(xml)
{
    try
    {
        var resourcesElem = $(xml).find("data");
        resourcesElem.each(function()
        {
            var xmlResource = $(this);
            Resources[xmlResource.attr("name")] = xmlResource.children("value").text()
        })
    }
    catch(e) {}
};
CourseParser.parseMediaManifest = function(xml, course)
{
    try
    {
        var itemsElem = $(xml).find("item");
        itemsElem.each(function()
        {
            var xmlVideoItem = $(this);
            var videoItem = new VideoItem;
            if (xmlVideoItem.attr("required") == "yes" || xmlVideoItem.attr("required") == "true")
                videoItem.required = true;
            videoItem.mediaPath = xmlVideoItem.attr("mediaPath");
            videoItem.namingScheme = xmlVideoItem.attr("namingScheme");
            videoItem.videoPlayerType = xmlVideoItem.attr("videoPlayerType");
            videoItem.uiLabel = xmlVideoItem.attr("uiLabel");
            videoItem.userDownload = xmlVideoItem.attr("userDownload") === "true";
            course.mediaManifest.videoItems.push(videoItem)
        })
    }
    catch(e) {}
};
CourseParser.getTrueFalseTrackInfo = function(xml, obj)
{
    if (!obj)
        return;
    obj.yes = {},
    obj.no = {};
    var trueElem = $("true", xml);
    obj.yes.required = trueElem.attr("required");
    obj.yes.removed = trueElem.attr("removed");
    var falseElem = $("false", xml);
    obj.no.required = falseElem.attr("required");
    obj.no.removed = falseElem.attr("removed")
};
CourseParser.parseTrackSelectionFromProfile = function(xml, settings)
{
    var settingsElem = $(xml).find("settings");
    settings.callServices = settingsElem.attr("callServices") == "true";
    settings.debug = settingsElem.attr("debug") == "true";
    settings.alwaysShowDialog = settingsElem.attr("alwaysShowDialog") == "true";
    settings.urlProfile = settingsElem.attr("urlProfile");
    settings.urlReportsTo = settingsElem.attr("urlReportsTo");
    settings.static = settingsElem.attr("static") == "true";
    if (settings.static)
    {
        settings.urlProfile = "userprofile.xml";
        settings.urlReportsTo = "reportsto.xml"
    }
    settings.FTE = {};
    settings.peopleManager = {};
    settings.organizations = [];
    CourseParser.getTrueFalseTrackInfo($("isFTE", settingsElem), settings.FTE);
    CourseParser.getTrueFalseTrackInfo($("isPeopleManager", settingsElem), settings.peopleManager);
    $("organizations", settingsElem).children("org").each(function()
    {
        var org = {};
        org.alias = $(this).attr("alias");
        if (org.alias)
        {
            org.name = $(this).attr("name");
            CourseParser.getTrueFalseTrackInfo(this, org);
            settings.organizations[org.alias] = org
        }
    })
};
(function($)
{
    $.fn.shuffle = function()
    {
        var allElems = this.get(),
            getRandom = function(max)
            {
                return Math.floor(Math.random() * max)
            },
            shuffled = $.map(allElems, function()
            {
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl
            });
        this.each(function(i)
        {
            $(this).replaceWith($(shuffled[i]))
        });
        return $(shuffled)
    }
})(jQuery);
if (parent.$)
{
    parent.$('.learn-footer a').on('focus', function()
    {
        parent.$('.learn-footer').css('z-index', 10000)
    });
    parent.$('.learn-footer a').on('blur', function()
    {
        parent.$('.learn-footer').css('z-index', 0)
    })
}
var views = views || {};
views.utils = {};
views.utils.createMetroButton = function(id, text)
{
    var metroButton = $('<a href="#" class="MetroButton"><div class="MetroIcon" id="' + id + '"></div><div class="MetroButtonLabel">' + text + '</div></a>');
    return metroButton
};
views.utils.createButton = function(id, text, theClass)
{
    var classAddIn = theClass ? " class=" + theClass : " ";
    var s = $('<button role="button" type="button" id="' + id + '"' + classAddIn + '>' + text + '</button>');
    return s
};
views.utils.getCheckedItems = function(container, name, separator)
{
    var checkedList = "";
    var inputList = container.find('input[name=' + name + ']:checked');
    for (var i = 0; i < inputList.length; i++)
    {
        if (checkedList == '')
        {
            checkedList += $(inputList[i]).val()
        }
        else
        {
            checkedList += separator + $(inputList[i]).val()
        }
    }
    return checkedList
};
views.utils.sizeDialog = function(dialogDivs, height, width)
{
    dialogDivs.each(function()
    {
        var dialogDiv = $(this);
        if (dialogDiv.dialog('isOpen') === true && dialogDiv.dialog('option', 'modal') == true)
        {
            dialogDiv.dialog('option', 'height', $(window).height() - (height ? height : 40));
            dialogDiv.dialog('option', 'width', $(window).width() - (width ? width : 40));
            dialogDiv.dialog('option', 'position', 'center')
        }
    })
};
views.utils.hideNonDialog = function()
{
    $("#container").attr("aria-hidden", "true")
};
views.utils.showNonDialog = function()
{
    $("#container").attr("aria-hidden", "false");
    if (window.quickLinksButton)
    {
        window.quickLinksButton.focus();
        window.quickLinksButton = null
    }
};
views.utils.fileExists = function(fileName)
{
    var retval;
    $.ajax({
        url: fileName, async: false, success: function(data)
            {
                retval = true
            }, statusCode: {404: function()
                {
                    retval = false
                }}
    });
    return retval
};
views.utils.getAssessmentSRStatusText = function(status)
{
    switch (status)
    {
        case 0:
            return Resources.Assessment_Status_NotStarted;
        case 1:
            return Resources.Assessment_Status_InProgress;
        case 2:
            return Resources.Assessment_Status_Failed;
        case 3:
            return Resources.Assessment_Status_Passed
    }
    return ""
};
views.utils.getMediaTimeDisplayFormat = function(currentTime, duration, showHours)
{
    var tcHours = parseInt(currentTime / 3600);
    var tcMins = parseInt((currentTime - (tcHours * 3600)) / 60);
    var tcSecs = parseInt(currentTime - ((tcHours * 3600) + (tcMins * 60)));
    var ttHours = parseInt(duration / 3600);
    var ttMins = parseInt((duration - (ttHours * 3600)) / 60);
    var ttSecs = parseInt(duration - ((ttHours * 3600) + (ttMins * 60)));
    if (tcSecs < 10)
    {
        tcSecs = '0' + tcSecs
    }
    if (ttSecs < 10)
    {
        ttSecs = '0' + ttSecs
    }
    if (tcMins < 10)
    {
        tcMins = '0' + tcMins
    }
    if (ttMins < 10)
    {
        ttMins = '0' + ttMins
    }
    if (tcHours < 10)
    {
        tcHours = '0' + tcHours
    }
    if (ttHours < 10)
    {
        ttHours = '0' + ttHours
    }
    if (showHours)
    {
        var resultCurrent = tcHours + ':' + tcMins + ':' + tcSecs;
        var resultTotal = ttHours + ':' + ttMins + ':' + ttSecs
    }
    else
    {
        var resultCurrent = tcMins + ':' + tcSecs;
        var resultTotal = ttMins + ':' + ttSecs
    }
    resultCurrent = views.utils.localizeNumbers(resultCurrent);
    resultTotal = views.utils.localizeNumbers(resultTotal);
    return '<span class="currentTime">' + resultCurrent + '</span>' + ' / ' + '<span class="totalTime">' + resultTotal + '</span>'
};
views.utils.formatTime = function(timeRaw)
{
    var hh = Math.floor(timeRaw / 3600);
    timeRaw -= hh * 3600;
    var mm = Math.floor(timeRaw / 60);
    timeRaw -= mm * 60;
    var ss = timeRaw;
    if (mm < 10)
        mm = "0" + mm;
    if (ss < 10)
        ss = "0" + ss;
    if (hh > 0)
    {
        return views.utils.localizeNumbers(hh + ":" + mm + ":" + ss)
    }
    return views.utils.localizeNumbers(mm + ":" + ss)
};
views.utils.localizeNumbers = function(s)
{
    if (courseController.course.language.rtl)
    {
        return views.utils.arabicNumbers(s + "")
    }
    return s
};
views.utils.arabicNumbers = function(s)
{
    if (!s)
        return '';
    var rep = {
            '0': '&#1632;', '1': '&#1633;', '2': '&#1634;', '3': '&#1635;', '4': '&#1636;', '5': '&#1637;', '6': '&#1638;', '7': '&#1639;', '8': '&#1640;', '9': '&#1641;', ':': ':', '/': '/', '.': '&#1643;'
        };
    var str = '';
    try
    {
        var arr = s.split("")
    }
    catch(e)
    {
        var arr = new Array(s)
    }
    for (i = 0; i < arr.length; i++)
    {
        str += rep[arr[i]]
    }
    return str
};
views.utils.hideRoleGuideVideo = function()
{
    if (views.utils.isInRoleGuide())
    {
        try
        {
            top.videoPosition("-1000,-1000,0,0");
            top.videoPause()
        }
        catch(e) {}
    }
};
views.utils.isInRoleGuide = function()
{
    return (typeof(window.external) != 'undefined' && typeof(window.external.notify) != 'undefined')
};
views.utils.msieversion = function()
{
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    if (msie > 0)
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    if (trident > 0)
    {
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
    }
    return false
};
function Caption()
{
    this.timeStart = "";
    this.timeEnd = "";
    this.text = "";
    this.isDisplayed = false
}
function KeyPoint()
{
    this.timeStart = "";
    this.timeEnd = "";
    this.type = "text";
    this.data = "";
    this.isDisplayed = false;
    this.pause = false;
    this.mustComplete = false;
    this.style = ""
}
function Language()
{
    this.code = null;
    this.defaultCode = null;
    this.languageArray = [];
    this.count = 0;
    this.reloading = false;
    this.rtl = false;
    this.init = function()
    {
        for (var i in _aLanguages)
        {
            if (i != "shuffle")
            {
                this.languageArray[i] = _aLanguages[i];
                this.count++
            }
        }
        this.defaultCode = _sLanguageDefault;
        this.browserLangauge = navigator.userLanguage ? navigator.userLanguage.toLowerCase() : navigator.language.toLowerCase();
        var savedLanguage = courseController.course.scormState.getState("language");
        if (savedLanguage != "")
        {
            this.code = savedLanguage
        }
        else
        {
            if (this.count > 1)
            {
                for (var i in this.languageArray)
                {
                    if (this.browserLangauge == i)
                    {
                        this.code = this.browserLangauge;
                        break
                    }
                }
                if (this.code == null)
                {
                    if (this.browserLangauge.indexOf("-") != -1)
                    {
                        var sBaseBrowser = this.browserLangauge.substring(0, this.browserLangauge.indexOf("-"));
                        for (i in this.languageArray)
                        {
                            if (i != "shuffle")
                            {
                                var sBaseOptions = i.substring(0, i.indexOf("-"));
                                if (sBaseOptions != "")
                                {
                                    if (sBaseBrowser == sBaseOptions)
                                    {
                                        this.code = i
                                    }
                                }
                                else if (sBaseBrowser == i)
                                {
                                    this.code = i
                                }
                            }
                        }
                    }
                    if (this.code == null)
                        this.code = this.defaultCode
                }
            }
            else
            {
                this.code = this.defaultCode
            }
            courseController.course.scormState.setState("language", this.code)
        }
        if (this.code.indexOf("-") > -1)
        {
            var sBase = this.code.substring(0, this.code.indexOf("-"))
        }
        else
        {
            var sBase = this.code
        }
        this.rtl = sBase == "ar" || sBase == "he"
    }
}
function MediaFile(course, fileName)
{
    this.Course = course;
    this.PlayOnPageDisplay = true;
    this.UseTranscript = false;
    this.FileName = fileName;
    this.FilePath = "";
    this.videoClickToPlay = false;
    this.videoAutoNavigate = false;
    this.audioAutoNavigate = false;
    this.audioPreventSkipAhead = false;
    this.videoPreventSkipAhead = false;
    this.videoStretchToFit = false;
    this.mustPlayAll = false;
    this.videoWidth = 0;
    this.videoHeight = 0
}
MediaFile.prototype.getFilePath = function(mediaManifestItem)
{
    if (this.azureAsset)
        return this.azureAsset;
    if (this.FilePath)
        return this.FilePath;
    var fileName = this.FileName;
    if (mediaManifestItem)
    {
        if (mediaManifestItem.namingScheme)
        {
            fileName = mediaManifestItem.namingScheme.replace("*", common.getFileNameWithoutExtension(fileName))
        }
        if (mediaManifestItem.mediaPath)
        {
            return mediaManifestItem.mediaPath.replace(/\/?$/, '/') + fileName
        }
    }
    return this.Course.getMediaFolderPath() + fileName
};
function MediaManifest()
{
    this.videoItems = [];
    this.getVideoItemByPlayerType = function(type)
    {
        if (type)
        {
            for (var i = 0; i < this.videoItems.length; i++)
            {
                if (this.videoItems[i].videoPlayerType.toLowerCase() == type.toLowerCase())
                {
                    return this.videoItems[i]
                }
            }
        }
    };
    this.getFirstMpgVideoItem = function()
    {
        for (var i = 0; i < this.videoItems.length; i++)
        {
            if (this.videoItems[i].videoPlayerType.toLowerCase() == "wmv" || this.videoItems[i].videoPlayerType.toLowerCase() == "mp4")
            {
                return this.videoItems[i]
            }
        }
    };
    this.getMpgVideoItemByUiLabel = function(uiLabel)
    {
        if (uiLabel)
        {
            for (var i = 0; i < this.videoItems.length; i++)
            {
                if ((this.videoItems[i].videoPlayerType.toLowerCase() == "wmv" || this.videoItems[i].videoPlayerType.toLowerCase() == "mp4") && this.videoItems[i].uiLabel.toLowerCase() == uiLabel.toLowerCase())
                {
                    return this.videoItems[i]
                }
            }
        }
        return this.getFirstMpgVideoItem()
    };
    this.getVideoUiLabels = function()
    {
        var qualities = [];
        for (var i = 0; i < this.videoItems.length; i++)
        {
            if ((this.videoItems[i].videoPlayerType.toLowerCase() == "wmv" || this.videoItems[i].videoPlayerType.toLowerCase() == "mp4"))
            {
                for (var j = 0, index = -1; j < qualities.length; j++)
                {
                    if (qualities[j] === this.videoItems[i].uiLabel)
                    {
                        index = j;
                        break
                    }
                }
                index === -1 && qualities.push(this.videoItems[i].uiLabel)
            }
        }
        return qualities
    };
    this.getFirstDownloadableVideoItem = function()
    {
        for (var i = 0; i < this.videoItems.length; i++)
        {
            if ((this.videoItems[i].videoPlayerType.toLowerCase() == "wmv" || this.videoItems[i].videoPlayerType.toLowerCase() == "mp4") && this.videoItems[i].userDownload)
            {
                return this.videoItems[i]
            }
        }
    };
    this.getFirstRequiredVideoItem = function()
    {
        for (var i = 0; i < this.videoItems.length; i++)
        {
            if (this.videoItems[i].required)
            {
                return this.videoItems[i]
            }
        }
    }
}
function VideoItem()
{
    this.required = false;
    this.mediaPath = "";
    this.namingScheme = "";
    this.videoPlayerType = "";
    this.uiLabel = "";
    this.userDownload = false;
    this.getMimeType = function()
    {
        if (this.videoPlayerType)
        {
            switch (this.videoPlayerType.toLowerCase())
            {
                case"wmv":
                    return "video/x-ms-wmv";
                case"streaming":
                    return 'application/vnd.ms-sstr+xml'
            }
        }
        return 'video/mp4'
    }
}
function Observer()
{
    this.observations = []
}
;
function Observation(name, func)
{
    this.name = name;
    this.func = func
}
;
Observer.prototype = {
    clear: function()
    {
        this.observations.length = 0
    }, observe: function(name, func)
        {
            var exists = false;
            for (var i = 0, ilen = this.observations.length; i < ilen; i++)
            {
                var observer = this.observations[i];
                if (observer.name == name && observer.func == func)
                {
                    exists = true;
                    break
                }
            }
            if (!exists)
                this.observations.push(new Observation(name, func))
        }, unobserve: function(name, func)
        {
            for (var i = 0, ilen = this.observations.length; i < ilen; i++)
            {
                var observer = this.observations[i];
                if (observer.name == name && observer.func == func)
                {
                    this.observations.splice(i, 1);
                    break
                }
            }
        }, fire: function(name, data, scope)
        {
            var observers = [];
            for (var i = 0, ilen = this.observations.length; i < ilen; i++)
            {
                var observer = this.observations[i];
                if (observer.name == name)
                    observers.push(observer)
            }
            for (var i = 0, ilen = observers.length; i < ilen; i++)
                observers[i].func.call(scope || window, data)
        }
};
function PageLink()
{
    this.id = "";
    this.type = "";
    this.source = "";
    this.duration = 0;
    this.name = "";
    this.description = ""
}
function Page()
{
    this.id = null;
    this.isModule = false;
    this.moduleIndex = -1;
    this.name = "";
    this.pages = [];
    this.privatePages = [];
    this.contribute = 'n';
    this.Assessment = null;
    this.navNext = null;
    this.navPrevious = null;
    this.parent = null;
    this.pageState = new PageState;
    this.pageType = new PageType;
    this.course = null;
    this.fileName = "page.htm";
    this.videoFiles = [];
    this.audioFiles = [];
    this.mustCompletePrevModules = false;
    this.modulesToComplete = "";
    this.mustCompleteRequiredPages = false;
    this.objectives = "";
    this.time = 0;
    this.navRestrictionMsg = "";
    this.points = 0;
    this.pageLinkArray = null
}
Page.prototype.InitVideoController = function(contentWindow, courseController, vObserver, vContext)
{
    if (this.pageType.PlaybackSource == "Video")
    {
        var vid = new VideoController(contentWindow, courseController);
        vid.page = this;
        vid.videoFile = this.hasVideo() ? this.videoFiles[0] : new MediaFile(courseController.course, "");
        vid.volume = courseController.course.volume;
        vid.keyPointsFilePath = this.getKeyPointsPath(vid.videoFile.FileName);
        if (!vid.videoFile.mustPlayAll)
            this.setComplete();
        if (vObserver)
            vid.observer = vObserver;
        if (vContext)
            vid.context = vContext;
        vid.readyToPlay();
        return vid
    }
    return null
};
Page.prototype.isRequired = function()
{
    if (this.availableForNavigation() && !this.pageState.isOptional && this.contribute == "r")
    {
        return true
    }
    return false
};
Page.prototype.availableForNavigation = function()
{
    if (this.pageState.isOptionalByTrackSelection)
        return false;
    if (this.course.settings.ShowOptionalContent && this.pageState.isOptionalByObjectiveCompletion)
    {
        return this.course.settings.ShowTestedOutContent
    }
    if (this.pageState.isOptional)
    {
        return this.course.settings.ShowOptionalContent
    }
    return true
};
Page.prototype.setComplete = function(skipCheckCompletion)
{
    this.pageState.status = "P";
    this.course.recordPathmark();
    if (!skipCheckCompletion)
        this.course.checkCompletion(this);
    this.course.updateLockedModules();
    this.course.observer.fire("pageStatusChanged", this)
};
Page.prototype.setIncomplete = function()
{
    this.pageState.status = "I";
    this.course.recordPathmark()
};
Page.prototype.isComplete = function()
{
    return this.pageState.status == "P"
};
Page.prototype.getModule = function()
{
    for (var module = this; module.parent != null; module = module.parent)
        ;
    return module
};
Page.prototype.getPageContentFolderPath = function()
{
    if (this.isTestOut())
    {
        if (this.id != "test-out")
            this.actualId = this.id;
        return this.course.getContentFolderPath() + "content" + common.zeroFill(this.actualId, 5) + "/"
    }
    else
    {
        return this.course.getContentFolderPath() + "content" + common.zeroFill(this.id, 5) + "/"
    }
};
Page.prototype.getFilePath = function()
{
    if (this.pageType.PlaybackSource == "Video")
        return "VideoPage.htm";
    return this.getPageContentFolderPath() + this.fileName
};
Page.prototype.getFilePathRelativeToContentPage = function()
{
    if (this.pageType.PlaybackSource == "Video")
        return "../../../VideoPage.htm";
    if (this.isTestOut())
    {
        if (this.id != "test-out")
            this.actualId = this.id;
        return "../content" + common.zeroFill(this.actualId, 5) + "/" + this.fileName
    }
    else
    {
        return "../content" + common.zeroFill(this.id, 5) + "/" + this.fileName
    }
};
Page.prototype.hasAudio = function()
{
    return this.audioFiles.length > 0
};
Page.prototype.getPlayOnPageDisplayAudio = function()
{
    for (var i = 0; i < this.audioFiles.length; i++)
    {
        if (this.audioFiles[i].PlayOnPageDisplay)
        {
            return this.audioFiles[i]
        }
    }
    return null
};
Page.prototype.hasVideo = function()
{
    return this.videoFiles.length > 0
};
Page.prototype.getVideo = function(fileName)
{
    if (fileName)
    {
        for (var i = 0; i < this.videoFiles.length; i++)
        {
            if (this.videoFiles[i].FileName.toLowerCase() == fileName.toLowerCase())
            {
                return this.videoFiles[i]
            }
        }
    }
    return null
};
Page.prototype.getVideoCaptionsPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_Video_cc.xml";
    return ""
};
Page.prototype.getVideoChaptersPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_Video_chapters.js";
    return ""
};
Page.prototype.getVideoDescriptionsPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_Video_descriptions.xml";
    return ""
};
Page.prototype.getAudio = function(file)
{
    if (file)
    {
        for (var i = 0; i < this.audioFiles.length; i++)
        {
            var sFileName = "";
            if (typeof file === "string")
                sFileName = file.toLowerCase();
            else
                sFileName = file.FileName;
            if (this.audioFiles[i].FileName.toLowerCase() == sFileName.toLowerCase())
            {
                return this.audioFiles[i]
            }
        }
    }
    return null
};
Page.prototype.getAudioCaptionsPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_Audio_cc.xml";
    return ""
};
Page.prototype.getAudioTranscriptPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_Audio_transcript.htm";
    return ""
};
Page.prototype.getVideoTranscriptPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_Video_transcript.htm";
    return ""
};
Page.prototype.getKeyPointsPath = function(mediaFileName)
{
    if (mediaFileName)
        return this.getPageContentFolderPath() + common.getFileNameWithoutExtension(mediaFileName) + "_cmd.xml";
    return ""
};
Page.prototype.getKeyPointsImagesPath = function()
{
    return this.getPageContentFolderPath() + "Images/"
};
Page.prototype.toString = function()
{
    return this.name + " (" + this.id + ")"
};
Page.prototype.unload = function(keepObservers)
{
    if (this.Assessment)
        this.Assessment.unload(keepObservers);
    if (this.BranchingGraph)
        this.BranchingGraph.unload()
};
Page.prototype.isTestOut = function()
{
    return (this.pageType.id == "6137920C-0B48-452D-A9E3-0C1D82B00EB8")
};
Page.prototype.canSendCompletion = function()
{
    if (this.pageType.canSendCompletion)
        return true;
    var playOnPageDisplayAudio = this.getPlayOnPageDisplayAudio();
    if (playOnPageDisplayAudio && playOnPageDisplayAudio.mustPlayAll)
        return true;
    return false
};
Page.prototype.getPageLinkArray = function()
{
    if (!this.pageLinkArray)
    {
        this.pageLinkArray = [];
        for (var i = 0; i < this.course.PageLinkArray.length; i++)
        {
            if (this.course.PageLinkArray[i].id == this.id)
            {
                this.pageLinkArray.push(this.course.PageLinkArray[i])
            }
        }
    }
    return this.pageLinkArray
};
function PageState()
{
    this.isLocked = false;
    this.isOptional = false;
    this.isOptionalByAuthor = false;
    this.isOptionalByObjectiveCompletion = false;
    this.isOptionalByTrackSelection = false;
    this.isVisited = false;
    this.status = "N"
}
function PageType()
{
    this.id = "";
    this.canSendCompletion = false;
    this.version = "";
    this.behavior = "None";
    this.PlaybackSource = "";
    this.PlaybackFile = "";
    this.isValid = false;
    this.HideContentsWidget = false
}
function SbaSet()
{
    this.name = "";
    this.pages = []
}
function ScormState(course)
{
    this.bookmark = null;
    this.isComplete = false;
    this.course = course;
    this.stateArray = [];
    this._sSep = "{{";
    this.ScormTerminated = false
}
ScormState.prototype.load = function()
{
    this.bookmark = getBookmark();
    var sSuspend = getSuspendData();
    var aParts = sSuspend.split(this._sSep);
    for (var i = 0; i < aParts.length; i = i + 2)
    {
        if (aParts[i] != "")
        {
            this.stateArray[aParts[i]] = aParts[i + 1]
        }
    }
    var status = getCompletionStatus();
    if (status == "completed" || status == "passed")
        this.isComplete = true
};
ScormState.prototype.calcSuspendData = function()
{
    this.stateArray["VERSION"] = _sVersion;
    this.stateArray["DATE"] = (new Date).getTime();
    var sSuspend = "";
    for (var i in this.stateArray)
    {
        if (i != "shuffle")
            sSuspend += i + this._sSep + this.stateArray[i] + this._sSep
    }
    return sSuspend
};
ScormState.prototype.save = function()
{
    if (!this.ScormTerminated)
    {
        setBookmark(this.course.currentPageIndex + "");
        var sSuspend = this.calcSuspendData();
        if (sSuspend)
        {
            setSuspendData(sSuspend);
            var API = getAPI();
            if (API && API.LMSServiceCallErrArray && API.LMSServiceCallErrArray.length > 0)
            {
                courseController.alert("A communication error will not allow this course to save your interactions with this course. Please close the course and relaunch the course when your network connection will allow this course to communicate information to the server.");
                _bErrDisplayed = true
            }
            scormCommit()
        }
    }
};
ScormState.prototype.getBookmark = function()
{
    return this.course.currentPageIndex + ""
};
ScormState.prototype.getScormBookmark = function()
{
    return getBookmark() + ""
};
ScormState.prototype.getSuspendData = function()
{
    return getSuspendData()
};
ScormState.prototype.getCompletionStatus = function()
{
    return getCompletionStatus()
};
function RestorePoint(bookmark, suspendData, completionStatus)
{
    this.bookmark = bookmark;
    this.suspendData = suspendData;
    this.completionStatus = completionStatus
}
ScormState.prototype.getRestorePoint = function()
{
    return new RestorePoint(this.getBookmark(), this.getSuspendData(), this.getCompletionStatus())
};
ScormState.prototype.setRestorePoint = function(restorePoint)
{
    setBookmark(restorePoint.bookmark);
    setSuspendData(restorePoint.suspendData);
    this.setCompletionStatus(restorePoint.completionStatus);
    scormCommit();
    this.stateArray = [];
    this.load()
};
ScormState.prototype.setState = function(sId, sValue)
{
    this.stateArray[sId] = sValue
};
ScormState.prototype.getState = function(sId)
{
    if (this.stateArray[sId])
    {
        return this.stateArray[sId]
    }
    return ""
};
ScormState.prototype.getLearnerName = function()
{
    return getLearnerName()
};
ScormState.prototype.getLearnerId = function()
{
    return getLearnerId()
};
ScormState.prototype.setCompletionStatus = function(status)
{
    setCompletionStatus(status);
    if (status == "completed" || status == "passed")
    {
        this.isComplete = true
    }
};
ScormState.prototype.setPassFail = function(status)
{
    setPassFail(status)
};
ScormState.prototype.getScore = function()
{
    return getScore()
};
ScormState.prototype.setScore = function(score)
{
    setScore(score / 100)
};
ScormState.prototype.getTotalTime = function()
{
    return getTotalTime()
};
function Settings()
{
    this.SkipWelcomePage = false;
    this.ShowResources = true;
    this.hasTracks = false;
    this.EmbeddedEvaluation = "ShowInModal";
    this.MustAnswerAllEvalQuestions = true;
    this.AttemptId = "";
    this.ReviewMode = false;
    this.CourseTranscript = "";
    this.MediaURL = "";
    this.MediaLocation = "";
    this.DiscussionLink = "";
    this.ShowGlossary = true;
    this.ShowTestedOutContent = false;
    this.UserCanToggleOptional = false;
    this.ShowOptionalContent = true;
    this.TOCCollapsed = false;
    this.ShowCaptions = true;
    this.MediaPlaybackRate = 1;
    this.ShowVideoCaptions = true;
    this.videoRetry = 0;
    this.VideoQuality = "VideoQualityMedium";
    this.ShowVideoDescriptions = false;
    this.VideoFullScreen = false;
    this.HighContrastModeActive = false;
    this.DisplayExitCompleteMsg = true;
    this.DisplayExitIncompleteMsg = true;
    this.HideHeader = false;
    this.HideFooter = false;
    this.HeaderLinks = [];
    this.ApiLinks = [];
    this.Mercury = new Mercury
}
function HeaderLink()
{
    this.Id = "";
    this.IsActive = false;
    this.Name = "";
    this.Url = "";
    this.CssStyle = ""
}
function Mercury()
{
    this.URL = ""
}
function Track()
{
    this.description = "";
    this.modules = "";
    this.name = "";
    this.objectives = "";
    this.required = false;
    this.state = new TrackState
}
function Tracks()
{
    this.mapType = "";
    this.canUserSelect = true;
    this.trackSelectionMin = 0;
    this.trackSelectionMax = 0;
    this.items = [];
    this.reset = function()
    {
        for (var i = 0; i < this.items.length; i++)
        {
            this.items[i].state.isSelected = false;
            this.items[i].state.isActive = true;
            this.items[i].required = false
        }
    }
}
function TrackState()
{
    this.isSelected = false;
    this.isSelectedByAuthor = false;
    this.isActive = true
}
AssessmentStatus = {
    NotAttempted: 0, Incomplete: 1, Failed: 2, Passed: 3
};
AssessmentLocation = {
    Intro: 0, Question: 1, Review: 2, ObjectiveIntro: 3
};
function Assessment(courseModel, pageModel)
{
    this.Course = courseModel;
    this.Page = pageModel;
    this.Observer = new Observer;
    this.Type = null;
    this.PreTestType = null;
    this.QuestionSelection = null;
    this.PassingMethod = null;
    this.PassingPercentage = 0;
    this.CompletesCourse = false;
    this.Order = null;
    this.FeedbackType = null;
    this.ShowTestedOutContent = false;
    this.AttemptsToPass = 0;
    this.AttemptsToAnswer = 0;
    this.Attempts = 1;
    this.HideAnswers = false;
    this.HoursBeforeNextAttemptList = [];
    this.ScoredTime = 0;
    this.IntroductionText = null;
    this.Description = null;
    this.ReviewPassedText = null;
    this.ReviewFailedText = null;
    this.ReviewIncompleteText = null;
    this.Objectives = [];
    this.QuestionsPresented = [];
    this.NavigationNodes = [];
    this.Status = AssessmentStatus.NotAttempted;
    this.LocationIndex = 0;
    this.Location = AssessmentLocation.Intro;
    this.Initialized = false;
    this.ViewState = new AssessmentViewState(this);
    this.IsObjectiveSet = false;
    this.TimeLimit = 0;
    this.TimeRemaining = 0;
    this.IntervalTimer = null
}
Assessment.prototype.init = function()
{
    this.LocationIndex = 0;
    this.Status = AssessmentStatus.NotAttempted;
    this.IsObjectiveSet = false;
    this.ScoredTime = 0;
    this.QuestionsPresented = [];
    if (this.Order == "Random")
        this.Objectives.shuffle();
    for (var i = 0; i < this.Objectives.length; i++)
    {
        var assessmentObjective = this.Objectives[i];
        if (assessmentObjective.Objective.Complete)
            continue;
        if (!assessmentObjective.isRequiredByTrack())
            continue;
        assessmentObjective.init();
        var shuffledQuestions = [];
        if (assessmentObjective.StandAloneQuestion != null)
        {
            shuffledQuestions.push(assessmentObjective.StandAloneQuestion)
        }
        else
        {
            switch (this.QuestionSelection)
            {
                case"Random":
                    shuffledQuestions = assessmentObjective.Objective.Questions;
                    break;
                case"Manual":
                    var questionsToUse = 0;
                    if (assessmentObjective.Attempts.length > 0)
                    {
                        var attemptNumber = (this.Attempts - 1) % assessmentObjective.Attempts.length;
                        if (assessmentObjective.Attempts.length > attemptNumber)
                        {
                            shuffledQuestions = assessmentObjective.Attempts[attemptNumber].Questions;
                            questionsToUse = shuffledQuestions.length
                        }
                    }
                    assessmentObjective.QuestionsToUse = questionsToUse;
                    break
            }
        }
        if (this.Order != "None" && !this.Course.settings.ReviewMode)
            shuffledQuestions.shuffle();
        for (var j = 0; j < assessmentObjective.QuestionsToUse; j++)
        {
            var questionCopied = jQuery.extend(true, {}, shuffledQuestions[j]);
            questionCopied.AssessmentObj = assessmentObjective;
            questionCopied.setChoicesOrder();
            this.QuestionsPresented.push(questionCopied);
            assessmentObjective.QuestionOrder.push(questionCopied)
        }
    }
    if (this.Order == "Mixed")
        this.QuestionsPresented.shuffle();
    this.setNavigationNodes();
    if (this.countQuestions() == 0)
        this.setPassed();
    this.Initialized = true
};
Assessment.prototype.setNavigationNodes = function()
{
    var lastObjId = "",
        qLocationIndex = -1;
    this.NavigationNodes = [];
    if (this.Type != "StandAloneQuestion")
    {
        qLocationIndex++;
        this.NavigationNodes.push(new AssessmentNode(AssessmentLocation.Intro))
    }
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        var question = this.QuestionsPresented[i];
        if (this.Order != "Mixed" && question.AssessmentObj.Objective.IntroductionPageId)
        {
            if (question.AssessmentObj.Objective.Id != lastObjId)
            {
                qLocationIndex++;
                lastObjId = question.AssessmentObj.Objective.Id;
                var oNode = new AssessmentNode(AssessmentLocation.ObjectiveIntro);
                oNode.Tag = question.AssessmentObj.Objective.IntroductionPageId;
                this.NavigationNodes.push(oNode)
            }
        }
        var qNode = new AssessmentNode(AssessmentLocation.Question);
        qLocationIndex++;
        question.LocationIndex = qLocationIndex;
        question.Index = i;
        qNode.Tag = question;
        this.NavigationNodes.push(qNode)
    }
    if (this.Type != "StandAloneQuestion")
        this.NavigationNodes.push(new AssessmentNode(AssessmentLocation.Review));
    this.setLocation(this.LocationIndex)
};
Assessment.prototype.getScormData = function()
{
    var assessmentData = [];
    assessmentData.push(this.Status);
    assessmentData.push(this.Attempts);
    assessmentData.push(this.LocationIndex);
    if (this.QuestionsPresented.length > 0)
    {
        var questionsData = [];
        for (var i = 0; i < this.QuestionsPresented.length; i++)
        {
            var scormQuestionData = [];
            var question = this.QuestionsPresented[i];
            scormQuestionData.push(question.Objective.Id);
            scormQuestionData.push(question.Id);
            scormQuestionData.push(question.AnswerCount);
            scormQuestionData.push(question.getScormChoicesOrder());
            scormQuestionData.push(question.Answer ? question.Answer : "X");
            scormQuestionData.push(Number(question.Scored));
            scormQuestionData.push(question.Latency);
            questionsData.push(scormQuestionData.join("-"))
        }
        assessmentData.push(questionsData.join(","))
    }
    else
    {
        assessmentData.push("X")
    }
    if (this.ScoredTime > 0 && this.HoursBeforeNextAttemptList.length > 0 && this.hasAttemptsLeft())
        assessmentData.push(this.ScoredTime);
    else
        assessmentData.push("0");
    return assessmentData.join("::")
};
Assessment.prototype.loadScormData = function()
{
    var scormData = this.Course.scormState.getState(this.Page.id);
    if (!scormData)
        return;
    var assessmentData = scormData.split("::");
    var scormQuestionPresented = assessmentData[3].split(",");
    if (scormQuestionPresented[0] == "X")
    {
        return
    }
    this.QuestionsPresented = [];
    this.Status = +assessmentData[0];
    if (assessmentData.length == 1)
        return;
    this.Attempts = +assessmentData[1];
    this.LocationIndex = +assessmentData[2];
    if (scormQuestionPresented.length > 0)
    {
        var questionInfo = [],
            questionStatus,
            assessmentObjective;
        for (var i = 0; i < scormQuestionPresented.length; i++)
        {
            questionInfo = scormQuestionPresented[i].split("-");
            assessmentObjective = this.getObjective(questionInfo[0]);
            questionStatus = jQuery.extend(true, {}, assessmentObjective.Objective.getQuestion(questionInfo[1]));
            questionStatus.AssessmentObj = assessmentObjective;
            questionStatus.AnswerCount = +questionInfo[2];
            var choicesOrder = questionInfo[3].split("~");
            for (var j = 0; j < choicesOrder.length; j++)
                questionStatus.ChoicesOrder.push(questionStatus.Choices[+choicesOrder[j] - 1]);
            questionStatus.setCorrectAnswer();
            questionStatus.Answer = questionInfo[4] == "X" ? "" : questionInfo[4];
            questionStatus.Scored = Boolean(+questionInfo[5]);
            questionStatus.Latency = +questionInfo[6];
            assessmentObjective.QuestionOrder.push(questionStatus);
            if (this.QuestionSelection == "Manual")
                assessmentObjective.QuestionsToUse = assessmentObjective.QuestionOrder.length;
            this.QuestionsPresented.push(questionStatus)
        }
    }
    this.setNavigationNodes();
    this.Initialized = true;
    this.ScoredTime = +assessmentData[4]
};
Assessment.prototype.saveScormData = function()
{
    this.Course.scormState.setState(this.Page.id, this.getScormData());
    this.Course.scormState.save()
};
Assessment.prototype.resetScormData = function()
{
    this.Course.scormState.setState(this.Page.id, "")
};
Assessment.prototype.hasAttemptsLeft = function()
{
    return this.AttemptsToPass == 0 || this.Attempts < this.AttemptsToPass
};
Assessment.prototype.hasUnrequiredObjectives = function()
{
    for (var i = 0; i < this.Objectives.length; i++)
    {
        if (this.Objectives[i].Objective.Complete || !this.Objectives[i].isRequiredByTrack())
            return true
    }
    return false
};
Assessment.prototype.getObjective = function(id)
{
    for (var i = 0; i < this.Objectives.length; i++)
    {
        var assessmentObjective = this.Objectives[i];
        if (assessmentObjective.Objective.Id == id)
        {
            return assessmentObjective
        }
    }
    return null
};
Assessment.prototype.getCurrentQuestion = function()
{
    if (this.Location == AssessmentLocation.Question)
        return this.getCurrentNavNode().Tag;
    return null
};
Assessment.prototype.getCurrentNavNode = function()
{
    return this.NavigationNodes[this.LocationIndex]
};
Assessment.prototype.countQuestions = function()
{
    return this.QuestionsPresented.length
};
Assessment.prototype.countScoredQuestions = function()
{
    var nCount = 0;
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        if (this.QuestionsPresented[i].Scored)
        {
            nCount++
        }
    }
    return nCount
};
Assessment.prototype.countAnsweredQuestions = function()
{
    var nCount = 0;
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        if (this.QuestionsPresented[i].Answer != "")
        {
            nCount++
        }
    }
    return nCount
};
Assessment.prototype.countUnansweredQuestions = function()
{
    return this.countQuestions() - this.countAnsweredQuestions()
};
Assessment.prototype.countUnscoredQuestions = function()
{
    return this.countQuestions() - this.countScoredQuestions()
};
Assessment.prototype.answeredAllQuestions = function()
{
    return (this.countQuestions() - this.countAnsweredQuestions()) == 0
};
Assessment.prototype.countCorrectQuestions = function()
{
    var nCount = 0;
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        if (this.QuestionsPresented[i].isCorrect())
            nCount++
    }
    return nCount
};
Assessment.prototype.scoreAllQuestions = function()
{
    for (var i = 0; i < this.QuestionsPresented.length; i++)
        this.QuestionsPresented[i].score();
    this.updateStatus()
};
Assessment.prototype.hasNextLocation = function()
{
    return this.LocationIndex < (this.NavigationNodes.length - 1)
};
Assessment.prototype.hasPreviousLocation = function()
{
    return this.LocationIndex > 0
};
Assessment.prototype.setNextLocation = function()
{
    this.setLocation(this.LocationIndex + 1)
};
Assessment.prototype.setPreviousLocation = function()
{
    this.setLocation(this.LocationIndex - 1)
};
Assessment.prototype.setReviewLocation = function()
{
    this.setLocation(this.NavigationNodes.length - 1)
};
Assessment.prototype.setIntroLocation = function()
{
    this.setLocation(0)
};
Assessment.prototype.setLocation = function(index)
{
    var previousLocationIndex = this.LocationIndex;
    this.stopCurrentQuestionLatencyTimer();
    var navNode = this.NavigationNodes[index];
    if (navNode)
    {
        this.LocationIndex = index;
        this.Location = navNode.Type
    }
    if (this.LocationIndex != previousLocationIndex)
    {
        this.saveScormData();
        this.Observer.fire("locationChanged", this)
    }
};
Assessment.prototype.stopCurrentQuestionLatencyTimer = function()
{
    var question = this.getCurrentQuestion();
    if (question)
        question.stopLatencyTimer()
};
Assessment.prototype.checkAnswer = function()
{
    var question = this.getCurrentQuestion();
    if (question)
        question.score()
};
Assessment.prototype.retryQuestion = function()
{
    var question = this.getCurrentQuestion();
    if (question)
        question.retry()
};
Assessment.prototype.nextAttemptDate = function()
{
    if (this.HoursBeforeNextAttemptList.length > 0)
    {
        if (this.Status == AssessmentStatus.Failed)
        {
            if (this.hasAttemptsLeft())
            {
                var hoursBeforeNextAttemptIndex = (this.Attempts - 1) % this.HoursBeforeNextAttemptList.length;
                var hoursBeforeNextAttempt = this.HoursBeforeNextAttemptList[hoursBeforeNextAttemptIndex];
                var nextAttemptDate = this.ScoredTime + (hoursBeforeNextAttempt * 3600000);
                if (nextAttemptDate > (new Date).getTime())
                {
                    return nextAttemptDate
                }
            }
        }
    }
    return 0
};
Assessment.prototype.isCompleted = function()
{
    switch (this.Status)
    {
        case AssessmentStatus.Failed:
        case AssessmentStatus.Passed:
            return true
    }
    return false
};
Assessment.prototype.isTestOut = function()
{
    switch (this.PreTestType)
    {
        case"NonAdaptive":
        case"Adaptive":
            return true
    }
    return false
};
Assessment.prototype.pass = function()
{
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        var question = this.QuestionsPresented[i];
        question.Answer = question.CorrectAnswer;
        question.Scored = true
    }
    this.updateStatus()
};
Assessment.prototype.fail = function()
{
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        var question = this.QuestionsPresented[i];
        for (var j = 0; j < question.ChoicesOrder.length; j++)
        {
            var choice = question.ChoicesOrder[j];
            if (choice.Answers.length)
            {
                question.Answer = "";
                break
            }
            else if (!choice.Correct)
            {
                question.Answer = (j + 1) + "";
                break
            }
        }
        question.Scored = true
    }
    this.updateStatus()
};
Assessment.prototype.setPassed = function(skipCheckCompletion)
{
    this.Status = AssessmentStatus.Passed;
    this.ScoredTime = (new Date).getTime();
    if (!this.IsObjectiveSet)
    {
        setObjective(null, "Assessment." + this.Page.id + "." + (this.Attempts), "completed", "100", "passed", (this.getScore() / 100) + "", null);
        this.IsObjectiveSet = true
    }
    this.Page.setComplete(skipCheckCompletion)
};
Assessment.prototype.setFailed = function(skipCheckCompletion)
{
    this.Status = AssessmentStatus.Failed;
    this.ScoredTime = (new Date).getTime();
    if (!this.IsObjectiveSet)
    {
        setObjective(null, "Assessment." + this.Page.id + "." + (this.Attempts), "completed", "100", "failed", (this.getScore() / 100) + "", null);
        this.IsObjectiveSet = true
    }
    if (!this.hasAttemptsLeft())
        this.Page.setComplete(skipCheckCompletion)
};
Assessment.prototype.getScore = function()
{
    var answered = this.QuestionsPresented.length;
    if (answered > 0)
        return Math.round(100 * this.countCorrectQuestions() / answered);
    else
        return 0
};
Assessment.prototype.unload = function(keepObservers)
{
    this.stopCurrentQuestionLatencyTimer();
    this.saveScormData();
    if (!keepObservers)
        this.Observer.clear()
};
Assessment.prototype.getPassingMethod = function()
{
    switch (this.PreTestType)
    {
        case"NonAdaptive":
            var passingMethod = "PassingPercentage";
            break;
        case"Adaptive":
            var passingMethod = "PassObjectives";
            break;
        default:
            var passingMethod = this.PassingMethod;
            break
    }
    return passingMethod
};
Assessment.prototype.updateStatus = function()
{
    var nCorrect = 0,
        nTotal = 0;
    for (var i = 0; i < this.Objectives.length; i++)
        this.Objectives[i].QuestionsCorrect = 0;
    for (var i = 0; i < this.QuestionsPresented.length; i++)
    {
        if ((this.FeedbackType == "Delayed" && this.QuestionsPresented[i].Scored) || (this.FeedbackType == "Immediate" && this.QuestionsPresented[i].isBlocked()))
        {
            nTotal++;
            if (this.QuestionsPresented[i].isCorrect())
            {
                nCorrect++;
                this.QuestionsPresented[i].AssessmentObj.QuestionsCorrect++
            }
        }
    }
    var passingMethod = this.getPassingMethod();
    switch (passingMethod)
    {
        case"MustAnswerAll":
            if (nTotal == this.countQuestions())
                this.setPassed(true);
            break;
        case"PassingPercentage":
            if (nTotal == this.countQuestions())
            {
                if ((100 * nCorrect / this.countQuestions()) >= this.PassingPercentage)
                    this.setPassed(true);
                else
                    this.setFailed(true)
            }
            break;
        case"PassObjectives":
            if (nTotal == this.countQuestions())
            {
                var bAllPassed = true;
                for (var i = 0; i < this.Objectives.length; i++)
                {
                    if (!this.Objectives[i].isRequiredByTrack())
                        continue;
                    if (this.Objectives[i].Objective.Complete)
                        continue;
                    if (!this.Objectives[i].isPassed())
                    {
                        bAllPassed = false;
                        break
                    }
                }
                if (bAllPassed)
                    this.setPassed(true);
                else
                    this.setFailed(true);
                if (this.PreTestType == "Adaptive")
                {
                    for (var i = 0; i < this.Objectives.length; i++)
                    {
                        if (this.Objectives[i].isPassed())
                            this.Objectives[i].Objective.Complete = true
                    }
                    this.Course.scormState.setState("OBJ", this.Course.getCompletedObjectivesCsv());
                    this.Course.loadPageNavigation();
                    this.Course.updateForAssessments()
                }
            }
            break
    }
    for (var i = 0; i < this.Objectives.length; i++)
    {
        if (this.Objectives[i].isPassed())
            this.Course.observer.fire("loCompleted", this.Objectives[i])
    }
    this.saveScormData();
    if (this.isCompleted() && !this.sbaMode)
        this.Course.checkCompletion(this.Page);
    if (this.isCompleted())
    {
        if (this.IntervalTimer)
        {
            clearTimeout(this.IntervalTimer);
            this.IntervalTimer = null;
            this.TimeRemaining = 0
        }
    }
};
Assessment.prototype.startTimer = function(assessmentView, assessment, timeRemaining)
{
    assessment.TimeRemaining = timeRemaining;
    assessment.WantNavigation = false;
    assessment.IntervalTimer = setInterval(function()
    {
        assessment.TimeRemaining--;
        assessmentView.showRemainingTime(assessment.TimeRemaining);
        if (assessment.TimeRemaining <= 0)
        {
            clearTimeout(assessment.IntervalTimer);
            assessment.IntervalTimer = null;
            assessment.scoreAllQuestions();
            assessmentView.refreshResults(assessment);
            courseController.alert(Resources.Timer_NoTime_Text);
            assessmentView.Observer.fire("reviewLocationClicked")
        }
        else if (assessment.TimeRemaining == 300)
        {
            courseController.alert(Resources.Timer_LimitedTime_Text)
        }
    }, 1000)
};
function AssessmentAttempt(number)
{
    this.Number = number;
    this.Questions = []
}
function AssessmentNode(type)
{
    this.Type = type;
    this.Tag = null
}
function AssessmentObjective(objective, assessment)
{
    this.Objective = objective;
    this.Assessment = assessment;
    this.QuestionOrder = [];
    this.Attempts = [];
    this.QuestionsToUse = 0;
    this.QuestionsToAnswer = 0;
    this.QuestionsCorrect = 0;
    this.StandAloneQuestion = null;
    this.ScenarioAudioPlayed = false
}
AssessmentObjective.prototype.init = function()
{
    this.QuestionOrder = [];
    this.QuestionsCorrect = 0
};
AssessmentObjective.prototype.getQuestionsAnswered = function()
{
    var questionsAnswered = [];
    for (var i = 0; i < this.QuestionOrder.length; i++)
    {
        if (this.QuestionOrder[i].isAnswered())
            questionsAnswered.push(this.QuestionOrder[i])
    }
    return questionsAnswered
};
AssessmentObjective.prototype.getQuestionsCorrect = function()
{
    var questionsCorrect = [];
    for (var i = 0; i < this.QuestionOrder.length; i++)
    {
        if (this.QuestionOrder[i].isCorrect())
            questionsCorrect.push(this.QuestionOrder[i])
    }
    return questionsCorrect
};
AssessmentObjective.prototype.isPassed = function()
{
    if (this.Assessment && this.Assessment.getPassingMethod() == "PassObjectives")
        return this.QuestionsCorrect >= this.QuestionsToAnswer;
    return this.QuestionsCorrect >= this.QuestionOrder.length
};
AssessmentObjective.prototype.isRequiredByTrack = function()
{
    if (this.Objective)
        return this.Objective.IsRequiredByTrack;
    return true
};
function AssessmentViewState(assessment)
{
    this.Assessment = assessment
}
AssessmentViewState.prototype.navBarVisible = function()
{
    switch (this.Assessment.Type)
    {
        case"StandAloneQuestion":
            return false
    }
    return true
};
AssessmentViewState.prototype.navButtonsVisible = function()
{
    switch (this.Assessment.Type)
    {
        case"StandAloneQuestion":
            return false
    }
    return true
};
AssessmentViewState.prototype.checkAnswerButtonVisible = function()
{
    switch (this.Assessment.FeedbackType)
    {
        case"Delayed":
            return false
    }
    return true
};
AssessmentViewState.prototype.questionsNavButtonVisible = function()
{
    return this.Assessment.countQuestions() > 0
};
function Objective()
{
    this.Id = "";
    this.Name = "";
    this.Questions = [];
    this.IsRequiredByTrack = true;
    this.Scenario = new Scenario(this);
    this.Complete = false;
    this.ParentObjectiveId = "";
    this.ParentObjective = null;
    this.IntroductionPageId = ""
}
Objective.prototype.hasScenario = function()
{
    return !this.Scenario.isEmpty()
};
Objective.prototype.getQuestion = function(id)
{
    if (id)
    {
        for (var i = 0; i < this.Questions.length; i++)
        {
            var question = this.Questions[i];
            if (question.Id == id)
            {
                return question
            }
        }
    }
    return null
};
function ParentObjective()
{
    this.Id = "";
    this.Name = ""
}
function Question(objective)
{
    this.Id = "";
    this.Type = "";
    this.DistractorsCount = 0;
    this.RadioButtonStyle = "";
    this.FeedbackStyle = "";
    this.CheckedImage = "";
    this.UncheckedImage = "";
    this.Randomize = false;
    this.CorrectAnswer = "";
    this.Answer = "";
    this.AnswerCount = 0;
    this.Objective = objective;
    this.AssessmentObj = null;
    this.Prompt = new QuestionMedia;
    this.FeedbackCorrect = new QuestionMedia;
    this.FeedbackIncorrect = new QuestionMedia;
    this.Choices = [];
    this.ChoicesOrder = [];
    this.Feedbacks = [];
    this.Scored = false;
    this.PrevAnswer = '';
    this.Latency = 0;
    this.ResponseTimeMark = null;
    this.CustomStyle = false;
    this.CustomStyleName = "";
    this.Hint = "";
    this.Timing = "Immediate";
    this.SecondsDelay = 0;
    this.LocationIndex = 0;
    this.Index = 0;
    this.Observer = new Observer
}
Question.prototype.nSecondsDelayIsActive = function()
{
    if (!this.Scored && this.Timing == "NSecondsDelay" && this.SecondsDelay > 0)
        return true;
    return false
};
Question.prototype.getPromptAudioFilePath = function()
{
    return this.AssessmentObj.Assessment.Course.getMediaFolderPath() + this.Prompt.AudioFile
};
Question.prototype.getScenarioAudioFilePath = function()
{
    return this.AssessmentObj.Assessment.Course.getMediaFolderPath() + this.AssessmentObj.Objective.Scenario.AudioFile
};
Question.prototype.getFeedbackAudioFilePath = function()
{
    var audioFile = this.getFeedbackAudio();
    if (audioFile)
        return this.AssessmentObj.Assessment.Course.getMediaFolderPath() + audioFile;
    return ""
};
Question.prototype.hasAttemptsLeft = function()
{
    if (this.AssessmentObj)
    {
        var attemptsToAnswer = this.AssessmentObj.Assessment.AttemptsToAnswer;
        if (attemptsToAnswer == 0 || this.AnswerCount < attemptsToAnswer)
        {
            return true
        }
    }
    return false
};
Question.prototype.getAnswersArray = function()
{
    return this.Answer.split('~')
};
Question.prototype.getAnswerByOriginalOrder = function(sAnswer)
{
    if (sAnswer)
    {
        var aAnswers = sAnswer.split('~'),
            aOriginal = [];
        for (var i = 0; i < aAnswers.length; i++)
        {
            var choiceIndex = aAnswers[i] - 1;
            if (choiceIndex > -1)
            {
                aOriginal.push(+this.ChoicesOrder[choiceIndex].Id)
            }
            else
            {
                return sAnswer
            }
        }
        aOriginal.sort(function(int1, int2)
        {
            return (int1 - int2)
        });
        return aOriginal.join('~')
    }
    return ""
};
Question.prototype.getFeedback = function()
{
    switch (this.Type)
    {
        case"choice":
            var aAnswers = this.getAnswersArray();
            for (var i = 0; i < aAnswers.length; i++)
            {
                var choiceIndex = aAnswers[i] - 1;
                if (choiceIndex > -1)
                {
                    return this.Feedbacks[this.ChoicesOrder[choiceIndex].Id - 1]
                }
            }
            break;
        default:
            return this.isCorrect() ? this.FeedbackCorrect : this.FeedbackIncorrect
    }
    return new QuestionMedia
};
Question.prototype.getFeedbackAudio = function()
{
    switch (this.Type)
    {
        case"choice":
            var aAnswers = this.getAnswersArray();
            for (var i = 0; i < aAnswers.length; i++)
            {
                var choiceIndex = aAnswers[i] - 1;
                if (choiceIndex > -1)
                {
                    if (this.Feedbacks[this.ChoicesOrder[choiceIndex].Id - 1].AudioFile)
                        return this.Feedbacks[this.ChoicesOrder[choiceIndex].Id - 1].AudioFile
                }
            }
            break;
        default:
            if (this.isCorrect())
            {
                if (this.FeedbackCorrect.AudioFile)
                    return this.FeedbackCorrect.AudioFile
            }
            else
            {
                if (this.FeedbackIncorrect.AudioFile)
                    return this.FeedbackIncorrect.AudioFile
            }
    }
    return ""
};
Question.prototype.score = function()
{
    if (this.Answer != this.PrevAnswer && this.hasAttemptsLeft())
    {
        this.PrevAnswer = this.Answer;
        this.Scored = true;
        this.AnswerCount++;
        this.writeInteraction(this.AssessmentObj.Assessment.Attempts);
        if (this.AssessmentObj.Assessment.FeedbackType == "Immediate")
        {
            this.AssessmentObj.Assessment.updateStatus()
        }
        if (this.isBlocked())
        {
            this.stopLatencyTimer()
        }
    }
    else
    {
        this.Scored = true
    }
};
Question.prototype.retry = function()
{
    this.PrevAnswer = '';
    this.Scored = false
};
Question.prototype.writeInteraction = function(assessmentAttempt)
{
    var sId = this.AssessmentObj.Assessment.Page.id + '.' + this.AssessmentObj.Objective.Id + '.' + this.Id + '.' + assessmentAttempt;
    if (this.AssessmentObj.Assessment.sbaMode != undefined)
    {
        sId += "." + this.AssessmentObj.Assessment.sbaPageId + "." + (this.AssessmentObj.Assessment.sbaSelectedSet + 1)
    }
    var sType = this.Type == "choice-multiple" ? "choice" : this.Type;
    var sResult = this.isCorrect() ? "correct" : "incorrect";
    var sCorrectAnswerByOriginalOrder = this.getAnswerByOriginalOrder(this.CorrectAnswer);
    var sAnswerByOriginalOrder = this.getAnswerByOriginalOrder(this.Answer);
    setInteraction(null, sId, sType, sAnswerByOriginalOrder, sCorrectAnswerByOriginalOrder, sResult, "1", this.Latency, this.Prompt.Text, null);
    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
    var sFullId = "course:" + this.AssessmentObj.Assessment.Course.buildId + ";page:" + this.AssessmentObj.Assessment.Page.id + ";question:" + sId + ";";
    stmt.object = new ADL.XAPIStatement.Activity(sFullId, "question", this.Prompt.Text);
    stmt.object.definition.type = "http://adlnet.gov/expapi/activities/cmi.interaction";
    stmt.object.definition.interactionType = sType;
    stmt.object.definition.correctResponsesPattern = sCorrectAnswerByOriginalOrder;
    var aChoices = [];
    for (var i = 0; i < this.Choices.length; i++)
    {
        var ch = this.Choices[i];
        var newChoice = {};
        newChoice.id = ch.Text;
        newChoice.description = {};
        newChoice.description[this.AssessmentObj.Assessment.Course.language.code] = ch.Text;
        aChoices.push(newChoice)
    }
    stmt.choices = aChoices;
    stmt.result = {
        success: this.isCorrect(), response: sAnswerByOriginalOrder
    };
    ADL.XAPIWrapper.postMessage(stmt)
};
Question.prototype.isCorrect = function()
{
    return this.CorrectAnswer == this.Answer
};
Question.prototype.isAnswered = function()
{
    if (this.AssessmentObj.Assessment.FeedbackType == "Delayed")
    {
        return this.Answer != ""
    }
    return this.Scored
};
Question.prototype.startLatencyTimer = function()
{
    this.ResponseTimeMark = !this.Scored ? +new Date : null
};
Question.prototype.stopLatencyTimer = function()
{
    if (this.ResponseTimeMark)
    {
        this.Latency += +(+new Date - this.ResponseTimeMark);
        this.ResponseTimeMark = null
    }
};
Question.prototype.setCorrectAnswer = function()
{
    var correctChoices = [],
        aLetters = common.getAlphabetLettersArray(),
        stackItems = 0;
    for (var i = 0; i < this.ChoicesOrder.length; i++)
    {
        var choice = this.ChoicesOrder[i];
        if (choice.Answers.length)
        {
            var correctChoice = (i + 1) + "|";
            for (var j = 0; j < choice.Answers.length; j++)
            {
                if (!choice.Answers[j].Distractor)
                    correctChoice += aLetters[stackItems];
                stackItems++
            }
            correctChoices.push(correctChoice)
        }
        else if (choice.Correct)
        {
            correctChoices.push(i + 1)
        }
    }
    this.CorrectAnswer = correctChoices.join('~')
};
Question.prototype.setChoicesOrder = function()
{
    var tempChoices = this.Choices;
    if (this.Randomize)
    {
        switch (this.Type)
        {
            case"choice":
            case"choice-multiple":
                tempChoices.shuffle();
                break
        }
    }
    var distractors = 0;
    for (var i = 0; i < tempChoices.length; i++)
    {
        var choice = tempChoices[i];
        if (choice.Correct)
        {
            this.ChoicesOrder.push(choice)
        }
        else if (this.DistractorsCount > 0)
        {
            if (distractors < this.DistractorsCount || !this.Randomize)
            {
                this.ChoicesOrder.push(choice);
                distractors++
            }
        }
        else
        {
            this.ChoicesOrder.push(choice)
        }
    }
    this.setCorrectAnswer()
};
Question.prototype.getScormChoicesOrder = function()
{
    var scormChoicesOrder = [];
    for (var i = 0; i < this.ChoicesOrder.length; i++)
    {
        var choice = this.ChoicesOrder[i];
        scormChoicesOrder.push(choice.Id)
    }
    return scormChoicesOrder.join("~")
};
Question.prototype.showCorrectAnswer = function()
{
    if (this.AssessmentObj)
    {
        if (this.AssessmentObj.Assessment.Course.settings.ReviewMode)
            return true;
        if (!this.AssessmentObj.Assessment.HideAnswers)
        {
            if (this.Scored && !this.isCorrect())
            {
                if (this.AssessmentObj.Assessment.Status == AssessmentStatus.Failed && !this.AssessmentObj.Assessment.hasAttemptsLeft())
                    return true;
                if (this.AssessmentObj.Assessment.Status == AssessmentStatus.Passed)
                    return true;
                if (!this.hasAttemptsLeft())
                    return true
            }
        }
    }
    return false
};
Question.prototype.isBlocked = function()
{
    if (this.AssessmentObj.Assessment.Status == AssessmentStatus.Failed && !this.AssessmentObj.Assessment.hasAttemptsLeft())
        return true;
    if (this.AssessmentObj.Assessment.Status == AssessmentStatus.Passed)
        return true;
    if (!this.hasAttemptsLeft())
        return true;
    if (this.AssessmentObj.Assessment.TimeLimit > 0 && this.AssessmentObj.Assessment.TimeRemaining == 0)
        return true;
    if (this.Scored && this.isCorrect())
        return true;
    return false
};
function QuestionChoice(question)
{
    this.Question = question;
    this.Id = "";
    this.Correct = false;
    this.Text = "";
    this.Points = 0;
    this.Answers = []
}
function QuestionChoiceAnswer(choice)
{
    this.Choice = choice;
    this.Text = "";
    this.FileName = "";
    this.Distractor = false
}
function QuestionMedia(mediaName)
{
    this.Name = mediaName;
    this.Text = "";
    this.Image = "";
    this.ImageAltText = "";
    this.AudioFile = "";
    this.PageId = ""
}
QuestionMedia.prototype.hasPage = function()
{
    if (this.PageId)
        return true;
    return false
};
function Scenario(objective)
{
    this.Objective = objective;
    this.Title = null;
    this.Type = null;
    this.Text = null;
    this.Image = null;
    this.AudioFile = ""
}
Scenario.prototype.isEmpty = function()
{
    if (this.Title || this.Text)
        return false;
    return true
};
function BranchingArc(graph, tailId, headId, feedbackItem)
{
    this.graph = graph;
    this.tailId = tailId;
    this.headId = headId;
    this.feedbackItem = feedbackItem
}
BranchingArc.prototype.getTailElement = function()
{
    return this.graph.getBranchingPointById(this.tailId)
};
BranchingArc.prototype.getHeadElement = function()
{
    return this.graph.getBranchingPointById(this.headId)
};
BranchingGraphCompletion = {
    FinalAttempt: 0, FirstAttempt: 1
};
BranchingGraphNavigation = {
    ForwardOnly: 0, BiDirectional: 1
};
function BranchingGraph(courseModel, pageModel)
{
    this.course = courseModel;
    this.page = pageModel;
    this.branchingPoints = [];
    this.startPoint = null;
    this.completion = BranchingGraphCompletion.FinalAttempt;
    this.navigation = BranchingGraphNavigation.ForwardOnly;
    this.usePlayerNavigation = false;
    this.maxAttempts = 0;
    this.observer = new Observer;
    this.attempts = [];
    this.currentPath = [];
    this.pathComplete = false;
    this.complete = false;
    this.passed = false;
    this.initialized = false
}
BranchingGraph.prototype.restart = function()
{
    if (this.attempts.length === 0 || this.attempts[this.attempts.length - 1].length > 0)
        this.attempts.push([]);
    for (var i = 0; i < this.branchingPoints.length; i++)
        this.branchingPoints[i].reset();
    this.currentPath = [];
    this.pathComplete = false;
    this.initialized = true;
    this.moveToStart()
};
BranchingGraph.prototype.canRestart = function()
{
    return !this.passed && this.pathComplete && (this.maxAttempts === 0 || this.attempts.length < this.maxAttempts)
};
BranchingGraph.prototype.getBranchingPointById = function(id)
{
    for (var i = 0; i < this.branchingPoints.length; i++)
        if (this.branchingPoints[i].id == id)
            return this.branchingPoints[i];
    return null
};
BranchingGraph.prototype.getCurrentAttempt = function()
{
    return this.attempts.length === 0 ? null : this.attempts[this.attempts.length - 1]
};
BranchingGraph.prototype.getLatestBranchAttempt = function()
{
    var currentAttempt = this.getCurrentAttempt();
    return currentAttempt ? currentAttempt[currentAttempt.length - 1] : null
};
BranchingGraph.prototype.appendBranchAttempt = function(branchAttempt)
{
    if (this.attempts.length === 0)
        this.attempts.push([]);
    this.attempts[this.attempts.length - 1].push(branchAttempt)
};
BranchingGraph.prototype.getCurrentLocation = function()
{
    return this.currentPath.length > 0 ? this.currentPath[this.currentPath.length - 1] : null
};
BranchingGraph.prototype.getPreviousLocation = function()
{
    return this.currentPath.length > 1 ? this.currentPath[this.currentPath.length - 2] : null
};
BranchingGraph.prototype.getCurrentBranchingPointLocation = function()
{
    var currentLocation = this.getCurrentLocation();
    return currentLocation ? currentLocation.location : BranchingPointLocation.None
};
BranchingGraph.prototype.getDisplayedPageId = function()
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation)
    {
        if (currentLocation.location === BranchingPointLocation.Content)
            return currentLocation.contentPageId;
        else if (currentLocation.location === BranchingPointLocation.Feedback)
        {
            var currentFeedback = currentLocation.getCurrentFeedback();
            return currentFeedback ? currentFeedback.getFeedbackPageId : ""
        }
    }
    return ""
};
BranchingGraph.prototype.retryQuestion = function()
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation && currentLocation.hasQuestion() && currentLocation.canRetry())
    {
        currentLocation.retry();
        this.observer.fire("locationChanged")
    }
};
BranchingGraph.prototype.canMoveForward = function()
{
    var currentLocation = this.getCurrentLocation();
    return currentLocation ? currentLocation.canMoveForward() : (this.startPoint !== null)
};
BranchingGraph.prototype.canMoveBackward = function()
{
    var currentLocation = this.getCurrentLocation();
    return (currentLocation !== null) && (currentLocation.canMoveBackward() || (this.currentPath.length > 1 && this.navigation === BranchingGraphNavigation.BiDirectional))
};
BranchingGraph.prototype.moveToStart = function()
{
    if (this.startPoint)
    {
        this.currentPath = [this.startPoint];
        this.startPoint.moveToStart();
        this.observer.fire("locationChanged")
    }
};
BranchingGraph.prototype.moveForward = function()
{
    var currentLocation = this.getCurrentLocation();
    if (!currentLocation)
    {
        this.moveToStart();
        this.observer.fire("locationChanged")
    }
    else if (currentLocation.canMoveForward())
    {
        currentLocation.moveForward();
        this.pathComplete || this.checkCompletion();
        this.observer.fire("locationChanged")
    }
};
BranchingGraph.prototype.moveBackward = function()
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation)
    {
        if (currentLocation.canMoveBackward())
        {
            currentLocation.moveBackward();
            this.observer.fire("locationChanged")
        }
        else if (this.currentPath.length > 1)
        {
            this.currentPath.pop();
            this.getCurrentLocation().moveToEnd();
            this.observer.fire("locationChanged")
        }
    }
};
BranchingGraph.prototype.checkCompletion = function()
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation && currentLocation.interactionComplete() && !currentLocation.canMoveForward())
    {
        this.pathComplete = true;
        var setPass = !this.passed && currentLocation.isCompletionPoint;
        var setComplete = !this.complete && (currentLocation.isCompletionPoint || (this.completion === BranchingGraphCompletion.FirstAttempt) || (this.maxAttempts > 0 && this.attempts.length >= this.maxAttempts));
        setPass && (this.passed = true);
        if (setComplete)
        {
            this.complete = true;
            this.page.setComplete()
        }
        this.observer.fire("branchingPathCompleted");
        setComplete && this.observer.fire("branchingCompleted");
        setPass && this.observer.fire("branchingPassed")
    }
};
BranchingGraph.prototype.hasSelectedFeedbackPage = function()
{
    var currentLocation = this.getCurrentLocation();
    return currentLocation ? currentLocation.hasSelectedFeedbackPage() : false
};
BranchingGraph.prototype.selectFeedbackPage = function(id)
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation)
    {
        if (currentLocation.selectFeedbackPage(id))
            this.observer.fire("selectedFeedbackPageChanged")
    }
};
BranchingGraph.prototype.clearSelectedFeedbackPage = function()
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation && currentLocation.hasSelectedFeedbackPage())
    {
        currentLocation.clearSelectedFeedbackPage();
        this.observer.fire("selectedFeedbackPageChanged")
    }
};
BranchingGraph.prototype.stopCurrentLocationLatencyTimer = function()
{
    var currentLocation = this.getCurrentLocation();
    if (currentLocation)
        currentLocation.stopLatencyTimer()
};
BranchingGraph.prototype.unload = function()
{
    this.stopCurrentLocationLatencyTimer();
    this.saveScormData()
};
BranchingGraph.prototype.serializeStateData = function()
{
    var graphData = [];
    graphData.push(this.passed ? "t" : "f");
    graphData.push(this.complete ? "t" : "f");
    graphData.push(this.pathComplete ? "t" : "f");
    if (this.attempts.length === 0)
        graphData.push("XX");
    else
    {
        for (var i = 0, attemptsData = []; i < this.attempts.length; i++)
        {
            if (this.attempts[i].length === 0)
                attemptsData.push("X");
            else
            {
                for (var j = 0, attemptData = []; j < this.attempts[i].length; j++)
                {
                    attemptData.push(this.attempts[i][j].serializeStateData())
                }
                attemptsData.push(attemptData.join("::"))
            }
        }
        graphData.push(attemptsData.join(":::"))
    }
    if (this.branchingPoints.length === 0)
        graphData.push("X");
    else
    {
        for (var i = 0, pointData = []; i < this.branchingPoints.length; i++)
        {
            pointData.push(this.branchingPoints[i].id);
            pointData.push(this.branchingPoints[i].serializeStateData())
        }
        graphData.push(pointData.join("::"))
    }
    if (this.currentPath.length === 0)
        graphData.push("X");
    else
    {
        for (var i = 0, pathData = []; i < this.currentPath.length; i++)
        {
            pathData.push(this.currentPath[i].id)
        }
        graphData.push(pathData.join(":"))
    }
    return graphData.join("::::")
};
BranchingGraph.prototype.deserializeStateData = function(data)
{
    var graphData = data.split("::::");
    if (graphData.length !== 6)
        return;
    this.passed = graphData[0] === "t";
    this.complete = graphData[1] === "t";
    this.pathComplete = graphData[2] === "t";
    this.attempts = [];
    if (graphData[3] !== "XX")
    {
        var attemptsData = graphData[3].split(":::");
        for (var i = 0; i < attemptsData.length; i++)
        {
            if (attemptsData[i] === "X")
                this.attempts.push([]);
            else
            {
                var attemptData = attemptsData[i].split("::");
                for (var j = 0, attempt = []; j < attemptData.length; j++)
                {
                    var branchingPointAttempt = new BranchingPointAttempt(this, null, "", [], "", 0);
                    branchingPointAttempt.deserializeStateData(attemptData[j]);
                    attempt.push(branchingPointAttempt)
                }
                this.attempts.push(attempt)
            }
        }
    }
    if (graphData[4] !== "X")
    {
        var pointData = graphData[4].split("::");
        for (var i = 0; i < pointData.length - 1; i = i + 2)
        {
            var branchingPoint = this.getBranchingPointById(pointData[i]);
            branchingPoint && branchingPoint.deserializeStateData(pointData[i + 1])
        }
    }
    this.currentPath = [];
    if (graphData[5] !== "X")
    {
        var pathData = graphData[5].split(":");
        for (var i = 0; i < pathData.length; i++)
        {
            var branchingPoint = this.getBranchingPointById(pathData[i]);
            branchingPoint && this.currentPath.push(branchingPoint)
        }
    }
    this.initialized = true
};
BranchingGraph.prototype.saveScormData = function()
{
    this.course.scormState.setState(this.page.id, this.serializeStateData());
    this.course.scormState.save()
};
BranchingGraph.prototype.loadScormData = function()
{
    var scormData = this.course.scormState.getState(this.page.id);
    scormData && this.deserializeStateData(scormData)
};
BranchingGraph.prototype.resetScormData = function()
{
    this.course.scormState.setState(this.page.id, "")
};
BranchingGraph.prototype.getTotalPoints = function()
{
    var totalPoints = 0;
    for (var i = 0; i < this.currentPath.length; i++)
    {
        var currentPath = this.currentPath[i];
        if (currentPath.hasContent())
        {
            var page = this.course.getPageById(currentPath.contentPageId);
            if (page)
            {
                totalPoints += page.points
            }
        }
        if (currentPath.hasQuestion() && currentPath.isAnswered())
        {
            var answersArray = currentPath.getAnswersArray();
            for (var j = 0; j < answersArray.length; j++)
            {
                var choiceIndex = answersArray[j] - 1;
                var choice = currentPath.choicesOrder[choiceIndex];
                if (choice)
                    totalPoints += choice.Points
            }
        }
    }
    return totalPoints
};
BranchingPointLocation = {
    None: -1, Content: 0, Question: 1, Feedback: 2, FeedbackContent: 3, FeedbackAlternatives: 4
};
BranchingPointShowAlternativeResults = {
    Never: 0, Always: 1, OnPass: 2
};
BranchingPointFeedbackContentPosition = {
    Popup: 0, BeforeFeedback: 1, AfterFeedback: 2, SkipFeedback: 3
};
function BranchingPoint(graph)
{
    this.id = "";
    this.graph = graph;
    this.contentPageId = "";
    this.question = null;
    this.isCompletionPoint = false;
    this.mustPass = false;
    this.showAlternativeResults = BranchingPointShowAlternativeResults.Never;
    this.mustCompleteContent = false;
    this.mustCompleteFeedback = false;
    this.feedbackContentPosition = BranchingPointFeedbackContentPosition.Popup;
    this.forwardArcs = [];
    this.contentViewed = false;
    this.contentCompleted = false;
    this.choicesOrder = [];
    this.correctAnswer = "";
    this.previousAttempt = null;
    this.currentAttempt = null;
    this.currentAnswer = null;
    this.selectedFeedbackPageId = "";
    this.activeArc = null;
    this.latency = 0;
    this.responseTimeMark = null;
    this.location = BranchingPointLocation.None;
    this.ui = null
}
BranchingPoint.prototype.reset = function()
{
    this.contentViewed = false;
    this.contentCompleted = false;
    this.previousAttempt = null;
    this.currentAttempt = null;
    this.currentAnswer = null;
    this.firstAttemptCorrect = false;
    this.selectedFeedbackPageId = "";
    if (this.hasQuestion())
    {
        this.setChoicesOrder();
        this.activeArc = null
    }
    this.latency = 0;
    this.responseTimeMark = null;
    this.location = BranchingPointLocation.None
};
BranchingPoint.prototype.moveToStart = function()
{
    if (this.hasContent())
        this.location = BranchingPointLocation.Content;
    else if (this.hasQuestion())
        this.location = BranchingPointLocation.Question;
    else
        this.location = BranchingPointLocation.None
};
BranchingPoint.prototype.moveToEnd = function()
{
    if (this.isScored())
    {
        if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.SkipFeedback)
        {
            if (this.currentAttemptHasFeedbackContent())
                this.location = (this.canViewAlternativeFeedback() && this.hasAlternativeFeedbackContent()) ? BranchingPointLocation.FeedbackAlternatives : BranchingPointLocation.FeedbackContent;
            else
                this.location = (this.canViewAlternativeFeedback() && this.hasAlternativeFeedbackContent()) ? BranchingPointLocation.Feedback : BranchingPointLocation.Question
        }
        else if (this.feedbackContentPosition !== BranchingPointFeedbackContentPosition.AfterFeedback || !this.currentAttemptHasFeedbackContent())
            this.location = BranchingPointLocation.Feedback;
        else if (this.canViewAlternativeFeedback() && this.hasAlternativeFeedbackContent())
            this.location = BranchingPointLocation.FeedbackAlternatives;
        else
            this.location = BranchingPointLocation.FeedbackContent
    }
    else if (this.hasQuestion())
        this.location = BranchingPointLocation.Question;
    else if (this.hasContent())
        this.location = BranchingPointLocation.Content;
    else
        this.location = BranchingPointLocation.None
};
BranchingPoint.prototype.canMoveForward = function()
{
    switch (this.location)
    {
        case BranchingPointLocation.None:
            return this.hasContent() || this.hasQuestion();
        case BranchingPointLocation.Content:
            return (this.hasQuestion() || this.hasNextBranch()) && !this.mustFinishContent();
        case BranchingPointLocation.Question:
            return this.currentAnswer !== null;
        case BranchingPointLocation.Feedback:
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.Popup)
                return this.hasNextBranch() && !this.mustFinishQuestion() && !this.mustFinishFeedback();
            else if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.BeforeFeedback || this.feedbackContentPosition === BranchingPointFeedbackContentPosition.SkipFeedback)
                return this.mustFinishQuestion() || this.hasNextBranch();
            return this.currentAttemptHasFeedbackContent() || this.mustFinishQuestion() || this.hasNextBranch();
        case BranchingPointLocation.FeedbackContent:
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.BeforeFeedback)
                return !this.mustFinishFeedback();
            return this.mustFinishQuestion() || (this.hasAlternativeFeedbackContent() && this.canViewAlternativeFeedback()) || this.hasNextBranch();
        case BranchingPointLocation.FeedbackAlternatives:
            return this.hasNextBranch()
    }
};
BranchingPoint.prototype.canMoveBackward = function()
{
    switch (this.location)
    {
        case BranchingPointLocation.None:
            return false;
        case BranchingPointLocation.Content:
            return false;
        case BranchingPointLocation.Question:
            return this.hasContent();
        case BranchingPointLocation.Feedback:
            return true;
        case BranchingPointLocation.FeedbackContent:
            return true;
        case BranchingPointLocation.FeedbackAlternatives:
            return true
    }
};
BranchingPoint.prototype.moveForward = function()
{
    if (!this.canMoveForward())
        return;
    switch (this.location)
    {
        case BranchingPointLocation.None:
            if (this.hasContent())
                this.location = BranchingPointLocation.Content;
            else
                this.location = BranchingPointLocation.Question;
            break;
        case BranchingPointLocation.Content:
            if (this.hasQuestion())
                this.location = BranchingPointLocation.Question;
            else
            {
                var newLocation = this.activeArc.getHeadElement();
                if (newLocation)
                {
                    this.graph.currentPath.push(newLocation);
                    newLocation.moveToStart()
                }
            }
            break;
        case BranchingPointLocation.Question:
            if (!this.isScored())
                this.score();
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.SkipFeedback)
            {
                if (this.currentAttemptHasFeedbackContent())
                    this.location = BranchingPointLocation.FeedbackContent;
                else if (this.mustFinishQuestion() || (this.hasAlternativeFeedbackContent() && this.canViewAlternativeFeedback()))
                    this.location = BranchingPointLocation.Feedback;
                else
                {
                    var newLocation = this.activeArc.getHeadElement();
                    if (newLocation)
                    {
                        this.graph.currentPath.push(newLocation);
                        newLocation.moveToStart()
                    }
                }
            }
            else
            {
                if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.BeforeFeedback && this.currentAttemptHasFeedbackContent())
                    this.location = BranchingPointLocation.FeedbackContent;
                else
                    this.location = BranchingPointLocation.Feedback
            }
            break;
        case BranchingPointLocation.Feedback:
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.AfterFeedback && this.currentAttemptHasFeedbackContent())
                this.location = BranchingPointLocation.FeedbackContent;
            else if (this.mustFinishQuestion())
                this.retry();
            else
            {
                var newLocation = this.activeArc.getHeadElement();
                if (newLocation)
                {
                    this.graph.currentPath.push(newLocation);
                    newLocation.moveToStart()
                }
            }
            break;
        case BranchingPointLocation.FeedbackContent:
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.BeforeFeedback)
                this.location = BranchingPointLocation.Feedback;
            else if (this.mustFinishQuestion())
                this.retry();
            else if (this.hasAlternativeFeedbackContent() && this.canViewAlternativeFeedback())
                this.location = BranchingPointLocation.FeedbackAlternatives;
            else
            {
                var newLocation = this.activeArc.getHeadElement();
                if (newLocation)
                {
                    this.graph.currentPath.push(newLocation);
                    newLocation.moveToStart()
                }
            }
            break;
        case BranchingPointLocation.FeedbackAlternatives:
            var newLocation = this.activeArc.getHeadElement();
            if (newLocation)
            {
                this.graph.currentPath.push(newLocation);
                newLocation.moveToStart()
            }
            break
    }
};
BranchingPoint.prototype.moveBackward = function()
{
    if (!this.canMoveForward)
        return;
    switch (this.location)
    {
        case BranchingPointLocation.Question:
            this.location = BranchingPointLocation.Content;
            break;
        case BranchingPointLocation.Feedback:
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.BeforeFeedback && this.currentAttemptHasFeedbackContent())
                this.location = BranchingPointLocation.FeedbackContent;
            else
                this.location = BranchingPointLocation.Question;
            break;
        case BranchingPointLocation.FeedbackContent:
            if (this.feedbackContentPosition === BranchingPointFeedbackContentPosition.AfterFeedback)
                this.location = BranchingPointLocation.Feedback;
            else
                this.location = BranchingPointLocation.Question;
            break;
        case BranchingPointLocation.FeedbackAlternatives:
            this.location = BranchingPointLocation.FeedbackContent;
            break
    }
};
BranchingPoint.prototype.hasContent = function()
{
    return this.contentPageId !== ""
};
BranchingPoint.prototype.hasQuestion = function()
{
    return this.question != null
};
BranchingPoint.prototype.isTerminal = function()
{
    return !this.hasQuestion() && (this.activeArc === null || this.activeArc.getHeadElement() === null)
};
BranchingPoint.prototype.isDeadEnd = function()
{
    return this.isTerminal() && !this.isCompletionPoint
};
BranchingPoint.prototype.mustFinishContent = function()
{
    return !this.contentViewed || this.mustCompleteContent && !this.contentCompleted
};
BranchingPoint.prototype.mustFinishQuestion = function()
{
    return this.mustPass ? !this.isCorrect() : !this.isScored()
};
BranchingPoint.prototype.mustFinishFeedback = function()
{
    return this.currentAttempt && this.currentAttemptHasFeedbackContent() && (!this.currentAttempt.contentViewed || this.mustCompleteFeedback && !this.currentAttempt.contentCompleted)
};
BranchingPoint.prototype.hasNextBranch = function()
{
    return this.activeArc !== null && this.activeArc.getHeadElement() !== null
};
BranchingPoint.prototype.getPromptAudioFilePath = function()
{
    return this.graph.course.getMediaFolderPath() + this.question.Prompt.AudioFile
};
BranchingPoint.prototype.setCorrectAnswer = function()
{
    var correctChoices = [];
    for (var i = 0; i < this.choicesOrder.length; i++)
    {
        if (this.choicesOrder[i].Correct)
        {
            correctChoices.push(i + 1)
        }
    }
    this.correctAnswer = correctChoices.join('~')
};
BranchingPoint.prototype.setChoicesOrder = function()
{
    this.choicesOrder = [];
    var tempChoices = this.question.Choices.slice(0);
    switch (this.question.Type)
    {
        case"choice":
        case"choice-multiple":
            if (this.question.Randomize)
                tempChoices.shuffle();
            break
    }
    var distractors = 0,
        correctChoices = [];
    for (var i = 0; i < tempChoices.length; i++)
    {
        var choice = tempChoices[i];
        if (choice.Correct)
        {
            this.choicesOrder.push(choice);
            correctChoices.push(this.choicesOrder.length)
        }
        else if (this.question.DistractorsCount > 0)
        {
            if (distractors < this.question.DistractorsCount || !this.question.Randomize)
            {
                this.choicesOrder.push(choice);
                distractors++
            }
        }
        else
        {
            this.choicesOrder.push(choice)
        }
    }
    this.correctAnswer = correctChoices.join('~')
};
BranchingPoint.prototype.isScored = function()
{
    return this.currentAttempt !== null
};
BranchingPoint.prototype.isAnswered = function()
{
    return this.getCurrentAnswer() !== null
};
BranchingPoint.prototype.getAnswersArray = function()
{
    var currentAnswer = this.getCurrentAnswer();
    return currentAnswer ? currentAnswer.split('~') : []
};
BranchingPoint.prototype.canRetry = function()
{
    return this.isScored() && !this.isCorrect() && this.mustPass && (this.feedbackViewed() && (!this.mustCompleteFeedback || this.feedbackCompleted()) || !this.currentAttemptHasFeedbackContent())
};
BranchingPoint.prototype.interactionComplete = function()
{
    var contentInteractionComplete = !this.hasContent() || this.contentViewed && (!this.mustCompleteContent || this.contentCompleted);
    var questionInteractionComplete = !this.hasQuestion() || this.isScored() && (!this.mustPass || this.isCorrect()) && (this.currentAttempt.contentViewed && (!this.mustCompleteFeedback || this.currentAttempt.contentComplete) || !this.currentAttemptHasFeedbackContent());
    return contentInteractionComplete && questionInteractionComplete
};
BranchingPoint.prototype.retry = function()
{
    this.previousAttempt = this.currentAttempt;
    this.currentAttempt = null;
    this.currentAnswer = null;
    this.selectedFeedbackPageId = "";
    this.Latency = 0;
    this.location = BranchingPointLocation.Question
};
BranchingPoint.prototype.isCorrect = function()
{
    return this.isScored() && this.currentAttempt.isCorrect()
};
BranchingPoint.prototype.selectFeedbackPage = function(id)
{
    if (!id && this.isScored())
    {
        var pageId = this.currentAttempt.getFeedbackPageId();
        if (pageId)
        {
            this.selectedFeedbackPageId = pageId;
            return true
        }
    }
    else if (id)
    {
        switch (this.question.Type)
        {
            case"choice":
                for (var i = 0; i < this.question.Feedbacks.length; i++)
                    if (id == this.question.Feedbacks[i].PageId)
                    {
                        this.selectedFeedbackPageId = id;
                        return true
                    }
                break;
            case"true-false":
            case"choice-multiple":
                if (id === this.question.FeedbackCorrect.PageId || id === this.question.FeedbackIncorrect.PageId)
                {
                    this.selectedFeedbackPageId = id;
                    return true
                }
                break
        }
    }
    return false
};
BranchingPoint.prototype.setContentViewed = function()
{
    this.contentViewed = true;
    this.graph.checkCompletion()
};
BranchingPoint.prototype.setContentCompleted = function()
{
    this.contentCompleted = true;
    this.graph.checkCompletion()
};
BranchingPoint.prototype.setFeedbackViewed = function()
{
    this.currentAttempt && (this.currentAttempt.contentViewed = true);
    this.graph.checkCompletion()
};
BranchingPoint.prototype.setFeedbackCompleted = function()
{
    this.currentAttempt && (this.currentAttempt.contentCompleted = true);
    this.graph.checkCompletion()
};
BranchingPoint.prototype.feedbackCompleted = function()
{
    return this.currentAttempt && this.currentAttempt.contentCompleted
};
BranchingPoint.prototype.feedbackViewed = function()
{
    return this.currentAttempt && this.currentAttempt.contentViewed
};
BranchingPoint.prototype.clearSelectedFeedbackPage = function()
{
    this.selectedFeedbackPageId = ""
};
BranchingPoint.prototype.hasSelectedFeedbackPage = function()
{
    return this.selectedFeedbackPageId !== ""
};
BranchingPoint.prototype.currentAttemptHasFeedbackContent = function()
{
    return this.isScored() && this.currentAttempt.getFeedbackPageId() !== ""
};
BranchingPoint.prototype.selectedFeedbackPageIsAlternative = function()
{
    return this.hasSelectedFeedbackPage() && (!this.isScored() || this.selectedFeedbackPageId !== this.currentAttempt.getFeedbackPageId())
};
BranchingPoint.prototype.canViewAlternativeFeedback = function()
{
    return this.isScored() && !this.mustFinishFeedback() && !this.mustFinishQuestion() && (this.showAlternativeResults === BranchingPointShowAlternativeResults.Always || (this.showAlternativeResults === BranchingPointShowAlternativeResults.OnPass && this.isCorrect()))
};
BranchingPoint.prototype.hasAlternativeFeedbackContent = function()
{
    return this.getAlternativeFeedbackPageIds().length > 0
};
BranchingPoint.prototype.getAlternativeFeedbackPageIds = function()
{
    var ids = [];
    var currentAttemptPageId = this.isScored() ? this.currentAttempt.getFeedbackPageId() : "";
    switch (this.question.Type)
    {
        case"choice":
            for (var i = 0, pageId = ""; i < this.choicesOrder.length; i++)
            {
                pageId = this.question.Feedbacks[this.choicesOrder[i].Id - 1].PageId;
                if (pageId && pageId != currentAttemptPageId)
                {
                    var isAdded = false;
                    for (var j = 0; j < ids; j++)
                    {
                        if (ids[j] == pageId)
                        {
                            isAdded = true;
                            break
                        }
                    }
                    !isAdded && ids.push(pageId)
                }
            }
            break;
        case"true-false":
        case"choice-multiple":
            if (this.isCorrect())
                this.question.FeedbackIncorrect.PageId && (this.question.FeedbackIncorrect.PageId != currentAttemptPageId) && ids.push(this.question.FeedbackIncorrect.PageId);
            else if (this.isScored())
                this.question.FeedbackCorrect.PageId && (this.question.FeedbackCorrect.PageId != currentAttemptPageId) && ids.push(this.question.FeedbackCorrect.PageId);
            else
            {
                this.question.FeedbackCorrect.PageId && ids.push(this.question.FeedbackCorrect.PageId);
                this.question.FeedbackIncorrect.PageId && (this.question.FeedbackIncorrect.PageId != this.question.FeedbackCorrect.PageId) && ids.push(this.question.FeedbackIncorrect.PageId)
            }
            break
    }
    return ids
};
BranchingPoint.prototype.startLatencyTimer = function()
{
    this.responseTimeMark = !this.isScored() ? +new Date : null
};
BranchingPoint.prototype.stopLatencyTimer = function()
{
    if (this.responseTimeMark)
    {
        this.latency += +(+new Date - this.responseTimeMark);
        this.responseTimeMark = null
    }
};
BranchingPoint.prototype.getPreviousAnswer = function()
{
    return this.previousAttempt ? this.previousAttempt.answer : null
};
BranchingPoint.prototype.getCurrentAnswer = function()
{
    return this.currentAttempt ? this.currentAttempt.answer : this.currentAnswer
};
BranchingPoint.prototype.score = function()
{
    if (!this.isScored() && this.currentAnswer)
    {
        this.stopLatencyTimer();
        if (this.currentAnswer !== this.getPreviousAnswer())
        {
            this.currentAttempt = new BranchingPointAttempt(this.graph, this, this.currentAnswer, this.choicesOrder, this.correctAnswer, this.latency);
            if (this.previousAttempt !== null)
                this.currentAttempt.attemptNumber = this.previousAttempt.attemptNumber + 1;
            else
                this.activeArc = this.currentAttempt.getForwardArc();
            this.graph.appendBranchAttempt(this.currentAttempt)
        }
        else
        {
            this.currentAttempt = this.previousAttempt
        }
    }
};
BranchingPoint.prototype.serializeStateData = function()
{
    var pointData = [];
    pointData.push(this.location);
    pointData.push(this.contentViewed ? "t" : "f");
    pointData.push(this.contentCompleted ? "t" : "f");
    pointData.push(this.latency);
    pointData.push(this.currentAnswer || "X");
    pointData.push(this.isScored() ? "t" : "f");
    if (this.hasQuestion() && this.choicesOrder.length > 0)
    {
        for (var i = 0, choicesData = []; i < this.choicesOrder.length; i++)
        {
            choicesData.push(this.choicesOrder[i].Id)
        }
        pointData.push(choicesData.join("~"))
    }
    else
        pointData.push("X");
    return pointData.join(":")
};
BranchingPoint.prototype.deserializeStateData = function(data)
{
    var pointData = data.split(":");
    if (pointData.length !== 7)
        return;
    this.location = parseInt(pointData[0]);
    (this.location > 4 || this.location < 0) && (this.location = BranchingPointLocation.None);
    this.contentViewed = pointData[1] === "t";
    this.contentCompleted = pointData[2] === "t";
    this.latency = +pointData[3] || 0;
    this.currentAnswer = pointData[4] === "X" ? null : pointData[4];
    this.currentAttempt = null;
    this.previousAttempt = null;
    var latestGraphAttempt = this.graph.getCurrentAttempt();
    if (pointData[5] !== "t")
    {
        for (var i = latestGraphAttempt.length - 1; i >= 0; i--)
        {
            if (latestGraphAttempt[i].branchingPoint === this)
            {
                this.previousAttempt = latestGraphAttempt[i];
                break
            }
        }
    }
    else
    {
        for (var i = latestGraphAttempt.length - 1; i >= 0; i--)
        {
            if (latestGraphAttempt[i].branchingPoint === this)
            {
                if (this.currentAttempt === null)
                    this.currentAttempt = latestGraphAttempt[i];
                else
                {
                    this.previousAttempt = latestGraphAttempt[i];
                    break
                }
            }
        }
    }
    if (this.currentAttempt || this.previousAttempt)
    {
        for (var i = 0; i < latestGraphAttempt.length; i++)
        {
            if (latestGraphAttempt[i].branchingPoint === this)
            {
                this.activeArc = latestGraphAttempt[i].getForwardArc();
                break
            }
        }
    }
    if (this.hasQuestion())
    {
        var choicesData = pointData[6].split("~");
        var questionChoices = this.question.Choices.slice(0);
        this.choicesOrder = [];
        for (var i = 0; i < choicesData.length; i++)
        {
            for (var j = 0; j < questionChoices.length; j++)
            {
                if (questionChoices[j].Id == choicesData[i])
                {
                    this.choicesOrder.push(questionChoices.splice(j, 1)[0]);
                    break
                }
            }
            if (this.choicesOrder.length <= i)
                break
        }
        this.setCorrectAnswer()
    }
};
function BranchingPointAttempt(branchingGraph, branchingPoint, answer, choicesOrder, correctAnswer, latency)
{
    this.graph = branchingGraph;
    this.branchingPoint = branchingPoint;
    this.answer = answer;
    this.choicesOrder = choicesOrder;
    this.correctAnswer = correctAnswer;
    this.latency = latency;
    this.attemptNumber = 1;
    this.contentViewed = false;
    this.contentCompleted = false
}
BranchingPointAttempt.prototype.getFeedbackAudioFilePath = function()
{
    var audioFile = this.getFeedbackAudio();
    if (audioFile)
    {
        return this.branchingPoint.graph.course.getMediaFolderPath() + audioFile
    }
    return ""
};
BranchingPointAttempt.prototype.getAnswersArray = function()
{
    return this.answer.split('~')
};
BranchingPointAttempt.prototype.getFeedback = function()
{
    switch (this.branchingPoint.question.Type)
    {
        case"choice":
            var aAnswers = this.getAnswersArray();
            for (var i = 0; i < aAnswers.length; i++)
            {
                var choiceIndex = aAnswers[i] - 1;
                if (choiceIndex > -1)
                {
                    return this.branchingPoint.question.Feedbacks[this.choicesOrder[choiceIndex].Id - 1]
                }
            }
            break;
        case"true-false":
        case"choice-multiple":
            return this.isCorrect() ? this.branchingPoint.question.FeedbackCorrect : this.branchingPoint.question.FeedbackIncorrect
    }
    return new QuestionMedia
};
BranchingPointAttempt.prototype.getFeedbackAudio = function()
{
    switch (this.branchingPoint.question.Type)
    {
        case"choice":
            var aAnswers = this.getAnswersArray();
            for (var i = 0; i < aAnswers.length; i++)
            {
                var choiceIndex = aAnswers[i] - 1;
                if (choiceIndex > -1)
                {
                    if (this.branchingPoint.question.Feedbacks[this.choicesOrder[choiceIndex].Id - 1].AudioFile)
                        return this.branchingPoint.question.Feedbacks[this.choicesOrder[choiceIndex].Id - 1].AudioFile
                }
            }
            break;
        case"true-false":
        case"choice-multiple":
            if (this.isCorrect())
            {
                if (this.branchingPoint.question.FeedbackCorrect.AudioFile)
                    return this.branchingPoint.question.FeedbackCorrect.AudioFile
            }
            else
            {
                if (this.branchingPoint.question.FeedbackIncorrect.AudioFile)
                    return this.branchingPoint.question.FeedbackIncorrect.AudioFile
            }
    }
    return ""
};
BranchingPointAttempt.prototype.getFeedbackPageId = function()
{
    switch (this.branchingPoint.question.Type)
    {
        case"choice":
            var aAnswers = this.getAnswersArray();
            for (var i = 0; i < aAnswers.length; i++)
            {
                var choiceIndex = aAnswers[i] - 1;
                if (choiceIndex > -1)
                {
                    if (this.branchingPoint.question.Feedbacks[this.choicesOrder[choiceIndex].Id - 1].PageId)
                        return this.branchingPoint.question.Feedbacks[this.choicesOrder[choiceIndex].Id - 1].PageId
                }
            }
            break;
        case"true-false":
        case"choice-multiple":
            if (this.isCorrect())
            {
                if (this.branchingPoint.question.FeedbackCorrect.PageId)
                    return this.branchingPoint.question.FeedbackCorrect.PageId
            }
            else
            {
                if (this.branchingPoint.question.FeedbackIncorrect.PageId)
                    return this.branchingPoint.question.FeedbackIncorrect.PageId
            }
    }
    return ""
};
BranchingPointAttempt.prototype.isCorrect = function()
{
    return this.correctAnswer === this.answer
};
BranchingPointAttempt.prototype.getForwardArc = function()
{
    var feedbackItem = this.getFeedback();
    for (var i = 0; i < this.branchingPoint.forwardArcs.length; i++)
        if (this.branchingPoint.forwardArcs[i].feedbackItem === feedbackItem)
            return this.branchingPoint.forwardArcs[i];
    return null
};
BranchingPointAttempt.prototype.hasContent = function()
{
    return this.getFeedbackPageId() !== ""
};
BranchingPointAttempt.prototype.setCorrectAnswer = function()
{
    var correctChoices = [];
    for (var i = 0; i < this.choicesOrder.length; i++)
    {
        if (this.choicesOrder[i].Correct)
        {
            correctChoices.push(i + 1)
        }
    }
    this.correctAnswer = correctChoices.join('~')
};
BranchingPointAttempt.prototype.serializeStateData = function()
{
    var attemptData = [];
    attemptData.push(this.branchingPoint ? this.branchingPoint.id : "X");
    attemptData.push(this.attemptNumber);
    attemptData.push(this.latency);
    attemptData.push(this.contentViewed ? "t" : "f");
    attemptData.push(this.contentCompleted ? "t" : "f");
    attemptData.push(this.answer);
    if (this.choicesOrder.length > 0)
    {
        for (var i = 0, choicesData = []; i < this.choicesOrder.length; i++)
        {
            choicesData.push(this.choicesOrder[i].Id)
        }
        attemptData.push(choicesData.join("~"))
    }
    else
    {
        attemptData.push("X")
    }
    return attemptData.join(":")
};
BranchingPointAttempt.prototype.deserializeStateData = function(data)
{
    var attemptData = data.split(":");
    if (attemptData.length !== 7)
        return;
    var branchingPoint = this.graph.getBranchingPointById(attemptData[0]);
    if (!branchingPoint || !branchingPoint.question)
        return;
    this.branchingPoint = branchingPoint;
    this.attemptNumber = +attemptData[1] || 1;
    this.latency = +attemptData[2] || 0;
    this.contentViewed = attemptData[3] === "t";
    this.contentCompleted = attemptData[4] === "t";
    this.answer = attemptData[5];
    this.choicesOrder = [];
    if (attemptData[6] !== "X")
    {
        var choicesData = attemptData[6].split("~");
        var questionChoices = branchingPoint.question.Choices.slice(0);
        for (var i = 0; i < choicesData.length; i++)
        {
            for (var j = 0; j < questionChoices.length; j++)
            {
                if (questionChoices[j].Id == choicesData[i])
                {
                    this.choicesOrder.push(questionChoices.splice(j, 1)[0]);
                    break
                }
            }
            if (this.choicesOrder.length <= i)
                break
        }
        this.setCorrectAnswer()
    }
};
function AudioPlayerView(courseController, id)
{
    this.cc = courseController;
    var rootSelector = $('<div />', {
            'class': 'AudioPlayer', id: id
        }).append($('<div role="slider" class="AudioPlayerProgressSlider accent" id="' + id + 'ProgressSlider"></div>')).append($('<div class="AudioPlayerCaptions" id="' + id + 'Captions" aria-hidden="true"></div>')).append($('<a class="AudioPlayerPlayPauseButton" id="' + id + 'PlayPauseButton" title="Play" href="#" onclick="return false;"></a>')).append($('<a class="AudioPlayerVolumeButton" id="' + id + 'VolumeButton" role="button" aria-haspopup="true" aria-pressed="false" aria-live="polite" href="#" onclick="return false;"></a>')).append($('<div class="AudioPlayerVolumeSliderContainer"  id="' + id + 'VolumeSliderContainer" style="display:none;"><div class="AudioPlayerVolumeSlider" id="' + id + 'VolumeSlider"></div></div>')).append($('<div class="audioSpeed"><a class="AudioPlayerSpeedButton" id="' + id + 'AudioSpeedButton" role="button" aria-haspopup="true" aria-pressed="false" aria-live="polite" title="Speed" href="#" onclick="return false;"></a><ul role="menu" style="display:none" aria-hidden="true"><li role="menuitem"><a class="audioSpeedItem" href="#" value="2">2x</a></li><li role="menuitem"><a class="audioSpeedItem" href="#" value="1.5">1.5x</a></li><li role="menuitem"><a class="audioSpeedItem" href="#" id="' + id + 'AudioNormalSpeed" value="1"></a></li><li role="menuitem"><a class="audioSpeedItem" href="#" value="0.75">0.75x</a></li><li role="menuitem"><a class="audioSpeedItem" href="#" value="0.5">0.5x</a></li></ul></div>')).append($('<a role="button" class="AudioPlayerTranscript" id="' + id + 'TranscriptButton" title="Transcript" href="#"></a>')).append($('<div class="AudioPlayerLocation" id="' + id + 'Location" aria-hidden="true"></div>')).append($('<audio class="AudioPlayerAudio" id="' + id + 'Audio" src=""></audio>'));
    return rootSelector
}
function BannerView(controller)
{
    var path = controller.course.getContentFolderPath() + "Banner.htm";
    $('#Header').load(path, function()
    {
        if (controller.course.settings.Mercury.ShowURL && controller.course.settings.Mercury.URL)
            $('<iframe name="mercuryScoreFrame" frameborder="0" scrolling="auto" allowtransparency="true" id="mercuryScoreFrame" src="' + controller.course.settings.Mercury.URL + '"></iframe>').appendTo(this);
        $('#courseName').text(controller.course.name);
        $("#RtlLtr").click(function()
        {
            if ($("html").hasClass("rtl"))
            {
                $("html").removeClass("rtl");
                $("html").attr("dir", "ltr")
            }
            else
            {
                $("html").addClass("rtl");
                $("html").attr("dir", "rtl")
            }
        });
        var reportProblemButton = $('#reportProblemButton');
        reportProblemButton.attr('href', '#').attr('role', 'button');
        reportProblemButton.text(Resources.ReportProblemDialog_Title_Text).attr('title', Resources.ReportProblemDialog_Title_Text);
        reportProblemButton.click(function()
        {
            courseController.showHelpDialog();
            return false
        });
        var exitButton = $('#exitButton');
        exitButton.attr('href', "#").attr('role', 'button');
        if (_embedWindow)
        {
            exitButton.hide()
        }
        else
        {
            exitButton.text(Resources.Menu_Exit_Menu_Text);
            exitButton.attr('title', Resources.Menu_Exit_Menu_Title_Text);
            exitButton.click(function()
            {
                var message = handleOnBeforeUnload();
                if (message)
                {
                    courseController.confirm(message, closeCourse, null)
                }
                else
                {
                    closeCourse()
                }
                return false
            })
        }
        var quicklinksButton = $('#quickLinksButton');
        quicklinksButton.attr("title", Resources.Menu_Quick_Links_Menu_Text);
        quicklinksButton.attr("role", "button").attr('aria-haspopup', "true").attr("aria-expanded", "false").attr('href', '#');
        if (controller.course.settings.HighContrastModeActive)
            quicklinksButton.text(Resources.Menu_Quick_Links_Menu_Text);
        quicklinksButton.keyup(function(e)
        {
            if (e.keyCode == 32)
            {
                controller.course.observer.fire("quickLinksButtonClicked", null)
            }
        });
        quicklinksButton.click(function(event)
        {
            controller.course.observer.fire("quickLinksButtonClicked", null)
        });
        quicklinksButton.focus(function(){});
        quicklinksButton.blur(function(){});
        var quickLinksView = new QuickLinksView(controller, $('#quickLinksContainer'), $('#quickLinks'), $('#quickLinksButton'));
        var headerLinksView = new HeaderLinksView(controller);
        $(".menuButtons", this).prepend(InfoButtonView.getInstance());
        if ($("#progressWidget").length > 0)
        {
            $("#progressWidget").click(function()
            {
                controller.course.observer.fire("progressWidgetClicked");
                return false
            });
            var updateWidget = function()
                {
                    if (controller.course.scormState.isComplete)
                    {
                        $("#progressWidget").addClass("progressWidget-courseComplete").text(Resources.ProgressWidget_CompleteText);
                        controller.course.observer.unobserve("pageStatusChanged", updateWidget);
                        controller.course.observer.unobserve("courseCompleted", updateWidget)
                    }
                    else
                    {
                        var count = 0;
                        controller.course.recursePageTreeFn(function(page, nCurrentLevel)
                        {
                            if (nCurrentLevel > 1 && page.isRequired() && !page.isComplete())
                                count++
                        });
                        var sCount = views.utils.localizeNumbers(count);
                        $("#progressWidget").html(Resources.ProgressWidget_IncompleteText.replace("%%plural%%", count !== 1 ? "s" : "").replace("%%number%%", sCount))
                    }
                };
            controller.course.observer.observe("pageStatusChanged", updateWidget);
            controller.course.observer.observe("courseCompleted", updateWidget);
            $("#progressWidget").attr("title", $(".ContentsWidgetContainer").hasClass("CollapsedWidget") ? Resources.ProgressWidget_ContentsOffTitle : Resources.ProgressWidget_ContentsOnTitle);
            controller.course.observer.observe("contentsWidgetShown", function()
            {
                $("#progressWidget").attr("title", Resources.ProgressWidget_ContentsOnTitle)
            });
            controller.course.observer.observe("contentsWidgetHidden", function()
            {
                $("#progressWidget").attr("title", Resources.ProgressWidget_ContentsOffTitle)
            });
            updateWidget()
        }
    });
    courseController.course.observer.observe('navigatedToPage', function(page)
    {
        if (page.getModule() != page)
        {
            var sName = '<span class="pageNameModule">' + page.getModule().name + '</span><span class="pageNameSeparator"> | </span>' + page.name
        }
        else
        {
            var sName = page.name
        }
        $('#pageName').html(sName);
        $(InfoButtonView.getInstance()).unbind('click').hide()
    })
}
function ConfirmUserView(courseController)
{
    var rootElem = null;
    this.confirm = function(text, callback, param)
    {
        var newDiv = $(document.createElement('div'));
        newDiv.attr("id", "ConfirmDialog");
        var recenterDialog = function()
            {
                newDiv.dialog('option', 'position', 'center')
            };
        rootElem = newDiv.html(text).dialog({
            title: Resources.Confirmation_Title_Text, closeText: Resources.Dialog_Close_Text, dialogClass: 'ConfirmDialog', modal: true, draggable: false, resizable: false, width: '100%', position: 'center', open: function()
                {
                    $(window).on('resize', recenterDialog);
                    $('#container').attr('aria-hidden', true);
                    $('.ConfirmDialog').attr("role", "dialog")
                }, close: function()
                {
                    $(window).off('resize', recenterDialog);
                    $(this).dialog('destroy').remove();
                    $('#container').attr('aria-hidden', false)
                }, buttons: [{
                        id: "button-ok", text: Resources.Confirmation_Yes_Text, click: function()
                            {
                                callback(param);
                                $(this).dialog("close")
                            }
                    }, {
                        id: "button-cancel", text: Resources.Confirmation_No_Text, click: function()
                            {
                                $(this).dialog("close")
                            }
                    }]
        })
    };
    return rootElem
}
function ContentPopupView(courseController, hoverElementId, cssClass)
{
    if (!cssClass)
        cssClass = '';
    var cpv = this;
    cpv.cc = courseController;
    this.Observer = new Observer;
    this.pageDisplayed = null;
    this.cssClass = cssClass;
    this.hoverElementId = hoverElementId;
    var modal = true;
    if (this.hoverElementId)
        modal = false;
    cpv.callback = null;
    cpv.newDiv = $(document.createElement('div'));
    cpv.newDiv.attr("id", "ContentsPopupDialog");
    cpv.captionsContainer = $('<div id="ContentsPopupCaptionsContainer" aria-hidden="true"/>').appendTo(cpv.newDiv);
    var iframeContainer = $('<div class="ContentsPopupIframeContainer"/>');
    cpv.iframe = $('<iframe id="ContentsPopupIframe" allowfullscreen/>');
    cpv.assessmentDiv = $('<div id="ContentsPopupAssessment"/>');
    iframeContainer.append(cpv.iframe);
    cpv.newDiv.append(iframeContainer);
    cpv.newDiv.append(cpv.assessmentDiv);
    cpv.audioController = new AudioController(cpv.cc, "PopupAudio");
    cpv.transcriptView = new TranscriptView("ContentPopupTranscriptContainer", courseController);
    cpv.newDiv.append(cpv.transcriptView.container);
    cpv.audioController.transcriptView = cpv.transcriptView;
    cpv.audioPlayerView = new AudioPlayerView(cpv.cc, "PopupAudio");
    cpv.newDiv.append(cpv.audioPlayerView);
    var branchingController = null,
        branchingView = null,
        assessmentController = null;
    var dlg = cpv.newDiv.dialog({
            autoOpen: false, width: 1, height: 1, position: 'center', title: '', open: function()
                {
                    views.utils.sizeDialog(cpv.newDiv);
                    resize(dlg);
                    views.utils.hideNonDialog();
                    buildDialog(cpv.newDiv, cpv.pageDisplayed);
                    var currentPage = cpv.cc.course.getCurrentPage();
                    if (currentPage.hasAudio())
                        player.pageAudioController.stop();
                    player.activeAudioController = cpv.audioController;
                    cpv.audioController.page = cpv.pageDisplayed;
                    var playOnPageDisplayAudio = cpv.pageDisplayed.getPlayOnPageDisplayAudio();
                    if (playOnPageDisplayAudio)
                    {
                        cpv.transcriptView.container.show();
                        cpv.audioController.readyToPlay(playOnPageDisplayAudio, cpv.pageDisplayed.course.volume)
                    }
                    else
                    {
                        cpv.transcriptView.container.hide();
                        cpv.audioController.hideAndStop()
                    }
                }, close: function()
                {
                    $(window).unbind('resize.contentspoup');
                    views.utils.showNonDialog();
                    cpv.pageDisplayed.pageState.isVisited = true;
                    if (cpv.pageDisplayed.canSendCompletion() && !cpv.pageDisplayed.isComplete() && cpv.pageDisplayed.isRequired())
                    {
                        cpv.pageDisplayed.setIncomplete()
                    }
                    else
                    {
                        cpv.pageDisplayed.setComplete()
                    }
                    cpv.callback && cpv.callback();
                    cpv.pageDisplayed.unload();
                    cpv.audioController.page = null;
                    courseController.course.currentPopupPageId = null;
                    cpv.pageDisplayed = null;
                    cpv.iframe.removeClass('fullscreen').attr('src', "about:blank");
                    cpv.captionsContainer.empty();
                    cpv.assessmentDiv.empty();
                    assessmentController && assessmentController.unload();
                    assessmentController = null;
                    if (branchingController)
                    {
                        branchingController.hide((function()
                        {
                            var bv = branchingView;
                            return function()
                                {
                                    bv.remove()
                                }
                        })());
                        branchingController.unload()
                    }
                    branchingController = null;
                    branchingView = null;
                    cpv.audioController.hideAndStop();
                    player.activeAudioController = player.pageAudioController;
                    views.utils.hideRoleGuideVideo();
                    if (views.utils.isInRoleGuide())
                    {
                        var w = $('iframe#Content')[0].contentWindow;
                        for (var i = 0; i < w.frames.length; i++)
                        {
                            if (w.frames[i].location.href.indexOf("VideoPage.htm") > -1)
                                w.frames[i].location.reload()
                        }
                    }
                    dlg.empty().dialog('destroy')
                }, closeText: Resources.Dialog_Close_Text, dialogClass: 'ContentsPopupDialog ' + cpv.cssClass, modal: modal, draggable: false, resizable: false
        });
    $(window).bind('resize.contentspoup', function()
    {
        resize(dlg)
    });
    function resize(dlg)
    {
        if (hoverElementId)
        {
            var width = 1,
                height = 1,
                top = 0,
                left = 0;
            var $hoverElement = $('iframe#Content').contents().find('#' + hoverElementId);
            if ($hoverElement.length)
            {
                top = $hoverElement.offset().top;
                left = $hoverElement.offset().left;
                width = $hoverElement.width();
                height = $hoverElement.outerHeight()
            }
            $(".ContentsPopupDialog .ui-dialog-titlebar").hide();
            $("div.ContentsPopupDialog").removeClass("ui-corner-all");
            dlg.dialog('option', 'position', {
                my: "left+" + left + " top+" + top, at: "left top", of: $('iframe#Content')
            });
            dlg.dialog('option', 'height', height);
            dlg.dialog('option', 'width', (width - 1))
        }
    }
    function buildDialog(parent, page)
    {
        branchingController && branchingController.isVisible() && branchingController.unload();
        switch (page.pageType.PlaybackSource)
        {
            case"KnowledgeCheck":
            case"PostTest":
            case"StandAloneAssessment":
            case"StandAloneQuestion":
                cpv.iframe.hide();
                iframeContainer.hide();
                cpv.iframe.attr('src', "about:blank");
                cpv.newDiv.dialog('option', 'closeText', Resources.Assessment_Dialog_Close_Text);
                cpv.newDiv.dialog('option', 'dialogClass', 'ContentsPopupDialog AssessmentPopupDialog ' + cpv.cssClass);
                branchingController && branchingController.hide();
                cpv.assessmentDiv.show();
                if (!assessmentController)
                {
                    var assessmentView = new AssessmentView(cpv.assessmentDiv, cpv.audioController, cpv.cc);
                    assessmentController = new AssessmentController(assessmentView, cpv.audioController);
                    assessmentView.append(views.utils.createButton("AssessmentPopupExitButton", "", "AssessmentPopupExitButton").click(function()
                    {
                        cpv.newDiv.dialog("close")
                    }).prop("title", Resources.Assessment_Dialog_Close_Text))
                }
                assessmentController.readyToPlay(page.Assessment);
                break;
            case"Branching":
                cpv.iframe.hide();
                iframeContainer.hide();
                cpv.iframe.attr('src', "about:blank");
                cpv.newDiv.dialog('option', 'closeText', Resources.Branching_Dialog_Close_Text);
                cpv.newDiv.dialog('option', 'dialogClass', 'ContentsPopupDialog BranchingPopupDialog ' + cpv.cssClass);
                assessmentController && assessmentController.hide();
                if (!branchingController)
                {
                    branchingView = new BranchingView($('<div id="ContentsPopupBranching"/>').insertAfter(iframeContainer), cpv.audioController, cpv.cc);
                    branchingController = new BranchingController(branchingView, cpv.audioController);
                    branchingView.append(views.utils.createButton("BranchingPopupExitButton", "", "BranchingPopupExitButton").click(function()
                    {
                        cpv.newDiv.dialog("close")
                    }).prop("title", Resources.Branching_Dialog_Close_Text))
                }
                branchingController.readyToPlay(page.BranchingGraph);
                break;
            default:
                cpv.iframe.attr('src', page.getFilePath());
                cpv.iframe.attr('name', page.name);
                cpv.newDiv.dialog('option', 'closeText', Resources.Content_Dialog_Close_Text);
                cpv.newDiv.dialog('option', 'dialogClass', 'ContentsPopupDialog ' + cpv.cssClass);
                assessmentController && assessmentController.hide();
                branchingController && branchingController.hide();
                cpv.iframe.show();
                iframeContainer.show();
                cpv.transcriptView.container.show();
                cpv.assessmentDiv.hide();
                break
        }
    }
    cpv.iframe.load(function()
    {
        if (!cpv.pageDisplayed)
            return;
        if ($('html', document).hasClass('light_theme'))
        {
            $('html', this.contentDocument).addClass('light_theme')
        }
        if ($('html', document).hasClass('blackonwhite'))
        {
            $('html', this.contentDocument).addClass('blackonwhite')
        }
        if ($('html', document).hasClass('whiteonblack'))
        {
            $('html', this.contentDocument).addClass('whiteonblack')
        }
        cpv.pageDisplayed.InitVideoController(cpv.iframe[0].contentWindow, cpv.cc);
        $('title', this.contentDocument).html(cpv.pageDisplayed.name);
        $("body", this.contentDocument).attr("tabindex", "-1")
    });
    return {
            show: function(page, callback)
            {
                cpv.callback = callback;
                cpv.pageDisplayed = page;
                courseController.course.currentPopupPageId = page.id;
                cpv.newDiv.dialog('open');
                $('.ContentsPopupDialog').attr('role', '');
                $('.ContentsPopupIframeContainer').focus();
                views.utils.hideRoleGuideVideo()
            }, close: function()
                {
                    if (dlg.hasClass('ui-dialog-content') && dlg.dialog("isOpen"))
                        dlg.dialog('close')
                }, getAudioController: function()
                {
                    return cpv.audioController
                }, getCurrentPage: function()
                {
                    return cpv.pageDisplayed
                }, transcriptView: cpv.transcriptView
        }
}
var ContentsDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "ContentsDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, width: 1, height: 1, position: 'center', title: Resources.TableOfContentsDialog_Title_Text, open: function()
                        {
                            $("#ContentsDialog").dialog('option', 'height', $(window).height() - 50);
                            $("#ContentsDialog").dialog('option', 'width', $(window).width() - 50);
                            $("#ContentsDialog").dialog('option', 'position', 'center');
                            buildDialog(newDiv);
                            $(dlg).find(".ui-dialog-titlebar-close").attr("title", "");
                            $(".ContentsDialog").attr("aria-describedby", "");
                            views.utils.hideNonDialog()
                        }, modal: true, close: function()
                        {
                            dlg.dialog("destroy").remove();
                            instance = null;
                            views.utils.showNonDialog()
                        }, closeText: Resources.Dialog_Close_Text, dialogClass: 'ContentsDialog', draggable: false, resizable: false
                });
            $(newDiv).on('click', '#showOptionalContentCheckBox', function()
            {
                var checkbox = $(this);
                courseController.course.settings.ShowOptionalContent = checkbox.is(':checked');
                buildDialog(newDiv);
                courseController.course.loadPageNavigation();
                $("#showOptionalContentCheckBox").focus()
            });
            return dlg
        }
        function buildDialog(parent)
        {
            parent.empty();
            var left = getLeftColumn();
            var center = getCenterColumn();
            var right = getRightColumn();
            parent.html('<div class="ContentsBoxContainer">' + left + right + center + '</div>');
            var element = document.getElementById('ContentPage' + courseController.course.getCurrentPage().id);
            if (element)
            {
                var topPos = element.offsetTop;
                document.getElementById('ContentsCenterColumn').scrollTop = topPos
            }
            $(window).bind('resize', function()
            {
                $("#ContentsCenterColumn").css('height', $(window).height() - 170)
            }).trigger('resize')
        }
        function getLeftColumn()
        {
            var s = '<div class="ContentsLeftColumn">';
            if (courseController.course.testOutPage)
            {
                var title = "";
                if (courseController.course.testOutPage.Assessment)
                {
                    title = views.utils.getAssessmentSRStatusText(courseController.course.testOutPage.Assessment.Status)
                }
                s += '<a class="ContentsTestOutLink non_accent" title="' + title + '" href="#" onclick="player.courseController.hideContentsDialog();courseController.navigateToTestOut();return false;">' + Resources.Welcome_TestOut_Button_Text + '</a>'
            }
            if (courseController.course.modules.length > 1)
            {
                s += '<div id="ContentsModuleContainer" class="ContentsModuleBoxContainer">';
                var currentModule = courseController.course.getCurrentPage().getModule();
                var nModuleNumber = 1;
                for (var i = 0; i < courseController.course.modules.length; i++)
                {
                    var cModule = courseController.course.modules[i];
                    if (!cModule.pageState.isOptional)
                    {
                        var sStyle = currentModule == cModule ? "accent_selected" : "accent_not_selected";
                        var sTitle = cModule.name + " ";
                        if (cModule.pageState.isLocked)
                        {
                            sTitle += '(' + Resources.Contents_Module_ModuleLocked_Text + ')'
                        }
                        else if (cModule.isComplete())
                        {
                            sTitle += '(' + Resources.Contents_Module_ModuleComplete_Text + ')'
                        }
                        else if (cModule.pageState.status == "I")
                        {
                            sTitle += '(' + Resources.Contents_Module_ModuleInProgress_Text + ')'
                        }
                        else
                        {
                            sTitle += '(' + Resources.Contents_Module_ModuleNotStarted_Text + ')'
                        }
                        s += '<a class="ContentsModuleBox ' + sStyle + '" title="' + sTitle + '" href="" onclick="ContentsDialogView.jumpToModule(' + nModuleNumber + '); return false;">';
                        s += views.utils.localizeNumbers(common.zeroFill(nModuleNumber, 2));
                        if (cModule.pageState.isLocked)
                        {
                            s += '<div class="ContentsModuleBoxLocked"></div>'
                        }
                        else if (cModule.isComplete())
                        {
                            s += '<div class="ContentsModuleBoxComplete"></div>'
                        }
                        else
                        {
                            s += '<div class="ContentsModuleBoxNone">&nbsp;</div>'
                        }
                        s += '</a>';
                        nModuleNumber++
                    }
                }
                s += '<div class="ContentsModulesLabel">' + Resources.Contents_Modules_Text + '</div>';
                s += '</div>'
            }
            s += '</div>';
            return s
        }
        function getCenterColumn()
        {
            var nModule = 1;
            var s = '<div class="ContentsCenterColumn"  id="ContentsCenterColumn">';
            s += '<div class="ContentsTOC" id="ContentsTOC">';
            var bAddedModule = false;
            var currentPage = course.getCurrentPage();
            course.recursePageTreeFn(function getPage(page, nCurrentLevel)
            {
                if (page.availableForNavigation())
                {
                    if (nCurrentLevel == 1)
                    {
                        var sI = '';
                        if (page.isComplete())
                        {
                            sI = '<div class="ContentsModuleComplete"></div>'
                        }
                        else if (page.pageState.isLocked)
                        {
                            sI = '<div class="ContentsModuleLocked"></div>'
                        }
                        if (bAddedModule)
                        {
                            s += '<div class="ContentsModuleGap">&nbsp;</div>'
                        }
                        else
                        {
                            bAddedModule = true
                        }
                        var sModule = views.utils.localizeNumbers(common.zeroFill(nModule, 2));
                        s += '<div id="ContentModule' + nModule + '">' + sI + '<div role="heading" aria-level="1" class="ContentsModuleLabel accent_text toc_module_number">';
                        nModule++;
                        s += '<span class="toc_module_name ContentsLevel' + nCurrentLevel + '">' + Resources.ProgressBar_ModuleName_Info_Text_Format.replace("{0}", sModule) + ': ' + page.name + '</span></div></div>'
                    }
                    else
                    {
                        var pageStyle = page == currentPage ? 'ContentPageSelected ' : '';
                        var sOptional = page.pageState.isOptional ? " " + Resources.ModuleCard_Optional_Info_Text : "";
                        s += '<a id="ContentPage' + page.id + '" class="' + pageStyle + 'hoveraccent_text ContentsLevel' + nCurrentLevel + '" href="#" onclick="ContentsDialogView.navigateToPage(' + page.id + ');return false;">' + page.name + sOptional + '</a>'
                    }
                }
            });
            s += '</div>';
            s += '</div>';
            return s
        }
        function getRightColumn()
        {
            var s = '<div class="ContentsRightColumn">';
            s += '<div class="ContentsProgressBoxWrapper">';
            s += courseController.getProgressTile("", "tile_190_200");
            s += '</div>';
            if (courseController.course.settings.UserCanToggleOptional)
            {
                s += '<div class="ContentsOptionalContentBoxWrapper accent">';
                var checkedVal = courseController.course.settings.ShowOptionalContent ? "checked" : "";
                s += '<label style="display:block" class="default_padding"><input type="checkbox" id="showOptionalContentCheckBox" name="showOptionalContent"' + checkedVal + ' /> ' + Resources.Welcome_OptionalContent_CheckBox_Text + '</label>';
                s += '</div>'
            }
            s += '</div>';
            return s
        }
        return {
                getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }, jumpToModule: function(nModule)
                    {
                        var topPos = document.getElementById('ContentModule' + nModule).offsetTop;
                        document.getElementById('ContentsCenterColumn').scrollTop = topPos
                    }, navigateToPage: function(id)
                    {
                        var currentLocation = courseController.course.currentPageIndex;
                        courseController.navigateToPageById(id);
                        if (courseController.navigationSuccess)
                        {
                            courseController.hideContentsDialog()
                        }
                    }
            }
    })();
function ContentsWidgetView(courseController)
{
    var course = courseController.course,
        container = $("<div/>", {
            "class": "ContentsWidgetContainer", role: "navigation", "aria-label": Resources.ContentsWidget_Aria_Label
        }),
        splitter = new SplitterView(course.settings.TOCCollapsed),
        widget = $("<div/>", {"class": "ContentsWidget"}),
        widgetContent = $("<div/>", {"class": "ContentsWidgetContent"}),
        widgetItems = $("<div/>", {
            "class": "ContentsWidgetItems", id: "ContentsWidgetItems"
        });
    userDisplayState = 0;
    container.append(splitter);
    splitter.click(function()
    {
        updateWidgetCollapseState()
    });
    container.append(widget);
    widget.append(widgetContent).prepend($('<ul class="ContentsWidgetHeader" role="tablist" aria-label="' + Resources.Contents_Header_Description + '"><li><a id="tabContents" href="#ContentsWidgetItems" role="tab" aria-controls="ContentsWidgetItems" class="accent_text" aria-selected="true">' + Resources.ContentsWidget_Contents_Text + '</a></li><li><a id="tabtranscript" href="#" role="tab" aria-controls="TranscriptContainer" class="inactive" aria-selected="false">' + Resources.AppBar_CourseTranscript_Button_Text + '</a></li></ul>'));
    widgetContent.append(widgetItems);
    widgetContent.append(courseController.transcriptView.container);
    widget.on("click", "li a", function()
    {
        $(".ContentsWidgetHeader li a").addClass('inactive').removeClass('accent_text');
        $(this).removeClass('inactive').addClass('accent_text');
        $('.ContentsWidgetHeader a').attr('aria-selected', false);
        if ($(this).attr('id') == "tabContents")
        {
            courseController.transcriptView.container.hide();
            widgetItems.show();
            widgetContent.scrollTop(widgetContent.data('scroll'));
            $(this).attr('aria-selected', "true");
            $("#tabtranscript").attr('aria-selected', "false")
        }
        else
        {
            widgetContent.data('scroll', widgetContent.scrollTop());
            widgetItems.hide();
            courseController.transcriptView.container.show();
            showContentsWidget(true);
            $(this).attr('aria-selected', "true");
            $("#tabContents").attr('aria-selected', "false")
        }
    });
    courseController.course.observer.observe("pageNavigationLoaded", function()
    {
        buildWidgetItems();
        updateWidgetOnStatusChange();
        updateWidgetOnNavigate()
    });
    courseController.course.observer.observe("pageStatusChanged", function()
    {
        updateWidgetOnStatusChange()
    });
    courseController.course.observer.observe("navigatedToPage", function()
    {
        updateWidgetOnNavigate()
    });
    courseController.course.observer.observe("progressWidgetClicked", function()
    {
        if ($(".ContentsWidgetContainer").hasClass("CollapsedWidget"))
        {
            showContentsWidget();
            userDisplayState = 1
        }
        else
        {
            hideContentsWidget();
            userDisplayState = 2
        }
    });
    var updateWidgetCollapseState = function()
        {
            var mainContainer = $("#Main");
            if (splitter.collapsed)
            {
                mainContainer.addClass("ExpandedMain");
                container.addClass("collapsed");
                course.settings.TOCCollapsed = true
            }
            else
            {
                mainContainer.removeClass("ExpandedMain");
                container.removeClass("collapsed");
                course.settings.TOCCollapsed = false;
                try
                {
                    $(window).trigger('resize')
                }
                catch(e) {}
            }
        };
    var showContentsWidget = function(expandSplitter)
        {
            $("#Main").removeClass("ExpandedMain");
            $(".ContentsWidgetContainer").removeClass("CollapsedWidget");
            if (expandSplitter)
            {
                splitter.collapsed = false;
                splitter.removeClass('SplitterCollapsed').addClass('SplitterExpanded')
            }
            updateWidgetCollapseState();
            courseController.course.observer.fire("contentsWidgetShown")
        },
        hideContentsWidget = function()
        {
            $(".ContentsWidgetContainer").addClass("CollapsedWidget");
            $("#Main").addClass("ExpandedMain");
            courseController.course.observer.fire("contentsWidgetHidden")
        },
        expandWidgetItem = function(item)
        {
            var $currentModule = $('.ModuleItem.ExpandedSubItems');
            if ($currentModule.length > 0 && $currentModule !== $(item))
            {
                collapseWidgetItem($currentModule)
            }
            $(item).addClass("ExpandedSubItems");
            $(item).next(".ContentsWidgetSubItems").addClass("ExpandedSubItems");
            $(item).attr('aria-expanded', true);
            $(item).next(".ContentsWidgetSubItems").attr('aria-expanded', true).attr('aria-hidden', false);
            $(item).next(".ContentsWidgetSubItems").find('.PageItem').attr("tabindex", 0).attr("aria-hidden", false);
            $(item).next(".ContentsWidgetSubItems").find('.ariaStatus').attr("aria-hidden", false);
            $(item).next(".ContentsWidgetSubItems").find('.pageLabel').attr("aria-hidden", false)
        },
        collapseWidgetItem = function(item)
        {
            $(item).removeClass("ExpandedSubItems");
            $(item).next(".ContentsWidgetSubItems").removeClass("ExpandedSubItems");
            $(item).attr('aria-expanded', false);
            $(item).next(".ContentsWidgetSubItems").attr('aria-expanded', false).attr('aria-hidden', true);
            $(item).next(".ContentsWidgetSubItems").find('.PageItem').attr("tabindex", -1).attr("aria-hidden", true);
            $(item).next(".ContentsWidgetSubItems").find('.PageItem').attr("aria-hidden", true);
            $(item).next(".ContentsWidgetSubItems").find('.ariaStatus').attr("aria-hidden", true)
        },
        toggleWidgetItem = function(item)
        {
            var $currentModule = $('.ModuleItem.ExpandedSubItems');
            if ($currentModule.length > 0 && $currentModule !== $(item))
            {
                collapseWidgetItem($currentModule)
            }
            if ($(item).hasClass("ExpandedSubItems"))
            {
                collapseWidgetItem(item)
            }
            else
            {
                expandWidgetItem(item)
            }
        },
        expandAllItems = function()
        {
            widgetItems.find('.ContentsWidgetSubItems').addClass('ExpandedSubItems')
        },
        scrollWidgetToItem = function(item)
        {
            if ($(item).length > 0)
            {
                var top = $(item).offset().top,
                    bottom = $(item).offset().top + $(item).height(),
                    widgetTop = $(item).parents(".ContentsWidgetContent").offset().top,
                    widgetBottom = $(item).parents(".ContentsWidgetContent").offset().top + $(item).parents(".ContentsWidgetContent").height();
                if (top < widgetTop)
                    $(item).parents(".ContentsWidgetContent").scrollTop(top - widgetTop + $(item).parents(".ContentsWidgetContent").scrollTop());
                else
                    bottom > widgetBottom && $(item).parents(".ContentsWidgetContent").scrollTop(bottom - widgetBottom + $(item).parents(".ContentsWidgetContent").scrollTop())
            }
        },
        getModuleStatusText = function(module, pageCount)
        {
            var statusString = Resources.Contents_Module_Status_Description;
            statusString = statusString.replace("{0}", module.name);
            statusString = pageCount == 1 ? statusString.replace("{1}", pageCount + " page") : statusString.replace("{1}", pageCount + " pages");
            if (!module.pageState.isOptional)
            {
                statusString = statusString.replace("{2}", Resources.ContentsWidget_Required_Text)
            }
            else
            {
                statusString = statusString.replace("{2}", Resources.ContentsWidget_Optional_Text)
            }
            switch (module.pageState.status)
            {
                case"N":
                    statusString = statusString.replace("{3}", Resources.ContentsWidget_NotStarted_Text);
                    break;
                case"I":
                    statusString = statusString.replace("{3}", Resources.ContentsWidget_InProgress_Text);
                    break;
                case"P":
                    statusString = statusString.replace("{3}", Resources.ContentsWidget_Complete_Text);
                    break
            }
            return statusString
        },
        updateWidgetAccessibleInfo = function()
        {
            $(".ModuleItem").each(function(idx, item)
            {
                var module = $(item).data("page");
                var modulePages = $(".PageItem", $(item).next()).length;
                var moduleStatus = getModuleStatusText(module, modulePages);
                var moduleLocked = module.pageState.isLocked ? $(item).attr('aria-disabled', true) : $(item).attr('aria-disabled', false);
                var str = "";
                $(item).find('#module' + module.id).text(moduleStatus)
            });
            $(".ContentsWidgetSubItems").each(function(idx, item)
            {
                $(item).attr('role', "document");
                $(item).attr('aria-label', 'module ' + (idx + 1) + " pages")
            })
        },
        updateWidgetOnStatusChange = function()
        {
            $(".ContentsWidgetItem").each(function()
            {
                var widgetPage = $(this).data("page");
                $(this).children(".StatusIcon").remove();
                if (widgetPage && widgetPage.isComplete())
                    $(this).prepend($('<div aria-hidden="true" class="ContentsWidgetIcon StatusIcon"><img aria-hidden="true" class="showOnLight" src="Player/theme/light/images/checkmark.png" alt=""/><img aria-hidden="true" class="showOnDark" src="Player/theme/dark/images/checkmark.png" alt=""/></div>'));
                else
                    widgetPage && widgetPage.pageState.isLocked && $(this).prepend($('<div aria-hidden="true" class="ContentsWidgetIcon StatusIcon"><img aria-hidden="true" class="showOnLight" src="Player/theme/light/images/lock.png" alt=""/><img aria-hidden="true" class="showOnDark" src="Player/theme/dark/images/lock.png" alt=""/></div>'))
            });
            $('.ContentsWidgetSubItem').each(function()
            {
                var widgetPage = $(this).data("page");
                $(this).children(".StatusIcon").remove();
                $(this).children(".ariaStatus").remove();
                if (widgetPage && widgetPage.contribute == 'r' && !widgetPage.pageState.isOptional)
                {
                    if (widgetPage.isComplete())
                    {
                        $(this).prepend($('<div aria-hidden="true" class="ContentsWidgetIcon StatusIcon"><img aria-hidden="true" class="showOnLight" src="Player/theme/light/images/complete.png" alt=""/><img aria-hidden="true" class="showOnDark" src="Player/theme/dark/images/complete.png" alt=""/></div>'));
                        $(this).append($('<span aria-hidden="true" class="visuallyhidden ariaStatus"> ' + Resources.ContentsWidget_Page_Complete + '</span>'))
                    }
                    else
                    {
                        $(this).prepend($('<div aria-hidden="true" class="ContentsWidgetIcon StatusIcon"><img class="showOnLight" src="Player/theme/light/images/required.png" alt=""/><img class="showOnDark" src="Player/theme/dark/images/required.png" alt=""/></div>'));
                        $(this).append($('<span aria-hidden="true" class="visuallyhidden ariaStatus"> ' + Resources.ContentsWidget_Page_Incomplete + '</span>'))
                    }
                }
            });
            updateWidgetAccessibleInfo()
        },
        updateWidgetOnNavigate = function()
        {
            if (course.getCurrentPage())
            {
                currentPage = course.getCurrentPage()
            }
            else
            {
                currentPage = course.getPageById(course.pageNavigation[0].id)
            }
            $(".CurrentPageIcon", ".ContentsWidget").remove();
            $(".currentPageLabel").remove();
            $(".CurrentPage", ".ContentsWidget").removeClass("CurrentPage");
            $("#ContentPage" + currentPage.id, ".ContentsWidget").addClass('CurrentPage');
            $("#ContentPage" + currentPage.id, ".ContentsWidget").prepend($('<div aria-hidden="true" class="ContentsWidgetIcon CurrentPageIcon"><img alt="" class="showOnLight" src="Player/theme/light/images/arrow.right.nocircle.png"/><img alt="" class="showOnDark" src="Player/theme/dark/images/arrow.right.nocircle.png"/></div><span aria-hidden="false" class="visuallyhidden currentPageLabel">' + Resources.Contents_CurrentPage + '</span>'));
            $('.CurrentPageIcon img').attr('alt', Resources.Contents_CurrentPage);
            if ($('.CurrentPage').parent().prev().attr('aria-expanded') == "false")
            {
                toggleWidgetItem($("#ContentPage" + currentPage.id, ".ContentsWidget").parent(".ContentsWidgetSubItems").prev(".ContentsWidgetItem"))
            }
            if (userDisplayState === 1)
            {
                showContentsWidget()
            }
            else if (userDisplayState === 2)
            {
                hideContentsWidget()
            }
            else if (course.settings.DisplayContentsWidget === false)
            {
                hideContentsWidget()
            }
            else if (currentPage.pageType.HideContentsWidget === true)
            {
                hideContentsWidget()
            }
            else
            {
                switch (currentPage.pageType.PlaybackSource)
                {
                    case"KnowledgeCheck":
                    case"PostTest":
                    case"StandAloneAssessment":
                    case"StandAloneQuestion":
                        hideContentsWidget();
                        break;
                    case"Branching":
                        if (currentPage.BranchingGraph && currentPage.BranchingGraph.usePlayerNavigation)
                            hideContentsWidget();
                        else
                            showContentsWidget();
                        break;
                    default:
                        if (!currentPage.id)
                            hideContentsWidget();
                        else
                            showContentsWidget()
                }
                scrollWidgetToItem($("#ContentPage" + currentPage.id, ".ContentsWidget"))
            }
        },
        buildWidgetItems = function()
        {
            widgetItems.children().remove();
            var nModule = 0,
                subItems = null;
            course.recursePageTreeFn(function(page, nCurrentLevel)
            {
                if (page.availableForNavigation())
                    if (nCurrentLevel == 1)
                    {
                        nModule++;
                        var sModule = nModule < 10 ? "0" + nModule : nModule + "";
                        sModule = views.utils.localizeNumbers(sModule);
                        var strModule = Resources.ProgressBar_ModuleName_Info_Text_Format.replace("{0}", sModule) + " " + page.name;
                        widgetItems.append($('<button class="ContentsWidgetItem ModuleItem" aria-expanded=false aria-describedby="module' + page.id + '"><span aria-hidden=true>' + strModule + "</span><span id='module" + page.id + "' class='visuallyhidden'></span></button>").data("page", page).click(function()
                        {
                            if (page.pageState.isLocked)
                            {
                                return false
                            }
                            else
                            {
                                toggleWidgetItem(this);
                                return false
                            }
                        }));
                        subItems = $("<div />", {"class": "ContentsWidgetSubItems"});
                        widgetItems.append(subItems)
                    }
                    else
                    {
                        var sOptional = page.pageState.isOptional && Resources.ModuleCard_Optional_Info_Text ? " " + Resources.ModuleCard_Optional_Info_Text : "";
                        if (subItems != null)
                            subItems.append($('<a aria-hidden="true" tabindex="-1" id="ContentPage' + page.id + '" class="ContentsWidgetSubItem PageItem hoveraccent_text ContentsLevel' + nCurrentLevel + '" href="#" onclick="courseController.navigateToPageById(' + page.id + ');return false;"><span class="pageLabel">' + page.name + sOptional + "</span></a>").data("page", page).focus(function()
                            {
                                return false
                            }));
                        else
                            widgetItems.append($('<a aria-hidden="true" tabindex="-1" id="ContentPage' + page.id + '" class="ContentsWidgetSubItem PageItem hoveraccent_text ContentsLevel' + nCurrentLevel + '" href="#" onclick="courseController.navigateToPageById(' + page.id + ');return false;"><span class="pageLabel">' + page.name + sOptional + "</span></a>").data("page", page))
                    }
            });
            updateWidgetAccessibleInfo()
        };
    return {
            container: container, showContentsWidget: showContentsWidget, hideContentsWidget: hideContentsWidget, expandAllItems: expandAllItems
        }
}
function ContentView(courseController, audioController)
{
    var pageDisplayed = null,
        assessmentController = null,
        branchingController = null;
    var iframe = $('iframe#Content');
    this.getAssessmentController = function()
    {
        return assessmentController
    };
    this.getBranchingController = function()
    {
        return branchingController
    };
    iframe.load(function()
    {
        if (!pageDisplayed)
            return;
        iframeDoc = iframe.get(0).contentDocument;
        if ($('html', document).hasClass('light_theme'))
        {
            $('html', iframeDoc).addClass('light_theme')
        }
        if ($('html', document).hasClass('blackonwhite'))
        {
            $('html', iframeDoc).addClass('blackonwhite')
        }
        if ($('html', document).hasClass('whiteonblack'))
        {
            $('html', iframeDoc).addClass('whiteonblack')
        }
        if ($('html', document).hasClass('rtl'))
        {
            $('html', iframeDoc).addClass('rtl');
            $('html', iframeDoc).attr("dir", "rtl")
        }
        pageDisplayed.InitVideoController(iframe[0].contentWindow, courseController);
        $('title', iframeDoc).html(pageDisplayed.name);
        iframe.show();
        $(document.activeElement).blur();
        $('body', iframeDoc).attr('tabindex', -1);
        iframe.focus()
    });
    courseController.course.observer.observe('navigatedToPage', function(page)
    {
        pageDisplayed = page;
        courseController.showTranscriptView("");
        courseController.closeContentPopup();
        var playOnPageDisplayAudio = pageDisplayed.getPlayOnPageDisplayAudio();
        if (playOnPageDisplayAudio)
        {
            audioController.readyToPlay(playOnPageDisplayAudio, course.volume)
        }
        else
        {
            audioController.hideAndStop()
        }
        if (assessmentController && assessmentController.isVisible())
            assessmentController.unload();
        if (branchingController && branchingController.isVisible())
            branchingController.unload();
        iframe.removeClass('fullscreen');
        iframe.hide();
        switch (page.pageType.PlaybackSource)
        {
            case"KnowledgeCheck":
            case"PostTest":
            case"StandAloneAssessment":
            case"StandAloneQuestion":
                iframe.get(0).contentDocument.location.replace("about:blank");
                if (branchingController)
                    branchingController.hide();
                if (!assessmentController)
                {
                    var assessmentView = new AssessmentView($('div#Assessment'), audioController, courseController);
                    assessmentController = new AssessmentController(assessmentView, audioController);
                    assessmentView.Observer.observe("locationChanged", function(assessment)
                    {
                        courseController.course.observer.fire("assessmentLocationChanged", assessment)
                    });
                    assessmentView.Observer.observe("checkAnswerClicked", function(assessment)
                    {
                        courseController.course.observer.fire("assessmentQuestionScored", assessment)
                    })
                }
                assessmentController.hide();
                assessmentController.readyToPlay(page.Assessment);
                $('div#Assessment').focus();
                break;
            case"Branching":
                iframe.get(0).contentDocument.location.replace("about:blank");
                if (assessmentController)
                    assessmentController.hide();
                if (!branchingController)
                {
                    var branchingView = new BranchingView($('div#Branching'), audioController, courseController);
                    branchingController = new BranchingController(branchingView, audioController);
                    branchingView.Observer.observe("locationChanged", function(branchingGraph)
                    {
                        courseController.course.observer.fire("branchingLocationChanged", branchingGraph)
                    });
                    branchingView.Observer.observe("stateChanged", function(branchingGraph)
                    {
                        courseController.course.observer.fire("branchingStateChanged", branchingGraph)
                    })
                }
                branchingController.readyToPlay(page.BranchingGraph);
                break;
            default:
                if (assessmentController)
                    assessmentController.hide();
                if (branchingController)
                    branchingController.hide();
                var baseUrl = location.href.substring(0, location.href.indexOf('Launch.htm'));
                baseUrl += page.getFilePath();
                iframe.get(0).contentDocument.location.replace(baseUrl);
                break
        }
    })
}
var DefineYourRoleDialogView = (function()
    {
        var dyr = this;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "DefineYourRoleDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, width: 1, height: 1, title: Resources.DefineYourRole_Text, closeOnEscape: false, dialogClass: 'DefineYourRoleDialog', draggable: false, resizable: false, modal: true, open: function(event, ui)
                        {
                            views.utils.sizeDialog(newDiv);
                            newDiv.html(buildDialog());
                            $("#DefineYourRoleDialog").focus();
                            $(function()
                            {
                                if (dyr.settings)
                                {
                                    if (!dyr.settings.isFTE)
                                        $("#FTECombobox option[value='no']").attr("selected", "selected");
                                    if (!dyr.settings.isPeopleManager)
                                        $("#ManageFTEsCombobox option[value='no']").attr("selected", "selected");
                                    if (dyr.settings.organization)
                                        $("#OrganizationCombobox option[value='" + dyr.settings.organization.alias + "']").attr("selected", "selected")
                                }
                            })
                        }, buttons: [{
                                id: "button-ok", text: Resources.Dialog_Submit_Button_Text, click: function()
                                    {
                                        if (dyr.settings)
                                        {
                                            dyr.settings.isFTE = $("#FTECombobox").val() == "yes";
                                            dyr.settings.isPeopleManager = $("#ManageFTEsCombobox").val() == "yes";
                                            dyr.settings.organization = dyr.settings.organizations[$("#OrganizationCombobox").val()];
                                            if (dyr.callback)
                                                dyr.callback()
                                        }
                                        dyr.instance.dialog("close")
                                    }
                            }]
                });
            return dlg
        }
        return {
                open: function(settings, callback)
                {
                    if (!dyr.instance)
                    {
                        dyr.instance = new PrivateConstructor;
                        dyr.instance.constructor = null
                    }
                    dyr.settings = settings;
                    dyr.callback = callback;
                    dyr.instance.dialog('open')
                }, close: function()
                    {
                        if (dyr.instance)
                            dyr.instance.dialog('close')
                    }
            };
        function buildDialog()
        {
            var s = '<p>' + Resources.DefineYourRole_Dialog_InfoText + '</p>';
            s += '<p>' + Resources.AreYouMicrosoftFTE_Question_Text;
            s += '&nbsp;&nbsp;<select id="FTECombobox"><option value="yes">Yes</option><option value="no">No</option></select></p>';
            s += '<p>' + Resources.DoYouManageOtherMicrosoftFTEs_Question_Text;
            s += '&nbsp;&nbsp;<select id="ManageFTEsCombobox"><option value="yes">Yes</option><option value="no">No</option></select></p>';
            s += '<p>' + Resources.WhoIsYourDivisionPresident_Question_Text;
            s += '&nbsp;&nbsp;<select id="OrganizationCombobox">';
            for (var org in dyr.settings.organizations)
            {
                if (dyr.settings.organizations[org].alias)
                    s += '<option value="' + dyr.settings.organizations[org].alias + '">' + dyr.settings.organizations[org].name + '</option>'
            }
            s += '</select></p>';
            return s
        }
    })();
var EvalDialogView = (function()
    {
        var edv = this;
        function PrivateConstructor(course, formPK, parentWindow, mustAnswerAll, occurredAt)
        {
            edv.occurredAt = occurredAt;
            edv.formId = formPK;
            var dlg = parentWindow ? parentWindow.getDialogElem() : $(document.createElement('div'));
            dlg.attr("id", "EvalDialog");
            var shownInModal = course.settings.EmbeddedEvaluation == "ShowInModal";
            var dialogButtons = [{
                        id: "button-submit", text: Resources.Dialog_Submit_Button_Text, click: function()
                            {
                                var answeredAllQuestions = getAnswers(dlg);
                                if (course.settings.MustAnswerAllEvalQuestions && !answeredAllQuestions)
                                    courseController.alert(Resources.EvaluationDialog_Incomplete);
                                else
                                    saveQuestions()
                            }
                    }];
            if (shownInModal)
            {
                dialogButtons.push({
                    id: "button-cancel", text: Resources.Dialog_Cancel_Button_Text, click: function()
                        {
                            dlg.dialog('close')
                        }
                })
            }
            dlg.dialog({
                autoOpen: false, title: shownInModal ? Resources.EvaluationDialog_Editable_Title_Text.replace("%%courseName%%", course.name) : "", closeText: shownInModal ? Resources.Dialog_Close_Text : "", dialogClass: 'EvalDialog', resizable: false, draggable: false, closeOnEscape: shownInModal, modal: shownInModal, buttons: dialogButtons, close: function()
                    {
                        dlg.dialog('destroy').remove()
                    }, open: function()
                    {
                        dlg.dialog('option', 'height', parentWindow ? $(parentWindow).height() - 8 : $(window).height() - 50);
                        dlg.dialog('option', 'width', parentWindow ? $(parentWindow).width() - 8 : $(window).width() - 50);
                        dlg.dialog('option', 'position', 'center');
                        if (!shownInModal)
                            $(this).parent().children().children('.ui-dialog-titlebar-close').hide();
                        dlg.css('overflow', 'hidden');
                        LoadingDialogView.open(Resources.Dialog_Wait_Title_Text, Resources.EvaluationSubmittedDialog_Wait_Body_Text);
                        if (courseController.course.settings.courseDataService)
                        {
                            var ld_options = {formId: edv.formId};
                            courseController.course.ldServices.getEvalQuestions(ld_options, function(status, data)
                            {
                                if (status == "success")
                                {
                                    getQuestionsSuccess(data)
                                }
                                else
                                {
                                    onError()
                                }
                            })
                        }
                    }
            });
            function getQuestionsSuccess(questionList)
            {
                questions = questionList;
                dlg.html(buildDialog(questions));
                onResize(dlg);
                LoadingDialogView.close()
            }
            function saveQuestions()
            {
                LoadingDialogView.open(Resources.Dialog_Wait_Title_Text, Resources.EvaluationSubmittedDialog_Wait_Body_Text);
                if (courseController.course.settings.courseDataService)
                {
                    var ld_options = {
                            formId: edv.formId, attemptId: course.settings.AttemptId, data: questions, occurredAt: edv.occurredAt
                        };
                    courseController.course.ldServices.postEvalResponse(ld_options, function(status, data)
                    {
                        if (status == "success")
                        {
                            saveQuestionsSuccess()
                        }
                        else
                        {
                            onError()
                        }
                    })
                }
            }
            function saveQuestionsSuccess()
            {
                LoadingDialogView.open(Resources.EvaluationSubmittedDialog_Thanks_Title_Text, Resources.EvaluationSubmittedDialog_Thanks_Body_Text);
                if (shownInModal)
                {
                    window.setTimeout(function()
                    {
                        LoadingDialogView.close();
                        dlg.dialog('close')
                    }, 5000)
                }
                else
                {
                    if (course)
                        course.getCurrentPage().setComplete();
                    window.setTimeout(function()
                    {
                        LoadingDialogView.close()
                    }, 5000);
                    document.getElementById("Content").contentDocument.location.reload(true)
                }
            }
            function onError()
            {
                LoadingDialogView.open(Resources.EvaluationSubmittedDialog_Error_Title_Text, Resources.EvaluationSubmittedDialog_Error_Body_Text);
                if (shownInModal)
                {
                    window.setTimeout(function()
                    {
                        LoadingDialogView.close();
                        dlg.dialog('close')
                    }, 5000)
                }
                else
                {
                    window.setTimeout(function()
                    {
                        LoadingDialogView.close()
                    }, 5000)
                }
            }
            $(window).bind('resize', function()
            {
                onResize(dlg)
            });
            return dlg
        }
        function onResize(dlg)
        {
            dlg.find('#dlgQuestionsContainer').height(dlg.height() - dlg.find('#dlgInstructions').height() - 8)
        }
        function buildDialog(questionList)
        {
            var s = "";
            if (questionList && questionList.length > 0)
            {
                s += '<div id="dlgInstructions" class="dialogInstructions">' + questionList[0].FormInstruct + '</div>';
                s += '<div id="dlgQuestionsContainer" style="overflow-y:scroll;"><table border="0" width="100%">';
                var maxNoOfChoices = getMaxNumberOfChoices(questionList);
                for (var i = 0; i < questionList.length; i++)
                {
                    var question = questionList[i];
                    s += '<tr>';
                    s += '<td width="4%" style="padding-top:20px;" class="accent_text tile_title">';
                    s += common.zeroFill(question.QuestionDisplayOrder, 2);
                    s += '</td>';
                    s += '<td style="padding-top:20px;" colspan="' + maxNoOfChoices + '">';
                    s += question.QuestionText;
                    s += '</td>';
                    s += "</tr>";
                    s += "<tr>";
                    s += "<td/>";
                    var evalQuestionChoices = question.EvaluationQuestionChoices;
                    switch (question.QuestionType)
                    {
                        case'Comment':
                            s += '<td  colspan="' + maxNoOfChoices + '">';
                            s += '<textarea name="choiceForQuestion' + i + '" id="comment' + i + '" style="overflow-x: hidden;width:400px;" rows="4" cols="75"></textarea>';
                            s += '</td>';
                            break;
                        case'MultipleSelect':
                            for (var j = 0; j < evalQuestionChoices.length; j++)
                            {
                                var choice = evalQuestionChoices[j];
                                s += '<td valign="top" width="' + (96 / maxNoOfChoices) + '%">';
                                s += '<label><input type="checkbox" id="" name="choiceForQuestion' + i + '" value="' + choice.AnswerOrdinal + '" /> ' + choice.AnswerText + '</label>';
                                s += '</td>'
                            }
                            break;
                        case'MultipleChoice':
                            for (var j = 0; j < evalQuestionChoices.length; j++)
                            {
                                var choice = evalQuestionChoices[j];
                                s += '<td valign="top" width="' + (96 / maxNoOfChoices) + '%">';
                                if (course.settings.UseStarIconsForEvalRadios)
                                {
                                    var choiceId = 'choiceForQuestion' + i + '-' + choice.AnswerOrdinal;
                                    s += '<input type="radio" id="' + choiceId + '" name="choiceForQuestion' + i + '" value="' + choice.AnswerOrdinal + '" class="radio-star" /><label for="' + choiceId + '"></label>'
                                }
                                else
                                {
                                    s += '<label><input type="radio" id="" name="choiceForQuestion' + i + '" value="' + choice.AnswerOrdinal + '" /> ' + choice.AnswerText + '</label>'
                                }
                                s += '</td>'
                            }
                            break
                    }
                    s += "</tr>"
                }
                s += '</table></div>'
            }
            return s
        }
        function getAnswers(dlg)
        {
            var answeredAllQuestions = true;
            if (questions && questions.length > 0)
            {
                for (var i = 0; i < questions.length; i++)
                {
                    var question = questions[i];
                    switch (question.QuestionType)
                    {
                        case'Comment':
                            question.Answer = dlg.find('textarea[name=choiceForQuestion' + i + ']').val();
                            break;
                        case'MultipleSelect':
                        case'MultipleChoice':
                            question.Answer = '';
                            var inputList = dlg.find('input[name=choiceForQuestion' + i + ']:checked');
                            for (var j = 0; j < inputList.length; j++)
                            {
                                if (question.Answer == '')
                                {
                                    question.Answer += $(inputList[j]).val()
                                }
                                else
                                {
                                    question.Answer += ',' + $(inputList[j]).val()
                                }
                            }
                            if (!question.Answer)
                                answeredAllQuestions = false;
                            break
                    }
                }
            }
            return answeredAllQuestions
        }
        function getMaxNumberOfChoices(questions)
        {
            var max = 0;
            if (questions && questions.length > 0)
            {
                for (var i = 0; i < questions.length; i++)
                {
                    var evalQuestionChoices = questions[i].EvaluationQuestionChoices;
                    if (evalQuestionChoices && evalQuestionChoices.length > max)
                        max = evalQuestionChoices.length
                }
            }
            return max
        }
        return {open: function(course, formPK, parentWindow, mustAnswerAll, occurredAt)
                {
                    var dlg = new PrivateConstructor(course, formPK, parentWindow, mustAnswerAll, occurredAt);
                    dlg.dialog('open')
                }}
    })();
var GlossaryDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "GlossaryDialog");
            var handleResize = function()
                {
                    $("#GlossaryContents").height($(window).height() - 165);
                    $(".GlossaryMenuContainer").height($(window).height() - 165)
                };
            var dlg = newDiv.dialog({
                    autoOpen: false, height: 1, width: 1, title: Resources.GlossaryDialog_Title_Text, closeText: Resources.Dialog_Close_Text, dialogClass: 'GlossaryDialog', draggable: false, resizable: false, modal: true, close: function()
                        {
                            dlg.dialog("destroy").remove();
                            instance = null;
                            views.utils.showNonDialog()
                        }, open: function()
                        {
                            $("#GlossaryDialog").dialog('option', 'height', $(window).height() - 50);
                            $("#GlossaryDialog").dialog('option', 'width', $(window).width() - 50);
                            $("#GlossaryDialog").dialog('option', 'position', 'center');
                            var path = courseController.course.getContentFolderPath() + "Popups/__Glossary.htm";
                            $('#GlossaryDialog').load(path, function()
                            {
                                $('#AppBar_Glossary_Button_Text').text(Resources.AppBar_Glossary_Button_Text);
                                handleResize()
                            });
                            views.utils.hideNonDialog();
                            $(".GlossaryDialog").attr("aria-describedby", "");
                            $(window).bind('resize', function()
                            {
                                handleResize()
                            })
                        }
                });
            return dlg
        }
        return {
                getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }, glossaryJump: function(element)
                    {
                        try
                        {
                            var id = element.innerHTML ? "letter_" + element.innerHTML : element;
                            var topPos = document.getElementById(id).offsetTop;
                            document.getElementById('GlossaryContents').scrollTop = topPos - 10;
                            var j = document.getElementById(id);
                            j.setAttribute('aria-live', 'assertive');
                            j.focus()
                        }
                        catch(e) {}
                    }
            }
    })();
function HeaderLinksView(courseController)
{
    var headerLinksContainer = $('#headerLinksContainer');
    var headerLinks = courseController.course.settings.HeaderLinks;
    for (var i = 0; i < headerLinks.length; i++)
    {
        if (headerLinks[i].IsActive && headerLinks[i].Url.length > 0)
        {
            var headerLinkElem = $('<a href="' + headerLinks[i].Url + '" role="headerlink" class="' + headerLinks[i].CssStyle + '" target="_blank" title="' + headerLinks[i].Name + '"></a>');
            headerLinksContainer.append(headerLinkElem)
        }
    }
    return headerLinksContainer
}
function HelpDialogFastHelpView(helpDialogView)
{
    var rootElem = $('<div id="FastHelpView"/>');
    var categoryContainer = $('<div class="help_categories"/>').appendTo(rootElem);
    var contentContainer = $('<div class="help_content_container"/>');
    contentContainer.append($('<a name="FastHelpTopicContent" href="#" class="help_content_anchor"/>'));
    var topicTitle = $('<h2/>').appendTo(contentContainer);
    var topicContent = $('<div class="help_topic_content"/>').appendTo(contentContainer);
    contentContainer.appendTo(rootElem);
    $('<div class="clear"/>').appendTo(rootElem);
    var categories = null;
    var topics = null;
    var selectedCategory = -1;
    var getCategoryIndex = function(category)
        {
            for (var i = 0; i < categories.length; i++)
                if (categories[i] === category)
                    return i;
            return -1
        };
    var expandCategory = function(category)
        {
            var $category = $(category),
                $expansion = $(category.expansion),
                content = $expansion.children('.help_category_content'),
                expandedHeight = content.height();
            $expansion.removeClass('compressed').stop().animate({height: expandedHeight + 'px'}, 200, function()
            {
                $(this).css('height', 'auto')
            });
            $expansion.attr('aria-hidden', false);
            content.children().first().focus();
            $category.hasClass('accent2') || $category.addClass('accent2');
            selectedCategory = getCategoryIndex(category);
            $category.attr('aria-label', $category.children('h2').text());
            $(category).attr('aria-expanded', true)
        };
    var collapseCategory = function(category, callback)
        {
            var $category = $(category),
                $expansion = $(category.expansion),
                index = getCategoryIndex(category),
                content = $expansion.children('.help_category_content'),
                expandedHeight = content.height();
            $expansion.stop().animate({height: '0px'}, 150, function()
            {
                (selectedCategory === getCategoryIndex(category)) && (selectedCategory = -1);
                $expansion.addClass('compressed');
                $expansion.attr('aria-hidden', true);
                $category.hasClass('accent2') && $category.removeClass('accent2');
                callback && callback()
            });
            $category.attr('aria-expanded', false);
            $category.attr('aria-label', $category.children('h2').text())
        };
    var revealCategory = function()
        {
            var category = this;
            if (selectedCategory !== getCategoryIndex(category))
            {
                if (selectedCategory !== -1)
                    collapseCategory(categories[selectedCategory], function()
                    {
                        expandCategory(category)
                    });
                else
                    expandCategory(category)
            }
            $(category).attr('aria-expanded', true)
        };
    var unrevealCategory = function()
        {
            if (selectedCategory === getCategoryIndex(this))
                collapseCategory(this)
        };
    var toggleCategory = function(ele)
        {
            var category = ele.currentTarget;
            if (selectedCategory !== getCategoryIndex(category))
                revealCategory.call(category);
            else
                unrevealCategory.call(category);
            $(category).children('a.toggle').focus()
        };
    var displayTopic = function()
        {
            $('.help_topic > a.accent2_text').removeClass('accent2_text');
            $(this).addClass('accent2_text');
            topicTitle.html($(this).html());
            topicContent.html($(this).siblings('.help_topic_content').first().html());
            contentContainer.removeClass('noTopic');
            contentContainer.attr('aria-hidden', false).attr('aria-live', 'assertive').attr('aria-relevant', 'additions');
            topicContent.attr('aria-hidden', false).attr('tabindex', -1);
            topicContent.focus()
        };
    var clearTopic = function()
        {
            topicTitle.html('');
            topicContent.html('');
            contentContainer.addClass('noTopic');
            contentContainer.attr('aria-hidden', true)
        };
    rootElem.loadTopics = function(path)
    {
        categoryContainer.load(path, function()
        {
            $('#AppBar_Help_Button_Text').text(Resources.AppBar_Help_Button_Text);
            $('#HelpDialog_Fasthelp_Link_Text').text(Resources.HelpDialog_Fasthelp_Link_Text);
            var accessibleFile = courseController.course.getContentFolderPath() + "Accessibility.htm";
            $('#AccessibilityMode').attr("src", accessibleFile);
            clearTopic();
            categories = categoryContainer.find('.help_category');
            topics = categoryContainer.find('.help_topic');
            selectedCategory = -1;
            categories.each(function()
            {
                this.expansion = $(this).children('.help_category_expansion')[0];
                $(this.expansion).insertAfter(this).addClass('compressed');
                $(this.expansion).attr('aria-hidden', true);
                $(this).attr('role', 'button');
                $(this).attr('aria-expanded', false);
                $(this).attr('aria-label', ($(this).children('h2').text() + ' ' + ($('.help_topic', $(this).next('.help_category_expansion')).length) + ' items'));
                $('.help_topic_content').attr('aria-hidden', true);
                this.toggleButton = $(this).children('a.toggle')[0] || $('<a/>', {'class': 'toggle'}).prependTo(this)[0];
                $(this).attr('tabindex', "0");
                $(this).off('click', toggleCategory).on('click', toggleCategory);
                $(this).off('keyup').on('keyup', function(event)
                {
                    if (event.which == 13)
                    {
                        toggleCategory(event)
                    }
                })
            });
            topics.children('a').on('click', displayTopic)
        })
    };
    return rootElem
}
function HelpDialogNavBarView(helpDialogView)
{
    var navBar = $('<div id="HelpNavBar"></div>');
    try
    {
        if (course.settings.courseDataService && course.settings.courseDataService.CDNAPSPlayer)
        {
            var unorderedList = $('<ul></ul>').append('<li><a href="#" id="HelpNavBarFastHelpLink" class="active">' + Resources.HelpDialog_Buttons_FastHelp_Text + '</a></li>').append('<li><a href="#" id="HelpNavBarSubmitRequestLink">' + Resources.HelpDialog_Buttons_SubmitRequest_Text + '</a></li>')
        }
    }
    catch(e) {}
    $("#HelpNavBar li > a", unorderedList).on('click', function(event)
    {
        event.preventDefault();
        activateLink(this);
        switch (this.id)
        {
            case"HelpNavBarFastHelpLink":
                helpDialogView.Observer.fire("fastHelpLocationClicked");
                break;
            case"HelpNavBarSubmitRequestLink":
                helpDialogView.Observer.fire("submitRequestLocationClicked");
                break
        }
        return false
    });
    navBar.append(unorderedList);
    var activateLink = function(link)
        {
            unorderedList.find('.active').removeClass("active");
            $(link).addClass("active")
        };
    navBar.checkFastHelp = function()
    {
        activateLink(navBar.find('#HelpNavBarFastHelpLink'))
    };
    navBar.checkSubmitRequest = function()
    {
        activateLink(navBar.find('#HelpNavBarSubmitRequestLink'))
    };
    return navBar
}
function HelpDialogSubmitRequestView()
{
    var rootElem = $('<div id="SubmitRequestView"/>');
    rootElem.attr("aria-hidden", "true");
    rootElem.html('Have a technical problem or issue with this course? Here is how to report your problem and get help.' + '<p><strong>Step One: Create a Service Request with <a class="accent_text" style="text-decoration:underline !important;" href="https://mymicrosoftit.microsoft.com/?product=643&search=role guide" target="_blank">My Microsoft IT</a> </strong></p>' + '<ol>' + '<li>Click <a class="accent_text" href="#" id="copyToClipboardLink"><strong>here</strong></a> to copy critical system information to the clipboard. You will use this when creating your help desk ticket.</li>' + '<li>In MyMicrosoftIT site, select the symptom that best matches your concern</li>' + '<li>Describe your problem, including <b>course title,</b> in the description field (and paste the information you put in clipboard in earlier step)</li>' + '</ol>');
    var copySystemInfoToClipboard = function()
        {
            if (window.clipboardData && clipboardData.setData)
                clipboardData.setData('text', player.getHelpDeskCourseInfo())
        };
    rootElem.find('#copyToClipboardLink').on('click', copySystemInfoToClipboard);
    return rootElem
}
var HelpDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "HelpDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, resizable: false, height: 1, width: 1, closeText: Resources.Dialog_Close_Text, dialogClass: 'HelpDialog', draggable: false, resizable: false, modal: true, close: function()
                        {
                            dlg.dialog("destroy").remove();
                            instance = null;
                            views.utils.showNonDialog()
                        }, open: function()
                        {
                            views.utils.sizeDialog(newDiv);
                            $(".HelpDialog .ui-dialog-titlebar").append(navBarView);
                            var path = courseController.course.getContentFolderPath() + "Popups/__Help.htm";
                            try
                            {
                                fastHelpView.loadTopics(path);
                                showFastHelp();
                                navBarView.checkFastHelp()
                            }
                            catch(e) {}
                            views.utils.hideNonDialog();
                            $('.HelpDialog').attr("aria-describedby", "")
                        }
                });
            dlg.Observer = new Observer;
            var navBarView = new HelpDialogNavBarView(dlg);
            var dialogContent = $('<div id="HelpPopupContent"/>').appendTo(dlg);
            try
            {
                var fastHelpView = new HelpDialogFastHelpView(dlg);
                fastHelpView.appendTo(dialogContent);
                var showFastHelp = function()
                    {
                        dialogContent.removeClass('helpRequestMode')
                    };
                var showSubmitRequest = function()
                    {
                        dialogContent.addClass('helpRequestMode')
                    };
                dlg.Observer.observe("fastHelpLocationClicked", showFastHelp);
                dlg.Observer.observe("submitRequestLocationClicked", showSubmitRequest)
            }
            catch(e) {}
            return dlg
        }
        return {getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }}
    })();
var InfoButtonView = function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var rootElem = views.utils.createMetroButton("InfoMetroButton", "");
            rootElem.children('.MetroIcon').removeClass('MetroIcon').addClass('Metro24Icon');
            rootElem.addClass('InfoMetroButton');
            rootElem.attr('title', 'Show page information');
            return rootElem
        }
        return {
                getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }, bind: function(name, action)
                    {
                        this.getInstance().unbind(name).bind(name, action)
                    }, show: function(action)
                    {
                        this.getInstance().show()
                    }, hide: function()
                    {
                        this.getInstance().hide()
                    }
            }
    }();
var LanguageDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "LanguageDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, width: 800, height: 500, title: Resources.LanguageDialog_Title_Text, closeText: Resources.Dialog_Close_Text, dialogClass: 'LanguageDialog', modal: true, open: function()
                        {
                            $("#LanguageDialog").dialog('option', 'height', $(window).height() - 40);
                            $("#LanguageDialog").dialog('option', 'width', $(window).width() - 40);
                            $("#LanguageDialog").dialog('option', 'position', 'center');
                            newDiv.html(buildDialog());
                            $("#LanguageDialog").attr("aria-describedby", "")
                        }, draggable: false, resizable: false
                });
            return dlg
        }
        return {
                getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }, changeLanguage: function(code)
                    {
                        courseController.course.scormState.setState("language", code);
                        courseController.course.scormState.save();
                        courseController.course.language.reloading = true;
                        location.reload()
                    }
            };
        function buildDialog()
        {
            var s = '<div class="LanguageBoxContainer">';
            var arr = courseController.course.language.languageArray;
            for (var i in arr)
            {
                if (i != "shuffle")
                {
                    var selectedStyle = i == courseController.course.language.code ? 'LanguageBoxSelected accent' : 'LanguageBoxUnselected';
                    s += '<a class="LanguageBox ' + selectedStyle + '" href="#" onclick="LanguageDialogView.changeLanguage(\'' + i + '\');return false;">' + arr[i] + '</a>'
                }
            }
            return s + '</div>'
        }
    })();
var LoadingDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var dlg = $('<div id="loadingDialogView" />').dialog({
                    autoOpen: false, closeOnEscape: false, draggable: false, modal: true, width: 'auto', minHeight: 'auto', buttons: {}, resizable: false, open: function()
                        {
                            $(".ui-dialog-titlebar-close").hide()
                        }
                });
            return dlg
        }
        return {
                open: function(title, text)
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    instance.dialog('open');
                    instance.dialog('option', 'title', title);
                    instance.text(text)
                }, close: function()
                    {
                        $(".ui-dialog-titlebar-close").show();
                        if (instance)
                        {
                            instance.dialog('close')
                        }
                    }
            }
    })();
function NavBarView(courseController)
{
    var rootElem = $('<div/>', {'class': 'navbar'}),
        nextButtonView = new NextButtonView(courseController),
        previousButtonView = new PreviousButtonView(courseController);
    rootElem.append('<div id="CaptionsContainer" aria-hidden="true"/>');
    rootElem.append(previousButtonView);
    rootElem.append(nextButtonView);
    return rootElem
}
function NextButtonView(courseController)
{
    var rootElem = views.utils.createMetroButton('NextMetroButton', '');
    var setAccessibleTitle = function(val)
        {
            rootElem.prop("title", val);
            rootElem.find(".MetroButtonLabel").html("<span class='visuallyhidden'>" + val + "</span>")
        };
    setAccessibleTitle(Resources.NavigationBar_NextPage_Button_Title);
    rootElem.click(function()
    {
        !rootElem.hasClass('disabled') && courseController.navigateNext()
    });
    var updateTitle = function(page)
        {
            if (page.Assessment && page.Assessment.hasNextLocation())
            {
                if (page.Assessment.LocationIndex == page.Assessment.NavigationNodes.length - 2)
                    setAccessibleTitle(Resources.NavigationBar_Assessment_Review_Button_Title);
                else
                    setAccessibleTitle(Resources.NavigationBar_Assessment_NextQuestion_Button_Title)
            }
            else if (page.BranchingGraph && page.BranchingGraph.usePlayerNavigation)
            {
                var currentLocation = page.BranchingGraph.getCurrentLocation();
                if (currentLocation && (currentLocation.canMoveForward() || !currentLocation.interactionComplete()))
                    setAccessibleTitle(Resources.NavigationBar_Branching_NextStep_Button_Title);
                else
                    setAccessibleTitle(Resources.NavigationBar_NextPage_Button_Title)
            }
            else
            {
                setAccessibleTitle(Resources.NavigationBar_NextPage_Button_Title)
            }
        };
    courseController.course.observer.observe("navigatedToPage", function(page)
    {
        if ((page.Assessment && page.Assessment.hasNextLocation()) || page.navNext)
        {
            rootElem.css("visibility", "visible");
            updateTitle(page)
        }
        else
        {
            rootElem.css("visibility", "hidden")
        }
    });
    var assessmentStateChangeHandler = function(assessment)
        {
            if (assessment.Page === courseController.course.getCurrentPage())
            {
                if (assessment.hasNextLocation() || assessment.Page.navNext)
                {
                    rootElem.css("visibility", "visible");
                    updateTitle(assessment.Page)
                }
                else
                {
                    rootElem.css("visibility", "hidden")
                }
            }
        };
    var branchingStateChangeHandler = function(branchingGraph)
        {
            if (branchingGraph.usePlayerNavigation && branchingGraph.page === courseController.course.getCurrentPage())
            {
                var currentLocation = branchingGraph.getCurrentLocation();
                if (currentLocation && (currentLocation.canMoveForward() || !currentLocation.interactionComplete()) || branchingGraph.page.navNext)
                {
                    rootElem.css("visibility", "visible");
                    updateTitle(branchingGraph.page)
                }
                else
                {
                    rootElem.css("visibility", "hidden")
                }
            }
        };
    courseController.course.observer.observe("assessmentLocationChanged", assessmentStateChangeHandler);
    courseController.course.observer.observe("assessmentQuestionScored", assessmentStateChangeHandler);
    courseController.course.observer.observe("branchingLocationChanged", branchingStateChangeHandler);
    courseController.course.observer.observe("branchingStateChanged", branchingStateChangeHandler);
    return rootElem
}
function NotifyUserView(cc)
{
    var notifyUser = function(text)
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "NotifyDialog");
            var recenterDialog = function()
                {
                    newDiv.dialog('option', 'position', 'center')
                };
            newDiv.html(text).dialog({
                title: Resources.Notify_Title_Text, closeText: Resources.Dialog_Close_Text, dialogClass: 'NotifyDialog', modal: true, draggable: false, resizable: false, width: '100%', position: 'center', open: function()
                    {
                        $(window).on('resize', recenterDialog);
                        $('#container').attr('aria-hidden', true);
                        $('.NotifyDialog').attr("role", "dialog")
                    }, close: function()
                    {
                        $(window).off('resize', recenterDialog);
                        $(this).dialog('destroy').remove();
                        $('#container').attr('aria-hidden', false)
                    }, buttons: [{
                            id: "button-ok", text: Resources.Notify_OK_Text, click: function()
                                {
                                    $(this).dialog("close")
                                }
                        }]
            })
        };
    cc.course.observer.observe('notifyNavigateLinearRequired', function(page)
    {
        if (page.navRestrictionMsg)
        {
            notifyUser(page.navRestrictionMsg)
        }
        else
        {
            notifyUser(Resources.Navigation_LinearRequiredComplete)
        }
    });
    cc.course.observer.observe('notifyNavigateModuleLocked', function(page)
    {
        var sModules = page.modulesToComplete;
        var aParts = sModules.split(',');
        var sB = "";
        for (var i = 0; i < aParts.length; i++)
        {
            var index = aParts[i] - 1;
            if (!page.course.modules[index].pageState.isOptional && page.course.modules[index].pageState.status != "P")
            {
                if (sB != "")
                {
                    sB += ', '
                }
                sB += page.course.modules[index].name
            }
        }
        notifyUser(Resources.Navigation_CannotEnter + " " + sB)
    });
    cc.course.observer.observe('notifySbaLinear', function(page)
    {
        notifyUser(Resources.SBA_LinearNavigationRequired_Text)
    });
    cc.course.observer.observe('notifyCheckAnswerFail', function()
    {
        notifyUser(Resources.Assessment_Buttons_CheckAnswerFail_Text)
    });
    cc.course.observer.observe('notifyScoreQuestionRequired', function()
    {
        notifyUser(Resources.Assessment_Notify_ScoreQuestionRequired_Text)
    });
    cc.course.observer.observe('notifyRetryQuestionRequired', function()
    {
        notifyUser(Resources.Assessment_Notify_RetryQuestionRequired_Text)
    });
    cc.course.observer.observe('notifyBranchingContentNotViewed', function()
    {
        notifyUser(Resources.Branching_Notify_ContentNotViewed_Text)
    });
    cc.course.observer.observe('notifyBranchingContentIncomplete', function()
    {
        notifyUser(Resources.Branching_Notify_ContentIncomplete_Text)
    });
    cc.course.observer.observe('notifyBranchingQuestionNotAnswered', function()
    {
        notifyUser(Resources.Branching_Notify_QuestionNotAnswered_Text)
    });
    cc.course.observer.observe('notifyBranchingQuestionMustRetry', function()
    {
        notifyUser(Resources.Branching_Notify_QuestionMustRetry_Text)
    });
    cc.course.observer.observe('notifyBranchingFeedbackContentNotViewed', function()
    {
        notifyUser(Resources.Branching_Notify_FeedbackContentNotViewed_Text)
    });
    cc.course.observer.observe('notifyBranchingFeedbackContentIncomplete', function()
    {
        notifyUser(Resources.Branching_Notify_FeedbackContentIncomplete_Text)
    });
    cc.course.observer.observe('nextAttemptWaitWarning', function(date)
    {
        if (date)
        {
            var dDate = new Date(date);
            var sDate = (new Date).toDateString() == dDate.toDateString() ? dDate.toLocaleTimeString() : dDate.toLocaleString();
            notifyUser(Resources.Assessment_HoursBeforeNextAttempt_WaitMsg_Text.replace(/%%date%%/g, sDate))
        }
    });
    return {notify: notifyUser}
}
var ObjectivesDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "ObjectivesDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, height: 1, width: 1, closeText: Resources.Dialog_Close_Text, dialogClass: 'ObjectivesDialog', draggable: false, resizable: false, modal: true, open: function()
                        {
                            views.utils.sizeDialog(newDiv);
                            var s = "<ol>";
                            for (var i = 0; i < course.objectives.length; i++)
                            {
                                s += "<li>" + course.objectives[i].Name + "</li>"
                            }
                            s += "</ol>";
                            newDiv.html(s)
                        }
                });
            return dlg
        }
        return {getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }}
    })();
function PreviousButtonView(courseController)
{
    var rootElem = views.utils.createMetroButton('PreviousMetroButton', '');
    var setAccessibleTitle = function(val)
        {
            rootElem.prop("title", val);
            rootElem.find(".MetroButtonLabel").html("<span class='visuallyhidden'>" + val + "</span>")
        };
    setAccessibleTitle(Resources.NavigationBar_PreviousPage_Button_Title);
    rootElem.click(function()
    {
        courseController.navigatePrevious()
    });
    var updateTitle = function(page)
        {
            if (page.Assessment && page.Assessment.hasPreviousLocation())
            {
                if (page.Assessment.LocationIndex == 1)
                    setAccessibleTitle(Resources.NavigationBar_Assessment_Introduction_Button_Title);
                else
                    setAccessibleTitle(Resources.NavigationBar_Assessment_PreviousQuestion_Button_Title)
            }
            else if (page.BranchingGraph && page.BranchingGraph.usePlayerNavigation && page.BranchingGraph.canMoveBackward())
                setAccessibleTitle(Resources.NavigationBar_Branching_PreviousStep_Button_Title);
            else
                setAccessibleTitle(Resources.NavigationBar_PreviousPage_Button_Title)
        };
    courseController.course.observer.observe("navigatedToPage", function(page)
    {
        if ((page.Assessment && page.Assessment.hasPreviousLocation()) || page.navPrevious)
        {
            rootElem.css("visibility", "visible");
            updateTitle(page)
        }
        else
        {
            rootElem.css("visibility", "hidden")
        }
    });
    courseController.course.observer.observe("assessmentLocationChanged", function(assessment)
    {
        if (assessment.Page === courseController.course.getCurrentPage())
        {
            if (assessment.hasPreviousLocation() || assessment.Page.navPrevious)
            {
                rootElem.css("visibility", "visible");
                updateTitle(assessment.Page)
            }
            else
            {
                rootElem.css("visibility", "hidden")
            }
        }
    });
    courseController.course.observer.observe("branchingLocationChanged", function(branchingGraph)
    {
        if (branchingGraph.usePlayerNavigation && branchingGraph.page === courseController.course.getCurrentPage())
        {
            if (branchingGraph.canMoveBackward() || branchingGraph.page.navPrevious)
            {
                rootElem.css("visibility", "visible");
                updateTitle(branchingGraph.page)
            }
            else
            {
                rootElem.css("visibility", "hidden")
            }
        }
    });
    return rootElem
}
function QuickLinksView(courseController, quickLinksContainer, quickLinks, quickLinksButton)
{
    quickLinksContainer.attr('aria-hidden', true);
    quickLinks.attr('aria-hidden', true);
    var eventType = "";
    var contentsElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_TableOfContents_Button_Text + '</a>');
    quickLinks.append(contentsElem);
    contentsElem.click(function()
    {
        hideQuickLinks();
        window.quickLinksButton = quickLinksButton;
        courseController.showContentsDialog()
    });
    if (courseController.course.testOutPage)
    {
        var testOutElem = $('<a tabindex="-1" href="#" role="">' + Resources.Testout_AppBar_Button_Text + '</a>');
        quickLinks.append(testOutElem);
        testOutElem.click(function()
        {
            hideQuickLinks();
            courseController.navigateToTestOut();
            $(this).blur()
        })
    }
    if (courseController.course.settings.hasTracks && courseController.course.tracks.canUserSelect)
    {
        var changeTracksElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_ChangeTracks_Button_Text + '</a>');
        quickLinks.append(changeTracksElem);
        changeTracksElem.click(function()
        {
            hideQuickLinks();
            window.quickLinksButton = quickLinksButton;
            courseController.showTracksDialog()
        })
    }
    if (courseController.course.settings.ShowResources)
    {
        var resourcesElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_Resources_Button_Text + '</a>');
        quickLinks.append(resourcesElem);
        resourcesElem.click(function()
        {
            hideQuickLinks();
            window.quickLinksButton = quickLinksButton;
            courseController.showResourcesDialog()
        })
    }
    if (courseController.course.settings.CourseTranscript != "")
    {
        var transcriptElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_CourseTranscript_Button_Text + '</a>');
        quickLinks.append(transcriptElem);
        transcriptElem.click(function()
        {
            hideQuickLinks();
            quickLinksButton.focus();
            courseController.showCourseTranscript(0)
        })
    }
    if (courseController.course.settings.DiscussionLink != "")
    {
        var discussionLinkElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_Discussion_Button_Text + '</a>');
        quickLinks.append(discussionLinkElem);
        discussionLinkElem.click(function()
        {
            hideQuickLinks();
            quickLinksButton.focus();
            open(courseController.course.settings.DiscussionLink, "DiscussionLink")
        })
    }
    if (courseController.course.settings.ShowGlossary)
    {
        var glossaryElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_Glossary_Button_Text + '</a>');
        quickLinks.append(glossaryElem);
        glossaryElem.click(function()
        {
            hideQuickLinks();
            window.quickLinksButton = quickLinksButton;
            courseController.showGlossaryDialog()
        })
    }
    if (courseController.course.language.count > 1)
    {
        var langaugesElem = $('<a tabindex="-1" href="#" role="" id="changeLanguage">' + Resources.AppBar_Languages_Button_Text + '</a>');
        quickLinks.append(langaugesElem);
        langaugesElem.click(function()
        {
            hideQuickLinks();
            window.quickLinksButton = quickLinksButton;
            courseController.showLanguageDialog()
        })
    }
    var helpElem = $('<a tabindex="-1" href="#" role="">' + Resources.AppBar_Help_Button_Text + '</a>');
    quickLinks.append(helpElem);
    helpElem.click(function()
    {
        hideQuickLinks();
        window.quickLinksButton = quickLinksButton;
        courseController.showHelpDialog()
    });
    courseController.course.observer.observe("quickLinksButtonClicked", function()
    {
        if (quickLinksContainer.height() === 0)
        {
            showQuickLinks()
        }
        else
        {
            hideQuickLinks()
        }
    });
    var showQuickLinks = function()
        {
            quickLinksContainer.css({width: (quickLinks.outerWidth() - 5) + 'px'}).stop().animate({height: quickLinks.outerHeight() + 'px'}, 300);
            $('#quickLinksButton').attr('aria-expanded', true);
            quickLinksContainer.attr('aria-hidden', false);
            quickLinks.attr('aria-hidden', false);
            quickLinksContainer.find('a').attr('tabindex', "0").attr('aria-hidden', false)
        };
    var hideQuickLinks = function()
        {
            quickLinksContainer.stop().animate({height: '0px'}, 300);
            $('#quickLinksButton').attr('aria-expanded', false);
            quickLinksContainer.attr('aria-hidden', true);
            quickLinks.attr('aria-hidden', true);
            quickLinksContainer.find('a').attr('tabindex', "-1").attr('aria-hidden', true)
        };
    quickLinksContainer.bind('mouseleave', function(event)
    {
        hideQuickLinks()
    });
    quickLinksContainer.bind('focusin', function(event){});
    quickLinksContainer.bind('focusout', function(event){});
    quickLinksContainer.bind('keydown', function(e)
    {
        if (e.keyCode === 40)
        {
            if ($(document.activeElement).parent('#quickLinks').length > 0)
                $(document.activeElement).next().trigger('focus')
        }
        else if (e.keyCode === 38)
        {
            if ($(document.activeElement).parent('#quickLinks').length > 0)
                $(document.activeElement).prev().trigger('focus')
        }
        else if (e.keyCode === 9)
        {
            if ($(':focus').text() == $('#quickLinks a:last-child').text())
            {
                console.log('last child. yeah.');
                if (e.shiftKey)
                {
                    e.stopPropagation()
                }
                else
                {
                    hideQuickLinks()
                }
            }
        }
        else if (e.keyCode === 27)
        {
            hideQuickLinks();
            quickLinksButton.focus()
        }
    });
    quickLinksButton.attr('aria-label', Resources.Header_QuickLinks_Label.replace('{0}', $('a', quickLinksContainer).length));
    return quickLinksContainer
}
var ReportProblemDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "ReportProblemDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, width: 1, height: 1, title: Resources.ReportProblemDialog_Title_Text, closeText: Resources.Dialog_Close_Text, dialogClass: 'ReportProblemDialog', draggable: false, resizable: false, modal: true, open: function()
                        {
                            views.utils.sizeDialog(newDiv);
                            targetSubmission();
                            newDiv.focus().scrollTop(0);
                            views.utils.showNonDialog()
                        }, close: function()
                        {
                            rpForm && rpForm.children('input').val('');
                            dialogContent.find('textarea').val('');
                            rpFrame && rpFrame.remove();
                            rpFrame = null;
                            views.utils.hideNonDialog()
                        }
                });
            var dialogContent = $('<div id="ReportProblemPopupContent"/>').appendTo(dlg);
            var rpForm = $('<form target="reportProblemFrame" id="reportProblem" method="post" action="https://bprthritws/issuelog/issuelog.asmx/WriteApplicationError" style="width:0px;height:0px;position:absolute;left:-9999px;visibility:hidden;"><input name="applicationName" type="hidden"/><input name="userName" type="hidden"/><input name="issueDate" type="hidden"/><input name="issueDesc" type="hidden"/><input name="sourceComponent" type="hidden"/><input name="sourceMethod" type="hidden"/></form>').appendTo(dlg);
            var rpFrame = null;
            var targetSubmission = function()
                {
                    rpFrame = $('<iframe frameborder="0" width="0" height="0" id="reportProblemFrame" name="reportProblemFrame" style="width:0px;height:0px;position:absolute;left:-9999px;"></iframe>').appendTo(instance);
                    rpFrame[0].onload = function()
                    {
                        try
                        {
                            if (this.contentWindow.location.href === "about:blank")
                                return
                        }
                        catch(e) {}
                        newDiv.dialog('close');
                        player.notifyUserView.notify("Problem report has been sent")
                    }
                };
            var submit = function()
                {
                    var now = new Date;
                    rpForm.children('input[name="applicationName"]').val('LearningCentralReportingSolution');
                    rpForm.children('input[name="userName"]').val(courseController.course.scormState.getLearnerId());
                    rpForm.children('input[name="issueDate"]').val((now.getMonth() + 1).toString() + '/' + now.getDate().toString() + '/' + now.getFullYear().toString());
                    rpForm.children('input[name="sourceComponent"]').val('AccessPoint Player');
                    rpForm.children('input[name="sourceMethod"]').val('some method here');
                    var userAgent = navigator.userAgent,
                        browserType = $('[name="ReportProblemBrowser"]:checked').val();
                    if (browserType)
                    {
                        var match = navigator.userAgent.match(/MSIE [0-9,\.]+/);
                        match && match.length > 0 && (userAgent = userAgent.replace(match, match + browserType))
                    }
                    rpForm.children('input[name="issueDesc"]').val("b:" + courseController.course.buildId + "~" + "p:" + courseController.course.scormState.bookmark + "~" + "u:" + courseController.course.scormState.getLearnerId() + "~" + "n:" + userAgent + "~" + "l:" + ($('[name="ReportProblemLocation"]:checked').val() || 0) + "~" + "ct:" + $("#ReportProblemCity").val() + "~" + "cn:" + $("#ReportProblemCountry").val() + "~" + "a:" + ($('[name="ReportProblemAccess"]:checked').val() || 0) + "~" + "c:" + ($('[name="ReportProblemConnection"]:checked').val() || 0) + "~" + "s:" + ($('[name="ReportProblemOS"]:checked').val() || 0) + "~" + "d:" + $("#ReportProblemComments").val());
                    rpForm[0].submit()
                };
            dialogContent.html(function()
            {
                var s = '';
                s += '<div class="formsection"><h5>Location</h5>';
                s += '<div class="formfield">';
                s += '<input type="radio" name="ReportProblemLocation" id="ReportProblemLocationHome" value="1"/><label for="ReportProblemLocationHome">Home</label>';
                s += '<input type="radio" name="ReportProblemLocation" id="ReportProblemLocationHome" value="2"/><label for="ReportProblemLocationOffice">Office</label>';
                s += '</div>';
                s += '<div class="formfield halfwidth"><label for="ReportProblemCity">City</label><input type="text" id="ReportProblemCity" maxlength="50" aria-label="Enter your city"/></div>';
                s += '<div class="formfield halfwidth"><label for="ReportProblemCountry">Country</label><input type="text" id="ReportProblemCountry" maxlength="50" aria-label="Enter your country"/></div>';
                s += '</div>';
                s += '<div class="formsection"><h5>Connection</h5>';
                s += '<div class="formfield">';
                s += '<input type="radio" name="ReportProblemAccess" id="ReportProblemAccessDirect" value="1"/><label for="ReportProblemAccessDirect">Direct Access</label>';
                s += '<input type="radio" name="ReportProblemAccess" id="ReportProblemAccessVPN" value="2"/><label for="ReportProblemAccessVPN">VPN</label>';
                s += '</div>';
                s += '<div class="formfield">';
                s += '<input type="radio" name="ReportProblemConnection" id="ReportProblemConnectionWireless" value="1"/><label for="ReportProblemConnectionWireless">Wireless</label>';
                s += '<input type="radio" name="ReportProblemConnection" id="ReportProblemConnectionWired" value="2"/><label for="ReportProblemConnectionWired">Wired</label>';
                s += '</div></div>';
                s += '<div class="formsection"><h5>Operating System</h5>';
                s += '<div class="formfield">';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSW8" value="1"/><label for="ReportProblemW8">Windows 8</label>';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSW81" value="2"/><label for="ReportProblemOSW81">Windows 8.1</label>';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSW7" value="3"/><label for="ReportProblemOSW7">Windows 7</label>';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSWXP" value="4"/><label for="ReportProblemOSXP">Windows XP</label>';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSW2008" value="5"/><label for="ReportProblemOSW2008">Windows Server 2008</label>';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSM10" value="6"/><label for="ReportProblemOSM10">Mac OS 10</label>';
                s += '<input type="radio" name="ReportProblemOS" id="ReportProblemOSOther" value="7"/><label for="ReportProblemOSOther">Other</label>';
                s += '</div></div>';
                var msieversion = views.utils.msieversion();
                if (msieversion && +msieversion == 10)
                {
                    s += '<div class="formsection"><h5>Browser</h5>';
                    s += '<div class="formfield">';
                    s += '<input type="radio" name="ReportProblemBrowser" id="ReportProblemBrowserModern" value="m"/><label for="ReportProblemBrowserModern">IE 10 Modern</label>';
                    s += '<input type="radio" name="ReportProblemBrowser" id="ReportProblemBrowserClassic" value="c"/><label for="ReportProblemBrowserClassic">IE 10 Classic</label>';
                    s += '</div></div>'
                }
                s += '<div class="formsection"><h5>General Comments</h5>';
                s += '<div class="formfield"><textarea id="ReportProblemComments" rows="10" cols="50" maxlength="800" aria-label="Enter your response" role="textbox" aria-multiline="true"></textarea></div>';
                s += '</div>';
                return s
            }());
            views.utils.createButton("SubmitProblemReport", "Submit").addClass('accent2').addClass('accent2_border').appendTo(dialogContent).click(submit);
            return dlg
        }
        return {getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }}
    })();
var ResourcesDialogView = (function()
    {
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div'));
            newDiv.attr("id", "ResourcesDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, width: 1, height: 1, title: Resources.ResourcesDialog_Title_Text, closeText: Resources.Dialog_Close_Text, dialogClass: 'ResourcesDialog', draggable: false, resizable: false, modal: true, close: function()
                        {
                            dlg.dialog("destroy").remove();
                            views.utils.showNonDialog()
                        }, open: function()
                        {
                            views.utils.sizeDialog(newDiv);
                            if (window.clipboardData && clipboardData.setData)
                            {
                                $(".ResourcesDialog .ui-dialog-titlebar").append('<div style="margin-left:200px;" id="HelpNavBar"><ul><li><a id="CopyResourcesToClipboardLink" href="#">copy to clipboard</a></li></ul></div>')
                            }
                            newDiv.html(buildDialog());
                            $(dlg).find(".ui-dialog-titlebar-close").attr("title", "");
                            $("#CopyResourcesToClipboardLink").click(function()
                            {
                                if (window.clipboardData && clipboardData.setData)
                                {
                                    var table = document.getElementById("ResourcesDialogTable");
                                    clipboardData.setData('text', table.textContent || table.innerText)
                                }
                            });
                            $(function()
                            {
                                $('tr.ResourcesDialogHeader').click(function()
                                {
                                    $(this).siblings('.child-' + this.id).toggle();
                                    if ($(this).hasClass('ResourcesDialogExpanded'))
                                    {
                                        $(this).addClass('ResourcesDialogCollapsed').removeClass('ResourcesDialogExpanded')
                                    }
                                    else
                                    {
                                        $(this).addClass('ResourcesDialogExpanded').removeClass('ResourcesDialogCollapsed')
                                    }
                                })
                            });
                            views.utils.hideNonDialog();
                            $('.ResourcesDialog').attr("aria-describedby", "")
                        }
                });
            return dlg
        }
        return {getInstance: function()
                {
                    var inst = new PrivateConstructor;
                    inst.constructor = null;
                    return inst
                }};
        function buildDialog()
        {
            var s = '<table id="ResourcesDialogTable" class="ResourcesDialogTable">';
            var id = "";
            for (var i = 0; i < course.PageLinkArray.length; i++)
            {
                if (courseController.course.PageLinkArray[i].id != id)
                {
                    if (courseController.course.PageLinkArray[i].id == "course")
                    {
                        var sIdLabel = Resources.ResourcesDialog_Header_Course
                    }
                    else
                    {
                        var sIdLabel = Resources.ResourcesDialog_Header_Page + courseController.getPageNameFromId(courseController.course.PageLinkArray[i].id)
                    }
                    s += '<tr class="ResourcesDialogHeader ResourcesDialogExpanded" id="RDrow' + courseController.course.PageLinkArray[i].id + '">';
                    s += '<td class="ResourcesDialogToggle"></td>';
                    if (id)
                    {
                        s += '<th colspan="2">';
                        s += '<span style="display:none;">-------------------------------------------------------------------</span>';
                        s += String.fromCharCode(13) + String.fromCharCode(13) + sIdLabel;
                        s += '</th>'
                    }
                    else
                        s += '<th colspan="2">' + sIdLabel + '</th>';
                    s += '</tr>';
                    s += String.fromCharCode(13);
                    id = courseController.course.PageLinkArray[i].id
                }
                var sURL = courseController.course.PageLinkArray[i].source;
                s += '<tr class="child-RDrow' + courseController.course.PageLinkArray[i].id + '">';
                s += '<td></td>';
                s += '<td>' + String.fromCharCode(13) + '<a href="' + sURL + '" target="_blank" class="ResourcesDialogLink">' + courseController.course.PageLinkArray[i].name + '</a>';
                s += '<span style="display:none;">: ' + sURL + '</span>';
                s += String.fromCharCode(13);
                s += '<div class="ResourcesDialogDescription">' + courseController.course.PageLinkArray[i].description + '</div>';
                s += String.fromCharCode(13);
                s += '</td></tr>'
            }
            s += '</table>';
            return s
        }
    })();
function SplitterView(collapsed)
{
    var splitter = $("<div />", {"class": "Splitter accent"});
    splitter.collapsed = collapsed;
    if (splitter.collapsed)
    {
        splitter.addClass('SplitterCollapsed')
    }
    else
    {
        splitter.addClass('SplitterExpanded')
    }
    splitter.click(function()
    {
        if (!splitter.collapsed)
        {
            splitter.collapsed = true;
            splitter.removeClass('SplitterExpanded').addClass('SplitterCollapsed')
        }
        else
        {
            splitter.collapsed = false;
            splitter.removeClass('SplitterCollapsed').addClass('SplitterExpanded')
        }
    });
    return splitter
}
var TracksDialogView = (function()
    {
        var instance = null;
        function PrivateConstructor()
        {
            var newDiv = $(document.createElement('div')).attr("id", "TracksDialog");
            var dlg = newDiv.dialog({
                    autoOpen: false, width: 1, height: 1, title: Resources.TracksDialog_Title_Text, close: function()
                        {
                            dlg.dialog("destroy").remove();
                            instance = null;
                            views.utils.showNonDialog()
                        }, open: function()
                        {
                            $("#TracksDialog").dialog('option', 'height', $(window).height() - 50);
                            $("#TracksDialog").dialog('option', 'width', $(window).width() - 50);
                            $("#TracksDialog").dialog('option', 'position', 'center');
                            newDiv.html(buildDialog());
                            updateWarningMessage();
                            views.utils.hideNonDialog();
                            $("#TracksDialog").attr("aria-describedby", "")
                        }, closeText: Resources.Dialog_Close_Text, dialogClass: 'TracksDialog no-close', draggable: false, resizable: false, modal: true, buttons: [{
                                id: "button-ok", text: Resources.TracksDialog_SelectAndContinue_Button_Text, click: function()
                                    {
                                        updateTracksSelection();
                                        $(this).dialog("close");
                                        views.utils.showNonDialog()
                                    }
                            }]
                });
            return dlg
        }
        function updateWarningMessage()
        {
            var nCount = 0;
            $('input[class=tracksCheckbox]').each(function()
            {
                if (this.checked)
                {
                    nCount++
                }
            });
            if (nCount < course.tracks.trackSelectionMin && course.tracks.trackSelectionMin != 0)
            {
                var msg = Resources.TracksDialog_EnforceSelectionMinimum.replace("%%minTracks%%", course.tracks.trackSelectionMin);
                $("#button-ok").button("disable")
            }
            else if (nCount > course.tracks.trackSelectionMax && course.tracks.trackSelectionMax != 0)
            {
                var msg = Resources.TracksDialog_EnforceSelectionMaximum.replace("%%maxTracks%%", course.tracks.trackSelectionMax);
                $("#button-ok").button("disable")
            }
            else if (course.tracks.trackSelectionMin != nCount && course.tracks.trackSelectionMin != 0 && course.tracks.trackSelectionMax != 0)
            {
                var msg = Resources.TracksDialog_EnforceSelectionRange;
                msg = msg.replace("%%minTracks%%", course.tracks.trackSelectionMin);
                msg = msg.replace("%%maxTracks%%", course.tracks.trackSelectionMax);
                $("#button-ok").button("enable")
            }
            else
            {
                var msg = "";
                $("#button-ok").button("enable")
            }
            $("#tracksDialogWarning").html(msg)
        }
        function buildDialog()
        {
            var s = '<div class="tracksBoxContainer"><div class="dialogInstructions">' + Resources.TracksDialog_HeaderInfo_Text + '</div>';
            s += '';
            for (var i = 0; i < course.tracks.items.length; i++)
            {
                var checkedVal = course.tracks.items[i].state.isSelected ? 'checked = "checked"' : "";
                var requiredVal = course.tracks.items[i].required ? 'disabled = "disabled"' : "";
                var checkedStyle = course.tracks.items[i].state.isSelected ? 'tracksBoxSelected accent' : 'tracksBoxUnselected';
                s += '<div class="tracksBox ' + checkedStyle + '" id="tracksBox' + i + '" onclick="TracksDialogView.selectionChange(' + i + ')">';
                s += '<label class="tracksDialogTrackName">';
                s += '<input class="tracksCheckbox" name="tracksCheckbox' + i + '" type="checkbox" id="tracksCheckbox' + i + '" ' + checkedVal + ' ' + requiredVal + '>';
                s += course.tracks.items[i].name + '</label>';
                s += '<div class="tracksDialogTrackDescription">' + course.tracks.items[i].description + '</div></div>'
            }
            s += '</div>';
            s += '<div id="tracksDialogWarning"></div>';
            return s
        }
        function updateTracksSelection()
        {
            var nIndex = 0;
            $('input[class=tracksCheckbox]').each(function()
            {
                course.tracks.items[nIndex].state.isSelected = this.checked;
                nIndex++
            });
            var sB = "";
            for (var i = 0; i < course.tracks.items.length; i++)
            {
                if (course.tracks.items[i].state.isSelected)
                {
                    if (sB != "")
                        sB += ',';
                    sB += (i + 1)
                }
            }
            course.scormState.setState("TRACKS", sB);
            course.loadPageNavigation();
            course.updateForAssessments();
            if (!course.navigationStarted)
            {
                course.navigationStarted = true;
                courseController.navigateToStartupPage()
            }
        }
        return {
                getInstance: function()
                {
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    return instance
                }, selectionChange: function(index)
                    {
                        if (course.tracks.items[index].required)
                        {
                            courseController.alert(Resources.TracksDialog_RequiredWarning_Text);
                            return
                        }
                        if ($("#tracksBox" + index).hasClass("tracksBoxSelected"))
                        {
                            $("#tracksBox" + index).removeClass("tracksBoxSelected").addClass("tracksBoxUnselected");
                            document.getElementById("tracksCheckbox" + index).checked = false
                        }
                        else
                        {
                            $("#tracksBox" + index).removeClass("tracksBoxUnselected").addClass("tracksBoxSelected");
                            document.getElementById("tracksCheckbox" + index).checked = true
                        }
                        updateWarningMessage()
                    }
            }
    })();
function TranscriptView(id, cc)
{
    var tpv = this;
    tpv.htmTranscriptFilePath = "";
    tpv.newDiv = $('<div style="display:none;"/>');
    tpv.newDiv.attr("id", id);
    tpv.iframe = $(document.createElement('iframe'));
    tpv.iframe.css('height', '100%');
    tpv.iframe.css('width', '100%');
    tpv.iframe.on('load', function()
    {
        tpv.iframe.loaded = true;
        if ($('html', document).hasClass('light_theme'))
        {
            $('html', this.contentDocument).addClass('light_theme')
        }
        if ($('html', document).hasClass('blackonwhite'))
        {
            $('html', this.contentDocument).addClass('blackonwhite')
        }
        if ($('html', document).hasClass('whiteonblack'))
        {
            $('html', this.contentDocument).addClass('whiteonblack')
        }
        if ($('html', document).hasClass('rtl'))
        {
            $('html', this.contentDocument).addClass('rtl');
            $("html", this.contentDocument).attr("dir", "rtl")
        }
        var $head = tpv.iframe.contents().find("head");
        $head.append($("<link/>", {
            rel: "stylesheet", href: "Player/css/pagestyles.css", type: "text/css"
        }));
        if (!tpv.htmTranscriptFilePath)
        {
            if (!tpv.captions)
                tpv.captions = Resources.NoTranscript_Text;
            tpv.iframe.contents().find('body').html(tpv.captions)
        }
        tpv.iframe.contents().find("p").wrapInner("<a class='transcript-link' href='#'></a>");
        $(this.contentDocument).on("click", function(e)
        {
            var $target = $(e.target);
            if ($target.hasClass('transcript-link'))
            {
                var timeStart = $target.parent().attr("data-timeStart") - 0;
                if (cc.activeVideoController)
                {
                    cc.activeVideoController.setCurrentTime(timeStart, true)
                }
                else if (player)
                {
                    if (player.activeAudioController)
                    {
                        player.activeAudioController.setCurrentTime(timeStart, true)
                    }
                    else if (player.pageAudioController && !player.pageAudioController.hidden)
                    {
                        player.pageAudioController.setCurrentTime(timeStart, true)
                    }
                }
                return false
            }
        })
    });
    tpv.newDiv.append(tpv.iframe);
    return {
            scrollToItem: function(timeInSeconds)
            {
                var captionElem = null;
                tpv.iframe.contents().find('p').each(function(index)
                {
                    var $elem = $(this);
                    var timeStart = $elem.attr("data-timestart") - 0;
                    var timeEnd = $elem.attr("data-timeend") - 0;
                    $elem.css("font-weight", "");
                    if (timeInSeconds >= timeStart && timeInSeconds <= timeEnd)
                    {
                        captionElem = $elem;
                        captionElem.css("font-weight", "Bold")
                    }
                });
                if (captionElem)
                {
                    tpv.iframe.contents().find('html').stop().animate({scrollTop: captionElem.offset().top - 25}, 250)
                }
            }, container: tpv.newDiv, show: function(captionsFile, isHtmTranscript)
                {
                    tpv.captions = '';
                    tpv.htmTranscriptFilePath = isHtmTranscript ? captionsFile : "";
                    if (tpv.htmTranscriptFilePath)
                    {
                        tpv.iframe.attr('src', tpv.htmTranscriptFilePath)
                    }
                    else
                    {
                        if (captionsFile)
                        {
                            $.ajax({
                                type: "GET", url: captionsFile, dataType: "XML", complete: function()
                                    {
                                        if (tpv.iframe.loaded)
                                        {
                                            if (!tpv.captions)
                                                tpv.captions = Resources.NoTranscript_Text;
                                            tpv.iframe.contents().find('body').html(tpv.captions)
                                        }
                                    }, success: function(captionsXml)
                                    {
                                        $(captionsXml).find('div').children('p').each(function()
                                        {
                                            tpv.captions += '<p data-timeStart="' + common.convertTimeFormatToSecs($(this).attr("begin")) + '" data-timeEnd="' + common.convertTimeFormatToSecs($(this).attr("end")) + '"><a class="transcript-link" href="#">' + $(this).text() + '</a></p>'
                                        })
                                    }
                            })
                        }
                        else
                        {
                            tpv.captions = Resources.NoTranscript_Text;
                            try
                            {
                                tpv.iframe.contents().find('body').html(tpv.captions)
                            }
                            catch(e)
                            {
                                tpv.iframe.attr('src', "blank.htm")
                            }
                        }
                    }
                }
        }
}
var AssessmentFeedbackDialogView = (function()
    {
        var instance = null,
            question = null,
            assessment = null,
            assessmentView = null,
            newDiv = null;
        function PrivateConstructor()
        {
            newDiv = $(document.createElement('div'));
            newDiv.attr("id", "AssessmentFeedbackDialog");
            newDiv.audioController = new AudioController(assessmentView.CourseController, "FeedbackPopupAudio");
            newDiv.audioPlayerView = new AudioPlayerView(assessmentView.CourseController, "FeedbackPopupAudio");
            newDiv.dialog({
                autoOpen: false, resizable: false, height: 1, width: 1, title: '', closeText: Resources.Dialog_Close_Text, dialogClass: 'AssessmentFeedbackDialog', draggable: false, resizable: false, modal: true, close: function()
                    {
                        newDiv.audioController.hideAndStop()
                    }, open: function()
                    {
                        views.utils.sizeDialog(newDiv);
                        buildDialog(newDiv)
                    }, close: function()
                    {
                        newDiv.empty()
                    }
            });
            return newDiv
        }
        function buildDialog(parent)
        {
            parent.append(parent.audioPlayerView);
            var feedbackView = new AssessmentFeedbackView(assessmentView, parent.audioController);
            parent.append(feedbackView);
            feedbackView.showFeedback(question, assessment, true)
        }
        return {
                open: function(questionModel, assessmentModel, assessmentV)
                {
                    question = questionModel;
                    assessment = assessmentModel;
                    assessmentView = assessmentV;
                    if (instance == null)
                    {
                        instance = new PrivateConstructor;
                        instance.constructor = null
                    }
                    instance.dialog('open')
                }, close: function()
                    {
                        if (instance)
                            instance.dialog('close')
                    }, getAudioController: function()
                    {
                        if (newDiv)
                            return newDiv.audioController;
                        return null
                    }
            }
    })();
function AssessmentFeedbackView(assessmentView, audioController)
{
    var q = null,
        privatePage = null;
    var rootElem = $('<div id="FeedbackView" aria-live="assertive"/>');
    var boxElem = $('<div id="FeedbackViewBox"/>').appendTo(rootElem);
    var headerElem = $('<div class="FeedbackViewTitle"/>').appendTo(boxElem);
    var feedbackElem = $('<div id="FeedbackViewContent"/>').appendTo(boxElem);
    var scrollElem = $('<div id="FeedbackViewContentScroll"/>').appendTo(feedbackElem);
    var feedbackChoicesOutcome = $('<div id="FeedbackChoicesOutcome"/>').appendTo(scrollElem);
    var feedbackTextElem = $('<div id="FeedbackViewText" />').appendTo(scrollElem);
    var bottomMask = $('<div class="scroll-padding-bottom-mask"><div></div></div>').appendTo(feedbackElem);
    var buttonsElem = $('<div id="FeedbackViewButtons"></div>').appendTo(feedbackElem);
    var attemptsElem = $('<span class="FeedbackViewAttemptCount"></span>').appendTo(buttonsElem);
    var qIframe = $('<iframe src="" class="FullContainerIframe" id="QuestionFeedbackIframe"/>').appendTo(feedbackElem);
    boxElem.attr('tabindex', '-1');
    var aLetter = Resources.Alphabet_Letters.split('');
    qIframe.off('load').on('load', function()
    {
        if (qIframe.attr('src') == "")
            return;
        if ($('html', document).hasClass('light_theme'))
            $('html', qIframe.get(0).contentDocument).addClass('light_theme');
        if ($('html', document).hasClass('blackonwhite'))
            $('html', qIframe.get(0).contentDocument).addClass('blackonwhite');
        if ($('html', document).hasClass('whiteonblack'))
            $('html', qIframe.get(0).contentDocument).addClass('whiteonblack');
        if (privatePage)
            privatePage.InitVideoController(qIframe[0].contentWindow, assessmentView.CourseController)
    });
    var detailedFeedbackBtn = views.utils.createButton('QDetailedFeedbackButton', Resources.Assessment_Buttons_DetailedFeedback_Text).addClass('accent2').addClass('accent2_border').click(function()
        {
            var feedbackPageId = q.getFeedback().PageId;
            if (feedbackPageId)
            {
                var feedbackPage = assessmentView.CourseController.getPageFromId(feedbackPageId);
                if (feedbackPage)
                {
                    audioController.stop();
                    if ($("#AssessmentFeedbackDialog").dialog('isOpen'))
                        $("#AssessmentFeedbackDialog").dialog('close');
                    assessmentView.CourseController.showContentPopup(feedbackPage, null, "AssessmentDetailedFeedbackDialogView")
                }
            }
        }).appendTo(buttonsElem);
    rootElem.showFeedback = function(question, assessment, playAudio)
    {
        q = question;
        if (q.isCorrect())
        {
            headerElem.removeClass("FeedbackTitleIncorrect").addClass("FeedbackTitleCorrect").html(Resources.Assessment_Feedback_Correct);
            attemptsElem.html('')
        }
        else
        {
            headerElem.removeClass("FeedbackTitleCorrect").addClass("FeedbackTitleIncorrect").html(Resources.Assessment_Feedback_Incorrect_Finished);
            if (q.AssessmentObj.Assessment.AttemptsToAnswer == 0)
                attemptsElem.html(Resources.Attempt_Text + ' ' + views.utils.localizeNumbers(q.AnswerCount));
            else
                attemptsElem.html(Resources.Attempt_Text + ' ' + views.utils.localizeNumbers(q.AnswerCount + '/' + q.AssessmentObj.Assessment.AttemptsToAnswer))
        }
        qIframe.attr('src', "");
        privatePage = null;
        $([detailedFeedbackBtn, qIframe, scrollElem, bottomMask]).each(function()
        {
            $(this).hide()
        });
        var cFeedback = q.getFeedback();
        var fPageId = cFeedback.PageId;
        if (fPageId && q.FeedbackStyle == "show-page")
        {
            qIframe.show();
            var page = assessmentView.CourseController.getPageFromId(fPageId);
            if (page)
            {
                privatePage = page;
                qIframe.attr('src', privatePage.getFilePath())
            }
        }
        else
        {
            scrollElem.show();
            bottomMask.show();
            feedbackTextElem.html(cFeedback.Text);
            if (q.Scored & q.isBlocked())
            {
                var str = "The correct response is ";
                var count = q.ChoicesOrder.length;
                var cChoice = [];
                $(q.ChoicesOrder).each(function(idx, itemChoice)
                {
                    if (itemChoice.Correct)
                    {
                        cChoice.push(aLetter[idx])
                    }
                });
                count = cChoice.length;
                $(cChoice).each(function(idx, item)
                {
                    if (count == 1 || idx == 0)
                    {
                        str = str + cChoice[idx]
                    }
                    else if (idx + 1 < cChoice.length)
                    {
                        str = str + ", " + cChoice[idx]
                    }
                    else if (idx + 1 == cChoice.length)
                    {
                        str = str + " and " + cChoice[idx]
                    }
                });
                console.log(str);
                feedbackChoicesOutcome.html(str)
            }
            if (fPageId)
                detailedFeedbackBtn.show()
        }
        audioController.hideAndStop();
        if (playAudio)
        {
            var audioFile = q.getFeedbackAudioFilePath();
            if (audioFile)
                audioController.readyToPlay(audioFile, assessment.Course.volume, null, null)
        }
    };
    rootElem.ContentArea = feedbackElem;
    return rootElem
}
function AssessmentIntroView(assessmentView, audioController)
{
    var ac = audioController;
    var rootElem = $('<div id="IntroView" />');
    var backgroundElem = $('<div id="IntroViewBackground" class="AssessmentBackground"/>').appendTo(rootElem);
    var foregroundElem = $('<div id="IntroViewForeground" class="AssessmentForeground"/>').appendTo(rootElem);
    var contentElem = $('<div id="IntroViewContent" class="AssessmentContent"/>').appendTo(foregroundElem);
    var introIframeElem = $('<iframe id="IntroViewIframe" class="FullContainerIframe" src="" aria-hidden="true"></iframe>');
    rootElem.append(introIframeElem);
    var statusTileElem = $('<div id="AssessmentStatusTileContainer"/>');
    var statusTile = $('<div class="AssessmentStatusTile"/>');
    var statusFooter = $('<div class="tile_footer">' + Resources.Assessment_Status_Tile_Footer_Text + '</div>');
    var statusCompleteCount = $('<div class="QuestionsCompleteCount"/>');
    statusTile.html('<div class="QuestionsCompleteWord">' + Resources.Assessment_Status_Tile_QuestionsComplete_Text + '</div>');
    statusTile.prepend(statusCompleteCount);
    statusTile.prepend(statusFooter);
    statusTileElem.append(statusTile).appendTo(foregroundElem);
    var buttonContainerElem = $('<div class="AssessmentActionButtonContainer"/>');
    var beginButton = views.utils.createButton('IntroBeginButton', Resources.Assessment_Introduction_BeginButton_Text);
    beginButton.attr('title', Resources.Assessment_Introduction_BeginButton_Text);
    beginButton.addClass('accent');
    beginButton.addClass('accent_border');
    buttonContainerElem.append(beginButton);
    if ((course.currentPopupPageId == "test-out" || course.getCurrentPage().id == "test-out"))
    {
        var skipButton = views.utils.createButton('IntroSkipButton', "Skip Test Out");
        skipButton.attr('title', "Skip Test Out");
        skipButton.addClass('accent');
        skipButton.addClass('accent_border');
        buttonContainerElem.append(skipButton);
        skipButton.click(function()
        {
            introIframeElem.removeClass('fullscreen').attr('src', '');
            courseController.navigateToNextPage()
        })
    }
    rootElem.append(buttonContainerElem);
    beginButton.click(function()
    {
        assessmentView.Observer.fire("nextLocationClicked")
    });
    rootElem.showIntro = function(assessment)
    {
        rootElem.assessment = assessment;
        if (assessment.FeedbackType == "Delayed")
            statusCompleteCount.html(views.utils.localizeNumbers(assessment.countAnsweredQuestions() + '/' + assessment.countQuestions()));
        else
            statusCompleteCount.html(views.utils.localizeNumbers((assessment.countQuestions() - assessment.countUnscoredQuestions()) + '/' + assessment.countQuestions()));
        rootElem.find('#AssessmentIntroductionTitle').html(assessment.Page.name);
        rootElem.find('#AssessmentIntroductionTitle').addClass('page_title accent_text');
        if (assessment.QuestionsPresented.length > 0)
        {
            rootElem.find('#AssessmentIntroductionInstructions').html(assessment.IntroductionText);
            buttonContainerElem.show()
        }
        else
        {
            rootElem.find('#AssessmentIntroductionInstructions').html(Resources.Assessment_Intro_Test_None_Text);
            buttonContainerElem.hide()
        }
        backgroundElem.empty();
        contentElem.empty();
        if (assessment.Page.privatePages.length > 0)
        {
            rootElem.addClass('IntroView-CustomContent');
            var pageDisplayed = assessment.Page.privatePages[0];
            introIframeElem.off('load').on('load', function()
            {
                introIframeElem.off('load');
                if (introIframeElem.attr('src') == "")
                    return;
                if ($('html', document).hasClass('light_theme'))
                    $('html', introIframeElem.get(0).contentDocument).addClass('light_theme');
                if ($('html', document).hasClass('blackonwhite'))
                    $('html', introIframeElem.get(0).contentDocument).addClass('blackonwhite');
                if ($('html', document).hasClass('whiteonblack'))
                    $('html', introIframeElem.get(0).contentDocument).addClass('whiteonblack');
                pageDisplayed.InitVideoController(introIframeElem[0].contentWindow, courseController)
            });
            introIframeElem.attr('src', pageDisplayed.getFilePath())
        }
        else
        {
            rootElem.removeClass('IntroView-CustomContent');
            introIframeElem.off('load').on('load', function()
            {
                introIframeElem.off('load');
                if (introIframeElem.attr('src') == "")
                    return;
                introIframeElem[0].contentWindow.setAssessment && introIframeElem[0].contentWindow.setAssessment(assessment);
                $('body', introIframeElem.get(0).contentDocument).find('script').remove();
                backgroundElem.empty().append($('.AssessmentBackground > img:first', introIframeElem.get(0).contentDocument));
                var str = $('.AssessmentContent', introIframeElem.get(0).contentDocument)[0].innerHTML;
                contentElem.html(str)
            });
            introIframeElem.attr('src', assessment.Page.getFilePath())
        }
        ac.hideAndStop();
        var playOnPageDisplayAudio = assessment.Page.getPlayOnPageDisplayAudio();
        if (playOnPageDisplayAudio)
            ac.readyToPlay(playOnPageDisplayAudio, assessment.Course.volume, null, null);
        rootElem.show();
        rootElem.attr("tabindex", "-1");
        rootElem.focus()
    };
    return rootElem
}
function AssessmentNavBarView(assessmentView)
{
    var navBar = $('<div id="AssessmentNavBar"></div>');
    var unorederedList = $('<ul id="AssessmentNavBarList"></ul>').append('<li><a href="#" id="AssNavBarIntroLink">' + Resources.Assessment_Buttons_Instructions_Text + '</a></li>').append('<li><a href="#" id="AssNavBarQuestionsLink">' + Resources.Assessment_Buttons_Questions_Text + '</a></li>').append('<li><a href="#" id="AssNavBarReviewLink">' + Resources.Assessment_Buttons_Review_Text + '</a></li>').append('<li><a href="#" id="AssNavBarViewReportLink">' + Resources.Assessment_Buttons_FeedbackReport_Text + '</a></li>');
    $("li > a", unorederedList).on('click', function(event)
    {
        event.preventDefault();
        (this.id !== "AssNavBarViewReportLink") && activateLink(this);
        switch (this.id)
        {
            case"AssNavBarIntroLink":
                assessmentView.Observer.fire("introLocationClicked");
                break;
            case"AssNavBarQuestionsLink":
                assessmentView.Observer.fire("questionsLocationClicked");
                break;
            case"AssNavBarReviewLink":
                assessmentView.Observer.fire("reviewLocationClicked");
                break;
            case"AssNavBarViewReportLink":
                assessmentView.Observer.fire("resultsReportClicked");
                break
        }
        return false
    });
    var timeLimit = $('<div id="AssessmentTimeLimit"><span class="AssessmentTimeLimitLabel">' + Resources.Timer_Label_Text + '</span><span id="AssessmentTimeLimitValue"></span></div>');
    timeLimit.addClass('accent');
    timeLimit.addClass('accent_border');
    navBar.append(unorederedList).append(timeLimit);
    var activateLink = function(link)
        {
            unorederedList.find('.active').removeClass("active");
            $(link).addClass("active")
        };
    navBar.checkIntro = function()
    {
        activateLink(navBar.find('#AssNavBarIntroLink'))
    };
    navBar.checkQuestions = function()
    {
        activateLink(navBar.find('#AssNavBarQuestionsLink'))
    };
    navBar.checkReview = function()
    {
        activateLink(navBar.find('#AssNavBarReviewLink'))
    };
    navBar.hideQuestionsLink = function()
    {
        navBar.find('#AssNavBarQuestionsLink').hide()
    };
    navBar.showQuestionsLink = function()
    {
        navBar.find('#AssNavBarQuestionsLink').show()
    };
    navBar.hideReportLink = function()
    {
        var l = navBar.find('#AssNavBarViewReportLink');
        l.hide();
        l.attr("aria-hidden", "true")
    };
    navBar.showReportLink = function()
    {
        var l = navBar.find('#AssNavBarViewReportLink');
        l.show();
        l.attr("aria-hidden", "false")
    };
    navBar.hideTimer = function()
    {
        var l = navBar.find('#AssessmentTimeLimit');
        l.hide();
        l.attr("aria-hidden", "true")
    };
    navBar.showTimer = function()
    {
        var l = navBar.find('#AssessmentTimeLimit');
        l.show();
        l.attr("aria-hidden", "false")
    };
    navBar.showRemainingTime = function(time)
    {
        navBar.find('#AssessmentTimeLimitValue').html(views.utils.formatTime(time))
    };
    return navBar
}
function AssessmentObjIntroView(assessmentView, audioController)
{
    var ac = audioController;
    var rootElem = $('<div id="ObjIntroView"/>');
    var introIframeElem = $('<iframe id="ObjIntroViewIframe" class="FullContainerIframe" src=""></iframe>');
    rootElem.append(introIframeElem);
    var navBarView = new QuestionNavBarView(assessmentView);
    rootElem.append(navBarView);
    rootElem.showObjIntro = function(assessment)
    {
        introIframeElem.attr('src', '');
        var page = assessmentView.CourseController.getPageFromId(assessment.getCurrentNavNode().Tag);
        introIframeElem.off('load').on('load', function()
        {
            introIframeElem.off('load');
            if (introIframeElem.attr('src') == "")
                return;
            if ($('html', document).hasClass('light_theme'))
                $('html', introIframeElem.get(0).contentDocument).addClass('light_theme');
            if ($('html', document).hasClass('blackonwhite'))
                $('html', introIframeElem.get(0).contentDocument).addClass('blackonwhite');
            if ($('html', document).hasClass('whiteonblack'))
                $('html', introIframeElem.get(0).contentDocument).addClass('whiteonblack');
            if (page)
                page.InitVideoController(introIframeElem[0].contentWindow, assessmentView.CourseController)
        });
        introIframeElem.show();
        ac.hideAndStop();
        if (page)
        {
            introIframeElem.attr('src', page.getFilePath());
            var playOnPageDisplayAudio = page.getPlayOnPageDisplayAudio();
            if (playOnPageDisplayAudio)
                ac.readyToPlay(playOnPageDisplayAudio, assessment.Course.volume, null, null)
        }
        rootElem.show()
    };
    return rootElem
}
function AssessmentQuestionView(assessmentView, audioController)
{
    var question = null,
        assessment = null,
        stackingInterface = null;
    this.ac = audioController;
    var aqv = this;
    var aLetter = Resources.Alphabet_Letters.split('');
    this.aStackId = common.getAlphabetLettersArray();
    this.questionViewElem = $('<div id="AssessmentQuestionView"></div>');
    var questionView = $('<div id="QuestionView"></div>');
    var questionViewBox = $('<div id="QuestionViewBox"></div>').appendTo(questionView);
    var navBarTitle = $('<div class="QuestionNavBarTitle"></div>');
    navBarTitle.attr('tabindex', "-1");
    questionViewBox.attr('tabindex', '-1');
    questionViewBox.append(navBarTitle);
    var questionContentElem = $('<div id="QuestionContent"></div>');
    questionViewBox.append(questionContentElem);
    var questionContentScrollElem = $('<div id="QuestionContentScroll"></div>');
    questionContentElem.append(questionContentScrollElem);
    var bottomMask = $('<div class="scroll-padding-bottom-mask"><div></div></div>').appendTo(questionContentElem);
    var promptTextElem = $('<div id="QuestionViewPrompt" />').appendTo(questionContentScrollElem);
    var choicesContainer = $('<div id="QuestionViewChoices"/>').appendTo(questionContentScrollElem);
    var buttonsElem = $('<div id="QuestionViewButtons"></div>');
    var qAccessibleBtn = views.utils.createButton('QAccessibleButton', Resources.Assessment_Buttons_AccessibleButton_Text).addClass('accent2').addClass('accent2_border').click(function()
        {
            $('body').toggleClass('accessible');
            qAccessibleBtn.attr('aria-pressed', $('body').hasClass('accessible'));
            if (stackingInterface)
                aqv.questionViewElem.showQuestionView(assessment, true)
        }).appendTo(buttonsElem);
    qAccessibleBtn.attr("title", Resources.Assessment_Buttons_AccessibleButtonTitle_Text);
    qAccessibleBtn.attr('role', 'button').attr('aria-pressed', 'false');
    views.utils.createButton('QShowAnswerButton', Resources.Assessment_Buttons_ShowAnswer_Text).addClass('accent2').addClass('accent2_border').click(function()
    {
        if (question && question.isBlocked())
        {
            var hasScenario = aqv.questionViewElem.hasClass('QuestionView-HasScenario');
            if ($(this).text() == Resources.Assessment_Buttons_ShowAnswer_Text)
            {
                $(this).text(Resources.Assessment_Buttons_HideAnswer_Text);
                if (stackingInterface)
                {
                    if (hasScenario)
                        aqv.questionViewElem.removeClass('QuestionView-ShowFeedback');
                    stackingInterface.showAnswer()
                }
            }
            else
            {
                $(this).text(Resources.Assessment_Buttons_ShowAnswer_Text);
                aqv.questionViewElem.showQuestionView(assessment, true);
                if (hasScenario)
                    aqv.questionViewElem.addClass('QuestionView-ShowFeedback')
            }
        }
    }).appendTo(buttonsElem);
    views.utils.createButton('QCheckAnswerButton', Resources.Assessment_Buttons_CheckAnswer_Text).addClass('accent2').addClass('accent2_border').click(function()
    {
        if (!question.Answer)
        {
            courseController.course.observer.fire("notifyCheckAnswerFail", null)
        }
        else
        {
            assessmentView.Observer.fire("checkAnswerClicked", assessment);
            if (stackingInterface)
                stackingInterface.markAllItemsComplete();
            aqv.showFeedback(question, true);
            setViewState(question)
        }
    }).appendTo(buttonsElem);
    views.utils.createButton('QRetryButton', Resources.Assessment_Buttons_Retry_Text).addClass('accent2').addClass('accent2_border').click(function()
    {
        assessmentView.Observer.fire("retryQuestionClicked");
        setViewState(question);
        if (stackingInterface)
            aqv.questionViewElem.showQuestionView(assessment, true);
        questionViewBox.focus()
    }).appendTo(buttonsElem);
    questionViewBox.append(buttonsElem);
    var navBarView = new QuestionNavBarView(assessmentView, buttonsElem);
    questionViewBox.append(navBarView);
    var scenarioView = new AssessmentScenarioView(assessmentView);
    aqv.questionViewElem.append(scenarioView, questionView);
    var feedbackView = new AssessmentFeedbackView(assessmentView, audioController);
    aqv.questionViewElem.append(feedbackView);
    assessmentView.Observer.observe('audioEnded', function(q)
    {
        if (q.AssessmentObj.Assessment.Location == AssessmentLocation.Question && q == question && !q.Objective.ScenarioAudioPlayed)
        {
            if (q.Scored)
            {
                var audioFile = q.getFeedbackAudioFilePath();
                if (audioFile)
                {
                    aqv.ac.readyToPlay(audioFile, q.AssessmentObj.Assessment.Course.volume, null, null)
                }
            }
            else
            {
                if (q.Prompt.AudioFile)
                    aqv.ac.readyToPlay(q.getPromptAudioFilePath(), q.AssessmentObj.Assessment.Course.volume, null, null)
            }
        }
        q.Objective.ScenarioAudioPlayed = true
    });
    var setViewState = function(question)
        {
            aqv.questionViewElem.toggleClass('QuestionView-Scored', question.Scored);
            aqv.questionViewElem.toggleClass('QuestionView-ShowFeedback', question.Scored);
            aqv.questionViewElem.toggleClass('QuestionView-Blocked', question.isBlocked());
            aqv.questionViewElem.removeClass('choice-multiple choice true-false stacking stacking-images matching');
            aqv.questionViewElem.addClass(question.Type);
            aqv.questionViewElem.toggleClass('QuestionView-Correct', question.isCorrect());
            if (question.Scored && !question.isBlocked())
                $('#QuestionViewChoices :input').attr('disabled', true);
            else if (question.isBlocked())
                $('#QuestionViewChoices :input').attr('disabled', true);
            else
                $('#QuestionViewChoices :input').removeAttr('disabled');
            if (question.showCorrectAnswer())
            {
                for (var i = 0; i < question.ChoicesOrder.length; i++)
                {
                    if (question.ChoicesOrder[i].Correct)
                    {
                        choicesContainer.find('input[value="' + (i + 1) + '"]').parent().addClass("accent_text correctChoice")
                    }
                }
            }
            $('#QuestionViewButtons button').attr("aria-hidden", "true");
            if (!question.Scored && assessment.FeedbackType != "Delayed")
            {
                $("#QCheckAnswerButton").attr("aria-hidden", "false")
            }
            if (question.Scored && !question.isBlocked())
            {
                $("#QRetryButton").attr("aria-hidden", "false")
            }
            if (assessment.feedbackType != "Delayed" && (question.Scored && !question.isCorrect() && (question.Type == ("matching" || "stacking"))))
            {
                $("#QShowAnswerButton").attr("aria-hidden", "false")
            }
            if (question.isBlocked())
            {
                $("#AssessmentNextButton2").attr("aria-hidden", "false")
            }
            if (assessment.FeedbackType == "Delayed")
            {
                $("#AssessmentPreviousButton2").attr("aria-hidden", "false");
                $("#AssessmentNextButton2").attr("aria-hidden", "false")
            }
            if ((question.Type == "matching") || (question.Type == "stacking"))
            {
                $("#QAccessibleButton").attr("aria-hidden", false)
            }
        };
    this.showFeedback = function(question, animate)
    {
        aqv.questionViewElem.addClass('QuestionView-ShowFeedback');
        if (question.CustomStyle && aqv.feedbackCustomView)
        {
            aqv.feedbackCustomView(question, assessment, question.Objective.ScenarioAudioPlayed)
        }
        else
        {
            if (animate && question.FeedbackStyle == "modal")
            {
                aqv.ac.hideAndStop();
                feedbackView.showFeedback(question, assessment, false);
                AssessmentFeedbackDialogView.open(question, assessment, assessmentView)
            }
            else
            {
                feedbackView.showFeedback(question, assessment, question.Objective.ScenarioAudioPlayed)
            }
        }
    };
    this.showScenario = function(question, assessment)
    {
        aqv.ac.hideAndStop();
        if (question.Objective.Scenario.AudioFile)
        {
            if (!question.Objective.ScenarioAudioPlayed)
            {
                aqv.ac.readyToPlay(question.getScenarioAudioFilePath(), assessment.Course.volume, assessmentView.Observer, question)
            }
        }
        else
            question.Objective.ScenarioAudioPlayed = true;
        aqv.questionViewElem.toggleClass('QuestionView-HasScenario', question.Objective.hasScenario());
        if (question.Prompt.hasPage())
            aqv.questionViewElem.addClass('QuestionView-HasScenario');
        scenarioView.updateScenario(question, assessment)
    };
    aqv.questionViewElem.showQuestionView = function(assessmentModel, ignoreTiming)
    {
        assessment = assessmentModel;
        aqv.questionViewElem.addClass(assessment.Type);
        question = assessment.getCurrentQuestion();
        $([choicesContainer, promptTextElem]).each(function()
        {
            $(this).empty()
        });
        $("#QShowAnswerButton").text(Resources.Assessment_Buttons_ShowAnswer_Text);
        aqv.questionViewElem.toggleClass('QuestionView-DelayedFeedback', !assessment.ViewState.checkAnswerButtonVisible());
        questionView.toggleClass('nav-off', !assessment.ViewState.navButtonsVisible());
        questionView.removeClass(function(index, css)
        {
            return (css.match(/(^|\s)Question_\S+/g) || []).join(' ')
        });
        aqv.questionViewElem.removeClass("NSecondsDelay PageControlled");
        qAccessibleBtn.hide();
        if (question)
        {
            if (!ignoreTiming && question.Timing)
            {
                if (question.nSecondsDelayIsActive())
                {
                    aqv.questionViewElem.addClass("NSecondsDelay");
                    aqv.showScenario(question, assessment);
                    setTimeout(function()
                    {
                        aqv.questionViewElem.showQuestionView(assessment, true)
                    }, (question.SecondsDelay * 1000));
                    setViewState(question);
                    return
                }
                else if (!question.Scored && question.Timing == "PageControlled")
                {
                    aqv.questionViewElem.addClass("PageControlled");
                    setViewState(question)
                }
            }
            questionView.addClass('Question_' + question.Objective.Id + '-' + question.Id);
            var questionHeaderText = Resources.Assessment_Question_Title_Text.replace(/%%index%%/g, views.utils.localizeNumbers(question.Index + 1));
            questionHeaderText = questionHeaderText.replace(/%%total%%/g, views.utils.localizeNumbers(assessment.countQuestions()));
            navBarTitle.html(questionHeaderText);
            promptTextElem.html(question.Prompt.Text + " ");
            if (question.Prompt.Image)
            {
                var sFile = assessment.Course.getImagesFolderPath() + question.Prompt.Image;
                choicesContainer.append('<img class="QuestionViewImage" src="' + sFile + '" alt="' + question.Prompt.ImageAltText + '"/>')
            }
            if (question.CustomStyle)
            {
                aqv.customView(assessmentModel, question, choicesContainer, aqv)
            }
            else
            {
                var answersArray = question.getAnswersArray();
                var stack_wrapper = null,
                    stack_container = null,
                    stack_item_container = null;
                var stackItems = 0;
                var fieldset = $("<fieldset><legend style='display:none;'>" + question.Prompt.Text + "</legend></fieldset>");
                choicesContainer.append(fieldset);
                for (var i = 0; i < question.ChoicesOrder.length; i++)
                {
                    var choice = question.ChoicesOrder[i];
                    var attrs = $.inArray((i + 1) + '', answersArray) != -1 ? 'checked' : 'unchecked';
                    switch (question.Type)
                    {
                        case"choice":
                        case"true-false":
                            fieldset.append('<label style="display:block" for="qqq' + i + '"><input id="qqq' + i + '" type="radio" name="questionChoice"' + attrs + ' value="' + (i + 1) + '"/><span>' + aLetter[i] + '. ' + choice.Text + '</span></label>');
                            break;
                        case"choice-multiple":
                            fieldset.append('<label style="display:block" for="qqq' + i + '"><input id="qqq' + i + '" type="checkbox" name="questionChoice"' + attrs + ' value="' + (i + 1) + '"/><span>' + aLetter[i] + '. ' + choice.Text + '</span></label>');
                            break;
                        case"stacking":
                        case"matching":
                            if (!stack_wrapper)
                            {
                                stack_wrapper = $("<div>", {'class': "stack_wrapper textstack"}).appendTo(fieldset);
                                stack_item_container = $("<div>", {'class': "stack_item_container"}).appendTo(stack_wrapper);
                                stack_container = $("<div>", {'class': "stack_container"}).appendTo(stack_wrapper)
                            }
                            var tile_stack = $("<div>", {
                                    'class': "tile stack accent2", 'data-group': (i + 1)
                                }).append($("<div>", {'class': "stack_content"}).append($("<div>", {'class': "stack_title"}).text(choice.Text))).append($('<div class="item_container"><div class="item_input_container"></div></div>'));
                            stack_container.append(tile_stack);
                            for (var j = 0; j < choice.Answers.length; j++)
                            {
                                var dg = choice.Answers[j].Distractor ? "" : (i + 1);
                                var stack_item = $("<div>", {
                                        'class': "stack_item", 'data-group': dg, 'data-value': aqv.aStackId[stackItems]
                                    }).append($("<div>", {
                                        id: 'comboChoice' + stackItems, 'class': "stack_item_text"
                                    }).text(choice.Answers[j].Text)).appendTo(stack_item_container);
                                if ($('body').hasClass('accessible'))
                                {
                                    var accessible_q_choice = $("<select class='accessible_q_choice'></select>");
                                    accessible_q_choice.attr('aria-labelledby', 'comboChoice' + stackItems);
                                    var option = '<option value="" selected> </option>';
                                    for (var k = 0; k < question.ChoicesOrder.length; k++)
                                        option += '<option value="' + k + '">' + question.ChoicesOrder[k].Text + '</option>';
                                    accessible_q_choice.append(option);
                                    stack_item.append(accessible_q_choice)
                                }
                                stackItems++
                            }
                            break;
                        case"stacking-images":
                            if (!stack_wrapper)
                            {
                                stack_wrapper = $("<div>", {'class': "stack_wrapper tilestack"}).appendTo(fieldset);
                                stack_item_container = $("<div>", {'class': "stack_item_container"}).appendTo(stack_wrapper);
                                stack_container = $("<div>", {'class': "stack_container"}).appendTo(stack_wrapper)
                            }
                            var tile_stack = $("<div>", {
                                    'class': "tile stack accent2", 'data-group': (i + 1)
                                }).append($("<div>", {'class': "stack_content"}).append($("<div>", {'class': "stack_title"}).text(choice.Text))).append($('<div class="item_container"><div class="item_input_container"></div></div>'));
                            stack_container.append(tile_stack);
                            for (var j = 0; j < choice.Answers.length; j++)
                            {
                                var stack_item = $("<div>", {
                                        'class': "stack_item tile", 'data-group': (i + 1), 'data-value': aqv.aStackId[stackItems]
                                    }).append($("<div>", {'class': "tile_background"}).append($("<img>", {
                                        src: assessmentModel.Course.getImagesFolderPath() + choice.Answers[j].FileName, alt: choice.Answers[j].Text
                                    }))).appendTo(stack_item_container);
                                if ($('body').hasClass('accessible'))
                                {
                                    var accessible_q_choice = $("<select class='accessible_q_choice'></select>");
                                    var option = '<option value=""/>';
                                    for (var k = 0; k < question.ChoicesOrder.length; k++)
                                        option += '<option value="' + k + '">' + question.ChoicesOrder[k].Text + '</option>';
                                    accessible_q_choice.append(option);
                                    stack_item.append(accessible_q_choice)
                                }
                                stackItems++
                            }
                            break
                    }
                }
                if (stack_wrapper)
                {
                    if (!$('body').hasClass('accessible'))
                    {
                        if (question.Randomize)
                            $(".stack_item_container .stack_item").shuffle()
                    }
                    stackingInterface = new StackingInterface(stack_wrapper, question);
                    qAccessibleBtn.show()
                }
                if (!question.nSecondsDelayIsActive())
                    aqv.showScenario(question, assessmentModel);
                if (question.Scored)
                {
                    aqv.showFeedback(question, false)
                }
                else
                {
                    if (question.Prompt.AudioFile && question.Objective.ScenarioAudioPlayed)
                    {
                        aqv.ac.readyToPlay(question.getPromptAudioFilePath(), assessmentModel.Course.volume, null, null)
                    }
                }
            }
            setViewState(question);
            question.startLatencyTimer()
        }
        else
        {
            aqv.questionViewElem.removeClass('QuestionView-HasScenario').removeClass('QuestionView-ShowFeedback')
        }
        aqv.questionViewElem.show();
        if (!$('body').hasClass('accessible'))
        {
            aqv.questionViewElem.attr("tabindex", "-1");
            aqv.questionViewElem.focus()
        }
        else
        {
            $("select:first").focus()
        }
    };
    $(document).on('change', 'input[name="questionChoice"]', function()
    {
        if (question && question == assessment.getCurrentQuestion())
        {
            question.Answer = views.utils.getCheckedItems(choicesContainer, 'questionChoice', '~')
        }
    });
    return aqv.questionViewElem
}
function StackingInterface(wrapper, question, settings)
{
    var defaults = {assetPath: 'Player/theme/'};
    this.question = question;
    this.settings = $.extend(false, defaults, settings);
    this.init(wrapper)
}
;
StackingInterface.prototype = {
    wrapper: false, stackContainer: false, itemContainer: false, stacks: false, items: false, settings: false, completed: false, required: false, getRootVisual: function()
        {
            return this.wrapper
        }, showAnswer: function()
        {
            if ($('body').hasClass('accessible'))
                $('#QAccessibleButton').click();
            var stackItems = $(".stack_item", this.wrapper);
            for (var i = 0; i < stackItems.length; i++)
            {
                var item = $(stackItems[i]);
                var itemGroup = item.attr("data-group");
                var stackGroup = item.closest(".stack").attr('data-group');
                var stackContainer = $('.stack[data-group="' + itemGroup + '"] .item_container', this.wrapper);
                $(".completion_indicator", item).remove();
                item.hide();
                if (!itemGroup)
                {
                    this.itemContainer.append(item)
                }
                else if (!stackGroup)
                {
                    stackContainer.append(item);
                    item.addClass('stacked').draggable('disable')
                }
                else if (stackGroup != itemGroup)
                {
                    stackContainer.append(item)
                }
                for (var j = 3; j < stackContainer.children(".stack_item").length; j++)
                    $('.stack[data-group="' + itemGroup + '"]').addClass('with' + j);
                if (!$(item).is(':animated'))
                    item.fadeIn('slow')
            }
        }, markStackComplete: function(stack)
        {
            try
            {
                stack.addClass('stacked').droppable('disable')
            }
            catch(e) {}
        }, markItemStacked: function(item)
        {
            if (!item.hasClass('stacked'))
            {
                var stackGroup = item.closest(".stack").attr('data-group');
                if (!stackGroup)
                    return;
                var stack = $('.stack[data-group="' + stackGroup + '"]', this.wrapper);
                item.addClass('stacked').draggable('disable');
                $('.item_input_container', stack).children('input:last').val(item.attr('data-value')).attr('disabled', true).siblings('.input_feedback').remove();
                for (var i = 3; i <= 10; i++)
                    if (stack.find(".stack_item").length >= i)
                        stack.addClass('with' + i);
                var iconSize = 16;
                var indicator = $('<div/>', {'class': 'completion_indicator icon'}).css({
                        left: '2%', width: iconSize + 'px', height: iconSize + 'px'
                    });
                var itemGroup = item.attr("data-group");
                if (itemGroup == stackGroup)
                {
                    indicator.append($('<div/>', {
                        'class': 'check', style: "width: 100%; height: 100%"
                    }).html('<img src="' + this.settings.assetPath + 'dark/images/check.nocircle.png" class="showOnDark"/><img src="' + this.settings.assetPath + 'light/images/check.nocircle.png" class="showOnLight"/>')).prependTo(item);
                    indicator.css({backgroundColor: 'green'});
                    $('img', indicator).attr('alt', Resources.Assessment_Feedback_Correct)
                }
                else
                {
                    indicator.append($('<div/>', {
                        'class': 'check', style: "width: 100%; height: 100%"
                    }).html('<img src="' + this.settings.assetPath + 'dark/images/cancel.png" class="showOnDark"/><img src="' + this.settings.assetPath + 'light/images/cancel.png" class="showOnLight"/>')).prependTo(item);
                    indicator.css({backgroundColor: 'red'});
                    $('img', indicator).attr('alt', Resources.Assessment_Feedback_Incorrect_Finished)
                }
            }
        }, markAllItemsComplete: function()
        {
            var stackingInterface = this;
            this.items.each(function()
            {
                stackingInterface.markItemStacked($(this))
            });
            this.stacks.each(function()
            {
                stackingInterface.markStackComplete($(this))
            })
        }, init: function(wrapper)
        {
            this.wrapper = $(wrapper);
            this.stackContainer = this.wrapper.children('.stack_container');
            this.itemContainer = this.wrapper.children('.stack_item_container');
            this.stacks = this.stackContainer.children('.stack');
            this.items = this.itemContainer.children('.stack_item');
            this.required = this.wrapper.attr('data-required') === "true";
            var si = this,
                restoreState = function()
                {
                    var currentState = si.question.Answer;
                    if (currentState)
                    {
                        var aState = currentState.split("~");
                        $(".stack").each(function(index)
                        {
                            var dataGroup = $(this).attr("data-group");
                            var aParts = aState[dataGroup - 1].split("|");
                            if (aParts[1])
                            {
                                var aItems = aParts[1].split("");
                                for (var i = 0; i < aItems.length; i++)
                                {
                                    var item = $(".stack_item[data-value='" + aItems[i] + "']");
                                    item.find(".accessible_q_choice").val(dataGroup - 1);
                                    if (!$('body').hasClass('accessible'))
                                        item.appendTo($(this).children('.item_container'))
                                }
                            }
                        });
                        if (si.question.Scored)
                            si.markAllItemsComplete()
                    }
                },
                setState = function()
                {
                    var currentState = "";
                    if ($('body').hasClass('accessible'))
                    {
                        var oState = {};
                        $('.stack_item_container').find(".stack_item").each(function(index)
                        {
                            var selectedVal = $(this).find('.accessible_q_choice').val();
                            if (selectedVal)
                            {
                                oState[selectedVal] = oState[selectedVal] ? oState[selectedVal] + $(this).attr("data-value") : $(this).attr("data-value")
                            }
                        });
                        $(".item_container").each(function(index)
                        {
                            if (currentState != "")
                                currentState += "~";
                            currentState += (index + 1) + "|";
                            if (oState[index])
                                currentState += oState[index].split('').sort().join('')
                        })
                    }
                    else
                    {
                        $(".item_container").each(function(index)
                        {
                            if (currentState != "")
                                currentState += "~";
                            currentState += (index + 1) + "|";
                            var stackItems = [];
                            $(this).find(".stack_item").each(function(index)
                            {
                                var id = $(this).attr("data-value");
                                stackItems.push(id)
                            });
                            currentState += stackItems.sort().join('')
                        })
                    }
                    si.question.Answer = currentState
                },
                answerDropped = function(e, ui)
                {
                    var stack = $(this),
                        item = ui.draggable;
                    item.draggable('option', 'revert', true).removeClass('correct').css({
                        left: 'auto', top: 'auto'
                    }).appendTo(stack.children('.item_container'));
                    $('.stack_item_text', item).each(function()
                    {
                        if (this.offsetWidth < this.scrollWidth)
                            this.title = this.innerText
                    });
                    stack.addClass('with' + stack.find(".stack_item").length);
                    setState();
                    if (si.stacks.not('.stacked').length === 0)
                        si.completed = true
                };
            this.items.each(function()
            {
                $(this).data('originalIndex', $(this).index());
                if ($(this).draggable)
                    $(this).draggable({
                        containment: 'document', revert: true, revertDuration: 100
                    }).contextmenu(function(e)
                    {
                        e.preventDefault();
                        e.stopPropagation();
                        return false
                    }).mousedown(function(e)
                    {
                        if (e.button === 2)
                        {
                            e.preventDefault();
                            e.stopPropagation();
                            return false
                        }
                    })
            });
            this.stacks.each(function()
            {
                $(this).prepend($('<div/>', {'class': 'drag_highlight'}));
                var group = $(this).attr('data-group');
                if (group && $(this).droppable)
                {
                    $(this).droppable({
                        accept: $('.stack_item', si.wrapper), hoverClass: courseController.course.settings.ReviewMode ? 'correct' : '', over: function(e, ui)
                            {
                                ui.draggable.addClass('correct')
                            }, out: function(e, ui)
                            {
                                ui.draggable.removeClass('correct')
                            }, drop: answerDropped
                    })
                }
                if ($('.stack_item[data-group="' + group + '"]').not('.stacked').length === 0)
                    si.markStackComplete($(this))
            });
            if ($('body').hasClass('accessible'))
            {
                this.items.draggable('disable');
                this.stacks.droppable('disable')
            }
            $('select').on('change', function()
            {
                setState()
            });
            restoreState()
        }
};
function AssessmentResultsView(assessmentView, assessment, audioController)
{
    var ac = audioController;
    var rootElem = $('<div id="ResultsView"/>');
    var backgroundElem = $('<div id="ResultsViewBackground" class="AssessmentBackground"/>').appendTo(rootElem);
    var foregroundElem = $('<div id="ResultsViewForeground" class="AssessmentForeground"/>').appendTo(rootElem);
    var contentElem = $('<div id="ResultsViewContent" class="AssessmentContent"/>').appendTo(foregroundElem);
    var resultsIframeElem = $('<iframe id="ResultsViewIframe" class="FullContainerIframe" src="" tabindex="-1"></iframe>');
    resultsIframeElem.attr('title', Resources.Assessment_Results_IframeTitle_Text);
    rootElem.append(resultsIframeElem);
    var statusLeftContainerElem = $('<div id="ResultsLeftContainer" class="ResultsLeftContainer"/>');
    if (assessment.Course.settings.ReviewMode)
    {
        var assessmentReviewView = new AssessmentReviewView(assessmentView);
        statusLeftContainerElem.append(assessmentReviewView)
    }
    var statusTileElem = $('<div id="ResultsViewStatusTile" class="ResultsViewStatusTile"/>');
    var statusCompleteCount = $('<div class="QuestionsCompleteCount"/>');
    var statusCompleteWord = $('<div class="QuestionsCompleteWord"/>');
    var scoreElem = $('<div class="ResultsViewScore"/>');
    var statusFooter = $('<div class="tile_footer"/>');
    var line1Elem = $('<div id="ResultsViewLine1" class="ResultsViewLine1"/>');
    var line2Elem = $('<div id="ResultsViewLine2" class="ResultsViewLine2"/>');
    var line3Elem = $('<div id="ResultsViewLine3" class="ResultsViewLine3"/>');
    var actionElem = $('<a id="ResultsAction" class="ResultsAction"/>');
    actionElem.click(function()
    {
        assessmentView.Observer.fire("resultsTileClicked")
    });
    statusTileElem.append(statusFooter, line1Elem, line2Elem, line3Elem, statusCompleteCount, statusCompleteWord, scoreElem, actionElem).appendTo(statusLeftContainerElem);
    var questionMenuContainerElem = $('<div id="QuestionMenuContainer" class="QuestionMenuContainer"/>');
    statusLeftContainerElem.append(questionMenuContainerElem);
    var resultsViewReportElem = $('<a id="ResultsViewReportTile" class="ResultsViewReportTile" href="#"/>');
    resultsViewReportElem.append('<div class="ResultsViewReportLine1">' + Resources.Assessment_Results_ShowReport1_Text + '</div>');
    resultsViewReportElem.append('<div class="ResultsViewReportLine2 tile_footer">' + Resources.Assessment_Results_ShowReport2_Text + '</div>');
    resultsViewReportElem.click(function()
    {
        assessmentView.Observer.fire("resultsReportClicked")
    });
    statusLeftContainerElem.append(resultsViewReportElem);
    foregroundElem.prepend(statusLeftContainerElem);
    var actionButtonContainerElem = $('<div class="AssessmentActionButtonContainer"/>');
    var actionButton = views.utils.createButton('ResultsActionButton', '').addClass('accent').addClass('accent_border');
    actionButtonContainerElem.append(actionButton);
    rootElem.append(actionButtonContainerElem);
    actionButton.click(function()
    {
        assessmentView.Observer.fire("resultsTileClicked")
    });
    rootElem.showReport = function(assessment)
    {
        var s = '<!doctype html>';
        s += '<html class="no-js' + ($('html', document).hasClass('light_theme') ? ' light_theme' : '') + ($('html', document).hasClass('rtl') ? ' rtl' : '') + '" dir="' + ($('html', document).hasClass('rtl') ? 'rtl' : 'ltr') + '" lang="en">';
        s += '<head>';
        s += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
        s += '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">';
        s += '<title>' + Resources.Assessment_Results_ShowReport2_Text + '</title>';
        s += '<meta name="viewport" content="width=device-width,initial-scale=1">';
        s += '<link type="text/css" href="Player/css/jquery-ui-1.10.4.custom-ui-darkness.css" rel="stylesheet" />';
        s += '<link type="text/css" href="Player/css/playerstyles.css" rel="stylesheet" />';
        s += '<link type="text/css" href="Custom/css/playerstyles.css" rel="stylesheet" />';
        if (assessment.Course.settings.HighContrastModeActive)
        {
            s += '<link type="text/css" href="Player/css/highcontrast.css" rel="stylesheet" />';
            s += '<link type="text/css" href="Custom/css/highcontrast.css" rel="stylesheet" />'
        }
        s += '<style>html, body {overflow:auto;}</style>';
        s += '</head>';
        s += '<body>';
        s += '<div class="ReviewReportContainer">';
        s += '<div class="ReviewReportTitlebar">';
        s += '<a class="menuButton" href="javascript:self.close()">' + Resources.Dialog_Close_Text + '</a>';
        s += '</div>';
        s += '<div class="ReviewReportContent">';
        s += '<div class="ReviewReportCourseName">' + assessment.Course.name + '</div>';
        s += '<div class="ReviewReportPageName">' + assessment.Page.name + '</div>';
        for (var j = 0; j < assessment.QuestionsPresented.length; j++)
        {
            var question = assessment.QuestionsPresented[j];
            s += '<div class="ReviewReportQuestionLabel">' + Resources.Assessment_SummaryDialog_QuestionHeader_Text + ' ' + (j + 1) + '</div>';
            ;
            s += '<div class="ReviewPrompt">' + question.Prompt.Text + '</div>';
            s += '<div class="ReviewChoicesContainer">';
            var aLetter = Resources.Alphabet_Letters.split('');
            var answersArray = question.getAnswersArray();
            var hideAnswers = assessment.HideAnswers;
            for (var i = 0; i < question.ChoicesOrder.length; i++)
            {
                var choice = question.ChoicesOrder[i];
                switch (question.Type)
                {
                    case"choice":
                    case"true-false":
                        var style = $.inArray((i + 1) + '', answersArray) != -1 ? 'ResultsRadioOn' : 'ResultsRadioOff';
                        s += '<div class="' + style + '"> ' + aLetter[i] + '. ' + choice.Text + '</div>';
                        break;
                    case"choice-multiple":
                        var style = $.inArray((i + 1) + '', answersArray) != -1 ? 'ResultsCheckOn' : 'ResultsCheckOff';
                        s += '<div class="' + style + '"> ' + aLetter[i] + '. ' + choice.Text + '</div>';
                        break;
                    default:
                        hideAnswers = true;
                        break
                }
            }
            s += '</div>';
            if (hideAnswers)
            {
                if (question.Scored)
                {
                    if (question.isCorrect())
                    {
                        s += '<div class="ReviewCorrect">' + Resources.Assessment_Results_Status_Correct_Text + '</div>'
                    }
                    else
                    {
                        s += '<div class="ReviewCorrect">' + Resources.Assessment_Results_Status_Incorrect_Text + '</div>'
                    }
                }
            }
            else
            {
                var sCorrect = "",
                    aCorrect = question.CorrectAnswer.split('~');
                for (var i = 0; i < aCorrect.length; i++)
                {
                    if (sCorrect != "")
                        sCorrect += ", ";
                    sCorrect += aLetter[aCorrect[i] - 1]
                }
                s += '<div class="ReviewCorrect">' + Resources.Assessment_CorrectAnswer_Format.replace("{0}", sCorrect) + '</div>'
            }
            s += '<div class="ReviewFeedback">' + Resources.Assessment_SummaryDialog_FeedbackHeader_Text + ": " + question.getFeedback().Text + '</div>';
            s += '<div class="ReviewReportSpacer"> </div>'
        }
        s += '</div>';
        s += '</div>';
        s += '</body>';
        s += '</html>';
        var w = open('', 'reportWindow', 'width=800,height=600,scrollbars=yes,resizable=yes,top=' + ((screen.availHeight / 2) - (600 / 2)) + ',left=' + ((screen.availWidth / 2) - (800 / 2)));
        w.document.write(s);
        w.document.close();
        w.focus()
    };
    rootElem.showResults = function(assessment)
    {
        ac.hideAndStop();
        resultsIframeElem.off('load').on('load', function()
        {
            if (resultsIframeElem.attr('src') !== "")
            {
                resultsIframeElem[0].contentWindow.setAssessment && resultsIframeElem[0].contentWindow.setAssessment(assessment);
                $('body', resultsIframeElem.get(0).contentDocument).find('script').remove();
                backgroundElem.empty().append($('.AssessmentBackground > img:first', resultsIframeElem.get(0).contentDocument));
                var str = $('.AssessmentContent', resultsIframeElem.get(0).contentDocument)[0].innerHTML;
                contentElem.html(str)
            }
            resultsIframeElem.off('load')
        });
        resultsIframeElem.attr('src', assessment.Page.getFilePath());
        questionMenuContainerElem.html('');
        questionMenuContainerElem.attr('role', 'group');
        questionMenuContainerElem.attr('aria-label', Resources.Assessment_Buttons_Questions_Text);
        for (var i = 0; i < assessment.QuestionsPresented.length; i++)
        {
            var sNum = (i + 1) < 10 ? "0" + (i + 1) : (i + 1) + "";
            var title = Resources.Assessment_Results_Question_Text.replace(/%%number%%/g, views.utils.localizeNumbers(sNum));
            var questionTileElem = $('<a class="QuestionTile" id="QuestionTile' + i + '" href="#" title="' + title + '"/>');
            questionTileElem.click(function()
            {
                assessmentView.Observer.fire("resultsQuestionClicked", this.id.substr(12) - 0)
            });
            var questionTileStatusElem = $('<div class="QuestionTileStatus"/>');
            questionTileElem.append(questionTileStatusElem);
            var questionTileNumberElem = $('<div class="QuestionTileNumber">' + views.utils.localizeNumbers(sNum) + '</div>');
            questionTileElem.append(questionTileNumberElem);
            questionMenuContainerElem.append(questionTileElem)
        }
        statusCompleteWord.html(Resources.Assessment_Status_Tile_QuestionsComplete_Text);
        statusFooter.html(Resources.Assessment_Status_Tile_Footer_Text);
        if (assessment.FeedbackType == "Delayed")
            statusCompleteCount.html(views.utils.localizeNumbers(assessment.countAnsweredQuestions() + '/' + assessment.countQuestions()));
        else
            statusCompleteCount.html(views.utils.localizeNumbers((assessment.countQuestions() - assessment.countUnscoredQuestions()) + '/' + assessment.countQuestions()));
        if (assessment.Status !== AssessmentStatus.NotAttempted && assessment.Status !== AssessmentStatus.Incomplete)
            scoreElem.html(views.utils.localizeNumbers(assessment.countCorrectQuestions() + '/' + assessment.countQuestions()) + ' ' + Resources.Assessment_Feedback_Correct);
        var interactionComplete = false;
        if (assessment.sbaMode != undefined)
        {
            switch (assessment.Status)
            {
                case AssessmentStatus.NotAttempted:
                case AssessmentStatus.Incomplete:
                    var nUnanswered = assessment.countUnansweredQuestions();
                    if (nUnanswered > 0)
                    {
                        $('#ResultsViewLine1').html(Resources.Assessment_Results_Status_Incomplete_Text);
                        $('#ResultsViewLine1').addClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultFail');
                        $('#ResultsViewLine2').html(Resources.SBA_AssessmentResultsMoreQuestions_Text.replace(/%%number%%/g, views.utils.localizeNumbers(nUnanswered)));
                        $('#ResultsAction').html(Resources.Assessment_Results_Directions_Incomplete_Text);
                        $('#ResultsAction').addClass('ResultsActionReturn').removeClass('ResultsActionRestart').removeClass('ResultsActionGradeTest');
                        $('#ResultsAction').attr("title", Resources.Assessment_Results_FirstUnanswered_Text);
                        $('#ResultsAction').attr("href", "#");
                        actionButton.addClass('ResultsActionReturn').removeClass('ResultsActionRestart').removeClass('ResultsActionGradeTest');
                        actionButton.html(Resources.Assessment_Results_Directions_Incomplete_Text);
                        actionButton.attr("title", Resources.Assessment_Results_FirstUnanswered_Text);
                        statusTileElem.addClass('actionable').off('click').on('click', function()
                        {
                            assessmentView.Observer.fire("resultsTileClicked")
                        });
                        $('#ResultsViewLine3').html(assessment.ReviewIncompleteText)
                    }
                    else
                    {
                        $('#ResultsViewLine1').html(Resources.SBA_ResultComplete_Text);
                        $('#ResultsViewLine1').addClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultFail');
                        $('#ResultsViewLine2').html(Resources.SBA_AssessmentResultsNotScored_Text);
                        $('#ResultsViewLine3').html("");
                        $('#ResultsAction').html("");
                        $('#ResultsAction').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest');
                        $('#ResultsAction').removeAttr("href");
                        $('#ResultsAction').removeAttr("title");
                        statusTileElem.removeClass('actionable').off('click');
                        actionButton.html('').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest').removeAttr('title');
                        interactionComplete = true
                    }
                    assessmentView.disableReport();
                    statusTileElem.removeClass('AssessmentPassResult').removeClass('AssessmentFailResult');
                    break;
                case AssessmentStatus.Failed:
                case AssessmentStatus.Passed:
                    if (assessment.Page.course.getCurrentPage().sbaIsScored)
                    {
                        if (assessment.Status == AssessmentStatus.Passed)
                        {
                            $('#ResultsViewLine1').html(Resources.SBA_ResultPassed_Text);
                            $('#ResultsViewLine1').addClass('AssesssmentResultPass').removeClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultFail');
                            $('#ResultsViewLine2').html(Resources.SBA_AssessmentResultsPassed_Text);
                            statusTileElem.removeClass('AssessmentFailResult').addClass('AssessmentPassResult')
                        }
                        else
                        {
                            $('#ResultsViewLine1').html(Resources.SBA_ResultFailed_Text);
                            $('#ResultsViewLine1').addClass('AssesssmentResultFail').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultIncomplete');
                            $('#ResultsViewLine2').html(Resources.SBA_AssessmentResultsFailed_Text);
                            statusTileElem.removeClass('AssessmentPassResult').addClass('AssessmentFailResult')
                        }
                        assessmentView.enableReport
                    }
                    else
                    {
                        $('#ResultsViewLine1').html(Resources.SBA_ResultComplete_Text);
                        $('#ResultsViewLine1').addClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultFail');
                        $('#ResultsViewLine2').html(Resources.SBA_AssessmentResultsNotScored_Text);
                        statusTileElem.removeClass('AssessmentFailResult').removeClass('AssessmentPassResult')
                    }
                    $('#ResultsViewLine3').html("");
                    $('#ResultsAction').html("");
                    $('#ResultsAction').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest');
                    $('#ResultsAction').removeAttr("href");
                    $('#ResultsAction').removeAttr("title");
                    statusTileElem.removeClass('actionable').off('click');
                    actionButton.html('').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest').removeAttr('title');
                    interactionComplete = true;
                    break
            }
        }
        else
        {
            switch (assessment.Status)
            {
                case AssessmentStatus.NotAttempted:
                case AssessmentStatus.Incomplete:
                    if (assessment.FeedbackType == "Delayed" && assessment.answeredAllQuestions())
                    {
                        $('#ResultsViewLine1').html(Resources.Assessment_Results_Status_Incomplete_Text);
                        $('#ResultsViewLine1').addClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultFail');
                        $('#ResultsViewLine2').html(Resources.Assessment_Results_MustScore_Text);
                        $('#ResultsAction').html(Resources.Assessment_Results_Directions_GradeTest_Text);
                        $('#ResultsAction').addClass('ResultsActionGradeTest').removeClass('ResultsActionReturn').removeClass('ResultsActionRestart');
                        $('#ResultsAction').attr("title", Resources.Assessment_Results_Directions_GradeTest_Text);
                        $('#ResultsAction').attr("href", "#");
                        statusTileElem.addClass('actionable').off('click').on('click', function()
                        {
                            assessmentView.Observer.fire("resultsTileClicked")
                        });
                        actionButton.addClass('ResultsActionGradeTest').removeClass('ResultsActionReturn').removeClass('ResultsActionRestart');
                        actionButton.html(Resources.Assessment_Results_Directions_GradeTest_Text);
                        actionButton.attr("title", Resources.Assessment_Results_Directions_GradeTest_Text)
                    }
                    else
                    {
                        $('#ResultsViewLine1').html(Resources.Assessment_Results_Status_Incomplete_Text);
                        $('#ResultsViewLine1').addClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultFail');
                        var qNumber = assessment.FeedbackType == "Delayed" ? assessment.countUnansweredQuestions() : assessment.countUnscoredQuestions();
                        $('#ResultsViewLine2').html(Resources.Assessment_Results_Not_Answered_Text.replace(/%%number%%/g, views.utils.localizeNumbers(qNumber)));
                        $('#ResultsAction').html(Resources.Assessment_Results_Directions_Incomplete_Text);
                        $('#ResultsAction').addClass('ResultsActionReturn').removeClass('ResultsActionRestart').removeClass('ResultsActionGradeTest');
                        $('#ResultsAction').attr("title", Resources.Assessment_Results_FirstUnanswered_Text);
                        $('#ResultsAction').attr("href", "#");
                        statusTileElem.addClass('actionable').off('click').on('click', function()
                        {
                            assessmentView.Observer.fire("resultsTileClicked")
                        });
                        actionButton.addClass('ResultsActionReturn').removeClass('ResultsActionRestart').removeClass('ResultsActionGradeTest');
                        actionButton.html(Resources.Assessment_Results_Directions_Incomplete_Text);
                        actionButton.attr('title', Resources.Assessment_Results_FirstUnanswered_Text)
                    }
                    $('#ResultsViewLine3').html(assessment.ReviewIncompleteText);
                    assessmentView.disableReport();
                    statusTileElem.removeClass('AssessmentFailResult').removeClass('AssessmentPassResult');
                    break;
                case AssessmentStatus.Failed:
                    $('#ResultsViewLine1').html(Resources.Assessment_Results_Status_Fail_Text);
                    $('#ResultsViewLine1').addClass('AssesssmentResultFail').removeClass('AssesssmentResultPass').removeClass('AssesssmentResultIncomplete');
                    if (assessment.PassingMethod == "PassingPercentage" || assessment.PreTestType == "NonAdaptive")
                    {
                        var results = Resources.Assessment_Results_FailPercent_Text.replace(/%%percent%%/g, views.utils.localizeNumbers(assessment.getScore()))
                    }
                    else
                    {
                        var results = Resources.Assessment_Results_FailNumber_Text.replace(/%%correct%%/g, views.utils.localizeNumbers(assessment.countCorrectQuestions()));
                        results = results.replace(/%%total%%/g, views.utils.localizeNumbers(assessment.countQuestions()))
                    }
                    $('#ResultsViewLine2').html(results);
                    if (!assessment.hasAttemptsLeft())
                    {
                        $('#ResultsViewLine3').html(Resources.Assessment_Results_Attempts_TooMany_Text);
                        $('#ResultsAction').html("");
                        $('#ResultsAction').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest');
                        $('#ResultsAction').removeAttr("href");
                        $('#ResultsAction').removeAttr("title");
                        statusTileElem.removeClass('actionable').off('click');
                        actionButton.html('').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest').removeAttr('title');
                        interactionComplete = true
                    }
                    else
                    {
                        if (assessment.AttemptsToPass > 0)
                        {
                            results = Resources.Assessment_Results_AttemptsLeft_Text.replace(/%%attempts%%/g, views.utils.localizeNumbers(assessment.Attempts));
                            results = results.replace(/%%total%%/g, views.utils.localizeNumbers(assessment.AttemptsToPass));
                            $('#ResultsViewLine3').html(results)
                        }
                        $('#ResultsAction').html(Resources.Assessment_Results_Directions_Fail_Text);
                        $('#ResultsAction').addClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest');
                        $('#ResultsAction').attr("title", Resources.Assessment_Results_Retry_Text);
                        $('#ResultsAction').attr("href", "#");
                        statusTileElem.addClass('actionable').off('click').on('click', function()
                        {
                            assessmentView.Observer.fire("resultsTileClicked")
                        });
                        actionButton.addClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest');
                        actionButton.html(Resources.Assessment_Results_Directions_Fail_Text);
                        actionButton.attr('title', Resources.Assesment_Results_Retry_Text)
                    }
                    $('#ResultsViewLine3').append('<div>' + assessment.ReviewFailedText + '</div>');
                    assessmentView.enableReport();
                    statusTileElem.removeClass('AssessmentPassResult').addClass('AssessmentFailResult');
                    break;
                case AssessmentStatus.Passed:
                    $('#ResultsViewLine1').html(Resources.Assessment_Results_Status_Pass_Text);
                    $('#ResultsViewLine1').addClass('AssesssmentResultPass').removeClass('AssesssmentResultIncomplete').removeClass('AssesssmentResultFail');
                    if (assessment.PassingMethod == "MustAnswerAll")
                    {
                        $('#ResultsViewLine2').html(Resources.Assessment_Results_CongratulationOnly_Text)
                    }
                    else
                    {
                        var results = Resources.Assessment_Results_Congratulation_Text.replace(/%%percent%%/g, views.utils.localizeNumbers(assessment.getScore()) + "");
                        $('#ResultsViewLine2').html(results)
                    }
                    $('#ResultsViewLine3').html(assessment.ReviewPassedText);
                    $('#ResultsAction').html(Resources.Assessment_Results_Directions_Pass_Text);
                    $('#ResultsAction').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest');
                    $('#ResultsAction').removeAttr("href");
                    $('#ResultsAction').removeAttr("title");
                    statusTileElem.addClass('actionable').off('click');
                    actionButton.html('').removeClass('ResultsActionRestart').removeClass('ResultsActionReturn').removeClass('ResultsActionGradeTest').removeAttr('title');
                    interactionComplete = true;
                    assessmentView.enableReport();
                    statusTileElem.removeClass('AssessmentFailResult').addClass('AssessmentPassResult');
                    break
            }
        }
        interactionComplete ? assessmentView.addClass('Assessment-interactionComplete') : assessmentView.removeClass('Assessment-interactionComplete');
        for (var i = 0; i < assessment.QuestionsPresented.length; i++)
        {
            if (assessment.FeedbackType == "Delayed" && !assessment.isCompleted())
            {
                if (!assessment.QuestionsPresented[i].isAnswered())
                {
                    $('#QuestionTile' + i).removeClass('QuestionTile-Pass').removeClass('QuestionTile-Fail').removeClass('QuestionTile-Answered').removeClass('accent2').removeClass('accent2_border')
                }
                else
                {
                    $('#QuestionTile' + i).addClass('Question-Answered').removeClass('QuestionTile-Pass').removeClass('QuestionTile-Fail').addClass('accent2').addClass('accent2_border')
                }
            }
            else
            {
                if (!assessment.QuestionsPresented[i].Scored)
                {
                    $('#QuestionTile' + i).removeClass('QuestionTile-Pass').removeClass('QuestionTile-Fail').removeClass('QuestionTile-Answered').removeClass('accent2').removeClass('accent2_border')
                }
                else if (assessment.QuestionsPresented[i].isCorrect())
                {
                    $('#QuestionTile' + i).addClass('QuestionTile-Pass').removeClass('QuestionTile-Fail').removeClass('QuestionTile-Answered').addClass('accent2').addClass('accent2_border')
                }
                else
                {
                    $('#QuestionTile' + i).addClass('QuestionTile-Fail').removeClass('QuestionTile-Pass').removeClass('QuestionTile-Answered').addClass('accent2').addClass('accent2_border')
                }
            }
        }
        contentElem.show();
        rootElem.show();
        rootElem.attr("tabindex", "-1");
        rootElem.focus()
    };
    return rootElem
}
function AssessmentReviewView(assessmentView)
{
    var rootElem = $('<div id="AssessmentReviewView" style="margin-bottom:10px;"/>');
    views.utils.createButton('PassAssessmentButton', Resources.Assessment_PassTestButton_Text).click(function()
    {
        assessmentView.Observer.fire("passAssessmentClicked")
    }).appendTo(rootElem);
    rootElem.append(' ');
    views.utils.createButton('FailAssessmentButton', Resources.Assessment_FailTestButton_Text).click(function()
    {
        assessmentView.Observer.fire("failAssessmentClicked")
    }).appendTo(rootElem);
    return rootElem
}
function AssessmentScenarioView(assessmentView)
{
    var rootElem = $('<div id="ScenarioView">');
    var boxElem = $('<div id="ScenarioViewBox"/>').appendTo(rootElem);
    var titleElem = $('<div class="ScenarioViewTitle accent2"/>').appendTo(boxElem);
    var contentElem = $('<div id="ScenarioViewContent"/>').appendTo(boxElem);
    var scrollElem = $('<div id="ScenarioViewContentScroll"/>').appendTo(contentElem);
    var scenarioTextElem = $('<div id="ScenarioViewText" />').appendTo(scrollElem);
    var bottomMask = $('<div class="scroll-padding-bottom-mask"><div></div></div>').appendTo(contentElem);
    var qIframe = $('<iframe src="" class="FullContainerIframe" id="QuestionIframe"/>').appendTo(boxElem);
    var privatePage = null;
    qIframe.off('load').on('load', function()
    {
        if (qIframe.attr('src') == "")
            return;
        if ($('html', document).hasClass('light_theme'))
            $('html', qIframe.get(0).contentDocument).addClass('light_theme');
        if ($('html', document).hasClass('blackonwhite'))
            $('html', qIframe.get(0).contentDocument).addClass('blackonwhite');
        if ($('html', document).hasClass('whiteonblack'))
            $('html', qIframe.get(0).contentDocument).addClass('whiteonblack');
        if (privatePage)
            privatePage.InitVideoController(qIframe[0].contentWindow, assessmentView.CourseController)
    });
    rootElem.updateScenario = function(question, assessment)
    {
        qIframe.attr('src', "");
        privatePage = null;
        $([qIframe, titleElem, contentElem]).each(function()
        {
            $(this).hide()
        });
        $([titleElem, scenarioTextElem]).each(function()
        {
            $(this).html('')
        });
        var scenario = question.Objective.Scenario;
        if (question.Prompt.hasPage())
        {
            qIframe.show();
            var page = assessmentView.CourseController.getPageFromId(question.Prompt.PageId);
            if (page)
            {
                privatePage = page;
                qIframe.attr('src', privatePage.getFilePath())
            }
        }
        else if (scenario)
        {
            $([titleElem, contentElem]).each(function()
            {
                $(this).show()
            });
            titleElem.html(scenario.Title);
            scenarioTextElem.html(scenario.Text)
        }
    };
    rootElem.ContentArea = contentElem;
    return rootElem
}
function AssessmentView(view, audioController, courseController)
{
    view.Observer = new Observer;
    view.CourseController = courseController;
    view.AudioController = audioController;
    view.showAssessment = function(assessment)
    {
        view.attr('aria-busy', "true");
        if (!assessment.Initialized)
            assessment.loadScormData();
        if (!assessment.Initialized)
            assessment.init();
        navBarView.toggle(assessment.ViewState.navBarVisible());
        assessment.ViewState.questionsNavButtonVisible() ? navBarView.showQuestionsLink() : navBarView.hideQuestionsLink();
        view.show();
        view.attr('aria-hidden', 'false');
        view.disableReport();
        view.removeUneededViews(assessment);
        switch (assessment.Location)
        {
            case AssessmentLocation.Intro:
                if (!introView)
                {
                    introView = new AssessmentIntroView(this, audioController);
                    introView.insertAfter(navBarView)
                }
                introView.showIntro(assessment);
                navBarView.checkIntro();
                view.removeClass('Assessment-interactionComplete');
                break;
            case AssessmentLocation.ObjectiveIntro:
                if (!objIntroView)
                {
                    objIntroView = new AssessmentObjIntroView(this, audioController);
                    objIntroView.insertAfter(navBarView)
                }
                objIntroView.showObjIntro(assessment);
                break;
            case AssessmentLocation.Question:
                if (!questionView)
                {
                    questionView = new AssessmentQuestionView(this, audioController);
                    questionView.insertAfter(navBarView)
                }
                questionView.showQuestionView(assessment, false);
                navBarView.checkQuestions();
                questionView.removeClass('QuestionView-HideNavBar');
                view.removeClass('Assessment-interactionComplete');
                if (!assessment.ViewState.navBarVisible())
                    questionView.addClass('QuestionView-HideNavBar');
                break;
            case AssessmentLocation.Review:
                if (!resultsView)
                {
                    resultsView = new AssessmentResultsView(this, assessment, audioController);
                    resultsView.insertAfter(navBarView)
                }
                resultsView.showResults(assessment);
                navBarView.checkReview();
                break
        }
        view.attr('aria-busy', "false")
    };
    view.removeUneededViews = function(assessment)
    {
        if (introView)
        {
            introView.remove();
            introView = null
        }
        if (objIntroView)
        {
            objIntroView.remove();
            objIntroView = null
        }
        if (questionView)
        {
            questionView.remove();
            questionView = null
        }
        if (resultsView)
        {
            resultsView.remove();
            resultsView = null
        }
    };
    view.hideAssessment = function()
    {
        view.hide();
        view.attr('aria-hidden', 'true');
        if (resultsView)
        {
            resultsView.remove();
            resultsView = null
        }
        if (questionView)
        {
            questionView.remove();
            questionView = null
        }
        if (introView)
        {
            introView.remove();
            introView = null
        }
        if (objIntroView)
        {
            objIntroView.remove();
            objIntroView = null
        }
    };
    view.isVisible = function()
    {
        return view.is(":visible")
    };
    view.refreshResults = function(assessment)
    {
        if (!resultsView)
        {
            resultsView = new AssessmentResultsView(this, assessment, audioController);
            resultsView.insertBefore(navBarView)
        }
        resultsView.showResults(assessment)
    };
    view.showReport = function(assessment)
    {
        resultsView && resultsView.showReport(assessment)
    };
    view.enableReport = function()
    {
        view.addClass('AllowReport');
        navBarView.showReportLink()
    };
    view.disableReport = function()
    {
        view.removeClass('AllowReport');
        navBarView.hideReportLink()
    };
    view.hideTimer = function()
    {
        navBarView.hideTimer()
    };
    view.showTimer = function()
    {
        navBarView.showTimer()
    };
    view.showRemainingTime = function(time)
    {
        navBarView.showRemainingTime(time)
    };
    var navBarView = new AssessmentNavBarView(view);
    navBarView.appendTo(view);
    var questionView = null,
        introView = null,
        resultsView = null,
        objIntroView = null;
    return view
}
function QuestionNavBarView(assessmentView, buttonsElem)
{
    var navBar = $('<div class="QuestionNavBar" aria-hidden="true"></div>');
    var navButtons = $('<div id="QuestionNavButtons"></div>');
    var nextButton2 = views.utils.createButton("AssessmentNextButton2", Resources.Assessment_Buttons_NextQuestion_Text, "AssessmentNextButton2").click(function()
        {
            assessmentView.Observer.fire("nextLocationClicked")
        });
    var prevButton2 = views.utils.createButton("AssessmentPreviousButton2", Resources.Assessment_Buttons_PreviousQuestion_Text, "AssessmentPreviousButton2");
    prevButton2.attr("aria-hidden", "true");
    prevButton2.click(function()
    {
        assessmentView.Observer.fire("previousLocationClicked")
    });
    nextButton2.addClass('accent2');
    prevButton2.addClass('accent2');
    buttonsElem.append(prevButton2, nextButton2);
    var assessmentLocationChanged = function(assessment)
        {
            if (assessment.LocationIndex == 1)
            {}
            else
            {}
            if (assessment.LocationIndex == assessment.NavigationNodes.length - 2)
            {}
            else
            {}
        };
    assessmentView.Observer.unobserve("locationChanged", assessmentLocationChanged);
    assessmentView.Observer.observe("locationChanged", assessmentLocationChanged);
    return navBar
}
function BranchingContentView(branchingView, audioController)
{
    var ac = audioController,
        branchingPoint = null;
    var rootElem = $('<div class="BranchingContentView"/>');
    var foregroundElem = $('<div class="BranchingContentViewForeground"/>').appendTo(rootElem);
    var contentIframeElem = $('<iframe id="BranchingContentIframe" src=""></iframe>');
    foregroundElem.append(contentIframeElem);
    rootElem.unloadContent = function(callback)
    {
        contentIframeElem.hide().removeClass('fullscreen').off('load').on('load', function()
        {
            callback && callback()
        }).attr('src', '');
        branchingView.CourseController.course.observer.unobserve("pageStatusChanged", pageStatusChangedHandler)
    };
    var pageStatusChangedHandler = function(page)
        {
            page.isComplete() && branchingPoint && (page.id == branchingPoint.contentPageId) && !branchingPoint.contentCompleted && branchingPoint.setContentCompleted();
            branchingView.updateNavButtons(branchingPoint.graph);
            branchingView.Observer.fire("stateChanged", branchingPoint.graph)
        };
    rootElem.showContent = function(bpm)
    {
        branchingPoint = bpm;
        var pageDisplayed = branchingView.CourseController.getPageFromId(branchingPoint.contentPageId);
        if (!pageDisplayed)
        {
            branchingPoint.graph.observer.fire('contentMissing');
            return
        }
        if (pageDisplayed.canSendCompletion() && !pageDisplayed.isComplete() && pageDisplayed.isRequired())
        {
            pageDisplayed.setIncomplete()
        }
        else
        {
            pageDisplayed.setComplete()
        }
        if (pageDisplayed.isComplete())
            !branchingPoint.contentCompleted && branchingPoint.setContentCompleted();
        else
            branchingView.CourseController.course.observer.observe("pageStatusChanged", pageStatusChangedHandler);
        var playOnPageDisplayAudio = pageDisplayed.getPlayOnPageDisplayAudio();
        if (playOnPageDisplayAudio)
        {
            audioController.page = pageDisplayed;
            audioController.readyToPlay(playOnPageDisplayAudio, branchingPoint.graph.course.volume)
        }
        else
        {
            audioController.hideAndStop()
        }
        contentIframeElem.off('load').on('load', function()
        {
            contentIframeElem.off('load');
            if (contentIframeElem.attr('src') == "")
                return;
            if (!branchingPoint.contentViewed)
            {
                branchingPoint.setContentViewed();
                branchingView.updateNavButtons(branchingPoint.graph);
                branchingView.Observer.fire("stateChanged", branchingPoint.graph)
            }
            if ($('html', document).hasClass('light_theme'))
                $('html', contentIframeElem.get(0).contentDocument).addClass('light_theme');
            if ($('html', document).hasClass('blackonwhite'))
                $('html', contentIframeElem.get(0).contentDocument).addClass('blackonwhite');
            if ($('html', document).hasClass('whiteonblack'))
                $('html', contentIframeElem.get(0).contentDocument).addClass('whiteonblack');
            pageDisplayed.InitVideoController(contentIframeElem[0].contentWindow, branchingView.CourseController, branchingView.Observer, pageDisplayed)
        });
        contentIframeElem.attr('src', pageDisplayed.getFilePath());
        contentIframeElem.show();
        rootElem.show()
    };
    return rootElem
}
function BranchingFeedbackContentView(branchingView, audioController)
{
    var ac = audioController;
    var branchingPoint;
    var rootElem = $('<div id="BranchingFeedbackContentView"/>');
    var backgroundElem = $('<div id="BranchingFeedbackContentViewBackground"/>').appendTo(rootElem);
    var foregroundElem = $('<div id="BranchingFeedbackContentViewForeground"/>').appendTo(rootElem);
    var titleBar = $('<div class="BranchingDialogTitlebar"></div>');
    var close = $('<a class="BranchingDialogClose" href="#">' + Resources.Dialog_Close_Text + '</a>').on('click', function()
        {
            audioController.hideAndStop();
            branchingView.Observer.fire("closeFeedbackContentClicked")
        }).appendTo(titleBar);
    titleBar.appendTo(rootElem);
    var contentIframeElem = $('<iframe id="BranchingFeedbackContentIframe" src=""></iframe>');
    foregroundElem.append(contentIframeElem);
    rootElem.unloadContent = function(callback)
    {
        contentIframeElem.hide().removeClass('fullscreen').off('load').on('load', function()
        {
            callback && callback()
        }).attr('src', '');
        branchingView.CourseController.course.observer.unobserve("pageStatusChanged", pageStatusChangedHandler)
    };
    var pageStatusChangedHandler = function(page)
        {
            page.isComplete() && branchingPoint && branchingPoint.currentAttempt && (branchingPoint.currentAttempt.getFeedbackPageId() == page.id) && !branchingPoint.feedbackCompleted() && branchingPoint.setFeedbackCompleted();
            branchingView.updateNavButtons(branchingPoint.graph);
            branchingView.Observer.fire("stateChanged", branchingPoint.graph)
        };
    rootElem.showContent = function(branchingPointModel)
    {
        branchingPoint = branchingPointModel;
        if (branchingPoint.location === BranchingPointLocation.FeedbackContent)
            rootElem.addClass('BranchingFeedbackContent-linearMode');
        else
            rootElem.removeClass('BranchingFeedbackContent-linearMode');
        var pageDisplayed = branchingPoint.location === BranchingPointLocation.FeedbackContent ? (branchingPoint.currentAttempt ? branchingView.CourseController.getPageFromId(branchingPoint.currentAttempt.getFeedbackPageId()) : null) : (branchingPoint.selectedFeedbackPageId ? branchingView.CourseController.getPageFromId(branchingPoint.selectedFeedbackPageId) : null);
        if (!pageDisplayed)
        {
            branchingPoint.graph.observer.fire('feedbackContentMissing');
            return
        }
        if (pageDisplayed.canSendCompletion() && !pageDisplayed.isComplete() && pageDisplayed.isRequired())
        {
            pageDisplayed.setIncomplete()
        }
        else
        {
            pageDisplayed.setComplete()
        }
        if (pageDisplayed.isComplete())
            !branchingPoint.selectedFeedbackPageIsAlternative() && !branchingPoint.feedbackCompleted() && branchingPoint.setFeedbackCompleted();
        else
            branchingView.CourseController.course.observer.observe("pageStatusChanged", pageStatusChangedHandler);
        var playOnPageDisplayAudio = pageDisplayed.getPlayOnPageDisplayAudio();
        if (playOnPageDisplayAudio)
        {
            audioController.readyToPlay(playOnPageDisplayAudio, branchingPoint.graph.course.volume)
        }
        else
        {
            audioController.hideAndStop()
        }
        contentIframeElem.show().off('load').on('load', function()
        {
            contentIframeElem.off('load');
            if (contentIframeElem.attr('src') == "")
                return;
            if (!branchingPoint.feedbackViewed() && !branchingPoint.selectedFeedbackPageIsAlternative())
            {
                branchingPoint.setFeedbackViewed();
                branchingView.updateNavButtons(branchingPoint.graph);
                branchingView.Observer.fire("stateChanged", branchingPoint.graph)
            }
            if ($('html', document).hasClass('light_theme'))
                $('html', contentIframeElem.get(0).contentDocument).addClass('light_theme');
            if ($('html', document).hasClass('blackonwhite'))
                $('html', contentIframeElem.get(0).contentDocument).addClass('blackonwhite');
            if ($('html', document).hasClass('whiteonblack'))
                $('html', contentIframeElem.get(0).contentDocument).addClass('whiteonblack');
            pageDisplayed.InitVideoController(contentIframeElem[0].contentWindow, branchingView.CourseController, branchingView.Observer, pageDisplayed)
        });
        contentIframeElem.attr('src', pageDisplayed.getFilePath());
        rootElem.show()
    };
    return rootElem
}
function BranchingFeedbackView(branchingView, audioController)
{
    var branchingPoint = null,
        ac = audioController;
    var feedbackView = $('<div id="BranchingFeedbackView"></div>');
    var feedbackViewBox = $('<div id="BranchingFeedbackViewBox"></div>').appendTo(feedbackView);
    feedbackViewBox.append($('<div class="BranchingQALabel accent2_text">Q&amp;A</div>'));
    var titleBar = $('<div class="BranchingFeedbackTitleBar"></div>');
    feedbackViewBox.append(titleBar);
    var titleBarText = $('<div class="BranchingTitleBarText"></div>');
    titleBar.append(titleBarText);
    var feedbackContentElem = $('<div id="BranchingFeedbackContent"></div>');
    feedbackViewBox.append(feedbackContentElem);
    var feedbackContentScrollElem = $('<div id="BranchingFeedbackContentScroll"></div>');
    feedbackContentElem.append(feedbackContentScrollElem);
    var bottomMask = $('<div class="scroll-padding-bottom-mask"><div></div></div>').appendTo(feedbackContentElem);
    var feedbackTextElem = $('<div id="BranchingFeedbackViewText" />').appendTo(feedbackContentScrollElem);
    var feedbackIncompleteMessage = $('<div id="BranchingFeedbackIncompleteMessage"/>').html(Resources.Branching_FeedbackIncomplete_Text).appendTo(feedbackContentScrollElem);
    var actionBar = $('<div class="BranchingFeedbackActionBar"></div>');
    feedbackViewBox.append(actionBar);
    var buttonsElem = $('<div id="BranchingFeedbackViewButtons"></div>');
    var retryBtn = views.utils.createButton('BranchingFRetryButton', Resources.Branching_Buttons_RetryQuestion_Text).addClass('accent2').addClass('accent2_border').click(function()
        {
            branchingView.Observer.fire("retryQuestionClicked")
        }).appendTo(buttonsElem);
    var showFeedbackBtn = views.utils.createButton('BranchingFShowFeedbackButton', Resources.Branching_Buttons_ShowFeedback_Text).addClass('accent2').addClass('accent2_border').click(function()
        {
            branchingView.Observer.fire("showFeedbackContentClicked")
        }).appendTo(feedbackContentScrollElem);
    actionBar.append(buttonsElem);
    var relatedOutcomesSelector = new BranchingRelatedOutcomesSelectorView(branchingView),
        relatedOutcomesTiles = new BranchingRelatedOutcomesTileView(branchingView);
    relatedOutcomesSelector.appendTo(actionBar);
    relatedOutcomesTiles.appendTo(feedbackContentScrollElem);
    var setViewState = function(branchingPoint)
        {
            if (branchingPoint.feedbackContentPosition !== BranchingPointFeedbackContentPosition.Popup)
            {
                feedbackView.removeClass('BranchingFeedbackView-canRetry').removeClass('BranchingFeedbackView-hasOutcome').removeClass('BranchingFeedbackView-feedbackIncomplete');
                if (branchingPoint.location === BranchingPointLocation.Feedback)
                {
                    feedbackView.removeClass('BranchingFeedbackView-feedbackAlternativesView');
                    if ((branchingPoint.feedbackContentPosition === BranchingPointFeedbackContentPosition.BeforeFeedback || branchingPoint.feedbackContentPosition === BranchingPointFeedbackContentPosition.SkipFeedback || !branchingPoint.currentAttemptHasFeedbackContent()) && branchingPoint.canViewAlternativeFeedback() && branchingPoint.hasAlternativeFeedbackContent())
                        feedbackView.addClass('BranchingFeedbackView-canViewAlternatives');
                    else
                        feedbackView.removeClass('BranchingFeedbackView-canViewAlternatives')
                }
                else if (branchingPoint.location === BranchingPointLocation.FeedbackContent)
                    feedbackView.removeClass('BranchingFeedbackView-canViewAlternatives').removeClass('BranchingFeedbackView-feedbackAlternativesView');
                else
                    feedbackView.addClass('BranchingFeedbackView-canViewAlternatives').addClass('BranchingFeedbackView-feedbackAlternativesView')
            }
            else
            {
                feedbackView.removeClass('BranchingFeedbackView-feedbackAlternativesView');
                if (branchingPoint.canRetry())
                {
                    feedbackView.addClass('BranchingFeedbackView-canRetry')
                }
                else
                {
                    feedbackView.removeClass('BranchingFeedbackView-canRetry')
                }
                if (branchingPoint.currentAttemptHasFeedbackContent())
                {
                    feedbackView.addClass('BranchingFeedbackView-hasOutcome')
                }
                else
                {
                    feedbackView.removeClass('BranchingFeedbackView-hasOutcome')
                }
                if (branchingPoint.canViewAlternativeFeedback() && branchingPoint.hasAlternativeFeedbackContent())
                    feedbackView.addClass('BranchingFeedbackView-canViewAlternatives');
                else
                    feedbackView.removeClass('BranchingFeedbackView-canViewAlternatives');
                if (branchingPoint.currentAttemptHasFeedbackContent() && branchingPoint.feedbackViewed() && branchingPoint.mustCompleteFeedback && !branchingPoint.feedbackCompleted())
                    feedbackView.addClass('BranchingFeedbackView-feedbackIncomplete');
                else
                    feedbackView.removeClass('BranchingFeedbackView-feedbackIncomplete')
            }
        };
    feedbackView.showFeedbackView = function(branchingPointModel)
    {
        branchingPoint = branchingPointModel;
        setViewState(branchingPoint);
        feedbackTextElem.empty();
        if (branchingPoint.isScored())
        {
            if (branchingPoint.location !== BranchingPointLocation.FeedbackContent)
            {
                feedbackView.show();
                feedbackView.hideFeedbackContent();
                feedbackTextElem.html(branchingPoint.currentAttempt.getFeedback().Text);
                if (branchingPoint.location === BranchingPointLocation.Feedback)
                {
                    titleBarText.html(branchingPoint.isCorrect() ? Resources.Branching_Correct_Header_Text : Resources.Branching_Incorrect_Header_Text);
                    relatedOutcomesTiles.clearList();
                    if ((branchingPoint.feedbackContentPosition !== BranchingPointFeedbackContentPosition.AfterFeedback || !branchingPoint.currentAttemptHasFeedbackContent()) && branchingPoint.canViewAlternativeFeedback())
                        relatedOutcomesSelector.updateList(branchingPoint);
                    else
                        relatedOutcomesSelector.clearList();
                    audioFilePath = branchingPoint.currentAttempt.getFeedbackAudioFilePath();
                    if (audioFilePath)
                        ac.readyToPlay(audioFilePath, branchingPoint.graph.course.volume, null, null);
                    else
                        ac.hideAndStop()
                }
                else
                {
                    titleBarText.html(Resources.Branching_RelatedOutcomes_Header_Text);
                    relatedOutcomesSelector.clearList();
                    relatedOutcomesTiles.updateList(branchingPoint);
                    ac.hideAndStop()
                }
            }
            else
            {
                relatedOutcomesTiles.clearList();
                relatedOutcomesSelector.clearList();
                feedbackView.hide();
                feedbackView.showFeedbackContent()
            }
        }
        else
        {
            feedbackView.hide();
            feedbackView.hideFeedbackContent();
            relatedOutcomesTiles.clearList();
            relatedOutcomesSelector.clearList();
            feedbackTextElem.html('');
            titleBarText.html('');
            ac.hideAndStop()
        }
    };
    feedbackView.showFeedbackContent = function()
    {
        ac.hideAndStop();
        if (!feedbackContentView)
        {
            feedbackContentView = new BranchingFeedbackContentView(branchingView, audioController);
            feedbackContentView.insertAfter(feedbackView)
        }
        feedbackContentView.showContent(branchingPoint);
        setViewState(branchingPoint);
        (branchingPoint.location !== BranchingPointLocation.FeedbackContent) && branchingView.addClass('BranchingView-popupOpen')
    };
    feedbackView.hideFeedbackContent = function()
    {
        if (feedbackContentView)
        {
            feedbackContentView.hide();
            feedbackContentView.unloadContent();
            setViewState(branchingPoint);
            branchingView.removeClass('BranchingView-popupOpen')
        }
    };
    var feedbackContentView = null;
    return feedbackView
}
function BranchingNavBarView(branchingView)
{
    var navBar = $('<div id="BranchingNavBar"></div>');
    var navButtons = $('<div id="BranchingNavButtons"></div>');
    var prevButton = views.utils.createButton("BranchingPreviousButton", "", "BranchingPreviousButton").click(function()
        {
            branchingView.Observer.fire("previousLocationClicked")
        });
    prevButton.prop("title", Resources.Branching_Previous_Button_Title);
    var nextButton = views.utils.createButton("BranchingNextButton", "", "BranchingNextButton").click(function()
        {
            branchingView.Observer.fire("nextLocationClicked")
        });
    nextButton.prop("title", Resources.Branching_Next_Button_Title);
    navButtons.append(prevButton);
    navButtons.append(nextButton);
    navBar.append(navButtons);
    navBar.setNavButtons = function(branchingGraph)
    {
        if (branchingGraph.canMoveForward())
            nextButton.removeAttr('disabled');
        else
            nextButton.attr('disabled', true);
        if (branchingGraph.canMoveBackward())
            prevButton.removeAttr('disabled');
        else
            prevButton.attr('disabled', true)
    };
    return navBar
}
function BranchingQuestionView(branchingView, audioController, bp)
{
    var branchingPoint = null,
        ac = audioController,
        titleContainer = null,
        promptContainer = null,
        choicesContainer = null,
        retryButton = null;
    var questionView = null,
        iframeContentDoc = null;
    var rootElem = $('<div class="BranchingContentView"/>');
    var foregroundElem = $('<div class="BranchingContentViewForeground"/>').appendTo(rootElem);
    var questionIframeElem = $('<iframe id="BranchingContentIframe" src=""></iframe>');
    foregroundElem.append(questionIframeElem);
    var setViewState = function(branchingPoint)
        {
            if (branchingPoint.isScored())
            {
                questionView.addClass('BranchingQuestionView-scored');
                choicesContainer.find(':input').attr('disabled', 'disabled');
                if (branchingPoint.canRetry())
                {
                    questionView.addClass('BranchingQuestionView-canRetry')
                }
                else
                {
                    questionView.removeClass('BranchingQuestionView-canRetry')
                }
                titleContainer.html(branchingPoint.isCorrect() ? Resources.Branching_Correct_Header_Text : Resources.Branching_Incorrect_Header_Text)
            }
            else
            {
                questionView.removeClass('BranchingQuestionView-scored').removeClass('BranchingQuestionView-canRetry');
                choicesContainer.find(':input').removeAttr('disabled');
                titleContainer.html('')
            }
        };
    var showQuestionView = function(bpm)
        {
            branchingPoint = bpm;
            if (branchingPoint.hasQuestion())
            {
                if (branchingPoint.question.Prompt.Image)
                {
                    var sFile = branchingPoint.graph.course.getImagesFolderPath() + branchingPoint.question.Prompt.Image;
                    choicesContainer.append('<img class="BranchingQuestionViewImage" src="' + sFile + '" alt="' + branchingPoint.question.Prompt.ImageAltText + '"/>')
                }
                promptContainer.html(branchingPoint.question.Prompt.Text);
                var answersArray = branchingPoint.getAnswersArray();
                var aLetter = Resources.Alphabet_Letters.split('');
                for (var i = 0; i < branchingPoint.choicesOrder.length; i++)
                {
                    var choice = branchingPoint.choicesOrder[i];
                    var idx = i + 1;
                    if (branchingPoint.ui)
                    {
                        iframeContentDoc.find("span[id=questionChoice" + idx + "]").html(choice.Text);
                        if ($.inArray(idx + '', answersArray) != -1)
                            choicesContainer.find("input[value=" + idx + "]").prop("checked", true)
                    }
                    else
                    {
                        var attrs = $.inArray(idx + '', answersArray) != -1 ? ' checked' : ' ';
                        switch (branchingPoint.question.Type)
                        {
                            case"choice":
                            case"true-false":
                                choicesContainer.append('<label><input type="radio" name="branchingQuestionChoice"' + attrs + ' value="' + idx + '"/><span id="questionChoice' + idx + '">' + aLetter[i] + '. ' + choice.Text + '</span></label>');
                                break;
                            case"choice-multiple":
                                choicesContainer.append('<label><input type="checkbox" name="branchingQuestionChoice"' + attrs + ' value="' + idx + '"/><span id="questionChoice' + idx + '">' + aLetter[i] + '. ' + choice.Text + '</span></label>');
                                break
                        }
                    }
                }
                if (branchingPoint.isScored())
                {
                    ac.hideAndStop()
                }
                else
                {
                    if (branchingPoint.question.Prompt.AudioFile)
                    {
                        ac.readyToPlay(branchingPoint.graph.course.getMediaFolderPath() + branchingPoint.question.Prompt.AudioFile, branchingPoint.graph.course.volume, null, null)
                    }
                    else
                        ac.hideAndStop()
                }
                setViewState(branchingPoint);
                branchingPoint.startLatencyTimer();
                choicesContainer.find('input').on("change", function(e)
                {
                    if (branchingPoint)
                    {
                        branchingPoint.currentAnswer = views.utils.getCheckedItems(choicesContainer, 'branchingQuestionChoice', '~');
                        branchingView.updateNavButtons(branchingPoint.graph);
                        branchingView.Observer.fire("stateChanged", branchingPoint.graph)
                    }
                    if (this.checked)
                    {
                        var t = this;
                        setTimeout(function()
                        {
                            if (!t.checked)
                                t.checked = true
                        }, 1)
                    }
                })
            }
        };
    questionIframeElem.show().off('load').on('load', function()
    {
        questionIframeElem.off('load');
        if (questionIframeElem.attr('src') == "")
            return;
        iframeContentDoc = $(questionIframeElem.get(0).contentDocument);
        if ($('html', document).hasClass('light_theme'))
            $('html', iframeContentDoc).addClass('light_theme');
        if ($('html', document).hasClass('blackonwhite'))
            $('html', iframeContentDoc).addClass('blackonwhite');
        if ($('html', document).hasClass('whiteonblack'))
            $('html', iframeContentDoc).addClass('whiteonblack');
        questionView = iframeContentDoc.find("#BranchingQuestionView");
        titleContainer = iframeContentDoc.find(".BranchingTitleBarText");
        promptContainer = iframeContentDoc.find("#BranchingQuestionViewPrompt");
        choicesContainer = iframeContentDoc.find("#BranchingQuestionViewChoices");
        retryButton = views.utils.createButton('BranchingQRetryButton', Resources.Branching_Buttons_RetryQuestion_Text).addClass('accent2').addClass('accent2_border').click(function()
        {
            branchingView.Observer.fire("retryQuestionClicked");
            branchingPoint.startLatencyTimer();
            setViewState(branchingPoint)
        }).appendTo(iframeContentDoc.find("#BranchingQuestionViewButtons"));
        showQuestionView(bp)
    });
    var path = bp.graph.page.getPageContentFolderPath();
    path += bp.ui ? bp.ui : "QuestionView.html";
    questionIframeElem.attr('src', path);
    return rootElem
}
function BranchingRelatedOutcomesSelectorView(branchingView)
{
    var relatedOutcomesSelector = $('<div id="BranchingRelatedOutcomesSelector"/>');
    var relatedOutcomesOpener = $('<a href="#"><span class="label">' + Resources.Branching_Buttons_RelatedOutcomes_Text + '</span><span class="expandVisual"></span></a>').appendTo(relatedOutcomesSelector);
    var relatedOutcomesMenu = $('<div id="BranchingRelatedOutcomesMenu"/>').appendTo(relatedOutcomesSelector);
    var relatedOutcomesList = $('<ul/>').appendTo(relatedOutcomesMenu);
    var showMenu = function()
        {
            relatedOutcomesSelector.addClass('expanded')
        },
        hideMenu = function()
        {
            relatedOutcomesSelector.removeClass('expanded')
        };
    relatedOutcomesSelector.on('focusout', function()
    {
        relatedOutcomesSelector.find(':focus').length === 0 && relatedOutcomesSelector.find(':hover').length === 0 && relatedOutcomesSelector.filter(':hover').length === 0 && hideMenu()
    }).on('mouseout', function(e)
    {
        relatedOutcomesList.find(':focus').length === 0 && relatedOutcomesSelector.find(e.toElement).length === 0 && relatedOutcomesSelector.filter(e.toElement).length === 0 && hideMenu()
    });
    relatedOutcomesList.on('focusin', showMenu);
    relatedOutcomesOpener.on('click', function()
    {
        relatedOutcomesOpener.focus();
        if (relatedOutcomesSelector.hasClass('expanded'))
            hideMenu();
        else
            showMenu()
    });
    relatedOutcomesSelector.updateList = function(branchingPoint)
    {
        relatedOutcomesList.empty();
        if (branchingPoint.isScored())
        {
            var alternativeFeedbackPageIds = branchingPoint.getAlternativeFeedbackPageIds();
            for (var i = 0, link; i < alternativeFeedbackPageIds.length; i++)
            {
                link = $('<a href="#"/>').html(Resources.Branching_RelatedOutcome_Item.replace('%%index%%', ('0' + (i + 1)).substr(-2, 2))).attr('data-pageId', alternativeFeedbackPageIds[i]);
                relatedOutcomesList.append($('<li/>').append(link));
                link.on('click', function()
                {
                    branchingView.Observer.fire("alternateFeedbackContentClicked", $(this).attr('data-pageId'))
                })
            }
        }
    };
    relatedOutcomesSelector.clearList = function()
    {
        relatedOutcomesList.empty()
    };
    return relatedOutcomesSelector
}
function BranchingRelatedOutcomesTileView(branchingView)
{
    var relatedOutcomes = $('<div id="BranchingRelatedOutcomes"/>');
    relatedOutcomes.updateList = function(branchingPoint)
    {
        relatedOutcomes.empty();
        if (branchingPoint.isScored())
        {
            var alternativeFeedbackPageIds = branchingPoint.getAlternativeFeedbackPageIds();
            for (var i = 0, link, page; i < alternativeFeedbackPageIds.length; i++)
            {
                page = branchingView.CourseController.getPageFromId(alternativeFeedbackPageIds[i]);
                if (page)
                {
                    link = $('<a class="accent2" href="#"/>').html('<div class="outcome_number">' + ('0' + (i + 1)).substr(-2, 2) + '</div><div class="outcome_name">' + page.name + '</div>').attr('data-pageId', alternativeFeedbackPageIds[i]);
                    relatedOutcomes.append(link);
                    link.on('click', function()
                    {
                        branchingView.Observer.fire("alternateFeedbackContentClicked", $(this).attr('data-pageId'))
                    })
                }
            }
            i > 0 && relatedOutcomes.append($('<div class="clear"/>'))
        }
    };
    relatedOutcomes.clearList = function()
    {
        relatedOutcomes.empty()
    };
    return relatedOutcomes
}
function BranchingView(view, audioController, courseController)
{
    view.Observer = new Observer;
    view.CourseController = courseController;
    view.AudioController = audioController;
    var ac = audioController;
    view.showBranchingGraph = function(branchingGraph)
    {
        branchingGraph.stopCurrentLocationLatencyTimer();
        view.updateViewState(branchingGraph);
        view.show();
        if (questionView)
            questionView.remove();
        if (!branchingGraph.getCurrentLocation())
        {
            if (feedbackView)
            {
                feedbackView.hide();
                feedbackView.hideFeedbackContent()
            }
            if (contentView)
            {
                contentView.hide();
                contentView.unloadContent()
            }
        }
        else
        {
            switch (branchingGraph.getCurrentBranchingPointLocation())
            {
                case BranchingPointLocation.Content:
                    if (feedbackView)
                    {
                        feedbackView.hide();
                        feedbackView.hideFeedbackContent()
                    }
                    if (!contentView)
                    {
                        contentView = new BranchingContentView(this, audioController);
                        contentView.insertBefore(navBarView)
                    }
                    if (branchingGraph.getCurrentLocation())
                        contentView.showContent(branchingGraph.getCurrentLocation());
                    break;
                case BranchingPointLocation.Question:
                    if (contentView)
                    {
                        contentView.hide();
                        contentView.unloadContent()
                    }
                    if (feedbackView)
                    {
                        feedbackView.hide();
                        feedbackView.hideFeedbackContent()
                    }
                    questionView = new BranchingQuestionView(this, audioController, branchingGraph.getCurrentLocation());
                    questionView.insertBefore(navBarView);
                    break;
                case BranchingPointLocation.Feedback:
                case BranchingPointLocation.FeedbackContent:
                case BranchingPointLocation.FeedbackAlternatives:
                    if (contentView)
                    {
                        contentView.hide();
                        contentView.unloadContent()
                    }
                    if (!feedbackView)
                    {
                        feedbackView = new BranchingFeedbackView(this, audioController);
                        feedbackView.insertBefore(navBarView)
                    }
                    feedbackView.showFeedbackView(branchingGraph.getCurrentLocation(), ac);
                    break;
                default:
                    if (contentView)
                    {
                        contentView.hide();
                        contentView.unloadContent()
                    }
                    if (feedbackView)
                    {
                        feedbackView.hide();
                        feedbackView.hideFeedbackContent()
                    }
                    break
            }
        }
    };
    view.showFeedbackContent = function(branchingGraph)
    {
        if (!feedbackView)
        {
            feedbackView = new BranchingFeedbackView(this, audioController);
            view.append(feedbackView);
            feedbackView.showFeedbackView(branchingGraph.getCurrentLocation(), ac)
        }
        feedbackView.showFeedbackContent()
    };
    view.hideFeedbackContent = function()
    {
        feedbackView && feedbackView.hideFeedbackContent()
    };
    view.updateNavButtons = function(branchingGraph)
    {
        navBarView.setNavButtons(branchingGraph)
    };
    view.updateViewState = function(branchingGraph)
    {
        if (branchingGraph.canRestart())
            view.addClass("Branching-canRestart");
        else
            view.removeClass("Branching-canRestart");
        branchingGraph.pathComplete ? view.addClass("Branching-pathComplete") : view.removeClass("Branching-pathComplete");
        branchingGraph.complete ? view.addClass("Branching-complete") : view.removeClass("Branching-complete");
        branchingGraph.passed ? view.addClass("Branching-passed") : view.removeClass("Branching-passed");
        var currentLocation = branchingGraph.getCurrentLocation();
        currentLocation && currentLocation.interactionComplete() && !currentLocation.canMoveForward() ? view.addClass("Branching-terminus") : view.removeClass("Branching-terminus")
    };
    view.hideGraph = function(callback)
    {
        view.hide();
        if (feedbackView)
        {
            feedbackView.hide();
            feedbackView.hideFeedbackContent(callback)
        }
        if (questionView)
        {
            questionView.remove();
            callback && callback()
        }
        if (contentView)
        {
            contentView.hide();
            contentView.unloadContent(callback)
        }
    };
    view.isVisible = function()
    {
        return view.is(":visible")
    };
    var navBarView = new BranchingNavBarView(view);
    navBarView.appendTo(view);
    var restartBtn = views.utils.createButton('BranchingRestartButton', Resources.Branching_Buttons_Restart_Text).addClass('accent2').addClass('accent2_border');
    restartBtn.on('click', function()
    {
        view.Observer.fire("restartClicked")
    }).appendTo(view);
    var contentView = null;
    var questionView = null;
    var feedbackView = null;
    return view
}
function ChangeLanguagesTileView(courseController)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_Languages_Button_Text);
    tileAction.click(function()
    {
        courseController.showLanguageDialog();
        return false
    });
    return tileAction
}
function ChangeTracksTileView(courseController)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_ChangeTracks_Button_Text);
    tileAction.click(function()
    {
        courseController.showTracksDialog();
        return false
    });
    return tileAction
}
function CommunityTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_Discussion_Button_Text);
    tileAction.click(function()
    {
        open(courseController.course.settings.DiscussionLink, "DiscussionLink");
        return false
    });
    return tileAction
}
function ContentsTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_TableOfContents_Button_Text);
    tileAction.click(function()
    {
        courseController.showContentsDialog();
        return false
    });
    return tileAction
}
function DownloadTranscriptTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_CourseTranscript_Button_Text);
    tileAction.click(function()
    {
        courseController.showCourseTranscript(0);
        return false
    });
    return tileAction
}
function GlossaryTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_Glossary_Button_Text);
    tileAction.click(function()
    {
        courseController.showGlossaryDialog();
        return false
    });
    return tileAction
}
function HelpTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.Welcome_GetHelp_Text);
    tileAction.click(function()
    {
        courseController.showHelpDialog();
        return false
    });
    return tileAction
}
function ProgressTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction);
    var footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer);
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    if (courseController.course.scormState.isComplete)
    {
        var nPercent = 100
    }
    else
    {
        var nTotal = 0;
        var nComplete = 0;
        courseController.course.recursePageTreeFn(function(page, nCurrentLevel)
        {
            if (page.contribute == 'r' && !page.pageState.isOptional && !page.isModule)
            {
                nTotal++;
                if (page.isComplete())
                {
                    nComplete++
                }
            }
        });
        var nPercent = Math.round(100 * nComplete / nTotal)
    }
    title.html(views.utils.localizeNumbers(nPercent) + '%');
    subtitle.text(Resources.Contents_Module_Complete_Text);
    var nextPage = courseController.course.getNextRequiredPage();
    if (nextPage)
    {
        button.append($('<span/>').html(Resources.NavigationBar_WhatsNext_Text.replace("%%pageName%%", "<br/>" + nextPage.name)));
        tileAction.attr('title', Resources.NavigationBar_WhatsNext_Text.replace("%%pageName%%", nextPage.name))
    }
    footerContent.html('<span>' + Resources.Contents_MyProgress_Text + '</span>');
    tileAction.click(function()
    {
        courseController.navigateToNextPage();
        return false
    });
    tileAction.adjustLayout = function()
    {
        button.children('span').css('max-width', button.position().left - footerContent.children('span').position().left - footerContent.children('span').outerWidth() + 'px')
    };
    return tileAction
}
function ResourcesTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.AppBar_Resources_Button_Text);
    tileAction.click(function()
    {
        courseController.showResourcesDialog();
        return false
    });
    return tileAction
}
function TestOutTileView(courseController, iconSource)
{
    var tileAction = $('<a/>', {
            'class': 'action', href: '#'
        });
    var title = $('<div />', {'class': 'tile_title'}).appendTo(tileAction),
        subtitle = $('<div />', {'class': 'tile_subtitle'}).appendTo(tileAction),
        footer = $('<div />', {'class': 'tile_footer'}).appendTo(tileAction),
        footerContent = $('<div />', {'class': 'tile_footer_content'}).appendTo(footer),
        button = $('<div />', {'class': 'tileActionButton'}).appendTo(tileAction);
    title.text(Resources.Testout_AppBar_Button_Text);
    footerContent.text(Resources.Contents_MyProgress_Text);
    tileAction.click(function()
    {
        courseController.navigateToTestOut();
        return false
    });
    return tileAction
}
function AssessmentController(assessmentView, audioController)
{
    var assessment = null;
    var ac = audioController;
    assessmentView.Observer.observe("nextLocationClicked", function()
    {
        assessmentView.removeUneededViews(assessment);
        if (assessment.Location === AssessmentLocation.Question && assessment.FeedbackType === "Immediate")
        {
            var question = assessment.getCurrentQuestion();
            if (question.Answer == "" && !question.Scored)
                courseController.course.observer.fire("notifyCheckAnswerFail", null);
            else if (!question.Scored)
                courseController.course.observer.fire("notifyScoreQuestionRequired", null);
            else if (!question.isBlocked())
                courseController.course.observer.fire("notifyRetryQuestionRequired", null);
            else
            {
                assessment.setNextLocation()
            }
        }
        else
        {
            assessment.setNextLocation()
        }
        checkTimer()
    });
    assessmentView.Observer.observe("previousLocationClicked", function()
    {
        assessment.setPreviousLocation()
    });
    assessmentView.Observer.observe("introLocationClicked", function()
    {
        assessment.setIntroLocation()
    });
    assessmentView.Observer.observe("reviewLocationClicked", function()
    {
        assessment.setReviewLocation();
        checkTimer()
    });
    assessmentView.Observer.observe("questionsLocationClicked", function()
    {
        assessment.setLocation(1);
        checkTimer()
    });
    assessmentView.Observer.observe("checkAnswerClicked", function()
    {
        assessment.checkAnswer()
    });
    assessmentView.Observer.observe("retryQuestionClicked", function()
    {
        assessment.retryQuestion()
    });
    assessmentView.Observer.observe("passAssessmentClicked", function()
    {
        assessment.pass();
        showCurrentLocation()
    });
    assessmentView.Observer.observe("failAssessmentClicked", function()
    {
        assessment.fail();
        showCurrentLocation()
    });
    assessmentView.Observer.observe("resultsTileClicked", function()
    {
        if (assessment.Status == AssessmentStatus.Failed)
        {
            if (assessment.hasAttemptsLeft())
            {
                var nextAttemptDate = assessment.nextAttemptDate();
                if (nextAttemptDate)
                {
                    courseController.course.observer.fire("nextAttemptWaitWarning", nextAttemptDate);
                    return
                }
                assessment.Attempts++;
                assessment.init();
                assessment.resetScormData();
                assessment.setLocation(1);
                initTimer();
                showCurrentLocation()
            }
        }
        else
        {
            if (assessment.FeedbackType == "Delayed" && assessment.answeredAllQuestions())
            {
                assessment.scoreAllQuestions();
                assessmentView.refreshResults(assessment)
            }
            else
            {
                for (var i = 0; i < assessment.QuestionsPresented.length; i++)
                {
                    if (!assessment.QuestionsPresented[i].isAnswered())
                    {
                        assessment.setLocation(assessment.QuestionsPresented[i].LocationIndex);
                        break
                    }
                }
            }
        }
    });
    assessmentView.Observer.observe("resultsReportClicked", function()
    {
        assessmentView.showReport(assessment)
    });
    assessmentView.Observer.observe("resultsQuestionClicked", function(qIndex)
    {
        var question = assessment.QuestionsPresented[qIndex];
        if (question)
            assessment.setLocation(question.LocationIndex)
    });
    var showCurrentLocation = function()
        {
            assessmentView.showAssessment(assessment, ac);
            assessmentView.Observer.fire("locationChanged", assessment)
        };
    var initTimer = function()
        {
            if (assessment.TimeLimit == 0)
            {
                assessmentView.hideTimer()
            }
            else
            {
                assessmentView.showTimer();
                assessmentView.showRemainingTime(assessment.TimeRemaining);
                if (!assessment.isCompleted() && assessment.Location != AssessmentLocation.Intro)
                {
                    assessment.startTimer(assessmentView, assessment, assessment.TimeLimit)
                }
                else
                {
                    if (assessment.isCompleted())
                    {
                        assessmentView.showRemainingTime(0)
                    }
                    else
                    {
                        assessmentView.showRemainingTime(assessment.TimeLimit)
                    }
                }
            }
        };
    var checkTimer = function()
        {
            if (assessment.TimeLimit != 0 && !assessment.isCompleted() && assessment.IntervalTimer == null)
                assessment.startTimer(assessmentView, assessment, assessment.TimeLimit)
        };
    return {
            readyToPlay: function(a)
            {
                assessment = a;
                assessment.Observer.unobserve("locationChanged", showCurrentLocation);
                assessment.Observer.observe("locationChanged", showCurrentLocation);
                initTimer();
                showCurrentLocation();
                if (assessment.Status == AssessmentStatus.NotAttempted)
                    assessment.Status = AssessmentStatus.Incomplete
            }, unload: function()
                {
                    if (assessment)
                    {
                        if (assessment.IntervalTimer)
                        {
                            clearTimeout(assessment.IntervalTimer);
                            assessment.IntervalTimer = null;
                            assessment.TimeRemaining = 0
                        }
                        assessment.unload()
                    }
                }, hide: function()
                {
                    assessmentView.hideAssessment()
                }, isVisible: function()
                {
                    return assessmentView.isVisible()
                }, navigateNext: function()
                {
                    assessmentView.Observer.fire("nextLocationClicked")
                }, navigatePrevious: function()
                {
                    assessmentView.Observer.fire("previousLocationClicked")
                }
        }
}
function AudioController(courseController, id)
{
    this.page = null;
    this.audioFile = null;
    this.captionsFile = "";
    this.hasCaptions = false;
    this.courseController = courseController;
    this.volume = 50;
    this.volumePrevious = 50;
    this.audioPosition = 0;
    this.maxAudioPosition = 0;
    this.slider = null;
    this.IsPlaying = false;
    this.IsMuted = false;
    this.captionArray = [];
    this.observer = null;
    this.speedSelector = null;
    this.transcriptSelector = null;
    this.transcriptView = null;
    this.hidden = true;
    var ac = this;
    ac.id = id;
    var cc = courseController;
    this.getCurrentPage = function()
    {
        if (this.page == null)
        {
            return cc.course.getCurrentPage()
        }
        return this.page
    };
    this.readyToPlay = function(file, volume, observer, data)
    {
        var audio = ac.getCurrentPage().getAudio(file);
        if (audio instanceof MediaFile && audio instanceof Object)
        {
            ac.audioFile = audio
        }
        else
        {
            var mediaFolder = cc.course.getMediaFolderPath();
            ac.audioFile = new MediaFile(cc.course, null);
            if (file.indexOf(mediaFolder) > -1)
            {
                mediaFolder = ""
            }
            if (typeof file === "string")
                ac.audioFile.FilePath = mediaFolder + file;
            if (file instanceof MediaFile)
                ac.audioFile.FilePath = mediaFolder + file.FileName
        }
        this.volume = volume;
        this.observer = observer;
        var currPage = this.getCurrentPage();
        this.captionsFile = currPage != null ? currPage.getAudioCaptionsPath(ac.audioFile.getFilePath()) : "";
        $.ajax({
            type: "GET", url: ac.captionsFile, dataType: "XML", error: function()
                {
                    ac.hasCaptions = false;
                    ac.captionArray = [];
                    ac.startPlayback(observer, data)
                }, success: function(xml)
                {
                    var ttElem = $(xml).find("tt");
                    var bodyElem = $(ttElem).find("body");
                    var divElem = $(bodyElem).find("div");
                    ac.captionArray = [];
                    $(divElem).children('p').each(function()
                    {
                        var xmlP = $(this);
                        var newCaption = new Caption;
                        newCaption.timeStart = ac.charTimeToSeconds(xmlP.attr("begin"));
                        newCaption.timeEnd = ac.charTimeToSeconds(xmlP.attr("end"));
                        try
                        {
                            var s = $("<div>").append(xmlP.clone()).remove().html();
                            newCaption.text = s.substring(s.indexOf(">") + 1, s.lastIndexOf("</"))
                        }
                        catch(e)
                        {
                            newCaption.text = xmlP.text()
                        }
                        ac.captionArray.push(newCaption)
                    });
                    ac.hasCaptions = ac.captionArray.length > 0;
                    ac.startPlayback(observer, data)
                }
        })
    };
    this.charTimeToSeconds = function(charTime)
    {
        var aParts = charTime.split(":");
        var value = (aParts[0] * 60 * 60) + (aParts[1] * 60) + (aParts[2] - 0);
        if (aParts.length > 3)
            value = value + (aParts[3] / 100);
        return value
    };
    this.hideAndStop = function()
    {
        var acViewSelector = $("#" + ac.id);
        var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
        var audioElement = audioSelector.get(0);
        try
        {
            audioElement.pause()
        }
        catch(e) {}
        ;
        ac.IsPlaying = false;
        acViewSelector.find("#" + ac.id + "Captions").html("");
        var playPauseSelector = acViewSelector.find("#" + ac.id + "PlayPauseButton");
        playPauseSelector.off("click");
        if (ac.speedSelector)
            ac.speedSelector.off("click");
        if (ac.transcriptSelector)
            ac.transcriptSelector.off("click");
        acViewSelector.css("display", "none");
        ac.hidden = true;
        acViewSelector.attr('aria-hidden', true);
        if (this.observer)
        {
            this.observer.fire("audioStopped")
        }
    };
    this.stop = function()
    {
        var acViewSelector = $("#" + ac.id);
        if (acViewSelector && ac.IsPlaying)
        {
            var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
            var audioElement = audioSelector.get(0);
            try
            {
                audioElement.pause()
            }
            catch(e) {}
            ;
            ac.IsPlaying = false;
            var playPauseSelector = acViewSelector.find("#" + ac.id + "PlayPauseButton");
            playPauseSelector.addClass("AudioPlayerShowPlay").removeClass("AudioPlayerShowPause");
            playPauseSelector.attr("title", Resources.MediaControls_Play_Menu_Text);
            if (this.observer)
            {
                this.observer.fire("audioStopped")
            }
            cc.screenReaderAlert("Audio player stopped.")
        }
    };
    this.play = function()
    {
        var acViewSelector = $("#" + ac.id);
        if (acViewSelector && !ac.IsPlaying)
        {
            var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
            var audioElement = audioSelector.get(0);
            audioElement.play();
            ac.IsPlaying = true;
            audioElement.playbackRate = cc.course.settings.MediaPlaybackRate;
            var playPauseSelector = acViewSelector.find("#" + ac.id + "PlayPauseButton");
            playPauseSelector.addClass("AudioPlayerShowPause").removeClass("AudioPlayerShowPlay");
            playPauseSelector.attr("title", Resources.MediaControls_Pause_Menu_Text);
            if (this.courseController.activeVideoController)
                delete this.courseController.activeVideoController;
            if (this.observer)
            {
                this.observer.fire("audioStarted")
            }
        }
    };
    this.togglePlay = function()
    {
        if (ac.audioFile)
        {
            if (ac.IsPlaying)
            {
                ac.stop()
            }
            else
            {
                ac.play()
            }
        }
    };
    this.toggleMute = function()
    {
        if (ac.audioFile)
        {
            var acViewSelector = $("#" + ac.id);
            var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
            if (ac.IsMuted)
            {
                audioSelector.prop("muted", "");
                ac.IsMuted = false;
                $(".AudioPlayerVolumeButton", acViewSelector).toggleClass("Muted");
                cc.screenReaderAlert("Audio volume " + ac.volume + " percent.")
            }
            else
            {
                audioSelector.prop("muted", "muted");
                ac.IsMuted = true;
                $(".AudioPlayerVolumeButton", acViewSelector).toggleClass("Muted");
                cc.screenReaderAlert("Audio volume muted.")
            }
        }
    };
    this.volumeChanged = function(newVolume)
    {
        ac.volume = newVolume;
        if (ac.audioFile)
        {
            var acViewSelector = $("#" + ac.id);
            var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
            var audioElement = audioSelector.get(0);
            audioElement.volume = newVolume / 100;
            ac.volumeSliderSelector.slider("option", "value", newVolume);
            console.log(ac.volume + "volume changed.");
            ac.courseController.volumeChanged(newVolume);
            cc.screenReaderAlert("Audio volume changed to " + newVolume + " percent")
        }
    };
    this.showPopupSpeedList = function()
    {
        $(this).addClass('expanded');
        $(this).children('a').addClass('speedSelected');
        $(this).attr("aria-pressed", "true");
        $(this).children('ul').attr("aria-hidden", "false");
        $(this).children('ul').show()
    };
    this.hidePopupSpeedList = function()
    {
        $(this).removeClass('expanded');
        $(this).children('a').removeClass('speedSelected');
        $(this).attr("aria-pressed", "false");
        $(this).children('ul').attr("aria-hidden", "true");
        $(this).children('ul').hide()
    };
    this.toggleTranscript = function()
    {
        var transcriptFile = ac.audioFile.UseTranscript ? ac.getCurrentPage().getAudioTranscriptPath(ac.audioFile.getFilePath()) : ac.captionsFile;
        this.transcriptView && this.transcriptView.show(transcriptFile, ac.audioFile.UseTranscript);
        cc.selectTranscriptTab()
    };
    this.showVolumeSlider = function()
    {
        ac.volumeSliderContainerSelector.show();
        ac.volumeSliderSelector.find(".ui-slider-handle").attr("role", "slider");
        ac.volumeSliderSelector.find(".ui-slider-handle").focus();
        ac.volumeSelector.attr("aria-pressed", "false")
    };
    this.setCurrentTime = function(seconds, skipPlayhead)
    {
        var acViewSelector = $("#" + ac.id);
        var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
        var audioElement = audioSelector.get(0);
        if (ac.audioFile.audioPreventSkipAhead && seconds > 0)
        {
            if (audioElement.currentTime + seconds > ac.maxAudioPosition)
            {
                seconds = ac.maxAudioPosition - audioElement.currentTime
            }
        }
        audioElement.currentTime = skipPlayhead ? seconds : audioElement.currentTime + seconds;
        progressSliderSelector = acViewSelector.find("#" + ac.id + "ProgressSlider");
        progressSliderSelector.slider("option", "value", audioElement.currentTime)
    };
    this.startPlayback = function(observer, data)
    {
        var acViewSelector = $("#" + ac.id);
        acViewSelector.css("display", "block");
        ac.hidden = false;
        acViewSelector.attr('aria-hidden', false);
        var playPauseSelector = acViewSelector.find("#" + ac.id + "PlayPauseButton");
        playPauseSelector.removeClass("AudioPlayerShowPause");
        playPauseSelector.removeClass("AudioPlayerShowPlay");
        var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
        audioSelector.attr("src", ac.audioFile.getFilePath());
        var audioCaptions = acViewSelector.find("#" + ac.id + "Captions");
        if (cc.course.settings.ShowCaptions && ac.hasCaptions)
        {
            audioCaptions.css("display", "block");
            audioCaptions.html("")
        }
        else
        {
            audioCaptions.css("display", "none")
        }
        var audioElement = audioSelector.get(0);
        audioElement.play();
        if (audioElement.paused)
        {
            ac.IsPlaying = false;
            playPauseSelector.addClass("AudioPlayerShowPlay").removeClass("AudioPlayerShowPause");
            playPauseSelector.attr("title", Resources.MediaControls_Play_Menu_Text)
        }
        else
        {
            ac.IsPlaying = true;
            playPauseSelector.addClass("AudioPlayerShowPause");
            playPauseSelector.attr("title", Resources.MediaControls_Pause_Menu_Text)
        }
        audioSelector.prop("defaultPlaybackRate", cc.course.settings.MediaPlaybackRate);
        ac.audioPosition = ac.maxAudioPosition = 0;
        if (ac.observer)
        {
            ac.observer.fire("audioLoaded")
        }
        audioElement.volume = ac.volume / 100;
        ac.volumePrevious = ac.volume;
        ac.volumeSelector = acViewSelector.find("#" + ac.id + "VolumeButton");
        ac.volumeSelector.attr("title", Resources.AudioPlayer_VolumeButton_Text);
        ac.volumeSliderSelector = acViewSelector.find("#" + ac.id + "VolumeSlider");
        ac.volumeSliderContainerSelector = acViewSelector.find("#" + ac.id + "VolumeSliderContainer");
        ac.volumeSelector.off('click');
        ac.volumeSelector.on('click', function()
        {
            ac.volumeSelector.attr("aria-pressed", "true");
            ac.showVolumeSlider()
        });
        ac.volumeSelector.off('mouseenter');
        ac.volumeSelector.on('mouseenter', function()
        {
            ac.showVolumeSlider()
        });
        ac.volumeSliderContainerSelector.off('mouseleave');
        ac.volumeSliderContainerSelector.on('mouseleave', function()
        {
            ac.volumeSliderContainerSelector.hide()
        });
        ac.volumeSliderSelector.off('focusout');
        ac.volumeSliderSelector.on('focusout', function()
        {
            ac.volumeSliderContainerSelector.hide()
        });
        ac.volumeSliderSelector.off('keyup');
        ac.volumeSliderSelector.on('keyup', function(e)
        {
            console.log(e.keyCode + " was pressed");
            if (e.keyCode == 27)
            {
                ac.volumeSliderContainerSelector.hide();
                ac.volumeSelector.focus()
            }
        });
        ac.volumeSliderSelector.slider({
            orientation: "vertical", range: "min", min: 0, max: 100, value: ac.volume, slide: function(event, ui)
                {
                    ac.volume = ui.value;
                    audioElement.volume = ac.volume / 100;
                    ac.volumeSliderSelector.find(".ui-slider-handle").attr("aria-valuenow", ac.volume);
                    ac.volumeSliderSelector.find(".ui-slider-handle").attr("aria-valuetext", ac.volume + "")
                }
        });
        ac.volumeSliderSelector.find(".ui-slider-handle").attr("aria-label", Resources.AudioPlayer_VolumeSlider_Text);
        ac.volumeSliderSelector.find(".ui-slider-handle").attr("aria-valuenow", ac.volume);
        ac.volumeSliderSelector.find(".ui-slider-handle").attr("aria-valuetext", ac.volume + "");
        ac.volumeSliderSelector.find(".ui-slider-handle").attr("aria-live", "polite");
        playPauseSelector.off("click", ac.togglePlay);
        playPauseSelector.on("click", ac.togglePlay);
        $('#' + ac.id + 'AudioNormalSpeed').html(Resources.VideoPlayer_VideoSpeedNormal_Text);
        $('.audioSpeed').removeClass('expanded');
        $('.audioSpeed > ul a').each(function()
        {
            (parseFloat($(this).attr('value')) == cc.course.settings.MediaPlaybackRate) && $(this).addClass('accent2_text')
        });
        ac.speedMenu = $('.audioSpeed > ul');
        ac.speedMenu.off('mouseleave');
        ac.speedMenu.on('mouseleave', function()
        {
            ac.hidePopupSpeedList.call(this.parentElement)
        });
        ac.speedMenu.off('focusout');
        ac.speedMenu.on('focusout', function(e)
        {
            if (!$(e.relatedTarget).hasClass("audioSpeedItem"))
            {
                ac.hidePopupSpeedList.call(this.parentElement)
            }
        });
        ac.speedSelector = acViewSelector.find("#" + ac.id + "AudioSpeedButton");
        ac.speedSelector.off('click');
        ac.speedSelector.on('click', function()
        {
            if ($(this).parent().hasClass('expanded'))
            {
                ac.hidePopupSpeedList.call(this.parentElement)
            }
            else
            {
                var itemForFocus = null;
                $('.audioSpeed > ul a').each(function()
                {
                    if (parseFloat($(this).attr('value')) == cc.course.settings.MediaPlaybackRate)
                    {
                        itemForFocus = $(this);
                        $(this).addClass('accent2_text')
                    }
                    else
                    {
                        $(this).removeClass('accent2_text')
                    }
                });
                ac.showPopupSpeedList.call(this.parentElement);
                if (itemForFocus)
                {
                    itemForFocus.focus()
                }
            }
        });
        ac.speedMenu.off('keyup');
        ac.speedMenu.on('keyup', function(e)
        {
            var selection = $('.audioSpeed > ul a.accent2_text');
            var val = selection.attr("value");
            var keyCode = e.keyCode || e.which;
            if (keyCode == 38)
            {
                selection.removeClass("accent2_text");
                switch (val)
                {
                    case"1.5":
                        selection = $(".audioSpeed > ul a[value='2']");
                        break;
                    case"1":
                        selection = $(".audioSpeed > ul a[value='1.5']");
                        break;
                    case"0.75":
                        selection = $(".audioSpeed > ul a[value='1']");
                        break;
                    case"0.5":
                        selection = $(".audioSpeed > ul a[value='0.75']");
                        break
                }
                selection.addClass("accent2_text");
                selection.focus();
                return false
            }
            else if (keyCode == 40)
            {
                selection.removeClass("accent2_text");
                switch (val)
                {
                    case"2":
                        selection = $(".audioSpeed > ul a[value='1.5']");
                        break;
                    case"1.5":
                        selection = $(".audioSpeed > ul a[value='1']");
                        break;
                    case"1":
                        selection = $(".audioSpeed > ul a[value='0.75']");
                        break;
                    case"0.75":
                        selection = $(".audioSpeed > ul a[value='0.5']");
                        break
                }
                selection.addClass("accent2_text");
                selection.focus();
                return false
            }
            else if (keyCode == 27)
            {
                ac.hidePopupSpeedList.call(this.parentElement);
                ac.speedSelector.focus();
                return false
            }
        });
        $('.audioSpeed > ul a').off('click');
        $('.audioSpeed > ul a').on('click', function()
        {
            cc.course.settings.MediaPlaybackRate = parseFloat($(this).attr('value'));
            var audioSelector = acViewSelector.find("#" + ac.id + "Audio");
            audioSelector.prop("playbackRate", cc.course.settings.MediaPlaybackRate);
            ac.hidePopupSpeedList.call(ac.speedMenu.parentElement);
            ac.speedSelector.focus();
            var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.experienced);
            stmt.object = new ADL.XAPIStatement.Activity("course:" + cc.course.buildId + ";page:" + ac.getCurrentPage().id + ";", "media");
            stmt.object.definition.type = "http://adlnet.gov/expapi/activities/media";
            stmt.result = {
                audioPlayerId: ac.id, audioPlaybackRate: cc.course.settings.MediaPlaybackRate
            };
            ADL.XAPIWrapper.postMessage(stmt)
        });
        ac.transcriptSelector = acViewSelector.find("#" + ac.id + "TranscriptButton");
        ac.transcriptSelector.off("click", ac.toggleTranscript);
        ac.transcriptSelector.on("click", ac.toggleTranscript);
        ac.transcriptSelector.off("keyup");
        ac.transcriptSelector.on("keyup", function(e)
        {
            if (e.keyCode == 32 || e.keyCode == 27)
            {
                ac.toggleTranscript
            }
        });
        if (ac.hasCaptions || ac.audioFile.UseTranscript)
        {
            ac.transcriptSelector.show();
            ac.transcriptSelector.attr("title", Resources.AudioPlayer_TranscriptShow_Text);
            var transcriptFile = ac.audioFile.UseTranscript ? ac.getCurrentPage().getAudioTranscriptPath(ac.audioFile.getFilePath()) : ac.captionsFile;
            this.transcriptView && this.transcriptView.show(transcriptFile, ac.audioFile.UseTranscript)
        }
        else
        {
            ac.transcriptSelector.hide();
            this.transcriptView && this.transcriptView.show("")
        }
        var audioLocationSelector = acViewSelector.find("#" + ac.id + "Location");
        var bCreatedSlider = false;
        var progressSliderSelector = null;
        $(audioElement).off("ended");
        $(audioElement).on('ended', function()
        {
            playPauseSelector.addClass("AudioPlayerShowPlay").removeClass("AudioPlayerShowPause");
            playPauseSelector.attr("title", Resources.MediaControls_Play_Menu_Text);
            ac.IsPlaying = false;
            progressSliderSelector = acViewSelector.find("#" + ac.id + "ProgressSlider");
            progressSliderSelector.slider("option", "value", "0");
            if (ac.observer)
            {
                ac.observer.fire("audioEnded", ac.audioFile, data)
            }
            else
            {
                if (ac.audioFile && ac.audioFile.mustPlayAll)
                {
                    ac.getCurrentPage().setComplete()
                }
                if (ac.audioFile.audioAutoNavigate)
                {
                    if (this.page == null || ac.getCurrentPage() === this.page)
                        cc.navigateToNextPage()
                }
            }
        });
        $(audioElement).off("timeupdate");
        $(audioElement).on('timeupdate', function()
        {
            var length = audioElement.duration;
            if (isNaN(length))
            {
                return
            }
            var secs = audioElement.currentTime;
            if (secs > ac.maxAudioPosition)
                ac.maxAudioPosition = secs;
            for (var i = 0; i < ac.captionArray.length; i++)
            {
                if (secs >= ac.captionArray[i].timeStart && secs <= ac.captionArray[i].timeEnd)
                {
                    if (!ac.captionArray[i].isDisplayed)
                    {
                        ac.captionArray[i].isDisplayed = true;
                        audioCaptions.html(ac.captionArray[i].text)
                    }
                }
                else
                {
                    if (ac.captionArray[i].isDisplayed)
                    {
                        audioCaptions.html("");
                        ac.captionArray[i].isDisplayed = false
                    }
                }
            }
            if (!bCreatedSlider)
            {
                progressSliderSelector = acViewSelector.find("#" + ac.id + "ProgressSlider");
                progressSliderSelector.slider({
                    min: 0, max: Math.round(length), value: 0, slide: function(event, ui)
                        {
                            if (ac && ac.audioFile.audioPreventSkipAhead)
                            {
                                if (ui.value >= ac.maxAudioPosition)
                                    return false
                            }
                            audioElement.currentTime = ui.value
                        }
                });
                $(".AudioPlayerProgressSlider > .ui-slider-handle").attr("title", Resources.AudioPlayer_ProgressBar_Title);
                $(".AudioPlayerProgressSlider > .ui-slider-handle").attr("role", "slider");
                bCreatedSlider = true
            }
            else
            {
                progressSliderSelector.slider("option", "value", Math.round(secs) + "")
            }
            audioLocationSelector.html(views.utils.getMediaTimeDisplayFormat(secs, length));
            $(".AudioPlayerProgressSlider > .ui-slider-handle").attr("aria-valuemax", Math.round(length));
            $(".AudioPlayerProgressSlider > .ui-slider-handle").attr("aria-valuenow", Math.round(secs));
            $(".AudioPlayerProgressSlider > .ui-slider-handle").attr("aria-valuetext", Math.round(secs))
        })
    }
}
function BranchingController(branchingView, audioController)
{
    var branchingGraph = null;
    var ac = audioController;
    branchingView.Observer.observe("nextLocationClicked", function()
    {
        if (branchingGraph.canMoveForward())
        {
            branchingGraph.moveForward();
            branchingView.updateNavButtons(branchingGraph)
        }
        else
        {
            var currentLocation = branchingGraph.getCurrentLocation();
            if (currentLocation)
            {
                switch (currentLocation.location)
                {
                    case BranchingPointLocation.Content:
                        if (!currentLocation.contentViewed)
                            courseController.course.observer.fire("notifyBranchingContentNotViewed", null);
                        else if (currentLocation.mustCompleteContent && !currentLocation.contentCompleted)
                            courseController.course.observer.fire("notifyBranchingContentIncomplete", null);
                        break;
                    case BranchingPointLocation.Question:
                        if (!currentLocation.currentAnswer)
                            courseController.course.observer.fire("notifyBranchingQuestionNotAnswered", null);
                        else if (currentLocation.mustPass && !currentLocation.isCorrect())
                            courseController.course.observer.fire("notifyBranchingQuestionMustRetry", null);
                        break;
                    default:
                        if (currentLocation.currentAttemptHasFeedbackContent())
                        {
                            if (!currentLocation.currentAttempt.contentViewed)
                                courseController.course.observer.fire("notifyBranchingFeedbackContentNotViewed", null);
                            else if (currentLocation.mustCompleteFeedback && !currentLocation.currentAttempt.contentComplete)
                                courseController.course.observer.fire("notifyBranchingFeedbackContentIncomplete", null);
                            else if (currentLocation.mustPass && !currentLocation.isCorrect())
                                courseController.course.observer.fire("notifyBranchingQuestionMustRetry", null)
                        }
                        else if (currentLocation.mustPass && !currentLocation.isCorrect())
                            courseController.course.observer.fire("notifyBranchingQuestionMustRetry", null)
                }
            }
        }
    });
    branchingView.Observer.observe("previousLocationClicked", function()
    {
        branchingGraph.moveBackward();
        branchingView.updateNavButtons(branchingGraph)
    });
    branchingView.Observer.observe("restartClicked", function()
    {
        branchingGraph.restart()
    });
    branchingView.Observer.observe("retryQuestionClicked", function()
    {
        branchingGraph.retryQuestion();
        branchingView.updateNavButtons(branchingGraph);
        branchingView.Observer.fire("stateChanged", branchingGraph)
    });
    branchingView.Observer.observe("showFeedbackContentClicked", function()
    {
        branchingGraph.selectFeedbackPage()
    });
    branchingView.Observer.observe("alternateFeedbackContentClicked", function(id)
    {
        branchingGraph.selectFeedbackPage(id)
    });
    branchingView.Observer.observe("closeFeedbackContentClicked", function()
    {
        branchingGraph.clearSelectedFeedbackPage()
    });
    branchingView.Observer.observe("mediaEnded", function(videoFile)
    {
        if (videoFile.mustPlayAll && typeof this.setComplete === "function")
            this.setComplete();
        var currentLocation = branchingGraph.getCurrentLocation();
        if (currentLocation && (currentLocation.location === BranchingPointLocation.Content || currentLocation.location === BranchingPointLocation.FeedbackContent) && currentLocation.canMoveForward())
        {
            branchingGraph.moveForward();
            branchingView.updateNavButtons(branchingGraph)
        }
        else if (currentLocation && currentLocation.location === BranchingPointLocation.Feedback || currentLocation.location === BranchingPointLocation.FeedbackAlternatives)
        {
            branchingGraph.clearSelectedFeedbackPage()
        }
    });
    var showCurrentLocation = function()
        {
            branchingView.showBranchingGraph(branchingGraph, ac);
            branchingView.Observer.fire("locationChanged", branchingGraph);
            var currentLocation = branchingGraph.getCurrentLocation();
            ac.page = course.getPageById(currentLocation.contentPageId)
        };
    var displaySelectedFeedbackPage = function()
        {
            if (branchingGraph.hasSelectedFeedbackPage())
                branchingView.showFeedbackContent(branchingGraph);
            else
                branchingView.hideFeedbackContent()
        };
    var updateViewState = function()
        {
            branchingView.updateViewState(branchingGraph)
        };
    return {
            readyToPlay: function(branchingGraphModel)
            {
                branchingGraph = branchingGraphModel;
                branchingGraph.observer.unobserve("locationChanged", showCurrentLocation);
                branchingGraph.observer.unobserve("selectedFeedbackPageChanged", displaySelectedFeedbackPage);
                branchingGraph.observer.unobserve("branchingPathCompleted", updateViewState);
                branchingGraph.initialized || branchingGraph.loadScormData();
                branchingGraph.initialized || branchingGraph.restart();
                branchingGraph.observer.observe("locationChanged", showCurrentLocation);
                branchingGraph.observer.observe("selectedFeedbackPageChanged", displaySelectedFeedbackPage);
                branchingGraph.observer.observe("branchingPathCompleted", updateViewState);
                branchingGraphModel.usePlayerNavigation ? branchingView.addClass('Branching-playerNavigation') : branchingView.removeClass("Branching-playerNavigation");
                showCurrentLocation();
                branchingView.updateNavButtons(branchingGraph)
            }, unload: function()
                {
                    if (branchingGraph)
                    {
                        branchingGraph.observer.unobserve("locationChanged", showCurrentLocation);
                        branchingGraph.observer.unobserve("selectedFeedbackPageChanged", displaySelectedFeedbackPage);
                        branchingGraph.observer.unobserve("branchingPathCompleted", updateViewState);
                        branchingGraph.unload();
                        branchingGraph = null
                    }
                }, hide: function(callback)
                {
                    branchingView.hideGraph(callback)
                }, isVisible: function()
                {
                    return branchingView.isVisible()
                }, navigateNext: function()
                {
                    branchingView.Observer.fire("nextLocationClicked")
                }, navigatePrevious: function()
                {
                    branchingView.Observer.fire("previousLocationClicked")
                }
        }
}
function CourseController(courseModel)
{
    this.nextPageIndex = 0;
    var bInTestOut = false;
    this.contentPopupView = null;
    return {
            navigateToPage: function(index)
            {
                courseModel.navigateToPage(index)
            }, navigateToPageById: function(id)
                {
                    courseModel.navigateToPageById(id)
                }, navigatePrevious: function()
                {
                    var currentPage = courseModel.getCurrentPage();
                    if (currentPage.Assessment && currentPage.Assessment.hasPreviousLocation())
                    {
                        var assessmentController = player.getContentView().getAssessmentController();
                        if (assessmentController)
                        {
                            assessmentController.navigatePrevious();
                            return
                        }
                    }
                    else if (currentPage.BranchingGraph && currentPage.BranchingGraph.usePlayerNavigation && currentPage.BranchingGraph.canMoveBackward())
                    {
                        var branchingController = player.getContentView().getBranchingController();
                        if (branchingController)
                        {
                            branchingController.navigatePrevious();
                            return
                        }
                    }
                    this.navigateToPreviousPage()
                }, navigateNext: function()
                {
                    var currentPage = courseModel.getCurrentPage();
                    if (currentPage.Assessment && currentPage.Assessment.hasNextLocation())
                    {
                        var assessmentController = player.getContentView().getAssessmentController();
                        if (assessmentController)
                        {
                            assessmentController.navigateNext();
                            return
                        }
                    }
                    else if (currentPage.BranchingGraph && currentPage.BranchingGraph.usePlayerNavigation)
                    {
                        var branchingController = player.getContentView().getBranchingController(),
                            currentLocation = currentPage.BranchingGraph.getCurrentLocation();
                        if (branchingController && currentLocation && (currentLocation.canMoveForward() || !currentLocation.interactionComplete()))
                        {
                            branchingController.navigateNext();
                            return
                        }
                    }
                    this.navigateToNextPage()
                }, navigateToNextPage: function()
                {
                    if (courseController.nextPageIndex > 0)
                    {
                        var target = courseController.nextPageIndex;
                        this.nextPageIndex = 0;
                        courseModel.navigateToPage(target)
                    }
                    else
                    {
                        courseModel.navigateToNextPage()
                    }
                }, navigateToPreviousPage: function()
                {
                    courseModel.navigateToPreviousPage()
                }, navigateToWelcomePage: function()
                {
                    courseModel.navigateToPage(0)
                }, navigateToTestOut: function()
                {
                    this.nextPageIndex = courseModel.currentPageIndex;
                    courseModel.testOutPage.navNext = courseModel.pageNavigation[courseModel.currentPageIndex];
                    var testOutModule = courseModel.testOutPage.moduleIndex;
                    if (courseModel.testOutPage.getModule().id == courseModel.testOutPage.id)
                    {
                        courseController.showContentPopup(courseModel.testOutPage, null)
                    }
                    else
                    {
                        courseModel.navigateToPageById('test-out')
                    }
                }, navigateToStartupPage: function()
                {
                    if (courseModel.scormState.bookmark && courseModel.scormState.bookmark != "-1")
                        this.navigateToPage(+courseModel.scormState.bookmark);
                    else
                        this.navigateToWelcomePage()
                }, hideHeader: function()
                {
                    $("#container").addClass("HideHeader")
                }, showHeader: function()
                {
                    $("#container").removeClass("HideHeader")
                }, hideFooter: function()
                {
                    $("#container").addClass("HideFooter")
                }, showFooter: function()
                {
                    $("#container").removeClass("HideFooter")
                }, showTracksDialog: function()
                {
                    TracksDialogView.getInstance().dialog('open')
                }, showContentsDialog: function()
                {
                    ContentsDialogView.getInstance().dialog('open')
                }, hideContentsDialog: function()
                {
                    ContentsDialogView.getInstance().dialog('close')
                }, showResourcesDialog: function()
                {
                    ResourcesDialogView.getInstance().dialog('open')
                }, showHelpDialog: function()
                {
                    HelpDialogView.getInstance().dialog('open')
                }, showLanguageDialog: function()
                {
                    LanguageDialogView.getInstance().dialog('open')
                }, showGlossaryDialog: function()
                {
                    GlossaryDialogView.getInstance().dialog('open')
                }, showContentPopup: function(page, callback, popupCssClass, hoverElement)
                {
                    this.contentPopupView = new ContentPopupView(this, hoverElement, popupCssClass);
                    this.contentPopupView.show(page, callback);
                    return this.contentPopupView
                }, closeContentPopup: function()
                {
                    if (this.contentPopupView)
                    {
                        this.contentPopupView.close();
                        this.contentPopupView = null
                    }
                }, showTranscriptView: function(captionsFile, isHtmTranscript)
                {
                    if (this.course.currentPopupPageId)
                        this.contentPopupView && this.contentPopupView.transcriptView.show(captionsFile, isHtmTranscript);
                    else
                        this.transcriptView && this.transcriptView.show(captionsFile, isHtmTranscript)
                }, selectTranscriptTab: function()
                {
                    if (this.course.currentPopupPageId)
                    {
                        if ($('#ContentPopupTranscriptContainer').is(":hidden"))
                        {
                            $('#ContentPopupTranscriptContainer').show();
                            this.course.settings.ShowTranscript = true
                        }
                        else
                        {
                            $('#ContentPopupTranscriptContainer').hide();
                            this.course.settings.ShowTranscript = false
                        }
                    }
                    else
                    {
                        if ($("#tabtranscript").attr('aria-selected') == "false")
                        {
                            $('#tabtranscript').trigger('click');
                            this.course.settings.ShowTranscript = true
                        }
                        else
                        {
                            $('#tabContents').trigger('click');
                            this.course.settings.ShowTranscript = false
                        }
                    }
                    if (this.course.settings.ShowTranscript)
                    {
                        this.screenReaderAlert("Transcript toggled on")
                    }
                    else
                    {
                        this.screenReaderAlert("Transcript toggled off")
                    }
                }, showCourseTranscript: function(location)
                {
                    var courseTranscript = "coursetranscript";
                    var url = "";
                    if (location == 1)
                        url = this.course.settings.CourseTranscript;
                    else
                    {
                        var path = window.location.href;
                        path = path.substring(0, path.lastIndexOf("/") + 1);
                        url = path + this.course.getContentFolderPath() + this.course.settings.CourseTranscript
                    }
                    open(url, courseTranscript);
                    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.experienced);
                    stmt.object = new ADL.XAPIStatement.Activity("course:" + this.course.buildId + ";dialog:" + courseTranscript + ";", "page");
                    stmt.object.definition.type = "http://activitystrea.ms/schema/1.0/page";
                    stmt.result = {
                        dialog: courseTranscript, url: url
                    };
                    ADL.XAPIWrapper.postMessage(stmt)
                }, showEvaluationDialog: function(parentWindow, bCoursCompletedByTestOut, formId, mustAnswerAll, occurredAt)
                {
                    if (!courseModel.settings.AttemptId)
                        return;
                    if (!formId)
                    {
                        formId = courseModel.settings.EvaluationForm;
                        mustAnswerAll = courseModel.settings.MustAnswerAllEvalQuestions;
                        occurredAt = 2
                    }
                    if (!formId)
                        return;
                    EvalDialogView.open(courseModel, formId, parentWindow, mustAnswerAll, occurredAt)
                }, volumeChanged: function(newVolume)
                {
                    courseModel.volume = newVolume
                }, initReceiveCredit: function(win)
                {
                    var s = "";
                    if (!course.scormState.isComplete && !course.getCurrentPage().isComplete())
                    {
                        for (var module = course.getCurrentPage(); module.parent != null; module = module.parent)
                            ;
                        var sIncompleteModules = "";
                        for (var i = 0; i < course.modules.length; i++)
                        {
                            if (!course.modules[i].pageState.isOptional && !course.modules[i].isComplete() && course.modules[i] != module)
                            {
                                if (sIncompleteModules != "")
                                {
                                    sIncompleteModules += ", "
                                }
                                sIncompleteModules += course.modules[i].name
                            }
                        }
                        var sIncompletePages = "";
                        if (sIncompleteModules == "")
                        {
                            course.recursePagesFn(module.pages, function(page, nCurrentLevel)
                            {
                                if (page.contribute == 'r' && !page.pageState.isOptional && !page.isComplete() && page != course.getCurrentPage())
                                {
                                    if (sIncompletePages != "")
                                    {
                                        sIncompletePages += ", "
                                    }
                                    sIncompletePages += page.name
                                }
                            }, 1)
                        }
                        if (sIncompleteModules == "" && sIncompletePages == "")
                        {
                            s += '<div class="receiveCreditComplete">' + Resources.RC_Complete_Text + '</div>';
                            s += '<input type="button" name="YES" value="' + Resources.RC_ReceiveCredit_Text + '" onclick="parent.player.courseController.markPageComplete();location.reload();">'
                        }
                        else
                        {
                            if (sIncompleteModules != "")
                            {
                                s += '<div class="receiveCreditIncomplete">' + Resources.RC_IncompleteModules_Text.replace(/%%modules/g, sIncompleteModules) + '</div>'
                            }
                            else
                            {
                                s += '<div class="receiveCreditIncomplete">' + Resources.RC_IncompletePages_Text.replace(/%%pages/g, sIncompletePages) + '</div>'
                            }
                        }
                    }
                    else
                    {
                        s += Resources.RC_CreditReceived_Text;
                        if (course.getCurrentPage().pageState.status == "")
                        {
                            this.markPageComplete()
                        }
                    }
                    win.document.getElementById('ReceiveCreditContent').innerHTML = s
                }, initOnePageCourseComplete: function(win)
                {
                    if (win == null)
                        win = window;
                    var module = course.getCurrentPage().getModule();
                    if (module.isComplete())
                    {
                        win.document.getElementById('courseIncompleteContent').style.display = "none";
                        win.document.getElementById('courseCompleteContent').style.display = "block"
                    }
                }, initConfirmModule: function(win)
                {
                    if (win == null)
                        win = window;
                    var module = course.getCurrentPage().getModule();
                    if (module.isComplete())
                    {
                        sPrompt = Resources.ModuleCompletedMessage_Text
                    }
                    else
                    {
                        sPrompt = Resources.ModuleCompletionPrompt_Text;
                        win.document.getElementById('buttonConfirm').style.display = "block"
                    }
                    win.document.getElementById('confirmPrompt').innerHTML = sPrompt
                }, confirmModuleComplete: function(win)
                {
                    win.document.getElementById('confirmPrompt').innerHTML = Resources.ModuleCompletedMessage_Text;
                    win.document.getElementById('buttonConfirm').style.display = "none";
                    this.markPageComplete()
                }, initUserVerification: function(win)
                {
                    var sXmlFile = win.location.href.substring(0, win.location.href.lastIndexOf('.')) + '.xml';
                    jQuery.ajax({
                        type: "GET", url: sXmlFile, dataType: "XML", success: function(xml)
                            {
                                var sName = course.scormState.getLearnerName();
                                if (sName.indexOf(',') > 0)
                                {
                                    var aParts = sName.split(',');
                                    if (aParts[1])
                                        aParts[1] = jQuery.trim(aParts[1]);
                                    sName = aParts[1] + " " + aParts[0]
                                }
                                var pageTypeElem = $(xml).find("pageType");
                                var pageInstructions = pageTypeElem.find("pageInstructions").text();
                                var legalText = pageTypeElem.find("legalText").text();
                                var electronicSignatureInstructions = pageTypeElem.find("electronicSignatureInstructions").text();
                                var buttonText = pageTypeElem.find("buttonText").text();
                                var incompleteCourseText = pageTypeElem.find("incompleteCourseText").text();
                                var successfulCompletionText = pageTypeElem.find("successfulCompletionText").text();
                                var signatureAccessibilityInfo = pageTypeElem.find("signatureAccessibilityInfo").text();
                                signatureAccessibilityInfo = signatureAccessibilityInfo.replace(/%%scormLearnerName%%/g, sName);
                                var module = course.getCurrentPage().getModule();
                                var allComplete = true;
                                for (var i = 0; i < course.modules.length; i++)
                                {
                                    if (course.modules[i] != module)
                                    {
                                        if (!course.modules[i].pageState.isOptional)
                                        {
                                            if (!course.modules[i].isComplete())
                                            {
                                                allComplete = false
                                            }
                                        }
                                    }
                                }
                                var s = "";
                                if (!allComplete)
                                {
                                    s += '<div class="UserVerifyInstructions">' + incompleteCourseText + '</div>'
                                }
                                else if (!course.getCurrentPage().isComplete())
                                {
                                    s += '<div class="UserVerifyInstructions">' + pageInstructions + '</div>';
                                    s += '<div class="UserVerifyLegalText">' + legalText + '</div>';
                                    s += '<div class="UserVerifyUsername">' + sName + '</div>';
                                    s += '<input class="UserVerifyTextbox" type="text" name="UserVerifyText" id="UserVerifyText" size="70" title="' + signatureAccessibilityInfo + '" />';
                                    s += '<div class="UserVerifySignatureInstructions">' + electronicSignatureInstructions + '</div>';
                                    s += '<input class="UserVerifyButton" type="button" name="UserVerifyButton" value="' + buttonText + '" onclick="parent.player.courseController.submitUserVerification(window)" />'
                                }
                                else
                                {
                                    s += '<div class="UserVerifyComplete">' + successfulCompletionText + '</div>'
                                }
                                win.document.getElementById('UserVerify').innerHTML = s
                            }, async: false
                    })
                }, submitUserVerification: function(win)
                {
                    var sNameEntered = win.document.getElementById("UserVerifyText").value;
                    var sName = course.scormState.getLearnerName();
                    if (sName.indexOf(',') > 0)
                    {
                        var aParts = sName.split(',');
                        if (aParts[1])
                            aParts[1] = jQuery.trim(aParts[1]);
                        sName = aParts[1] + " " + aParts[0]
                    }
                    if (sNameEntered == sName)
                    {
                        setInteraction(null, "attestation", "fill-in", sNameEntered, sNameEntered, "correct", null, null, null, null);
                        this.markPageComplete();
                        win.location.reload()
                    }
                    else
                    {
                        courseController.alert(win.document.getElementById("UserVerifyText").title)
                    }
                }, initScenarioBasedAssessment: function(win)
                {
                    var currentPage = course.getCurrentPage();
                    if (currentPage.privatePages.length == 0)
                    {
                        var sXmlFile = win.location.href.substring(0, win.location.href.lastIndexOf('.')) + '.xml';
                        jQuery.ajax({
                            type: "GET", url: sXmlFile, dataType: "XML", success: function(xml)
                                {
                                    var sbaElem = $(xml).find("sba");
                                    currentPage.sbaContributesCourseScore = sbaElem.attr("contributesCourseScore");
                                    currentPage.sbaAdaptiveBehavior = sbaElem.attr("adaptiveBehavior");
                                    currentPage.sbaRetryBehavior = sbaElem.attr("retryBehavior");
                                    currentPage.sbaSequenceOfScenarios = sbaElem.attr("sequenceOfScenarios");
                                    currentPage.sbaAttemptMaximum = sbaElem.attr("attemptMaximum") - 0;
                                    currentPage.sbaAttempts = 1;
                                    $(sbaElem).children('set').each(function()
                                    {
                                        var xmlSet = $(this);
                                        var newSetPage = new Page;
                                        newSetPage.name = xmlSet.attr("name");
                                        currentPage.privatePages.push(newSetPage);
                                        $(xmlSet).children('level1').each(function()
                                        {
                                            var xmlPage = $(this);
                                            var newPage = new Page;
                                            newSetPage.privatePages.push(newPage);
                                            CourseParser.parsePage(newPage, xmlPage, newSetPage, course);
                                            $(xmlPage).children('level2').each(function()
                                            {
                                                var xmlContent = $(this);
                                                var newContentPage = new Page;
                                                newPage.privatePages.push(newContentPage);
                                                CourseParser.parsePage(newContentPage, xmlContent, newPage, course)
                                            })
                                        })
                                    })
                                }, async: false
                        })
                    }
                    this.initSbaStatus(currentPage);
                    currentPage.sbaWin = win;
                    this.showSbaStatus()
                }, scoreScenarioBasedAssessment: function(win)
                {
                    var currentPage = course.getCurrentPage();
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        var selectedAssessment = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment;
                        selectedAssessment.scoreAllQuestions()
                    }
                    currentPage.sbaIsScored = true;
                    this.updateSbaStatus()
                }, retryScenarioBasedAssessment: function(win)
                {
                    var currentPage = course.getCurrentPage();
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        if (currentPage.privatePages[i].assessmentStatus != AssessmentStatus.Passed || currentPage.sbaRetryBehavior != "OnlyFailedAssessments")
                        {
                            currentPage.privatePages[i].assessmentSelected = Math.floor((Math.random() * currentPage.privatePages[i].privatePages.length));
                            var selectedAssessment = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment;
                            selectedAssessment.sbaMode = true;
                            selectedAssessment.sbaPageId = currentPage.id;
                            selectedAssessment.Attempts++;
                            selectedAssessment.init();
                            selectedAssessment.resetScormData();
                            currentPage.sbaIsScored = false
                        }
                    }
                    currentPage.sbaIsRetried = true;
                    this.updateSbaStatus(true)
                }, initSbaStatus: function(currentPage)
                {
                    var scormData = courseController.course.scormState.getState(currentPage.id);
                    var bStateRestored = false;
                    if (scormData != "")
                    {
                        var aSbaState = scormData.split(":");
                        var aSetState = aSbaState[0].split("-");
                        for (var i = 0; i < currentPage.privatePages.length; i++)
                        {
                            aParts = aSetState[i].split(",");
                            currentPage.privatePages[i].assessmentSelected = aParts[0] - 0;
                            currentPage.privatePages[i].sbaIsLocked = aParts[1] == "1"
                        }
                        currentPage.sbaIsScored = aSbaState[1] == "1";
                        currentPage.sbaIsRetried = aSbaState[2] == "1";
                        bStateRestored = true
                    }
                    var bAllPassed = true;
                    var nComplete = 0;
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        if (currentPage.privatePages[i].assessmentSelected == undefined)
                        {
                            currentPage.privatePages[i].assessmentSelected = Math.floor((Math.random() * currentPage.privatePages[i].privatePages.length))
                        }
                        if (currentPage.privatePages[i].sbaIsLocked == undefined)
                        {
                            currentPage.privatePages[i].sbaIsLocked = false
                        }
                        var selectedAssessment = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment;
                        selectedAssessment.sbaMode = true;
                        selectedAssessment.sbaPageId = currentPage.id;
                        if (!selectedAssessment.Initialized)
                        {
                            selectedAssessment.loadScormData();
                            if (!selectedAssessment.Initialized)
                                selectedAssessment.init()
                        }
                        if (selectedAssessment.Status != AssessmentStatus.Passed)
                            bAllPassed = false;
                        currentPage.privatePages[i].questionsUnanswered = selectedAssessment.countUnansweredQuestions();
                        if (currentPage.privatePages[i].questionsUnanswered == 0)
                            nComplete++;
                        if (currentPage.sbaSequenceOfScenarios == "Linear")
                        {
                            if (i > 0)
                            {
                                if (currentPage.privatePages[i - 1].questionsUnanswered > 0)
                                {
                                    currentPage.privatePages[i].sbaIsLocked = true
                                }
                            }
                        }
                        if (currentPage.privatePages[i].assessmentStatus == undefined)
                            currentPage.privatePages[i].assessmentStatus = selectedAssessment.Status
                    }
                    currentPage.sbaIsAllPassed = bAllPassed;
                    if (currentPage.sbaIsScored == undefined)
                        currentPage.sbaIsScored = false;
                    if (currentPage.sbaIsRetried == undefined)
                        currentPage.sbaIsRetried = false;
                    currentPage.sbaAllAnswered = (nComplete == currentPage.privatePages.length)
                }, updateSbaStatusClosed: function()
                {
                    $('#IntroViewIframe').attr('src', '');
                    courseController.updateSbaStatus(true)
                }, updateSbaStatus: function(skipCheckCompletion)
                {
                    var currentPage = course.getCurrentPage();
                    var bAllPassed = true;
                    var nComplete = 0;
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        var selectedAssessment = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment;
                        if (selectedAssessment.Status != AssessmentStatus.Passed)
                            bAllPassed = false;
                        currentPage.privatePages[i].questionsUnanswered = selectedAssessment.countUnansweredQuestions();
                        currentPage.privatePages[i].assessmentStatus = selectedAssessment.Status;
                        if (currentPage.sbaSequenceOfScenarios == "Linear")
                        {
                            if (i > 0)
                            {
                                if (currentPage.privatePages[i - 1].questionsUnanswered > 0)
                                {
                                    currentPage.privatePages[i].sbaIsLocked = true
                                }
                                else
                                {
                                    currentPage.privatePages[i].sbaIsLocked = false
                                }
                            }
                        }
                        if (currentPage.privatePages[i].questionsUnanswered == 0)
                            nComplete++
                    }
                    currentPage.sbaIsAllPassed = bAllPassed;
                    currentPage.sbaAllAnswered = (nComplete == currentPage.privatePages.length);
                    var scormData = "";
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        if (scormData != "")
                            scormData += "-";
                        scormData += currentPage.privatePages[i].assessmentSelected + ",";
                        scormData += (currentPage.privatePages[i].sbaIsLocked ? "1" : "0") + ",";
                        scormData += currentPage.privatePages[i].questionsUnanswered
                    }
                    scormData += ":" + (currentPage.sbaIsScored ? "1" : "0");
                    scormData += ":" + (currentPage.sbaIsRetried ? "1" : "0");
                    courseController.course.scormState.setState(currentPage.id, scormData);
                    courseController.showSbaStatus();
                    if (!skipCheckCompletion)
                    {
                        if (bAllPassed)
                        {
                            setObjective(null, "Assessment." + currentPage.id + ".1", "completed", "100", "passed", (this.getSbaScore() / 100) + "", null);
                            currentPage.setComplete(false)
                        }
                        else if (this.sbaHasNoAttemptsLeft(currentPage))
                        {
                            setObjective(null, "Assessment." + currentPage.id + ".1", "completed", "100", "failed", (this.getSbaScore() / 100) + "", null);
                            currentPage.setComplete(false)
                        }
                    }
                }, getSbaScore: function()
                {
                    var currentPage = course.getCurrentPage();
                    var nScore = 0;
                    var nContributed = 0;
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        var selectedAssessment = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment;
                        var nTotalQuestions = selectedAssessment.countQuestions();
                        if (nTotalQuestions > 0)
                        {
                            nContributed++;
                            nScore += selectedAssessment.countCorrectQuestions() / nTotalQuestions
                        }
                    }
                    if (nContributed > 0)
                    {
                        nScore = Math.round(nScore / nContributed * 100)
                    }
                    else
                    {
                        nScore = 100
                    }
                    return nScore
                }, sbaHasNoAttemptsLeft: function(page)
                {
                    if (page && page.sbaAttemptMaximum && page.sbaAttempts)
                        return page.sbaAttemptMaximum > 0 && page.sbaAttempts > page.sbaAttemptMaximum;
                    return false
                }, showSbaStatus: function()
                {
                    var currentPage = course.getCurrentPage();
                    var s = '<div class="sbaContainer">';
                    if (currentPage.sbaIsScored)
                    {
                        if (currentPage.sbaIsAllPassed)
                        {
                            var nScore = this.getSbaScore();
                            var sMessage = Resources.SBA_ActionButtonScoredPassed_Text.replace(/%%Score%%/g, nScore);
                            if (currentPage.sbaContributesCourseScore == "true")
                            {
                                this.course.scormState.setScore((nScore) + "")
                            }
                            s += '<div class="sbaActionContainer">' + sMessage + '</div>'
                        }
                        else
                        {
                            currentPage.sbaAttempts++;
                            if (currentPage.sbaAttemptMaximum == 0 || (currentPage.sbaAttemptMaximum > 0 && currentPage.sbaAttempts <= currentPage.sbaAttemptMaximum))
                            {
                                s += '<div class="sbaActionContainer">' + Resources.SBA_ActionButtonScoredRetry_Text;
                                s += '<a class="sbaActionButton accent" href="" onclick="parent.player.courseController.retryScenarioBasedAssessment(window);return false;">' + Resources.SBA_ActionButtonRetryTest_Text + '</a>';
                                s += '</div>'
                            }
                            else
                            {
                                s += '<div class="sbaActionContainer">' + Resources.SBA_NoAttemptsLeft_Text;
                                s += '</div>'
                            }
                        }
                    }
                    else
                    {
                        s += '<div class="sbaActionContainer">' + Resources.SBA_ActionButtonNotScored_Text;
                        if (currentPage.sbaAllAnswered)
                        {
                            s += '<a class="sbaActionButton accent" href="" onclick="parent.player.courseController.scoreScenarioBasedAssessment(window);return false;">' + Resources.SBA_ActionButtonScoreTest_Text + '</a>'
                        }
                        else
                        {
                            s += '<a class="sbaActionButtonDisabled">' + Resources.SBA_ActionButtonScoreTest_Text + '</a>'
                        }
                        s += '</div>'
                    }
                    s += '<div class="sbaSetContainer">';
                    for (var i = 0; i < currentPage.privatePages.length; i++)
                    {
                        var setPage = currentPage.privatePages[i];
                        var className = "sbaSet";
                        if (currentPage.sbaIsScored && setPage.questionsUnanswered == 0)
                        {
                            if (setPage.assessmentStatus === AssessmentStatus.Passed)
                                className += " sbaSetScored sbaSetPassed";
                            else if (setPage.assessmentStatus === AssessmentStatus.Failed)
                                className += " sbaSetScored sbaSetFailed"
                        }
                        s += '<a class="' + className + '" href="" onclick="parent.player.courseController.showScenarioBasedAssessment(window, ' + i + ');return false;">';
                        s += '<div class="sbaSetName">' + setPage.name + '</div>';
                        if (currentPage.sbaIsScored && setPage.questionsUnanswered == 0)
                            switch (setPage.assessmentStatus)
                            {
                                case AssessmentStatus.Passed:
                                    s += '<div class="sbaSetResult">' + Resources.SBA_ResultPassed_Text + "</div>";
                                    break;
                                case AssessmentStatus.Failed:
                                    s += '<div class="sbaSetResult">' + Resources.SBA_ResultFailed_Text + "</div>";
                                    break
                            }
                        if (currentPage.sbaIsScored || (setPage.assessmentStatus == AssessmentStatus.Passed && currentPage.sbaIsRetried))
                        {
                            var selectedAssessment = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment;
                            var xofy = Resources.SBA_RemainingXofY_Text.replace(/%%correct%%/g, selectedAssessment.countCorrectQuestions());
                            xofy = xofy.replace(/%%total%%/g, selectedAssessment.countQuestions());
                            s += '<div class="sbaSetRemaining">' + xofy + '</div>'
                        }
                        else
                        {
                            if (setPage.questionsUnanswered == 0)
                            {
                                s += '<div class="sbaSetRemaining">' + Resources.SBA_Remaining0_Text + '</div>'
                            }
                            else
                            {
                                s += '<div class="sbaSetRemaining">' + Resources.SBA_RemainingMore_Text.replace(/%%number%%/g, setPage.questionsUnanswered) + '</div>'
                            }
                        }
                        var questionCount = currentPage.privatePages[i].privatePages[currentPage.privatePages[i].assessmentSelected].Assessment.countQuestions();
                        s += '<div class="sbaSetComplete">' + (questionCount - setPage.questionsUnanswered) + '/' + questionCount + '</div>';
                        s += '<div class="sbaSetCompleteWord">' + Resources.Assessment_Status_Tile_QuestionsComplete_Text + '</div>';
                        switch (setPage.assessmentStatus)
                        {
                            case AssessmentStatus.NotAttempted:
                                if (setPage.sbaIsLocked)
                                {
                                    s += '<div class="sbaSetActionLocked">' + Resources.SBA_ActionBegin_Text + '</div>'
                                }
                                else
                                {
                                    s += '<div class="sbaSetActionBegin">' + Resources.SBA_ActionBegin_Text + '</div>'
                                }
                                break;
                            case AssessmentStatus.Incomplete:
                                s += '<div class="sbaSetActionResume">' + Resources.SBA_ActionResume_Text + '</div>';
                                break;
                            case AssessmentStatus.Passed:
                            case AssessmentStatus.Failed:
                                s += '<div class="sbaSetActionReview">' + Resources.SBA_ActionReview_Text + '</div>';
                                break
                        }
                        s += '</a>'
                    }
                    s += '</div></div>';
                    currentPage.sbaWin.document.getElementById('SBA').innerHTML = s
                }, showScenarioBasedAssessment: function(win, set)
                {
                    var currentPage = course.getCurrentPage();
                    if (currentPage.privatePages[set].sbaIsLocked)
                    {
                        this.course.observer.fire("notifySbaLinear", null)
                    }
                    else
                    {
                        var selectedAssessment = currentPage.privatePages[set].privatePages[currentPage.privatePages[set].assessmentSelected].Assessment;
                        selectedAssessment.sbaSelectedSet = set;
                        this.showContentPopup(currentPage.privatePages[set].privatePages[currentPage.privatePages[set].assessmentSelected], this.updateSbaStatusClosed)
                    }
                }, getQuestionFromId: function(id)
                {
                    for (var i = 0; i < course.objectives.length; i++)
                    {
                        for (var j = 0; j < course.objectives[i].Questions.length; j++)
                        {
                            if (course.objectives[i].Questions[j].Id == id)
                                return course.objectives[i].Questions[j]
                        }
                    }
                    return null
                }, markPageComplete: function()
                {
                    course.getCurrentPage().setComplete()
                }, getPageNameFromId: function(id)
                {
                    var pageName = null;
                    course.recursePageTreeFn(function(page, nCurrentLevel)
                    {
                        if (page.id == id)
                        {
                            pageName = page.name
                        }
                    });
                    if (pageName == null)
                    {
                        course.recursePagesFn(courseModel.privatePages, function(page, nCurrentLevel)
                        {
                            if (page.id == id)
                            {
                                pageName = page.name
                            }
                        }, 1)
                    }
                    return pageName
                }, getPageFromId: function(id)
                {
                    var pageFound = null;
                    course.recursePageTreeFn(function(page, nCurrentLevel)
                    {
                        if (page.id == id)
                        {
                            pageFound = page
                        }
                    });
                    if (!pageFound)
                    {
                        course.recursePagesFn(courseModel.privatePages, function(page, nCurrentLevel)
                        {
                            if (page.id == id)
                            {
                                pageFound = page
                            }
                        }, 1)
                    }
                    return pageFound
                }, showPageLinks: function()
                {
                    try
                    {
                        var s = "";
                        var id = course.getCurrentPage().id;
                        for (var i = 0; i < course.PageLinkArray.length; i++)
                        {
                            if (course.PageLinkArray[i].id == id)
                            {
                                var sFileName = course.PageLinkArray[i].source;
                                if (course.PageLinkArray[i].type == "File")
                                {
                                    if (sFileName.substring(0, 10) != "Resources/")
                                    {
                                        sFileName = "../Resources/" + sFileName
                                    }
                                    else
                                    {
                                        sFileName = "../" + sFileName
                                    }
                                }
                                s += '<tr><td><a href="' + sFileName + '" target="_blank" title="' + course.PageLinkArray[i].description + '">' + course.PageLinkArray[i].name + '</a></td></tr>'
                            }
                        }
                        if (s != "")
                        {
                            s = '<table class="PageResources"><caption>' + parent.Resources.ResourcesTable_Caption_Text + '</caption>' + s + '</table>'
                        }
                        return s
                    }
                    catch(e)
                    {
                        return ""
                    }
                }, getTestOutTile: function(styleColor, styleSize)
                {
                    if (course.testOutPage)
                    {
                        var s = '<a class="WelcomeTestOutTile ' + styleColor + ' ' + styleSize + '" href="#" onclick="parent.player.courseController.navigateToTestOut(); return false;"><div class="WelcomeTestOutTileTitle">' + Resources.Welcome_TestOut_Title_Text + '</div>';
                        s += '<div class="WelcomeTestOutTileBody">' + Resources.Welcome_TestOutNonAdaptive_Info_Html + '</div></a>';
                        return s
                    }
                    return ''
                }, getShowTranscriptTile: function(styleColor, styleSize, location)
                {
                    var s = "";
                    if (courseModel.settings.CourseTranscript)
                    {
                        s += '<a class="CourseTranscriptTile ' + styleColor + ' ' + styleSize + '" href="#" onclick="parent.player.courseController.showCourseTranscript(' + location + '); return false;">';
                        s += '<div class="CourseTranscriptTileLine1">' + Resources.CourseTranscriptTile_Line1_Text + '</div>';
                        s += '<div class="CourseTranscriptTileLine2">' + Resources.CourseTranscriptTile_Line2_Text + '</div>';
                        s += '<div class="CourseTranscriptTileLine3">' + Resources.CourseTranscriptTile_Line3_Text + '</div>';
                        s += '</a>'
                    }
                    return s
                }, getProgressTile: function(styleColor, styleSize)
                {
                    var s = '<div class="ContentsProgressBox ' + styleColor + ' ' + styleSize + '">';
                    if (this.course.scormState.isComplete)
                    {
                        var nPercent = 100
                    }
                    else
                    {
                        var nTotal = 0;
                        var nComplete = 0;
                        this.course.recursePageTreeFn(function(page, nCurrentLevel)
                        {
                            if (page.contribute == 'r' && !page.pageState.isOptional && !page.isModule)
                            {
                                nTotal++;
                                if (page.isComplete())
                                {
                                    nComplete++
                                }
                            }
                        });
                        var nPercent = Math.round(100 * nComplete / nTotal)
                    }
                    s += '<div class="ContentsProgressComplete">' + views.utils.localizeNumbers(nPercent) + '%</div>';
                    s += '<div class="ContentsProgressCompleteWord">' + Resources.Contents_Module_Complete_Text + '</div>';
                    var nextPage = this.course.getNextRequiredPage();
                    if (nextPage)
                    {
                        s += '<div class="ContentsProgressNext">' + Resources.NavigationBar_WhatsNext_Text.replace("%%pageName%%", nextPage.name) + '</div>'
                    }
                    s += '<div class="ContentsProgressMyProgress">' + Resources.Contents_MyProgress_Text + '</div>';
                    s += '</div>';
                    return s
                }, getStartButton: function(styleColor, styleSize)
                {
                    var s = '<a class="WelcomeStartButtonTile ' + styleColor + ' ' + styleSize + '" href="#" onclick="parent.player.courseController.navigateToNextPage(); return false;" title="' + Resources.NavigationBar_NextPage_Button_Title + '">';
                    s += '<span class="WelcomeStartButtonTileButton ' + styleSize + '" /></a>';
                    return s
                }, termScormCommunications: function()
                {
                    if (!courseModel.scormState.ScormTerminated)
                    {
                        var currentPage = courseModel.getCurrentPage();
                        if (currentPage)
                        {
                            if (currentPage.Assessment && currentPage.Assessment.IntervalTimer && !currentPage.Assessment.isCompleted())
                            {
                                currentPage.Assessment.scoreAllQuestions()
                            }
                            currentPage.unload(true)
                        }
                        courseModel.recordPathmark();
                        setSessionTime(_timeSessionStart);
                        courseModel.scormState.setState("USROPT", courseModel.volume + "," + Number(courseModel.settings.ShowOptionalContent) + "," + Number(courseModel.settings.TOCCollapsed) + "," + courseModel.settings.MediaPlaybackRate + "," + Number(courseModel.settings.ShowVideoCaptions) + "," + courseModel.settings.VideoQuality + "," + Number(courseModel.settings.ShowVideoDescriptions));
                        courseModel.scormState.save();
                        if (!courseModel.language.reloading)
                        {
                            var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.suspended);
                            stmt.object = new ADL.XAPIStatement.Activity("course:" + courseModel.buildId + ";", "course");
                            stmt.object.definition.type = "http://adlnet.gov/expapi/activities/course";
                            stmt.result = ["cmi.suspend_data", courseModel.scormState.getSuspendData(), "cmi.core.student_id", courseModel.scormState.getLearnerId(), "cmi.core.lesson_location", courseModel.scormState.getScormBookmark(), "cmi.core.student_name", courseModel.scormState.getLearnerName()];
                            ADL.XAPIWrapper.postMessage(stmt);
                            termCommunications();
                            courseModel.scormState.ScormTerminated = true;
                            $("#changeLanguage").hide()
                        }
                    }
                }, isLMSFree: function()
                {
                    if ($('iframe[name=OnlineLauncher]', parent.document).length)
                        return true;
                    return false
                }, isOnline: function()
                {
                    return location.protocol == "http:" || location.protocol == "https:"
                }, getUserId: function()
                {
                    return this.course.scormState.getLearnerId()
                }, alert: function(message)
                {
                    player.notifyUserView.notify(message)
                }, confirm: function(message, callback, param)
                {
                    player.confirmUserView.confirm(message, callback, param)
                }, showVideo: function(videoFileName, htmlElementId, context, observer, positionStateKey)
                {
                    if (!videoFileName)
                        return;
                    var iframe = $('<iframe src="../../../VideoPage.htm" width="100%" height="100%" frameborder="0" allowfullscreen >').load(function()
                        {
                            if (!this.src.match(/VideoPage.htm$/i))
                                return;
                            var vid = new VideoController(this.contentWindow, courseController);
                            var pageDisplayed = courseController.course.currentPopupPageId ? course.getPageById(courseController.course.currentPopupPageId) : course.getCurrentPage();
                            if (pageDisplayed.pageType.PlaybackSource === "Branching" && pageDisplayed.BranchingGraph)
                            {
                                var branchingPoint = pageDisplayed.BranchingGraph.getCurrentLocation(),
                                    contentPageId = '';
                                if (branchingPoint)
                                {
                                    if (branchingPoint.location === 0)
                                        contentPageId = branchingPoint.contentPageId;
                                    else if (branchingPoint.location === 3 && branchingPoint.currentAttempt)
                                        contentPageId = branchingPoint.currentAttempt.getFeedbackPageId();
                                    else if (branchingPoint.selectedFeedbackPageId)
                                        contentPageId = branchingPoint.selectedFeedbackPageId;
                                    pageDisplayed = course.getPageById(contentPageId) || pageDisplayed
                                }
                            }
                            vid.page = pageDisplayed;
                            vid.context = context;
                            vid.observer = observer;
                            if (positionStateKey || positionStateKey === '')
                                vid.positionStateKey = positionStateKey;
                            vid.videoFile = pageDisplayed.getVideo(videoFileName);
                            if (!vid.videoFile)
                                vid.videoFile = new MediaFile(course, "");
                            vid.volume = course.volume;
                            vid.keyPointsFilePath = pageDisplayed.getKeyPointsPath(vid.videoFile.FileName);
                            vid.readyToPlay();
                            observer && observer.fire("mediaLoaded", vid, context)
                        });
                    if (htmlElementId)
                    {
                        $("iframe").each(function(index)
                        {
                            try
                            {
                                if ($(this).contents().find("#" + htmlElementId).length)
                                {
                                    $(this).contents().find("#" + htmlElementId).append(iframe);
                                    return false
                                }
                            }
                            catch(e) {}
                        })
                    }
                }, setVideoDisplay: function(videoWindow, isFullScreen)
                {
                    if (videoWindow)
                    {
                        var w = videoWindow;
                        while (w != window && w.frameElement)
                        {
                            if (isFullScreen)
                            {
                                $(w.frameElement).addClass('fullscreen');
                                $('html', w.document).addClass('fullscreen')
                            }
                            else
                            {
                                $(w.frameElement).removeClass('fullscreen');
                                $('html', w.document).removeClass('fullscreen')
                            }
                            w = w.parent
                        }
                    }
                }, countRemainingRequiredPages: function(includeCurrentPage)
                {
                    var currentPage = courseModel.getCurrentPage(),
                        remaining = 0;
                    courseModel.recursePageTreeFn(function(page, nCurrentLevel)
                    {
                        if (nCurrentLevel > 1 && page.isRequired() && !page.isComplete() && (page !== currentPage || includeCurrentPage))
                            remaining++
                    });
                    return remaining
                }, showCaptions: function(html)
                {
                    if (this.contentPopupView && this.contentPopupView.getCurrentPage())
                        $("#ContentsPopupCaptionsContainer").html(html);
                    else
                        $("#CaptionsContainer").html(html)
                }, screenReaderAlert: function(t)
                {
                    var alert = $("<span role='alert'>" + t + "</span>");
                    $("#PlayerSRAlert").children().remove();
                    setTimeout(function()
                    {
                        $("#PlayerSRAlert").append(alert)
                    }, 1)
                }, course: courseModel, navigationSuccess: false
        }
}
function VideoController(iframeWindow, courseController)
{
    this.page = null;
    this.context = null;
    this.observer = null;
    this.positionStateKey = "_video";
    this.videoFile = null;
    this.keyPointsFilePath = "";
    this.keyPointsArray = [];
    this.iframeWindow = iframeWindow;
    this.courseController = courseController;
    this.volume = 50;
    this.videoPosition = "";
    this.endedEventReceived = false;
    this.retry = 0;
    this.canSetQuality = true;
    this.completionSet = false;
    var vc = this;
    this.readyToPlay = function()
    {
        this.endedEventReceived = false;
        if (this.page && this.positionStateKey)
        {
            if (this.videoFile.chapters)
            {
                var s = courseController.course.scormState.getState(this.page.id + this.positionStateKey);
                if (s)
                {
                    var aParts = s.split("=");
                    this.videoPosition = parseFloat(aParts[0]);
                    this.chapterState = {
                        complete: false, current: this.videoPosition, progress: []
                    };
                    aParts = aParts[1].split(",");
                    for (var i = 0; i < aParts.length; i++)
                    {
                        var state = aParts[i].split(":");
                        var p = {
                                current: state[0] - 0, max: state[1] - 0, status: state[2] - 0, locked: state[3] == "1"
                            };
                        this.chapterState.progress.push(p)
                    }
                }
                else
                {
                    this.chapterState = null
                }
            }
            else
            {
                this.videoPosition = parseFloat(courseController.course.scormState.getState(this.page.id + this.positionStateKey))
            }
        }
        if (vc.videoFile.hasKeypoints)
        {
            $.ajax({
                type: "GET", url: vc.keyPointsFilePath, dataType: "XML", success: function(xml)
                    {
                        try
                        {
                            var scriptCommandsElem = $(xml).find("ScriptCommands");
                            if (scriptCommandsElem)
                            {
                                $(scriptCommandsElem).children("ScriptCommand").each(function()
                                {
                                    var scriptCommandElem = $(this);
                                    var kp = new KeyPoint;
                                    var command = scriptCommandElem.attr("Command");
                                    var aCommand = command.split("|");
                                    for (var i = 0; i < aCommand.length; i++)
                                    {
                                        if (aCommand[i].length > 2)
                                        {
                                            aCommand[i] = aCommand[i].substring(1, aCommand[i].length - 1)
                                        }
                                        else
                                        {
                                            aCommand[i] = ""
                                        }
                                    }
                                    kp.timeStart = vc.charTimeToSeconds(scriptCommandElem.attr("Time"));
                                    kp.type = aCommand[0];
                                    kp.timeEnd = kp.timeStart + vc.charTimeToSeconds(aCommand[1]);
                                    kp.style = aCommand[2];
                                    if (kp.type == "quiz")
                                    {
                                        kp.data = courseController.course.getPageById(aCommand[3])
                                    }
                                    else
                                    {
                                        kp.data = aCommand[3]
                                    }
                                    kp.pause = aCommand[4] == "true";
                                    kp.mustComplete = aCommand[5] == "true";
                                    vc.keyPointsArray.push(kp)
                                })
                            }
                        }
                        catch(e) {}
                        vc.iframeWindow.videoView(vc);
                        if (courseController.course.settings.VideoFullScreen)
                            vc.setVideoDisplay(true)
                    }
            })
        }
        else
        {
            if (vc.iframeWindow && vc.iframeWindow.videoView)
                vc.iframeWindow.videoView(vc);
            if (courseController.course.settings.VideoFullScreen)
                vc.setVideoDisplay(true)
        }
        if (vc.videoFile.videoClickToPlay)
        {
            this.courseController.activeVideoController = this
        }
    };
    this.charTimeToSeconds = function(charTime)
    {
        var aParts = charTime.split(":");
        return (aParts[0] * 60 * 60) + (aParts[1] * 60) + (aParts[2] - 0)
    }
}
VideoController.prototype.setVideoDisplay = function(isFullScreen)
{
    if (this.iframeWindow)
    {
        this.courseController.setVideoDisplay(this.iframeWindow, isFullScreen);
        if (this.iframeWindow.showTranscriptButton)
            this.iframeWindow.showTranscriptButton(!isFullScreen)
    }
};
VideoController.prototype.play = function()
{
    this.iframeWindow && this.iframeWindow.azurePlayer && this.iframeWindow.azurePlayer.paused() && this.iframeWindow.azurePlayer.play()
};
VideoController.prototype.toggleMute = function()
{
    if (this.iframeWindow && this.iframeWindow.azurePlayer)
    {
        if (this.iframeWindow.azurePlayer.muted())
        {
            this.iframeWindow.azurePlayer.muted(false);
            this.courseController.screenReaderAlert("Video mute toggled off.")
        }
        else
        {
            this.iframeWindow.azurePlayer.muted(true);
            this.courseController.screenReaderAlert("Video mute toggled on.")
        }
    }
};
VideoController.prototype.togglePlay = function()
{
    if (this.iframeWindow && this.iframeWindow.azurePlayer)
    {
        if (this.iframeWindow.azurePlayer.paused())
            this.iframeWindow.azurePlayer.play();
        else
            this.iframeWindow.azurePlayer.pause()
    }
};
VideoController.prototype.videoStarted = function()
{
    this.courseController.activeVideoController = this;
    if (this.observer)
        this.observer.fire('mediaStarted', this.videoFile, this.context)
};
VideoController.prototype.videoStopped = function()
{
    if (this.observer)
    {
        this.observer.fire('mediaStopped', this.videoFile, this.context)
    }
    this.courseController.screenReaderAlert("Video playback stopped.")
};
VideoController.prototype.setComplete = function()
{
    if (!this.completionSet)
    {
        if (this.page != null)
        {
            this.page.setComplete();
            this.completionSet = true
        }
    }
};
VideoController.prototype.setState = function()
{
    if (this.positionStateKey)
    {
        if (this.videoFile.chapters)
        {
            var s = this.videoPosition + "=";
            var r = this.iframeWindow.Amp.Plugin.apsChapters.AmpService.getProgress("myVideoPlayer").result;
            var p = r.progress;
            for (var i = 0; i < p.length; i++)
            {
                if (i > 0)
                    s += ",";
                s += p[i].current + ":" + p[i].max + ":" + p[i].status + ":" + (p[i].locked ? "1" : "0")
            }
            s = 'courseController.course.scormState.setState("' + this.page.id + this.positionStateKey + '","' + s + '")'
        }
        else
        {
            var s = 'courseController.course.scormState.setState("' + this.page.id + this.positionStateKey + '",' + this.videoPosition + ')'
        }
    }
    setTimeout(s, 1)
};
VideoController.prototype.setCurrentTime = function(seconds, skipPlayhead)
{
    if (this.iframeWindow && this.iframeWindow.azurePlayer)
    {
        if (skipPlayhead)
        {
            this.iframeWindow.azurePlayer.currentTime(seconds)
        }
        else
        {
            var curTime = this.iframeWindow.azurePlayer.currentTime();
            this.iframeWindow.azurePlayer.currentTime(curTime + seconds)
        }
    }
    if (seconds < 0)
    {
        this.courseController.screenReaderAlert("rewinding " + (seconds * -1) + "seconds")
    }
    else
    {
        this.courseController.screenReaderAlert("jumping ahead " + seconds + "seconds")
    }
};
VideoController.prototype.goToAudioDescription = function(){};
VideoController.prototype.videoEnded = function()
{
    this.endedEventReceived = true;
    this.setVideoDisplay(false);
    this.videoPosition = "";
    if (this.page)
    {
        this.setState()
    }
    if (this.observer)
        this.observer.fire('mediaEnded', this.videoFile, this.context);
    else
    {
        if (this.videoFile.mustPlayAll && !this.videoFile.chapters)
        {
            this.setComplete()
        }
        if (this.videoFile.videoAutoNavigate)
        {
            if (this.page == null || this.courseController.course.getCurrentPage() === this.page)
                this.courseController.navigateToNextPage()
        }
    }
    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
    var stmtPageID = this.page ? this.page.id : "0";
    stmt.object = new ADL.XAPIStatement.Activity("course:" + this.courseController.course.buildId + ";page:" + stmtPageID + ";", "media");
    stmt.object.definition.type = "http://adlnet.gov/expapi/activities/media";
    stmt.result = {
        completion: true, fileName: this.videoFile.FileName
    };
    ADL.XAPIWrapper.postMessage(stmt)
};
VideoController.prototype.videoUnloaded = function()
{
    if (this.page)
    {
        if (!this.endedEventReceived)
        {
            if (this.positionStateKey)
            {
                var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.experienced);
                stmt.object = new ADL.XAPIStatement.Activity("course:" + this.courseController.course.buildId + ";page:" + this.page.id + ";", "media");
                stmt.object.definition.type = "http://adlnet.gov/expapi/activities/media";
                stmt.result = {
                    location: this.videoPosition, fileName: this.videoFile.FileName
                };
                ADL.XAPIWrapper.postMessage(stmt)
            }
        }
    }
};
VideoController.prototype.timeChanged = function(newTime)
{
    this.videoPosition = newTime;
    if (this.observer)
        this.observer.fire('timeupdate', newTime);
    if (this.courseController.transcriptView)
        this.courseController.transcriptView.scrollToItem(newTime);
    if (this.page != null)
    {
        this.setState()
    }
};
VideoController.prototype.setVolume = function(newVolume)
{
    if (this.iframeWindow && this.iframeWindow.azurePlayer)
    {
        this.iframeWindow.azurePlayer.volume(newVolume / 100)
    }
};
VideoController.prototype.volumeChanged = function(newVolume)
{
    this.volume = newVolume;
    this.courseController.volumeChanged(newVolume);
    if (!this.iframeWindow.azurePlayer.muted())
    {
        this.courseController.screenReaderAlert("Video volume " + (Math.floor(newVolume).toFixed(0)) + " percent")
    }
    else
    {
        this.courseController.screenReaderAlert("Video volume muted")
    }
};
VideoController.prototype.speedChanged = function(playbackRate)
{
    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.experienced);
    var stmtPageID = this.page ? this.page.id : "0";
    stmt.object = new ADL.XAPIStatement.Activity("course:" + this.courseController.course.buildId + ";page:" + stmtPageID + ";", "media");
    stmt.object.definition.type = "http://adlnet.gov/expapi/activities/media";
    stmt.result = {
        videoPlaybackRate: playbackRate, fileName: this.videoFile.FileName
    };
    ADL.XAPIWrapper.postMessage(stmt);
    this.courseController.screenReaderAlert("Playback rate changed to " + playbackRate)
};
VideoController.prototype.captionsStateChanged = function(state)
{
    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.experienced);
    var stmtPageID = this.page ? this.page.id : "0";
    stmt.object = new ADL.XAPIStatement.Activity("course:" + this.courseController.course.buildId + ";page:" + stmtPageID + ";", "media");
    stmt.object.definition.type = "http://adlnet.gov/expapi/activities/media";
    stmt.result = {
        captions: state, fileName: this.videoFile.FileName
    };
    ADL.XAPIWrapper.postMessage(stmt);
    if (state)
    {
        launchPage.player.courseController.screenReaderAlert('Video captions on.')
    }
    else
    {
        launchPage.player.courseController.screenReaderAlert('Video captions off.')
    }
};
VideoController.prototype.getManifestItem = function()
{
    var videoManifestItem = null;
    if (this.courseController.course.settings.errorOnVideoRetry)
    {
        this.courseController.course.settings.errorOnVideoRetry = false;
        videoManifestItem = this.courseController.course.mediaManifest.getFirstRequiredVideoItem()
    }
    else if (window.CheckRGHosted && CheckRGHosted())
    {
        videoManifestItem = this.courseController.course.mediaManifest.getMpgVideoItemByUiLabel(this.courseController.course.settings.VideoQuality)
    }
    else if (this.courseController.course.inOfflinePlayer())
    {
        videoManifestItem = this.courseController.course.mediaManifest.getMpgVideoItemByUiLabel("Standard")
    }
    else if (!common.isSilverlightInstalled())
    {
        videoManifestItem = this.courseController.course.mediaManifest.getMpgVideoItemByUiLabel(this.courseController.course.settings.VideoQuality)
    }
    else if (this.courseController.course.mediaManifest.getVideoItemByPlayerType("Streaming"))
    {
        this.canSetQuality = false;
        videoManifestItem = this.courseController.course.mediaManifest.getVideoItemByPlayerType("Streaming")
    }
    else if (this.courseController.course.mediaManifest.getVideoItemByPlayerType("WMV"))
    {
        this.canSetQuality = false;
        videoManifestItem = this.courseController.course.mediaManifest.getVideoItemByPlayerType("WMV")
    }
    else
    {
        videoManifestItem = this.courseController.course.mediaManifest.getMpgVideoItemByUiLabel(this.courseController.course.settings.VideoQuality)
    }
    if (videoManifestItem.namingScheme == "*.ism/manifest(format=mpd-time-csf)" && !common.supportsDashPlayReady())
    {
        videoManifestItem = this.courseController.course.mediaManifest.getFirstRequiredVideoItem()
    }
    return videoManifestItem
};
VideoController.prototype.getDownloadableManifestItem = function()
{
    return this.courseController.course.mediaManifest.getFirstDownloadableVideoItem()
};
VideoController.prototype.getAvailableVideoQualities = function()
{
    return this.courseController.course.mediaManifest.getVideoUiLabels()
};
VideoController.prototype.displayAssessment = function(pageId)
{
    var assessmentView = new AssessmentView($('div#Assessment'), null, this.courseController);
    var assessmentController = new AssessmentController(assessmentView, null);
    var page = this.courseController.course.getPageById(pageId);
    assessmentController.readyToPlay(page.Assessment)
};
function Course()
{
    this.pageTree = [];
    this.privatePages = [];
    this.pageNavigation = [];
    this.modules = [];
    this.pageTypesArray = [];
    this.currentPageIndex = 0;
    this.currentPopupPageId = null;
    this.PageLinkArray = [];
    this.name = "";
    this.buildId = "";
    this.isFirstLaunch = true;
    this.language = new Language;
    this.settings = new Settings;
    this.scormState = new ScormState(this);
    this.observer = new Observer;
    this.testOutPage = null;
    this.welcomePage = null;
    this.Assessments = [];
    this.tracks = new Tracks;
    this.mediaManifest = new MediaManifest;
    this.objectives = [];
    this.parentObjectives = [];
    this.volume = 75;
    this.navigationStarted = false;
    this.ldServices = window.ldservices;
    var that = this;
    var ajaxQueue = function(step, callback)
        {
            switch (step)
            {
                case 0:
                    $.ajax({
                        type: "GET", url: 'Types/Pages/PageTypes.xml', dataType: "XML", complete: function()
                            {
                                if (that.combinedXmls)
                                {
                                    ajaxQueue(2, callback)
                                }
                                else
                                {
                                    ajaxQueue(1, callback)
                                }
                            }, success: function(pageTypesXml)
                            {
                                CourseParser.parsePageTypesXml(pageTypesXml, that)
                            }
                    });
                    break;
                case 1:
                    $.ajax({
                        type: "GET", url: that.language.code + '/objectives.xml', dataType: "XML", complete: function()
                            {
                                ajaxQueue(2, callback)
                            }, success: function(objectivesXml)
                            {
                                CourseParser.parseObjectivesXml(objectivesXml, that)
                            }
                    });
                    break;
                case 2:
                    $.ajax({
                        type: "GET", url: that.language.code + '/pages.xml', dataType: "XML", complete: function()
                            {
                                if (that.combinedXmls)
                                {
                                    that.loadPageNavigation();
                                    callback()
                                }
                                else
                                {
                                    ajaxQueue(3, callback)
                                }
                            }, success: function(pagesXml)
                            {
                                CourseParser.parsePagesXml(pagesXml, that);
                                that.restoreState()
                            }
                    });
                    break;
                case 3:
                    $.ajax({
                        type: "GET", url: that.language.code + '/tracks.xml', dataType: "XML", complete: function()
                            {
                                ajaxQueue(4, callback)
                            }, success: function(tracksXml)
                            {
                                CourseParser.parseTracksXml(tracksXml, that)
                            }
                    });
                    break;
                case 4:
                    $.ajax({
                        type: "GET", url: that.language.code + '/pageLinks.xml', dataType: "XML", complete: function()
                            {
                                ajaxQueue(5, callback)
                            }, success: function(xml)
                            {
                                CourseParser.parsePageLinksXml(xml, that)
                            }
                    });
                    break;
                case 5:
                    $.ajax({
                        type: "GET", url: 'mediaManifest.xml', dataType: "XML", complete: function()
                            {
                                ajaxQueue(6, callback)
                            }, success: function(mediaManifestXml)
                            {
                                CourseParser.parseMediaManifest(mediaManifestXml, that)
                            }
                    });
                    break;
                case 6:
                    $.ajax({
                        type: "GET", url: that.language.code + '/resources.xml', dataType: "XML", complete: function()
                            {
                                that.loadPageNavigation();
                                callback()
                            }, success: function(resourcesXml)
                            {
                                CourseParser.parseResourcesXml(resourcesXml)
                            }
                    });
                    break
            }
        };
    this.load = function(callback)
    {
        try
        {
            var aX = new window.ActiveXObject("Microsoft.XMLHTTP")
        }
        catch(e)
        {
            var aX = null
        }
        if (aX)
        {
            function createActiveXHR()
            {
                try
                {
                    return new window.ActiveXObject("Microsoft.XMLHTTP")
                }
                catch(e) {}
            }
            $.ajaxSetup({xhr: createActiveXHR})
        }
        this.scormState.load();
        this.language.init();
        if (this.language.rtl)
        {
            $("html").attr("dir", "rtl");
            $("html").addClass("rtl")
        }
        var sUserOptions = this.scormState.getState("USROPT");
        if (sUserOptions)
        {
            var aUserOptions = sUserOptions.split(',');
            this.volume = aUserOptions[0] - 0;
            this.settings.ShowOptionalContent = Boolean(aUserOptions[1] - 0);
            this.settings.TOCCollapsed = Boolean(aUserOptions[2] - 0);
            this.settings.MediaPlaybackRate = aUserOptions[3] - 0;
            this.settings.ShowVideoCaptions = Boolean(aUserOptions[4] - 0);
            this.settings.VideoQuality = aUserOptions[5];
            this.settings.ShowVideoDescriptions = Boolean(aUserOptions[6] - 0);
            this.settings.ShowTranscript = false
        }
        ajaxQueue(0, callback)
    }
}
Course.prototype.getObjective = function(id)
{
    for (obj in this.objectives)
    {
        if (this.objectives[obj].Id == id)
        {
            return this.objectives[obj]
        }
    }
    return null
};
Course.prototype.restoreState = function()
{
    var sPathMark = this.scormState.getState("PATHMARK");
    if (sPathMark)
    {
        var aPathMark = sPathMark.split(':');
        for (var i = 0; i < aPathMark.length; i++)
        {
            var aParts = aPathMark[i].split(',');
            this.recursePageTreeFn(function(page, nCurrentLevel)
            {
                if (page.id == aParts[0])
                {
                    page.pageState.status = aParts[1];
                    page.pageState.isVisited = (aParts[2] == "1")
                }
            })
        }
    }
    sPathMark = this.scormState.getState("PRIVATEMARK");
    if (sPathMark)
    {
        var aPathMark = sPathMark.split(':');
        for (var i = 0; i < aPathMark.length; i++)
        {
            var aParts = aPathMark[i].split(',');
            this.recursePrivatePageTreeFn(function(page, nCurrentLevel)
            {
                if (page.id == aParts[0])
                {
                    page.pageState.status = aParts[1];
                    page.pageState.isVisited = (aParts[2] == "1")
                }
            })
        }
    }
};
Course.prototype.checkCompletion = function(currentPage)
{
    if (!this.scormState.isComplete)
    {
        var bCourseComplete = true,
            passFail = "",
            score = null,
            bCourseCompleteByAssessment = false,
            bCourseCompleteByTestOutAssessment = false;
        if (currentPage.Assessment && currentPage.Assessment.CompletesCourse)
        {
            if (currentPage.Assessment.Status == AssessmentStatus.Passed)
            {
                passFail = "passed";
                score = currentPage.Assessment.getScore();
                bCourseCompleteByAssessment = true;
                bCourseCompleteByTestOutAssessment = currentPage.Assessment.isTestOut()
            }
            else if (currentPage.Assessment.Status == AssessmentStatus.Failed)
            {
                if (!currentPage.Assessment.isTestOut() && !currentPage.Assessment.hasAttemptsLeft())
                {
                    passFail = "failed";
                    score = currentPage.Assessment.getScore();
                    bCourseCompleteByAssessment = true
                }
            }
        }
        for (var i = 0; i < this.modules.length; i++)
        {
            var bModuleComplete = true;
            this.recursePagesFn(this.modules[i].pages, function(page, nCurrentLevel)
            {
                if (page.contribute == 'r' && !page.pageState.isOptional)
                {
                    if (!page.isComplete())
                    {
                        bModuleComplete = false
                    }
                }
            }, 1);
            if (bModuleComplete)
            {
                if (!this.modules[i].pageState.isOptional && !this.modules[i].isComplete())
                {
                    setObjective(null, "Module" + (i + 1), "completed", null, null, null, null);
                    this.modules[i].pageState.isVisited = true;
                    this.modules[i].setComplete(true)
                }
            }
            else
            {
                bCourseComplete = false
            }
        }
        if (bCourseCompleteByAssessment || bCourseComplete)
        {
            this.scormState.setCompletionStatus("completed");
            if (passFail)
                this.scormState.setPassFail(passFail);
            if (score != null)
                this.scormState.setScore(score);
            this.observer.fire("courseCompleted", bCourseCompleteByTestOutAssessment)
        }
    }
};
Course.prototype.loadPageNavigation = function()
{
    var sTracks = this.scormState.getState("TRACKS");
    if (sTracks)
    {
        var aParts = sTracks.split(',');
        if (aParts.length > this.tracks.items.length)
        {
            courseController.alert("The data for the tracks cannot be restored correctly. See if all of the different language versions of this course has the same tracks data.")
        }
        for (var i = 0; i < this.tracks.items.length; i++)
        {
            this.tracks.items[i].state.isSelected = false
        }
        for (var i = 0; i < aParts.length; i++)
        {
            var index = aParts[i] - 1;
            this.tracks.items[index].state.isSelected = true
        }
    }
    var sObjectives = this.scormState.getState("OBJ");
    if (sObjectives != "")
    {
        var aObjectives = sObjectives.split(',');
        for (var i = 0; i < aObjectives.length; i++)
        {
            for (var j = 0; j < this.objectives.length; j++)
            {
                if (this.objectives[j].Id == aObjectives[i])
                {
                    this.objectives[j].Complete = true
                }
            }
        }
    }
    this.updateNavigationForTracks();
    this.updateForObjectives();
    var currentViewedPage = null;
    if (this.pageNavigation.length > 0)
        currentViewedPage = this.pageNavigation[course.currentPageIndex];
    this.pageNavigation = [];
    this.currentPageIndex = 0;
    var that = this;
    this.recursePageTreeFn(function(page, nCurrentLevel)
    {
        if (nCurrentLevel > 1)
        {
            if (page.availableForNavigation())
            {
                that.pageNavigation.push(page)
            }
        }
    });
    for (var i = 0; i < this.pageNavigation.length; i++)
    {
        if (i < this.pageNavigation.length)
            this.pageNavigation[i].navNext = this.pageNavigation[i + 1];
        if (i > 0)
            this.pageNavigation[i].navPrevious = this.pageNavigation[i - 1]
    }
    if (currentViewedPage != null)
    {
        for (var i = 0; i < this.pageNavigation.length; i++)
        {
            if (currentViewedPage.id == this.pageNavigation[i].id)
            {
                this.currentPageIndex = i;
                break
            }
        }
        if (this.currentPageIndex == -1)
            this.navigateToPageById(0);
        this.navigateToPage(this.currentPageIndex)
    }
    this.updateLockedModules();
    this.observer.fire("pageNavigationLoaded")
};
Course.prototype.updateLockedModules = function()
{
    for (var i = 0; i < this.modules.length; i++)
    {
        this.modules[i].pageState.isLocked = false;
        if (this.modules[i].mustCompletePrevModules)
        {
            var aParts = this.modules[i].modulesToComplete.split(',');
            for (var j = 0; j < aParts.length; j++)
            {
                var moduleIndex = aParts[j] - 1;
                if (!this.modules[moduleIndex].pageState.isOptional && !this.modules[moduleIndex].isComplete())
                {
                    this.modules[i].pageState.isLocked = true;
                    break
                }
            }
        }
    }
};
Course.prototype.getCurrentLanguageFolderPath = function()
{
    return this.language.code + "/"
};
Course.prototype.getContentFolderPath = function()
{
    return this.getCurrentLanguageFolderPath() + "Content/"
};
Course.prototype.getMediaFolderPath = function()
{
    if (!this.inOfflinePlayer())
    {
        if (this.settings.MediaLocation == "Server" && courseController.isOnline())
        {
            return this.settings.MediaURL
        }
    }
    return "Media/"
};
Course.prototype.getImagesFolderPath = function()
{
    return this.getContentFolderPath() + "Images/"
};
Course.prototype.getPopupsFolderPath = function()
{
    return this.getContentFolderPath() + "Popups/"
};
Course.prototype.getCurrentPage = function()
{
    return this.pageNavigation[this.currentPageIndex]
};
Course.prototype.inOfflinePlayer = function()
{
    if (parent.g_Courseid)
    {
        return true
    }
    else if (opener && opener.parent.g_Courseid)
    {
        return true
    }
    return false
};
Course.prototype.getNextRequiredPage = function()
{
    if (courseController.nextPageIndex > 0)
        return this.pageNavigation[courseController.nextPageIndex];
    var currentPage = this.getCurrentPage();
    if (currentPage && currentPage.navNext)
    {
        return currentPage.navNext
    }
    return null
};
Course.prototype.getNextRequiredModule = function()
{
    var currentModule = this.getCurrentPage().getModule();
    for (var i = 0; i < this.modules.length; i++)
    {
        if (this.modules[i] == currentModule)
        {
            for (var j = i + 1; j < this.modules.length; j++)
            {
                if (!this.modules[j].pageState.isOptional)
                {
                    return this.modules[j]
                }
            }
            return null
        }
    }
    for (var i = 0; i < this.modules.length; i++)
    {
        if (!this.modules[i].pageState.isOptional)
        {
            return this.modules[j]
        }
    }
    return null
};
Course.prototype.getPageById = function(id)
{
    var page = null;
    for (var i = 0; i < this.pageNavigation.length; i++)
    {
        if (id == this.pageNavigation[i].id)
        {
            page = this.pageNavigation[i];
            break
        }
    }
    if (!page)
    {
        for (i = 0; i < this.privatePages.length; i++)
        {
            if (id == this.privatePages[i].id)
            {
                page = this.privatePages[i];
                break
            }
        }
    }
    return page
};
Course.prototype.navigateToNextPage = function()
{
    courseController.screenReaderAlert("Navigating to next page.");
    this.navigateToPage(this.currentPageIndex + 1)
};
Course.prototype.navigateToPreviousPage = function()
{
    courseController.screenReaderAlert("Navigating to previous page.");
    this.navigateToPage(this.currentPageIndex - 1)
};
Course.prototype.navigateToPage = function(index)
{
    var page = this.pageNavigation[index];
    this.navigateToPageByPage(page, index)
};
Course.prototype.navigateToPageById = function(id)
{
    var page = null,
        index = 0;
    for (var i = 0; i < this.pageNavigation.length; i++)
    {
        if (id == this.pageNavigation[i].id)
        {
            page = this.pageNavigation[i];
            index = i;
            break
        }
    }
    courseController.nextPageIndex = 0;
    this.navigateToPageByPage(page, index)
};
var _NavAwayFromTestOut = false;
Course.prototype.navigateToPageByPage = function(page, index)
{
    courseController.navigationSuccess = false;
    if (page)
    {
        var cPage = this.pageNavigation[this.currentPageIndex];
        if (cPage && cPage.isTestOut())
        {
            if (!cPage.Assessment.isCompleted() && !_NavAwayFromTestOut)
            {
                courseController.confirm(Resources.Navigation_LeaveTestOut_Text, $.proxy(this.navigateToPage, this), index);
                _NavAwayFromTestOut = true;
                return
            }
            else
                _NavAwayFromTestOut = false
        }
        if (cPage && cPage.Assessment && cPage.Assessment.IntervalTimer && !cPage.Assessment.isCompleted())
        {
            if (!cPage.Assessment.WantNavigation)
            {
                cPage.Assessment.WantNavigation = true;
                courseController.confirm(Resources.Timer_NavigateAway_Text, $.proxy(this.navigateToPage, this), index);
                return
            }
            else
            {
                cPage.Assessment.scoreAllQuestions()
            }
        }
        var targetPageModule = page.getModule();
        var currentPageModule = cPage && cPage.getModule();
        if (targetPageModule == currentPageModule)
        {
            if (targetPageModule.mustCompleteRequiredPages)
            {
                if (index > this.currentPageIndex)
                {
                    for (var i = this.currentPageIndex; i < index; i++)
                    {
                        if (this.pageNavigation[i].contribute == 'r' && !this.pageNavigation[i].pageState.isOptional && !this.pageNavigation[i].isComplete())
                        {
                            this.observer.fire("notifyNavigateLinearRequired", this.pageNavigation[i]);
                            return
                        }
                    }
                }
            }
        }
        else
        {
            if (targetPageModule.pageState.isLocked)
            {
                this.observer.fire("notifyNavigateModuleLocked", targetPageModule);
                return
            }
            else if (targetPageModule.mustCompleteRequiredPages)
            {
                if (!page.pageState.isVisited)
                {
                    for (i = index - 1; i > -1; i--)
                    {
                        var backPage = this.pageNavigation[i];
                        var backPageModule = backPage.getModule();
                        if (backPageModule == targetPageModule)
                        {
                            if (this.pageNavigation[i].contribute == 'r' && !backPage.pageState.isOptional && !backPage.isComplete())
                            {
                                this.observer.fire("notifyNavigateLinearRequired", this.pageNavigation[i]);
                                return
                            }
                        }
                        else
                        {
                            break
                        }
                    }
                }
            }
        }
        this.currentPageIndex = index;
        this.observer.fire("navigatedToPage", page);
        page.pageState.isVisited = true;
        if (page.canSendCompletion() && !page.isComplete() && page.isRequired())
        {
            page.setIncomplete()
        }
        else
        {
            page.setComplete()
        }
        if (!targetPageModule.isComplete())
            targetPageModule.setIncomplete();
        this.scormState.save();
        courseController.navigationSuccess = true;
        courseController.screenReaderAlert("Navigated to new content page.")
    }
};
Course.prototype.recordPathmark = function()
{
    var sPathMark = "";
    this.recursePageTreeFn(function(page, nCurrentLevel)
    {
        if (sPathMark != "")
            sPathMark += ':';
        sPathMark += page.id + "," + page.pageState.status + ',' + (page.pageState.isVisited ? "1" : "0")
    });
    this.scormState.setState("PATHMARK", sPathMark);
    sPathMark = "";
    this.recursePrivatePageTreeFn(function(page, nCurrentLevel)
    {
        if (sPathMark != "")
            sPathMark += ':';
        sPathMark += page.id + "," + page.pageState.status + ',' + (page.pageState.isVisited ? "1" : "0")
    });
    this.scormState.setState("PRIVATEMARK", sPathMark)
};
Course.prototype.updateNavigationForTracks = function()
{
    if (this.tracks.mapType == "Modules")
    {
        this.recursePageTreeFn(function(page, nCurrentLevel)
        {
            var pageState = page.pageState;
            pageState.isOptionalByTrackSelection = false;
            pageState.isOptional = pageState.isOptionalByTrackSelection || pageState.isOptionalByAuthor || pageState.isOptionalByObjectiveCompletion
        });
        for (var i = 0; i < this.tracks.items.length; i++)
        {
            if (!this.tracks.items[i].state.isSelected)
            {
                var aModules = this.tracks.items[i].modules.split(',');
                for (j = 0; j < aModules.length; j++)
                {
                    var nIndex = aModules[j] - 1;
                    try
                    {
                        var pageState = this.pageTree[nIndex].pageState;
                        pageState.isOptionalByTrackSelection = true;
                        pageState.isOptional = pageState.isOptionalByTrackSelection || pageState.isOptionalByAuthor || pageState.isOptionalByObjectiveCompletion
                    }
                    catch(e) {}
                }
            }
        }
        for (var i = 0; i < this.tracks.items.length; i++)
        {
            if (this.tracks.items[i].state.isSelected)
            {
                var aModules = this.tracks.items[i].modules.split(',');
                for (j = 0; j < aModules.length; j++)
                {
                    var nIndex = aModules[j] - 1;
                    try
                    {
                        var pageState = this.pageTree[nIndex].pageState;
                        pageState.isOptionalByTrackSelection = false;
                        pageState.isOptional = pageState.isOptionalByTrackSelection || pageState.isOptionalByAuthor || pageState.isOptionalByObjectiveCompletion
                    }
                    catch(e) {}
                }
            }
        }
        for (var i = 0; i < this.pageTree.length; i++)
        {
            if (this.pageTree[i].pageState.isOptionalByTrackSelection)
            {
                this.recursePagesFn(this.pageTree[i].pages, function(page, nCurrentLevel)
                {
                    var pageState = page.pageState;
                    pageState.isOptionalByTrackSelection = true;
                    pageState.isOptional = pageState.isOptionalByTrackSelection || pageState.isOptionalByAuthor || pageState.isOptionalByObjectiveCompletion
                }, 1)
            }
        }
    }
    else
    {
        for (var j = 0; j < this.objectives.length; j++)
        {
            this.objectives[j].IsRequiredByTrack = true
        }
        for (var i = 0; i < this.tracks.items.length; i++)
        {
            if (!this.tracks.items[i].state.isSelected)
            {
                var aObjectives = this.tracks.items[i].objectives.split(',');
                for (var j = 0; j < aObjectives.length; j++)
                {
                    var index = aObjectives[j] - 1;
                    try
                    {
                        this.objectives[index].IsRequiredByTrack = false
                    }
                    catch(e) {}
                }
            }
        }
        for (var i = 0; i < this.tracks.items.length; i++)
        {
            if (this.tracks.items[i].state.isSelected)
            {
                var aObjectives = this.tracks.items[i].objectives.split(',');
                for (var j = 0; j < aObjectives.length; j++)
                {
                    var index = aObjectives[j] - 1;
                    try
                    {
                        this.objectives[index].IsRequiredByTrack = true
                    }
                    catch(e) {}
                }
            }
        }
        this.recursePageTreeFn(function(page, nCurrentLevel)
        {
            if (page.objectives)
            {
                var pageState = page.pageState;
                pageState.isOptionalByTrackSelection = true;
                pageState.isOptional = true;
                var pageModule = page.getModule();
                if (pageModule && !pageModule.pageState.isOptionalByTrackSelection)
                {
                    pageModule.pageState.isOptionalByTrackSelection = true;
                    pageModule.pageState.isOptional = true
                }
            }
        });
        this.recursePageTreeFn(function(page, nCurrentLevel)
        {
            if (page.objectives)
            {
                var aObjectives = page.objectives.split(',');
                for (var j = 0; j < aObjectives.length; j++)
                {
                    var index = aObjectives[j] - 1;
                    try
                    {
                        if (page.course.objectives[index].IsRequiredByTrack)
                        {
                            var pageState = page.pageState;
                            pageState.isOptionalByTrackSelection = false;
                            pageState.isOptional = pageState.isOptionalByTrackSelection || pageState.isOptionalByAuthor || pageState.isOptionalByObjectiveCompletion;
                            break
                        }
                    }
                    catch(e) {}
                }
            }
            if (!page.pageState.isOptionalByTrackSelection)
            {
                var pageModule = page.getModule();
                if (pageModule && pageModule.pageState.isOptionalByTrackSelection)
                {
                    var pageModuleState = pageModule.pageState;
                    pageModuleState.isOptionalByTrackSelection = false;
                    pageModuleState.isOptional = pageModuleState.isOptionalByTrackSelection || pageModuleState.isOptionalByAuthor || pageModuleState.isOptionalByObjectiveCompletion
                }
            }
        })
    }
};
Course.prototype.getCompletedObjectivesCsv = function()
{
    var sObjectives = "";
    for (var i = 0; i < this.objectives.length; i++)
    {
        if (this.objectives[i].Complete)
        {
            if (sObjectives != "")
                sObjectives += ',';
            sObjectives += this.objectives[i].Id
        }
    }
    return sObjectives
};
Course.prototype.updateForAssessments = function()
{
    for (var i = 0; i < this.Assessments.length; i++)
    {
        if (this.Assessments[i].hasUnrequiredObjectives())
        {
            this.Assessments[i].resetScormData();
            this.Assessments[i].Initialized = false
        }
    }
};
Course.prototype.updateForObjectives = function()
{
    this.recursePageTreeFn(function(page, nCurrentLevel)
    {
        if (page.objectives)
        {
            var aObjectives = page.objectives.split(',');
            for (var j = 0; j < aObjectives.length; j++)
            {
                var index = aObjectives[j] - 1;
                try
                {
                    if (page.course.objectives[index].Complete)
                    {
                        var pageState = page.pageState;
                        pageState.isOptionalByObjectiveCompletion = true;
                        pageState.isOptional = pageState.isOptionalByTrackSelection || pageState.isOptionalByAuthor || pageState.isOptionalByObjectiveCompletion;
                        break
                    }
                }
                catch(e) {}
            }
        }
    })
};
Course.prototype.recursePageTreeFn = function(fn)
{
    for (var i = 0; i < this.pageTree.length; i++)
    {
        fn(this.pageTree[i], 1);
        if (this.pageTree[i].pages && this.pageTree[i].pages.length > 0)
        {
            this.recursePagesFn(this.pageTree[i].pages, fn, 2)
        }
    }
};
Course.prototype.recursePagesFn = function(pages, fn, nLevel)
{
    for (var i = 0; i < pages.length; i++)
    {
        fn(pages[i], nLevel);
        if (pages[i].pages && pages.length > 0)
        {
            this.recursePagesFn(pages[i].pages, fn, nLevel + 1)
        }
    }
};
Course.prototype.recursePrivatePageTreeFn = function(fn)
{
    for (var i = 0; i < this.privatePages.length; i++)
    {
        fn(this.privatePages[i], 1);
        if (this.privatePages[i].pages && this.privatePages[i].pages.length > 0)
        {
            this.recursePrivatePagesFn(this.privatePages[i].pages, fn, 2)
        }
    }
};
Course.prototype.recursePrivatePagesFn = function(pages, fn, nLevel)
{
    for (var i = 0; i < pages.length; i++)
    {
        fn(pages[i], nLevel);
        if (pages[i].pages && pages.length > 0)
        {
            this.recursePrivatePagesFn(pages[i].pages, fn, nLevel + 1)
        }
    }
};
var player = function()
    {
        jQuery.support.cors = true;
        this.course = new Course;
        this.ampVersion = "https://amp.azure.net/libs/amp/2.1.1/";
        this.course.observer.observe("courseCompleted", courseCompleted);
        this.course.observer.observe("pageStatusChanged", pageStatusChangedHandler);
        this.course.observer.observe("loCompleted", loCompletedHandler);
        this.courseController = new CourseController(this.course);
        this.pageAudioController = new AudioController(this.courseController, "PageLevelAudio");
        this.notifyUserView = new NotifyUserView(this.courseController);
        this.confirmUserView = new ConfirmUserView(this.courseController);
        this.contentsWidgetView = null;
        function courseCompleted(bCoursCompletedByTestOut)
        {
            termSCO();
            var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
            stmt.object = new ADL.XAPIStatement.Activity("course:" + course.buildId + ";", course.name);
            stmt.object.definition.type = "http://adlnet.gov/expapi/activities/course";
            stmt.result = {
                completion: course.scormState.isComplete, score: {scaled: course.scormState.getScore()}
            };
            ADL.XAPIWrapper.postMessage(stmt);
            if (course.settings.EmbeddedEvaluation == "ShowInModal" && course.settings.EvaluationForm && !bCoursCompletedByTestOut)
            {
                window.setTimeout(function()
                {
                    courseController.showEvaluationDialog(null, bCoursCompletedByTestOut, course.settings.EvaluationForm, course.settings.MustAnswerAllEvalQuestions, 2)
                }, 200)
            }
        }
        function loCompletedHandler(assessmentObjective)
        {
            if (assessmentObjective)
            {
                var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
                stmt.object = new ADL.XAPIStatement.Activity("course:" + course.buildId + ";learningobjective:" + assessmentObjective.Objective.Id + ";", assessmentObjective.Objective.Name);
                stmt.object.definition.type = "http://microsoft.com/expapi/aps/activities/learningobjective";
                var resultObj = new Object;
                resultObj.name = assessmentObjective.Objective.Name;
                resultObj.questionsTotal = assessmentObjective.QuestionOrder.length;
                resultObj.questionsAnswered = assessmentObjective.getQuestionsAnswered().length;
                resultObj.questionsToUse = assessmentObjective.QuestionsToUse;
                resultObj.questionsToAnswer = assessmentObjective.QuestionsToAnswer;
                resultObj.questionsCorrect = assessmentObjective.getQuestionsCorrect().length;
                resultObj.isRequiredByTrack = assessmentObjective.isRequiredByTrack();
                if (assessmentObjective.Assessment && assessmentObjective.Assessment.Page)
                    resultObj.assessmentPageId = assessmentObjective.Assessment.Page.id;
                if (assessmentObjective.Attempts.length)
                    resultObj.maxAttemptsCount = assessmentObjective.Attempts.length;
                resultObj.completion = true;
                stmt.result = resultObj;
                ADL.XAPIWrapper.postMessage(stmt)
            }
        }
        function pageStatusChangedHandler(page)
        {
            if (page.pageState.status == "P")
            {
                if (page.Assessment)
                {
                    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
                    stmt.object = new ADL.XAPIStatement.Activity("course:" + page.course.buildId + ";page:" + page.id + ";", page.name);
                    stmt.object.definition.type = "http://adlnet.gov/expapi/activities/assessment";
                    stmt.result = {
                        completion: page.Assessment.Status, type: page.Assessment.Type
                    };
                    ADL.XAPIWrapper.postMessage(stmt)
                }
                if (page.isModule)
                {
                    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
                    stmt.object = new ADL.XAPIStatement.Activity("course:" + page.course.buildId + ";module:" + page.moduleIndex + ";", page.name);
                    stmt.object.definition.type = "http://adlnet.gov/expapi/activities/module";
                    ADL.XAPIWrapper.postMessage(stmt)
                }
                else
                {
                    var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.completed);
                    stmt.object = new ADL.XAPIStatement.Activity("course:" + page.course.buildId + ";page:" + page.id + ";", page.name);
                    stmt.object.definition.type = "http://activitystrea.ms/schema/1.0/page";
                    ADL.XAPIWrapper.postMessage(stmt)
                }
            }
            var updateParent = false;
            win = window.parent;
            while ((win.parent != null) && (win.parent != win))
            {
                if (win.Content)
                    if (win.Content._updateParent)
                    {
                        updateParent = true;
                        break
                    }
                win = win.parent
            }
            if (updateParent && win.course)
            {
                var popupPageId = win.course.currentPopupPageId;
                if (popupPageId)
                {
                    if (window.playerAPI)
                    {
                        var remainingTime = window.playerAPI.course().getRemainingTime();
                        if (typeof(win.Content.setRemainingTime) == 'function')
                        {
                            win.Content.setRemainingTime(popupPageId, remainingTime)
                        }
                        if (this.course.scormState.isComplete && typeof(win.Content.setCourseCompleted) == 'function')
                        {
                            win.Content.setCourseCompleted(popupPageId)
                        }
                    }
                }
            }
        }
        function launch()
        {
            startSessionTime();
            course.isFirstLaunch = isFirstLaunch();
            if (course.isFirstLaunch)
            {
                if (getCompletionStatus() == "not attempted")
                    setCompletionStatus("incomplete");
                learnerWillReturn(true)
            }
            course.load(courseLoaded)
        }
        var courseLoaded = function()
            {
                removeLoading();
                var API = getAPI();
                var value = "";
                if (API == null)
                {
                    courseController.alert(Resources.SCORM_error)
                }
                else
                {
                    try
                    {
                        if (_sAPI == "API")
                        {
                            value = API.LMSGetValue("cmi.core.credit")
                        }
                        else
                        {
                            value = API.GetValue("cmi.credit")
                        }
                    }
                    catch(e) {}
                }
                if (value == "" || scormGetLastError() != "0")
                    courseController.alert(Resources.SCORM_error);
                highContrast();
                var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.initialized);
                stmt.object = new ADL.XAPIStatement.Activity("course:" + course.buildId + ";", course.name);
                stmt.object.definition.type = "http://adlnet.gov/expapi/activities/course";
                stmt.result = {completion: course.scormState.isComplete};
                ADL.XAPIWrapper.postMessage(stmt);
                $("#PlayerSRInstructions").html(Resources.ScreenReader_CourseIntro_Text);
                $('title').text('course window for ' + course.name);
                $('#Footer').attr('aria-label', Resources.Footer_Navigation_Label);
                courseController.transcriptView = new TranscriptView("TranscriptContainer", courseController);
                pageAudioController.transcriptView = courseController.transcriptView;
                var audioPlayerView = new AudioPlayerView(courseController, "PageLevelAudio");
                var contentView = new ContentView(courseController, pageAudioController);
                player.getContentView = function()
                {
                    return contentView
                };
                var bannerView = new BannerView(courseController);
                var contentsWidgetView = new ContentsWidgetView(courseController);
                var $footer = $("#Footer");
                $footer.after(contentsWidgetView.container);
                player.contentsWidgetView = contentsWidgetView;
                if (course.settings.HideHeader)
                    courseController.hideHeader();
                if (course.settings.HideFooter)
                    courseController.hideFooter();
                else
                    $footer.append(new NavBarView(courseController));
                $footer.before(audioPlayerView);
                if (course.isFirstLaunch && course.settings.EmbeddedEvaluation == "ShowInModal" && course.settings.EvaluationFormPre)
                    courseController.showEvaluationDialog(null, false, course.settings.EvaluationFormPre, course.settings.MustAnswerAllEvalQuestionsPre, 1);
                if (course.settings.hasTracks && course.tracks.canUserSelect && course.isFirstLaunch)
                {
                    courseController.showTracksDialog()
                }
                else
                {
                    courseController.course.navigationStarted = true;
                    courseController.navigateToStartupPage()
                }
                course.observer.fire("pageNavigationLoaded");
                $(window).trigger('resize');
                $(document.body).focus();
                var msSCORMJQuery;
                try
                {
                    if (parent.parent.$)
                    {
                        msSCORMJQuery = parent.parent.$
                    }
                }
                catch(e) {}
                if (msSCORMJQuery)
                {
                    msSCORMJQuery('.learn-footer a').on('focus', function()
                    {
                        msSCORMJQuery('.learn-footer').css('z-index', 10000)
                    });
                    msSCORMJQuery('.learn-footer a').on('blur', function()
                    {
                        msSCORMJQuery('.learn-footer').css('z-index', 0)
                    })
                }
            };
        function removeLoading()
        {
            $('#divLoading').remove();
            $('#styleLoading').remove()
        }
        var sizeWidget = function()
            {
                $(".ContentsWidget").css("font-size", $(".ContentsWidget").width() / 140 + "em");
                $("#TranscriptContainer").find("iframe").contents().find('body').css("font-size", $(".ContentsWidget").width() / 240 + "em")
            };
        function highContrast()
        {
            var hcPreviouslySet = false;
            var hcPreviousColorScheme = "";
            if (this.course.settings.HighContrastModeActive)
            {
                hcPreviouslySet = true;
                this.course.settings.HighContrastModeActive = false;
                hcPreviousColorScheme = this.course.settings.HighContrastColorScheme
            }
            var options = {
                    divId: 'jQueryHighContrastDetection', image: 'Player/theme/neutral/images/i.normal.png', styleSheet: 'Player/css/highcontrast.css', styleSheetCustom: 'Custom/css/highcontrast.css'
                };
            var hcDetect = jQuery('<div id ="' + options.divId + '"></div>').css({
                    background: 'url("' + options.image + '")', width: '0px', height: '0px'
                });
            hcDetect.appendTo(document.body);
            hcDetect.css('background-color', 'rgb(255, 0, 0)');
            if (hcDetect.css('background-image') == 'none')
            {
                if (!hcPreviouslySet)
                {
                    $('head').append('<link rel="stylesheet" href="' + options.styleSheet + '" type="text/css"/>');
                    $('head').append('<link rel="stylesheet" href="' + options.styleSheetCustom + '" type="text/css"/>')
                }
                this.course.settings.HighContrastModeActive = true
            }
            if (hcDetect.css('background-color') == 'rgb(0, 0, 0)')
            {
                this.course.settings.HighContrastModeActive = true;
                this.course.settings.HighContrastColorScheme = 'whiteonblack'
            }
            if (hcDetect.css('background-color') == 'rgb(255, 255, 255)')
            {
                this.course.settings.HighContrastModeActive = true;
                this.course.settings.HighContrastColorScheme = 'blackonwhite'
            }
            $('#' + options.divId).remove();
            if (hcPreviouslySet && !this.course.settings.HighContrastModeActive)
            {
                courseController.course.scormState.save();
                courseController.course.language.reloading = true;
                window.location.reload()
            }
            else
            {
                if (this.course.settings.HighContrastModeActive)
                {
                    if (!hcPreviouslySet)
                    {
                        if (this.course.settings.HighContrastColorScheme == "blackonwhite")
                        {
                            $('html').removeClass('light_theme').addClass('light_theme').addClass('blackonwhite')
                        }
                        else
                        {
                            $('html').removeClass('light_theme').addClass('whiteonblack')
                        }
                        this.course.navigateToPage(this.course.currentPageIndex)
                    }
                    else
                    {
                        if (hcPreviousColorScheme != this.course.settings.HighContrastColorScheme)
                        {
                            if (this.course.settings.HighContrastColorScheme == "blackonwhite")
                            {
                                $('html').removeClass('whiteonblack').removeClass('light_theme').addClass('light_theme').addClass('blackonwhite')
                            }
                            else
                            {
                                $('html').removeClass('blackonwhite').removeClass('light_theme').addClass('whiteonblack')
                            }
                            this.course.navigateToPage(this.course.currentPageIndex)
                        }
                    }
                }
                setTimeout(highContrast, 15000)
            }
        }
        function getZoomLevel()
        {
            try
            {
                if (window.screen.deviceXDPI != undefined && window.screen.logicalXDPI != undefined)
                    return window.screen.deviceXDPI / window.screen.logicalXDPI;
                else
                    return 1
            }
            catch(e)
            {
                return 1
            }
        }
        handleResize = function()
        {
            if (!document.getElementById("quickLinksButton"))
            {
                setTimeout(handleResize, 10);
                return
            }
            if (window.innerHeight < 600)
            {
                if (!views.utils.movedHeaderItems)
                {
                    var f = $("#Footer");
                    $("#quickLinksButton").detach().prependTo(f);
                    $("#quickLinksContainer").detach().prependTo(f);
                    f.toggleClass("shortPlayer");
                    $("#Header").toggleClass("shortPlayer");
                    $("#Main").toggleClass("shortPlayer");
                    $(".ContentsWidgetContainer").toggleClass("shortPlayer");
                    $("#PageLevelAudio").toggleClass("shortPlayer");
                    $(".InfoMetroButton").detach().prependTo(f);
                    var ql = $("#quickLinks");
                    $("#progressWidget").detach().prependTo(ql);
                    $("#progressWidget").attr("tabindex", "-1");
                    ql.prepend("<div class='footerCourseName'>" + course.name + "</div>");
                    views.utils.movedHeaderItems = true
                }
            }
            else
            {
                if (views.utils.movedHeaderItems)
                {
                    var h = $("#headerLinksContainer");
                    h.before($("#quickLinksContainer").detach());
                    h.before($("#quickLinksButton").detach());
                    $("#Footer").toggleClass("shortPlayer");
                    $("#Header").toggleClass("shortPlayer");
                    $("#Main").toggleClass("shortPlayer");
                    $(".ContentsWidgetContainer").toggleClass("shortPlayer");
                    $("#PageLevelAudio").toggleClass("shortPlayer");
                    $("#pageName").after($("#progressWidget"));
                    $("#progressWidget").attr("tabindex", "0");
                    $(".InfoMetroButton").detach().prependTo($(".menuButtons"));
                    $(".footerCourseName").remove();
                    views.utils.movedHeaderItems = false
                }
            }
            views.utils.sizeDialog($('.ui-dialog-content'));
            sizeWidget()
        };
        $(document).ready(function()
        {
            getEmbedWindow();
            views.utils.movedHeaderItems = false;
            $(window).bind('resize', function()
            {
                handleResize()
            });
            launch();
            $(document).on("dialogopen", ".ui-dialog-content", function()
            {
                var stmt = new ADL.XAPIStatement(ADL.XAPIWrapper.Agent, ADL.verbs.experienced);
                stmt.object = new ADL.XAPIStatement.Activity("course:" + course.buildId + ";dialog:" + $(this).attr('id') + ";", $(this).attr('id'));
                stmt.object.definition.type = "http://activitystrea.ms/schema/1.0/page";
                stmt.result = {dialog: $(this).attr('id')};
                ADL.XAPIWrapper.postMessage(stmt)
            })
        });
        window.onunload = function()
        {
            termSCO();
            if (window.external && window.external.CloseCDLauncher)
                window.external.CloseCDLauncher()
        };
        function generateReportProblemEmail()
        {
            var sEmailNewLine = " %0D%0A";
            var emailBodyText = encodeURIComponent(Resources.ReportProblem_EmailBody_Text);
            emailBodyText += sEmailNewLine + sEmailNewLine + "-------------------------------------------------" + sEmailNewLine;
            var toAddresses = Resources.ReportProblem_APSTeam_EmailAlias;
            var subject = encodeURIComponent(Resources.ReportProblem_EmailSubject_Text.replace(/%%courseName%%/g, course.name).replace(/%%buildId%%/g, course.buildId));
            var href = "mailto:" + toAddresses + "?" + "subject=" + subject + "&" + "body=" + emailBodyText;
            var wndMail = open(href, "_blank", "scrollbars=yes,resizable=yes,width=10,height=10");
            if (wndMail)
                wndMail.close()
        }
        function generateUnifiedUrlEmail()
        {
            var emailBodyText = encodeURIComponent(Resources.ShareCourseUrl_EmailBody.replace(/%%courseName%%/g, course.name).replace(/%%courseURL%%/g, top.location.href));
            var toAddresses = "";
            var subject = encodeURIComponent(Resources.ShareCourseUrl_EmailSubject.replace(/%%courseName%%/g, course.name));
            var href = "mailto:" + toAddresses + "?" + "subject=" + subject + "&" + "body=" + emailBodyText;
            var wndMail = open(href, "_blank", "scrollbars=yes,resizable=yes,width=10,height=10");
            if (wndMail)
                wndMail.close()
        }
        function showHelpDeskInfo()
        {
            var w = 650,
                h = 480;
            var clipboardWindow = open(course.getPopupsFolderPath() + '__Help_Desk_Info.htm', 'helpDeskInfo', 'width=650,height=500,scrollbars=yes,resizable=yes,top=' + ((screen.availHeight / 2) - (h / 2)) + ',left=' + ((screen.availWidth / 2) - (w / 2)));
            clipboardWindow.focus()
        }
        function getHelpDeskCourseInfo()
        {
            var sNewLine = "\n";
            var info = "cmi.suspend_data = " + course.scormState.getSuspendData() + sNewLine + "internal.suspend_data = " + course.scormState.calcSuspendData() + sNewLine + "cmi.core.student_name = " + course.scormState.getLearnerName() + sNewLine + "cmi.core.lesson_location = " + course.scormState.getScormBookmark() + sNewLine + "internal.lesson_location = " + course.scormState.getBookmark() + sNewLine + "cmi.core.score.raw = " + course.scormState.getScore() + sNewLine + "cmi.core.total_time = " + course.scormState.getTotalTime() + sNewLine + "cmi.core.student_id = " + course.scormState.getLearnerId() + sNewLine + sNewLine + "window.location.href = " + window.location.href + sNewLine + "Course Name = " + course.name + sNewLine + "navigator.userAgent = " + navigator.userAgent + sNewLine + "Mode = " + (course.inOfflinePlayer() == true ? "offline" : "online") + sNewLine + "Date/time = " + dateToTimestamp(new Date) + sNewLine + "Current Page Type Id = " + course.scormState.getBookmark() + sNewLine + "Player Version = " + _sVersion + sNewLine;
            return info
        }
        function helpDeskInfoPopupLoaded(popup)
        {
            var sNewLine = "\n";
            var body = "cmi.suspend_data = " + course.scormState.getSuspendData() + sNewLine + "internal.suspend_data = " + course.scormState.calcSuspendData() + sNewLine + "cmi.core.student_name = " + course.scormState.getLearnerName() + sNewLine + "cmi.core.lesson_location = " + course.scormState.getScormBookmark() + sNewLine + "internal.lesson_location = " + course.scormState.getBookmark() + sNewLine + "cmi.core.score.raw = " + course.scormState.getScore() + sNewLine + "cmi.core.total_time = " + course.scormState.getTotalTime() + sNewLine + "cmi.core.student_id = " + course.scormState.getLearnerId() + sNewLine + sNewLine + "window.location.href = " + window.location.href + sNewLine + "Course Name = " + course.name + sNewLine + "navigator.userAgent = " + navigator.userAgent + sNewLine + "Mode = " + (course.inOfflinePlayer() == true ? "offline" : "online") + sNewLine + "Date/time = " + dateToTimestamp(new Date) + sNewLine + "Current Page Type Id = " + course.scormState.getBookmark() + sNewLine + "Player Version = " + _sVersion + sNewLine;
            popup.document.getElementById("courseInfoTextArea").value = body
        }
        return {
                courseController: courseController, pageAudioController: pageAudioController, notifyUserView: notifyUserView, confirmUserView: confirmUserView, hookAPI: function(callback)
                    {
                        courseController.course.observer.observe("pageNavigationLoaded", function()
                        {
                            callback(playerAPI)
                        })
                    }, generateReportProblemEmail: generateReportProblemEmail, generateUnifiedUrlEmail: generateUnifiedUrlEmail, showHelpDeskInfo: showHelpDeskInfo, getHelpDeskCourseInfo: getHelpDeskCourseInfo, helpDeskInfoPopupLoaded: helpDeskInfoPopupLoaded, ampVersion: ampVersion
            }
    }();
var _bExitButtonClicked = false;
function handleOnBeforeUnload(pEvtObj)
{
    _bSilentExit = _embedWindow != null;
    if (!_bSilentExit && !_bExitButtonClicked)
    {
        var course = player.courseController.course;
        if (!courseController.course.scormState.isComplete)
        {
            var cPage = course.pageNavigation[course.currentPageIndex];
            if (cPage && cPage.Assessment && cPage.Assessment.IntervalTimer && !cPage.Assessment.isCompleted())
                return Resources.Timer_NavigateAway_Text;
            if (course.settings.DisplayExitIncompleteMsg)
            {
                var msg = Resources.CloseCourse_NotComplete_Text;
                try
                {
                    if (course.settings.courseDataService && !pEvtObj)
                        msg += '<p><u><a href="#" onclick="player.generateUnifiedUrlEmail();return false;">' + Resources.ShareCourseUrl_Link + '</a></u></p>'
                }
                catch(e) {}
                if (!course.language.reloading)
                {
                    return msg
                }
            }
        }
        else
        {
            if (!player.courseController.isLMSFree() && course.settings.DisplayExitCompleteMsg)
                return Resources.CloseCourse_Complete_Text
        }
    }
}
window.onbeforeunload = handleOnBeforeUnload;
_embedWindow = null;
function getEmbedWindow()
{
    _embedWindow = null;
    try
    {
        var win = window.parent;
        while (win != null)
        {
            if (win.document.getElementById("apEmbedCourseframe"))
            {
                _embedWindow = win;
                return _embedWindow
            }
            if (win.parent == win)
                break;
            win = win.parent
        }
    }
    catch(e)
    {
        _embedWindow = win
    }
    if (window.CheckRGHosted && CheckRGHosted())
    {
        _embedWindow = null;
        return _embedWindow
    }
    return _embedWindow
}
function containerWantsToClose()
{
    termSCO()
}
var _bTerminated = false;
function termSCO()
{
    if (!_bTerminated)
    {
        _bTerminated = true;
        player.courseController.termScormCommunications()
    }
}
function doKeyDown(e)
{
    var ver = parseFloat(navigator.appVersion.slice(0, 4));
    var verIE = (navigator.appName == "Microsoft Internet Explorer" ? ver : 0.0);
    var isMSIE = (verIE >= 4.0);
    var myKeyCode = (!isMSIE) ? e.which : e.keyCode;
    var mySrcElement = (!isMSIE) ? e.target : e.srcElement;
    var isShiftPressed = e.shiftKey;
    var isCtrlPressed = e.ctrlKey;
    var isAltPressed = e.altKey;
    if (myKeyCode == 9)
    {
        var iContentPopup = $("#ContentsPopupDialog");
        var iframeContent = $("#Content");
        var iframeAssessment = $("#Assessment");
        var activeFrame = null;
        if (iContentPopup.children().length > 0)
        {
            activeFrame = iContentPopup.contents();
            activeFrame.isPopup = true;
            activeFrame.elem = iContentPopup.get()
        }
        else if (iframeContent.contents().find("body").children().length > 0)
        {
            activeFrame = iframeContent.contents();
            activeFrame.elem = iframeContent.get();
            activeFrame.isPopup = false
        }
        else
        {
            activeFrame = iframeAssessment.contents();
            activeFrame.elem = iframeAssessment.get();
            activeFrame.isPopup = false
        }
        determineType(activeFrame);
        if (activeFrame.firstItem.length == 0)
        {
            return
        }
        if (isShiftPressed)
        {
            if (e.target == activeFrame.firstItem.get()[0] && activeFrame.headerDestination != null)
            {
                e.preventDefault();
                e.stopPropagation();
                activeFrame.headerDestination.focus()
            }
            else
            {
                console.log("should be allowed to go someplace.");
                if ((activeFrame.isPopup) && (e.target == activeFrame.headerDestination.get()[0]))
                {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(function()
                    {
                        activeFrame.lastItem.focus()
                    }, 100)
                }
            }
        }
        else
        {
            if (activeFrame.headerDestination && activeFrame.headerDestination.get()[0] == e.target)
            {
                console.log("caught the last item in header");
                if (activeFrame.firstItem)
                {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(function()
                    {
                        activeFrame.firstItem.focus()
                    }, 100)
                }
                else
                {}
            }
            else if (activeFrame.isPopup && (e.target == activeFrame.lastItem.get()[0]))
            {
                if (activeFrame.headerDestination)
                {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeout(function()
                    {
                        activeFrame.headerDestination.focus()
                    }, 100)
                }
            }
            else if ((e.target.nodeName.toUpperCase() == "BODY" && !$(":first-child", e.target).attr("id") == "container") || e.target.nodeName.toUpperCase() == "IFRAME" || e.target.className == "ContentsPopupIframeContainer")
            {
                if (activeFrame.firstItem)
                {
                    e.preventDefault();
                    e.stopPropagation();
                    activeFrame.firstItem.focus()
                }
                else
                {}
            }
        }
    }
    if (myKeyCode == 17 && myKeyCode <= 20)
        return true;
    if (isCtrlPressed && isAltPressed)
    {
        if (myKeyCode == 66)
        {
            $('#PreviousMetroButton').trigger('click')
        }
        else if (myKeyCode == 78)
        {
            $('#NextMetroButton').trigger('click')
        }
        else if (myKeyCode == 88)
        {
            if (_embedWindow && _embedWindow.parent && _embedWindow.parent.playerAPI)
                _embedWindow.parent.playerAPI.course().closeContentPopup();
            $('#exitButton').trigger('click')
        }
        else if (myKeyCode == 75)
        {
            var page = courseController.course.getCurrentPage();
            switch (page.pageType.PlaybackSource)
            {
                case"KnowledgeCheck":
                case"PostTest":
                case"StandAloneAssessment":
                case"StandAloneQuestion":
                    $('div#Assessment').focus();
                    break;
                case"Branching":
                    $('div#Branching').focus();
                    break;
                default:
                    $('iframe#Content').focus();
                    break
            }
        }
        else if (myKeyCode == 77)
        {
            e.preventDefault();
            e.stopPropagation();
            if (courseController.activeVideoController)
                courseController.activeVideoController.toggleMute();
            else if ($('#AssessmentFeedbackDialog').dialog('isOpen') == true)
                AssessmentFeedbackDialogView.getAudioController().toggleMute();
            else if (courseController.contentPopupView && courseController.contentPopupView.getCurrentPage() && courseController.contentPopupView.getAudioController())
                courseController.contentPopupView.getAudioController().toggleMute();
            else if (!this.pageAudioController.hidden)
                this.pageAudioController.toggleMute()
        }
        else if (myKeyCode == 37 || myKeyCode == 188)
        {
            if (courseController.activeVideoController)
                courseController.activeVideoController.setCurrentTime(-30);
            else if ($('#AssessmentFeedbackDialog').dialog('isOpen') == true)
                AssessmentFeedbackDialogView.getAudioController().setCurrentTime(-30);
            else if (courseController.contentPopupView && courseController.contentPopupView.getCurrentPage() && courseController.contentPopupView.getAudioController())
                courseController.contentPopupView.getAudioController().setCurrentTime(-30);
            else if (!this.pageAudioController.hidden)
                this.pageAudioController.setCurrentTime(-30)
        }
        else if (myKeyCode == 39 || myKeyCode == 190)
        {
            if (courseController.activeVideoController)
                courseController.activeVideoController.setCurrentTime(30);
            else if ($('#AssessmentFeedbackDialog').dialog('isOpen') == true)
                AssessmentFeedbackDialogView.getAudioController().setCurrentTime(30);
            else if (courseController.contentPopupView && courseController.contentPopupView.getCurrentPage() && courseController.contentPopupView.getAudioController())
                courseController.contentPopupView.getAudioController().setCurrentTime(30);
            else if (!this.pageAudioController.hidden)
                this.pageAudioController.setCurrentTime(30)
        }
        else if (myKeyCode == 38 || myKeyCode == 76)
        {
            var raiseTo = 0;
            if (course.volume >= 90)
            {
                raiseTo = 100
            }
            else
            {
                raiseTo = course.volume + 10
            }
            if (courseController.activeVideoController)
                courseController.activeVideoController.setVolume(raiseTo);
            else if ($('#AssessmentFeedbackDialog').dialog('isOpen') == true)
                AssessmentFeedbackDialogView.getAudioController().volumeChanged(raiseTo);
            else if (courseController.contentPopupView && courseController.contentPopupView.getCurrentPage() && courseController.contentPopupView.getAudioController())
                courseController.contentPopupView.getAudioController().volumeChanged(raiseTo);
            else if (!this.pageAudioController.hidden)
                this.pageAudioController.volumeChanged(raiseTo)
        }
        else if (myKeyCode == 40 || myKeyCode == 83)
        {
            var lowerTo = 0;
            if (course.volume <= 10)
            {
                lowerTo = 0
            }
            else
            {
                lowerTo = course.volume - 10
            }
            if (courseController.activeVideoController)
                courseController.activeVideoController.setVolume(lowerTo);
            else if ($('#AssessmentFeedbackDialog').dialog('isOpen') == true)
                AssessmentFeedbackDialogView.getAudioController().volumeChanged(lowerTo);
            else if (courseController.contentPopupView && courseController.contentPopupView.getCurrentPage() && courseController.contentPopupView.getAudioController())
                courseController.contentPopupView.getAudioController().volumeChanged(lowerTo);
            else if (!this.pageAudioController.hidden)
                this.pageAudioController.volumeChanged(lowerTo)
        }
        else if (myKeyCode == 80)
        {
            if (courseController.activeVideoController)
                courseController.activeVideoController.togglePlay();
            else if ($('#AssessmentFeedbackDialog').dialog('isOpen') == true)
                AssessmentFeedbackDialogView.getAudioController().togglePlay();
            else if (courseController.contentPopupView && courseController.contentPopupView.getCurrentPage() && courseController.contentPopupView.getAudioController())
                courseController.contentPopupView.getAudioController().togglePlay();
            else if (!this.pageAudioController.hidden)
                this.pageAudioController.togglePlay()
        }
        else if (myKeyCode == 82)
        {
            if (courseController.activeVideoController)
            {
                try
                {
                    courseController.activeVideoController.focusToAudioDescription()
                }
                catch(e) {}
            }
        }
        else if (myKeyCode == 90)
        {
            if (window.toggleDebug)
                toggleDebug()
        }
        else if (myKeyCode == 68)
        {
            if (course.settings.ShowVideoDescriptions)
            {
                course.settings.ShowVideoDescriptions = false;
                courseController.screenReaderAlert("Audio descriptions off")
            }
            else
            {
                course.settings.ShowVideoDescriptions = true;
                courseController.screenReaderAlert("Audio descriptions on")
            }
        }
        else if (myKeyCode == 90)
        {
            if (window.toggleDebug)
                toggleDebug()
        }
    }
    else if (myKeyCode == 27)
    {
        if ($('.ui-dialog:visible').length === 0 && $('#BranchingFeedbackContentView').is(':visible'))
        {
            $('.BranchingDialogClose', '#BranchingFeedbackContentView').trigger('click')
        }
    }
}
function showPageLinks()
{
    return courseController.showPageLinks()
}
initCommunications();
var iSIpmCommonInitialized = false;
var useIpm = false;
ADL.XAPIWrapper.Agent = new ADL.XAPIStatement.Agent('mailto:' + getLearnerId(), getLearnerName());
ADL.XAPIWrapper.postMessage = function(stmt)
{
    var sJSON = JSON.stringify(stmt);
    _embedWindow && _embedWindow.postMessage(sJSON, "*");
    var useIpm = false;
    if (!iSIpmCommonInitialized)
    {
        iSIpmCommonInitialized = true;
        if (parent.courseDataService)
        {
            var alias = parent.courseDataService.Alias
        }
        else
        {
            var alias = ""
        }
        ipmCommon.init({
            userAlias: alias, enableLogging: true, applicationId: 41
        })
    }
    if (stmt.isIpm && useIpm)
    {
        trendsService.submitAnalytics({
            requestItem: stmt.object.id, actionId: stmt.ipmActionId, requestUrl: '', requestDescription: stmt.ipmRequestDescription, responseTime: ''
        })
    }
    for (var i = 0; i < course.settings.ApiLinks.length; i++)
    {
        var apiLink = course.settings.ApiLinks[i];
        if (!apiLink.IsActive)
            continue;
        var apiLinkFrame = $('#' + apiLink.Id + "Frame");
        if (!apiLinkFrame.length)
        {
            apiLinkFrame = $('<iframe name="' + apiLink.Id + 'Frame" id="' + apiLink.Id + 'Frame" style="display:none;"></iframe>').appendTo("body");
            apiLinkFrame.load(function()
            {
                this.contentWindow.postMessage(sJSON, "*")
            });
            apiLinkFrame.attr("src", apiLink.Url)
        }
        else
        {
            apiLinkFrame.get(0).contentWindow.postMessage(sJSON, "*")
        }
    }
};
function closeCourse()
{
    _bExitButtonClicked = true;
    if (typeof(window.external) != 'undefined' && typeof(window.external.notify) != 'undefined' && parent.sendDataToApp)
    {
        parent.sendDataToApp("courseExit")
    }
    else if (window.courseWantsToClose)
    {
        termSCO();
        courseWantsToClose()
    }
    else
    {
        top.close();
        window.location.replace("about:blank")
    }
}
function determineType(activeFrame)
{
    var firstItem;
    var headerDestination;
    var lastItem;
    if (activeFrame.isPopup)
    {
        activeFrame.headerDestination = $(".ui-dialog-titlebar :tabbable").last();
        if (activeFrame.headerDestination.length == 0)
            activeFrame.headerDestination = null;
        if ($(".ContentsPopupIframeContainer").is(":visible"))
        {
            activeFrame.firstItem = $("iframe", activeFrame).contents().find(":tabbable").first();
            activeFrame.lastItem = $("iframe", activeFrame).contents().find(":tabbable").last()
        }
        else if ($("#ContentsPopupAssessment").is(":visible"))
        {
            activeFrame.firstItem = $("#ContentsPopupAssessment").contents().find(":tabbable").first();
            activeFrame.lastItem = $("#ContentsPopupAssessment").contents().find(":tabbable").last()
        }
    }
    else
    {
        if ($("#Header").is(":visible"))
        {
            activeFrame.headerDestination = $("#Header :tabbable").last()
        }
        if ($("#Assessment").is(":visible"))
        {
            activeFrame.firstItem = $(":tabbable", activeFrame).first()
        }
        else if ($("#Branching").is(":visible"))
        {
            console.log("assessment page is showing")
        }
        else
        {
            console.log("content showing");
            activeFrame.firstItem = $(activeFrame).contents().find(":tabbable").first()
        }
    }
}
var playerAPI = playerAPI || new PlayerAPI;
function PlayerAPI()
{
    var cc = function()
        {
            return player.courseController
        };
    var getLogicalPageId = function(id)
        {
            return id == null ? 0 : id == "test-out" ? -1 : id
        };
    var getActualPageId = function(id)
        {
            return id == 0 ? null : id == -1 ? "test-out" : id
        };
    var hookAPI = function(callback)
        {
            callback(this)
        };
    return {
            objectType: function()
            {
                return "player"
            }, version: function()
                {
                    return _sVersion
                }, learner: function()
                {
                    return {
                            name: function()
                            {
                                return cc().course.scormState.getLearnerName()
                            }, id: function()
                                {
                                    return cc().course.scormState.getLearnerId()
                                }
                        }
                }, ui: function()
                {
                    return {
                            progressTile: function()
                            {
                                return new ProgressTileView(cc())
                            }, testOutTile: function()
                                {
                                    return cc().course.testOutPage ? new TestOutTileView(cc()) : null
                                }, downloadTranscriptTile: function()
                                {
                                    return cc().course.settings.CourseTranscript ? new DownloadTranscriptTileView(cc()) : null
                                }, changeTracksTile: function()
                                {
                                    return cc().course.settings.hasTracks && cc().course.tracks.canUserSelect ? new ChangeTracksTileView(cc()) : null
                                }, changeLanguagesTile: function()
                                {
                                    return cc().course.language.count > 1 ? new ChangeLanguagesTileView(cc()) : null
                                }, communityTile: function()
                                {
                                    return cc().course.settings.DiscussionLink ? new CommunityTileView(cc()) : null
                                }, resourcesTile: function()
                                {
                                    return cc().course.settings.ShowResources ? new ResourcesTileView(cc()) : null
                                }, glossaryTile: function()
                                {
                                    return cc().course.settings.ShowGlossary ? new GlossaryTileView(cc()) : null
                                }, helpTile: function()
                                {
                                    return new HelpTileView(cc())
                                }, contentsTile: function()
                                {
                                    return new ContentsTileView(cc())
                                }
                        }
                }, course: function()
                {
                    return {
                            objectType: function()
                            {
                                return "course"
                            }, player: function()
                                {
                                    return playerAPI
                                }, name: function()
                                {
                                    return cc().course.name
                                }, isFirstLaunch: function()
                                {
                                    return cc().isOnline()
                                }, isOnline: function()
                                {
                                    return cc().isOnline()
                                }, currentPage: function()
                                {
                                    return new CoursePage(this, cc().course.currentPageIndex, false)
                                }, nextRequiredPage: function()
                                {
                                    var p = cc().course.getNextRequiredPage();
                                    return p ? this.getPageById(p.id) : null
                                }, nextRequiredModule: function()
                                {
                                    var m = cc().course.getNextRequiredModule();
                                    return m ? new CourseModule(this, m.moduleIndex) : null
                                }, pageVisibleTree: function()
                                {
                                    return cc().course.pageTree
                                }, privatePages: function()
                                {
                                    return cc().course.privatePages
                                }, modules: function()
                                {
                                    var pmods = cc().course.modules;
                                    var mods = [];
                                    for (var i = 0; i < pmods.length; i++)
                                    {
                                        mods[i] = new CourseModule(this, i)
                                    }
                                    return mods
                                }, pageNavigation: function()
                                {
                                    return cc().course.pageNavigation
                                }, pageTypes: function()
                                {
                                    return cc().course.pageTypesArray
                                }, pageLinks: function()
                                {
                                    return cc().course.pageLinkArray
                                }, testOutPage: function()
                                {
                                    return cc().course.testOutPage
                                }, language: function()
                                {
                                    return cc().course.language
                                }, objectives: function()
                                {
                                    return cc().course.objectives
                                }, assessments: function()
                                {
                                    return cc().course.assessments
                                }, volume: function()
                                {
                                    return cc().course.volume
                                }, settings: function()
                                {
                                    return cc().course.settings
                                }, eventObserver: function()
                                {
                                    return cc().course.observer
                                }, tracks: function()
                                {
                                    return cc().course.tracks
                                }, hasTracks: function()
                                {
                                    return cc().course.tracks ? true : false
                                }, contentPath: function()
                                {
                                    return cc().course.getContentFolderPath()
                                }, currentLanguagePath: function()
                                {
                                    return cc().course.getCurrentLanguageFolderPath()
                                }, mediaPath: function()
                                {
                                    return cc().course.getMediaFolderPath()
                                }, imagePath: function()
                                {
                                    return cc().course.getImagesFolderPath()
                                }, data: function()
                                {
                                    var dataTag = "u_";
                                    return {
                                            getValue: function(name)
                                            {
                                                return cc().course.scormState.getState(dataTag + name)
                                            }, setValue: function(name, value)
                                                {
                                                    cc().course.scormState.setState(dataTag + name, value);
                                                    return cc().course.scormState.save()
                                                }, clearValue: function(name)
                                                {
                                                    cc().course.scormState.setState(dataTag + name, null);
                                                    return cc().course.scormState.save()
                                                }
                                        }
                                }, bookmark: function()
                                {
                                    return cc().course.scormState.getRestorePoint()
                                }, getPageById: function(id)
                                {
                                    var inx = null;
                                    var private = false;
                                    var pageNav = cc().course.pageNavigation;
                                    for (i in pageNav)
                                    {
                                        if (getLogicalPageId(pageNav[i].id) == id)
                                        {
                                            inx = i;
                                            break
                                        }
                                    }
                                    if (!inx)
                                    {
                                        var privatePages = cc().course.privatePages;
                                        for (i in privatePages)
                                        {
                                            if (privatePages[i] == id)
                                            {
                                                inx = i;
                                                private = true;
                                                break
                                            }
                                        }
                                    }
                                    if (inx)
                                        return new CoursePage(this, inx, private);
                                    return null
                                }, recursePageVisibleTreeFn: function(fn)
                                {
                                    return cc().course.recursePageTreeFn(fn)
                                }, recursePagesFn: function(pages, fn, nLevel)
                                {
                                    return cc().course.recursePages(pages, fn, nLevel)
                                }, getObjectiveById: function(id)
                                {
                                    return cc().course.getObjective(id)
                                }, getPoints: function(pageId)
                                {
                                    var coursePage = this.getPageById(pageId);
                                    if (coursePage)
                                        return coursePage.points();
                                    return 0
                                }, getTotalPoints: function(pageId)
                                {
                                    var coursePage = this.getPageById(pageId);
                                    if (coursePage)
                                    {
                                        var branchingGraph = coursePage.branchingGraph();
                                        if (branchingGraph)
                                            return branchingGraph.getTotalPoints()
                                    }
                                    return 0
                                }, navigateToPageByIndex: function(index)
                                {
                                    return cc().navigateToPage(index)
                                }, navigateToPageById: function(id)
                                {
                                    return cc().navigateToPageById(id)
                                }, navigateToNextPage: function()
                                {
                                    return cc().navigateToNextPage()
                                }, navigateToPreviousPage: function()
                                {
                                    return cc().navigateToPreviousPage()
                                }, navigateToWelcomePage: function()
                                {
                                    return cc().navigateToWelcomePage()
                                }, navigateToTestOut: function()
                                {
                                    return cc().navigateToTestOut()
                                }, navigateToStartupPage: function()
                                {
                                    return cc().navigateToStartupPage()
                                }, showTracksDialog: function()
                                {
                                    return cc().showTracksDialog()
                                }, showContentsDialog: function()
                                {
                                    return cc().showContentsDialog()
                                }, hideContentsDialog: function()
                                {
                                    return cc().hideContentsDialog()
                                }, showResourcesDialog: function()
                                {
                                    return cc().showResourcesDialog()
                                }, showHelpDialog: function()
                                {
                                    return cc().showHelpDialog()
                                }, showLanguageDialog: function()
                                {
                                    return cc().showLanguageDialog()
                                }, showGlossaryDialog: function()
                                {
                                    return cc().showGlossaryDialog()
                                }, showContentPopup: function(page, callback)
                                {
                                    return cc().showContentPopup(page, callback)
                                }, closeContentPopup: function()
                                {
                                    return cc().closeContentPopup()
                                }, showPageTranscriptView: function(page)
                                {
                                    return cc().showTranscriptView(page.getPageContentFolderPath() + "page_transcript.htm", true)
                                }, hidePageTranscriptView: function()
                                {
                                    return cc().hideContentPopup()
                                }, showCourseTranscriptView: function(location)
                                {
                                    return cc().showCourseTranscript(location)
                                }, showVideo: function(videoFileName, htmlElementId, context, observer, positionStateKey)
                                {
                                    return cc().showVideo(videoFileName, htmlElementId, context, observer, positionStateKey)
                                }, downloadCourse: function(nType)
                                {
                                    return cc().downloadCourse(nType)
                                }, hideContentsPanel: function()
                                {
                                    cc().course.settings.DisplayContentsWidget = false;
                                    return player.contentsWidgetView.hideContentsWidget()
                                }, showContentsPanel: function()
                                {
                                    return player.contentsWidgetView.showContentsWidget()
                                }, loadBookmark: function(restorePoint)
                                {
                                    cc().course.scormState.setRestorePoint(restorePoint);
                                    location.reload()
                                }, setTrackSelection: function(tracks)
                                {
                                    var course = cc().course;
                                    var sB = "";
                                    for (var i = 0; i < course.tracks.items.length; i++)
                                    {
                                        if (course.tracks.items[i].state.isSelected)
                                        {
                                            if (sB != "")
                                                sB += ',';
                                            sB += (i + 1)
                                        }
                                    }
                                    course.scormState.setState("TRACKS", sB);
                                    course.loadPageNavigation();
                                    course.updateForAssessments();
                                    if (!course.navigationStarted)
                                    {
                                        course.navigationStarted = true;
                                        courseController.navigateToStartupPage()
                                    }
                                }, getRemainingTime: function()
                                {
                                    var totalTime = 0;
                                    this.recursePageVisibleTreeFn(function(page, nCurrentLevel)
                                    {
                                        if (page.isRequired() && !page.isComplete())
                                            totalTime += page.time
                                    });
                                    return totalTime
                                }, hideHeader: function()
                                {
                                    return cc().hideHeader()
                                }, hideFooter: function()
                                {
                                    return cc().hideFooter()
                                }
                        }
                }, alert: function(message)
                {
                    cc().alert(message)
                }, confirm: function(message, callback, param)
                {
                    cc().confirm(message, callback, param)
                }, hook: function(callback)
                {
                    cc().course.observer.observe("pageNavigationLoaded", function()
                    {
                        callback(this)
                    })
                }
        }
}
function CourseModule(course, i)
{
    var cc = function()
        {
            return player.courseController
        };
    var getMod = function()
        {
            return cc().course.modules[i]
        };
    return {
            objectType: function()
            {
                return "module"
            }, course: function()
                {
                    return course
                }, name: function()
                {
                    return getMod().name
                }, index: function()
                {
                    return i
                }, number: function()
                {
                    return i + 1
                }, pages: function()
                {
                    var pss = [];
                    var ps = getMod().pages;
                    if (ps != null)
                    {
                        var pageNav = cc().course.pageNavigation;
                        for (var j = 0; j < ps.length; j++)
                        {
                            var private = false;
                            var pinx = null;
                            for (var i = 0; i < pageNav.length; i++)
                            {
                                if (pageNav[i].id == ps[j].id)
                                {
                                    pinx = i;
                                    break
                                }
                            }
                            if (!pinx)
                            {}
                            pss[j] = new CoursePage(course, pinx, private)
                        }
                    }
                    return pss
                }, data: function()
                {
                    var dataTag = "m" + i.toString() + "_";
                    return {
                            getValue: function(name)
                            {
                                return course.data.getValue(dataTag + name)
                            }, setValue: function(name, value)
                                {
                                    return course.data.setValue(dataTag + name, value)
                                }, clearValue: function(name)
                                {
                                    return course.data.clearValue()
                                }
                        }
                }, mustCompletePreviousModules: function()
                {
                    return getMod().mustCompletePrevModules
                }, modulesToComplete: function()
                {
                    return getMod().modulesToComplete
                }, mustCompleteRequiredPages: function()
                {
                    return getMod().mustCompleteRequiredPages
                }, toString: function()
                {
                    return "Module " + this.number + ": " + this.name
                }
        }
}
var enums = enums || new Enums;
function Enums()
{
    return {
            pageType: {
                none: '', passed: 'P', failed: 'F'
            }, pageStatus: {
                    none: '', passed: 'P', failed: 'F'
                }, pageContributionType: {
                    required: 'r', optional: 'o'
                }
        }
}
function stringToEnum(enumType, valueStr)
{
    var keys = Object.keys(enumType);
    for (var i = keys.length; i--; )
    {
        if (enumType[keys[i]].toUpperCase() == valueStr.toUpperCase())
            return keys[i]
    }
    return null
}
if (typeof Object.keys != 'function')
{
    Object.keys = function(obj)
    {
        if (typeof obj != "object" && typeof obj != "function" || obj == null)
        {
            throw TypeError("Object.keys called on non-object");
        }
        var keys = [];
        for (var p in obj)
            obj.hasOwnProperty(p) && keys.push(p);
        return keys
    }
}
function CoursePage(course, pinx, private)
{
    var videoController = null;
    var cc = function()
        {
            return player.courseController
        };
    var getPage = function()
        {
            var page = null;
            if (!private)
                page = cc().course.pageNavigation[pinx];
            else
                page = cc().course.privatePages[pinx];
            return page
        };
    var getModule = function()
        {
            var i = -1;
            var p = getPage();
            if (p)
            {
                var m = p.getModule();
                if (m)
                    i = m.moduleIndex
            }
            if (i < 0)
                return null;
            else
                return course.modules[i]
        };
    var getPageId = function()
        {
            var id = getPage().id;
            return id == null ? 0 : id == "test-out" ? -1 : id
        };
    return {
            objectType: function()
            {
                return "page"
            }, private: function()
                {
                    return private ? true : false
                }, module: function()
                {
                    return getModule()
                }, moduleIndex: function()
                {
                    return this.module ? this.module.index : -1
                }, id: function()
                {
                    return getPageId()
                }, name: function()
                {
                    return getPage().name
                }, data: function()
                {
                    var dataTag = "p" + this.id.toString() + "_";
                    return {
                            getValue: function(name)
                            {
                                return course.data.getValue(dataTag + name)
                            }, setValue: function(name, value)
                                {
                                    return course.data.setValue(dataTag + name, value)
                                }, clearValue: function(name)
                                {
                                    return course.data.clearValue()
                                }
                        }
                }, contributionType: function()
                {
                    return stringToEnum(enums.pageContributionType, getPage().contribute)
                }, pageType: function()
                {
                    return getPage().pageType
                }, pageState: function()
                {
                    return getPage().pageState
                }, branchingGraph: function()
                {
                    var page = getPage();
                    if (page)
                        return page.BranchingGraph;
                    return null
                }, points: function()
                {
                    var page = getPage();
                    if (page)
                        return page.points;
                    return 0
                }, bookmark: function()
                {
                    return course.bookmark
                }, parentPage: function()
                {
                    return getPage().parent
                }, pageFileName: function()
                {
                    return getPage().fileName
                }, pageFilePath: function()
                {
                    return getPage().getFilePath()
                }, contentPath: function()
                {
                    return getPage().getPageContentFolderPath()
                }, mediaPath: function()
                {
                    return course.mediaPath
                }, imagePath: function()
                {
                    return getPage().getKeyPointsImagesPath()
                }, isRequired: function()
                {
                    return getPage().isRequired()
                }, isComplete: function()
                {
                    return getPage().isComplete()
                }, video: function()
                {
                    return {
                            player: function()
                            {
                                return videoController ? videoController : new VideoController
                            }, settings: function()
                                {
                                    return {
                                            videoFileName: function()
                                            {
                                                return getPage().videoFiles[0].getFilePath()
                                            }, videoCaptionsFilePath: function()
                                                {
                                                    return getPage().getVideoCaptionsPath()
                                                }, keyPointsFilePath: function()
                                                {
                                                    return getPage().getKeyPointsPath()
                                                }, getClickToPlay: function()
                                                {
                                                    return getPage().videoFiles[0].videoClickToPlay
                                                }, setClickToPlay: function(value)
                                                {
                                                    getPage().videoFiles[0].videoClickToPlay = value
                                                }
                                        }
                                }
                        }
                }, audio: function()
                {
                    return {
                            player: function()
                            {
                                return parent.player.pageAudioController
                            }, settings: function()
                                {
                                    return {
                                            audioFileName: function()
                                            {
                                                return getPage().audioFile
                                            }, audioFilePath: function()
                                                {
                                                    return getPage().getFilePath()
                                                }, audioCaptionsFilePath: function()
                                                {
                                                    return getPage().getAudioCaptionsPath()
                                                }
                                        }
                                }
                        }
                }, isLocked: function()
                {
                    return getPage().pageState.isLocked
                }, isOptional: function()
                {
                    return getPage().pageState.isOptional
                }, isOptionalByAuthor: function()
                {
                    return getPage().pageState.isOptionalByAuthor
                }, isOptionalByObjectiveCompletion: function()
                {
                    return getPage().pageState.isOptionalByObjectiveCompletion
                }, isOptionalByTrackSelection: function()
                {
                    return getPage().pageState.isOptionalByTrackSelection
                }, isVisited: function()
                {
                    return getPage().pageState.isVisited
                }, status: function()
                {
                    return stringToEnum(enums.pageStatus, getPage().pageState.status)
                }, setComplete: function()
                {
                    return getPage().setComplete()
                }, setIncomplete: function()
                {
                    return getPage().setIncomplete()
                }, toString: function()
                {
                    return "Page " + this.id + ": " + this.name
                }
        }
}
function pageSerializationHelper(key, value)
{
    switch (key)
    {
        case"parentPage":
        case"module":
        case"player":
            return undefined;
        default:
            return value
    }
}
function moduleSerializationHelper(key, value)
{
    switch (key)
    {
        case"course":
            return undefined;
        default:
            switch (value.objectType)
            {
                case"page":
                    return pageSerializationHelper(key, value);
                default:
                    return value
            }
    }
}
function courseSerializationHelper(key, value)
{
    switch (key)
    {
        case"player":
        case"course":
            return undefined;
        default:
            switch (value.objectType)
            {
                case"page":
                    return pageSerializationHelper(key, value);
                case"module":
                    return moduleSerializationHelper(key, value);
                default:
                    return value
            }
    }
}
window.onmessage = handleRemoteMessage;
function handleRemoteMessage(e)
{
    if (!e.data)
        return;
    try
    {
        var tag = e.data.substr(0, 1)
    }
    catch(e)
    {
        return
    }
    var pi = e.data.indexOf("?") ? e.data.indexOf("?") : -1;
    var action = e.data.substring(2, (pi > 0) ? pi : undefined);
    var parameters = null;
    if (pi > 0)
    {
        parameters = [];
        var param = e.data.substring(e.data.indexOf("?") + 1);
        parameters[0] = JSON.parse(param)
    }
    var objResult = null;
    switch (action.toLowerCase())
    {
        case"getcurrentpage":
            var page = playerAPI.course().currentPage();
            objResult = new Object;
            objResult.id = page.id;
            objResult.name = page.name;
            objResult.bookmark = page.bookmark;
            break;
        case"getpage":
            var page = playerAPI.course().getPage(parameters[0]);
            objResult = new Object;
            objResult.id = page.id;
            objResult.name = page.name;
            objResult.bookmark = page.bookmark;
            break;
        case"loadbookmark":
            playerAPI.course().loadBookmark(parameters[0]);
            break;
        case"hideheader":
            playerAPI.course().hideHeader();
            break;
        case"hidefooter":
            playerAPI.course().hideFooter();
            break;
        case"hidetoc":
            playerAPI.course().hideContentsPanel();
            break
    }
    if (objResult)
    {
        var response = tag + ":" + JSON.stringify(objResult);
        if (e.ports)
        {
            for (var i = 0; i < e.ports.length; i++)
                e.ports[i].postMessage(response, "*")
        }
        else
        {
            e.source.postMessage(response, "*")
        }
    }
}
function PlayerORB(win, responseHandler)
{
    var mc = window.MessageChannel ? new MessageChannel : null;
    var handleMessage = function(e)
        {
            responseHandler(e)
        };
    if (responseHandler)
    {
        if (mc)
            mc.port1.onmessage = handleMessage;
        else
            window.addEventListener("message", handleMessage, false)
    }
    return {
            messageChannel: function()
            {
                return mc
            }, getRPC: function(orb)
                {
                    return new PlayerRPC(this)
                }, execute: function(rpc)
                {
                    if (mc)
                        win.postMessage(rpc.name, "*", [mc.port2]);
                    else
                        win.postMessage(rpc.name, "*")
                }
        }
}
function PlayerRemoteAPI(win)
{
    var handlers = [];
    var handleMessage = function(e)
        {
            var hi = -1;
            for (var i = 0; i < handlers.length; i++)
            {
                if (parseInt(e.data.substr(0, 1)) == i)
                {
                    hi = i;
                    var data = e.data.substring(2);
                    handlers[i](data);
                    break
                }
            }
            handlers.splice(hi, 1)
        };
    window.addEventListener("message", handleMessage, false);
    return {
            getRPC: function(orb)
            {
                return new PlayerRPC(this)
            }, execute: function(rpc, handler)
                {
                    var hi = -1;
                    for (var i = 0; i < handlers.length; i++)
                    {
                        if (handlers[i] == handler)
                        {
                            exists = i;
                            break
                        }
                    }
                    if (hi < 0)
                    {
                        hi = handlers.length;
                        handlers[hi] = handler
                    }
                    win.postMessage(hi + ":" + rpc, "*")
                }
        }
}
function PlayerRPC(orb)
{
    var name = null;
    var parameters = [];
    return {
            getName: function()
            {
                return name
            }, setName: function(value)
                {
                    name = value
                }, getParameters: function()
                {
                    return parameters
                }, setParameters: function(value)
                {
                    parameters = value
                }, execute: function()
                {
                    orb.execute(this)
                }
        }
}
