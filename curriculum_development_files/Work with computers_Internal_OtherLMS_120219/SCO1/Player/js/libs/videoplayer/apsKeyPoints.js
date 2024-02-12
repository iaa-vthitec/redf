(function () {
    amp.plugin('apsKeyPoints', function (options) {
        // see  if there are keypoints
        var hasKeyPoints = options && options.options && options.options.kp && options.options.kp.length;

        // do nothing if there are no keypoints
        if (!hasKeyPoints) return;

        // remember the video player instance
        var vidPlayer = this;

        // remember the keypoints array
        var keyPointsArray = options.options.kp;

        // remember the page links
        var pageLinks = options.options.pl

        // remember the text strings object
        var textString = options.options.ts;
        if (!textString) textString = {};
        if (!textString.getYourScore) textString.getYourScore = "Get your score...";
        if (!textString.goBackToVideo) textString.goBackToVideo = "Go back to video";
        if (!textString.finalScore) textString.finalScore = "Final Score";
        if (!textString.start) textString.start = "Start";
        if (!textString.next) textString.next = "Next";
        if (!textString.question) textString.question = "Question";
        if (!textString.resources) textString.resources = "Resources";
        if (!textString.view) textString.view = "View";
        if (!textString.download) textString.download = "Download";

        // remember the video container
        var vidContainer = null;

        // init the array of key point divs to show the keypoints
        var aElements = [];

        // remove the leading . off the styles. Example .kpFull becomes .kpFull
        for (var i = 0; i < keyPointsArray.length; i++) {
            keyPointsArray[i].style = keyPointsArray[i].style.slice(1);
        }

        // loadstart is the earliest event we can hook, use it to initialize our plugin
        vidPlayer.addEventListener(amp.eventName.loadstart, function () {
        });

        // hook the timeupdate to get the current playback time
        vidPlayer.addEventListener(amp.eventName.timeupdate, function () {
            // get the video container
            if (!vidContainer) {
                vidContainer = $("#" + options.options.id);
            }

            // get the current time
            var videoPosition = vidPlayer.currentTime();

            // loop through the list of keypoints to see what keypoints should be shown at this time
            for (var i = 0; i < keyPointsArray.length; i++) {
                // see if this keypoint should be shown at this time
                if (videoPosition >= keyPointsArray[i].timeStart && videoPosition <= keyPointsArray[i].timeEnd) {
                    // it should, see if we already have the created the element to place the keypoint
                    if (!aElements[keyPointsArray[i].style]) {
                        // we have not, init element and place it in the DOM
                        aElements[keyPointsArray[i].style] = true;
                        vidContainer.append('<div aria-live="assertive" id="' + keyPointsArray[i].style + '" class="' + keyPointsArray[i].style + '"/>');
                    }

                    // see if it is already showing
                    if (!keyPointsArray[i].isDisplayed) {
                        // it is not, mark it as showing
                        keyPointsArray[i].isDisplayed = true;

                        // show it
                        showKeyPoint(keyPointsArray[i]);
                    }
                } else {
                    // this keypoint should not be shown at this time, see if it is showing
                    if (keyPointsArray[i].isDisplayed) {
                        // it is showing, hide it and rememeber we hid it
                        hideKeyPoint(keyPointsArray[i]);
                        keyPointsArray[i].isDisplayed = false;
                    }
                }
            }
        });

        // show a keypoint item in the required container
        function showKeyPoint(kp) {
            // see if we need to pause the video
            if (kp.pause) {
                // we do, pause it;
                vidPlayer.pause();
            }

            // show the key point based on its type
            switch (kp.type) {
                case "text":
                    $("#" + kp.style).html(kp.data);
                    break;

                case "image":
                    try {
                        $("#" + kp.style).html('<img alt="" src="../SCO1/' + vc.page.getKeyPointsImagesPath() + kp.data + '"/>');
                    } catch (e) {
                        $("#" + kp.style).html('<img alt="" src="Images/' + kp.data + '"/>');
                    }
                    break;

                case "quiz":
                    showQuiz(kp);
                    break;

                case "resources":
                    showResources(kp);
                    break;
            }

            // show the div
            $("#" + kp.style).show();
        }

        function showResources(kp) {
            // remove all items from the key point container
            $("#" + kp.style).empty();

            // init the left position
            var left = 20;

            // this container will hold all of the resource cards
            var eContainer = $('<div class="keyResContainer" style="visibility: hidden;"/>');

            // add the title
            var eHeader = $('<div class="keyResHeader">' + textString.resources + '</div>');
            eContainer.append(eHeader);

            // create a container for all of the cards
            var eCardContainer = $('<div class="keyResCardContainer"></div>');
            eContainer.append(eCardContainer);

            // loop through the resources
            for (var i = 0; i < pageLinks.length; i++) {
                // this div contains a single card
                var eCard = $('<div class="keyResCard" style="left:' + left + 'px"></div>');

                // add the title plus the icon based on the title type (can be "")
                var eTitle = $('<div class="keyResTitle">' + pageLinks[i].name + '&nbsp;<span class="keyResIcon">' + pageLinks[i].icon + '</span>' + '</div>');

                // add the dscription
                var eDescription = $('<div class="keyResDesc">' + pageLinks[i].description + '</div>');

                // get the button label based on the type of link (File verus URI)
                var label;
                if (pageLinks[i].type === "File") label = textString.download.toUpperCase();
                else label = textString.view.toUpperCase();

                // Add the buttons DIV and the button
                var eButtons = $('<div class="keyResButtons"><a title="' + pageLinks[i].name + '" href="' + pageLinks[i].source + '" target="_blank">' + label + '</a></div>');

                // add the elements to the card and add the card to the container
                eCard.append(eTitle);
                eCard.append(eDescription);
                eCard.append(eButtons);
                eCardContainer.append(eCard);

                // increment the left position to the width of the card plus 20
                left += 239;
            }

            // make the width of the card container equal to the width of all of the cards to force horizontal scrolling if needed
            eCardContainer.css("width", left + "px");

            // show the resources (as visibility hidden)
            $("#" + kp.style).append(eContainer);

            setTimeout(function () {
                // loop through the cards to fix up the description heights
                $(".keyResCard").each(function () {
                    // get the height of the title and the buttons
                    var nTitle = $(this).find(".keyResTitle")[0].clientHeight;
                    var nButtons = $(this).find(".keyResButtons")[0].clientHeight;
                    console.log("title content:" + $(this).find(".keyResTitle")[0].innerHTML);
                    console.log("nTitle:" + nTitle);

                    // set the height of the description as the difference in the container height and the title/buttons
                    $(this).find(".keyResDesc").css("height", (300 - nTitle - nButtons) + "px");
                    console.log('$(this).find(".keyResDesc").css("height"):' + $(this).find(".keyResDesc").css("height"));
                });

                // make the resource container visible
                eContainer.css("visibility", "visible");
            },1);
        }

        function showQuiz(kp) {
            var assessment = kp.data.Assessment;
            if (!assessment) return;

            vidPlayer.pause();
            vidPlayer.controls(false); // hide control bar
            // try to init assessment by getting SCORM data if exists
            if (!assessment.Initialized)
                assessment.loadScormData();
            // check if assessment got initialized using SCORM data
            if (!assessment.Initialized) {
                assessment.init(); // it didn't, call default init method
                assessment.LocationIndex = -1; // intro
            }

            var $container = $("#" + kp.style);
            var $quizOuter = $("<div class='quizOuter'></div>");
            var $quizQuestions = $('<ul class="quizQuestions"></ul>');
            var $quizQuestionsHome = $('<li class="quizQuestion quizHome" aria-hidden="false"><div class="quizOverlay quizHomeOverlay"><div class="quizHomeContent"><div class="quizHomeContentInner"><h2></h2><p></p></div><a href="#" class="quizButton quizStart">' + textString.start + '</a></div></div></li>');
            var $footer = $('<div class="quizFooter" style="display:none"><div class="quizFooterOuter"><div class="quizFooterInner"><div class="quizFooterScore"><span class="quizFooterScoreCorrect">0</span>/<span class="quizFooterScoreTotal">0</span></div><ul class="quizSubway"></ul></div></div></div>');
            var $subway = $(".quizSubway", $footer);
            var $quisResponseDesc = $('<span class="quizResponseDesc"></span>');

            // set assessment name
            $quizQuestionsHome.find('h2').html(assessment.Page.name);
            // set assessment instructions
            $quizQuestionsHome.find('p').html(assessment.IntroductionText);
            // set number of total correct questions
            $footer.find(".quizFooterScoreCorrect").text(assessment.countCorrectQuestions());
            // add go back to video button
            if (!kp.mustComplete) $quizQuestionsHome.find(".quizHomeContent").prepend("<div class='quizButtons quizHeaderButtons'><a href='#' class='quizButton quizMore quizGoBackToVideo'>" + textString.goBackToVideo + "</a></div>");

            $quizQuestions.append($quizQuestionsHome);

            for (var i = 0; i < assessment.QuestionsPresented.length; i++) {
                var cq = assessment.QuestionsPresented[i];
                $subwayItem = $('<li class="quizSubwayStop"><a href="#" class="quizSubwayCircle"></a><div class="quizSubwayLine"></div></li>');
                cq.isAnswered() && $subwayItem.addClass(cq.isCorrect() ? "quizSubwayCorrect" : "quizSubwayIncorrect");
                $subway.append($subwayItem);

                var $quizQuestion = $('<li class="quizQuestion quizQuestionLayout-full" aria-hidden="true"><div class="quizOverlay"></div><div class="quizScroller"><div class="quizPanel"><div class="quizQuestionHeader"><h3 class="quizQuestionText"><span class="quizQuestionNumber"></span></h3></div><div class="quizQuestionDetail"><div class="quizResponses"></div><div class="quizAnswer"></div></div><div class="quizButtons"><a class="quizButton quizNext">' + textString.next + '</a></div></div></div></li>');
                $quizQuestion.find(".quizQuestionText").append(cq.Prompt.Text);
                $quizQuestion.find(".quizQuestionNumber").html(i + 1);
                $subwayItem.find('.quizSubwayCircle').attr('title', textString.question + " " + (i + 1));

                for (var j = 0; j < cq.ChoicesOrder.length; j++) {
                    var choice = cq.ChoicesOrder[j];
                    if (choice.Correct) cq.correctResponseIndex = j;

                    var $quizResponse = $('<div class="quizResponse"><a class="quizResponseText"></a></div>');
                    $quizResponse.find(".quizResponseText").text(choice.Text);
                    $quizQuestion.find(".quizResponses").append($quizResponse);
                }

                if (!kp.mustComplete) $quizQuestion.find(".quizPanel").prepend("<div class='quizButtons quizHeaderButtons'><a class='quizButton quizMore quizGoBackToVideo'>" + textString.goBackToVideo + "</a></div>");
                $quizQuestions.append($quizQuestion);
            }

            var $quizScore = $('<li class="quizQuestion quizScore" aria-hidden="true"><div class="quizScroller"><div class="quizPanel"><div class="quizScoreButtons"><a class="quizButton quizMore quizGoBackToVideo">' + textString.goBackToVideo + '</a></div><h4>' + textString.finalScore + '</h4><div class="quizScoreFinal"><span class="quizScoreFinalCorrect"></span>/<span class="quizScoreFinalTotal"></span></div><div class="quizScorePassedText"><p></p></div></div></div></li>');
            $quizScore.find(".quizScorePassedText p").html(assessment.ReviewPassedText);
            $quizQuestions.append($quizScore);

            $quizOuter.append($quizQuestions);
            $quizOuter.append($footer);
            $container.append($quizOuter);
            b.init(assessment);
        }

        // hide a keypoint item in the required container
        function hideKeyPoint(kp) {
            // remove the contents
            $("#" + kp.style).html("");
            // hide the div
            $("#" + kp.style).hide();
            // make sure controls are shown
            if (!vidPlayer.controls()) vidPlayer.controls(true);
        }

        var b = {
            currQuestionIndex: 0,
            quiz: null,
            questionCount: 0,
            init: function (assessment) {
                this.quiz = assessment;
                this.questionCount = this.quiz.QuestionsPresented.length;

                $(".quizFooterScoreTotal").html(this.questionCount);

                $(".quizResponse").on("click", $.proxy(function (a) {
                    var b = $(a.target).closest(".quizResponse");
                    this.selectResponse(b, b.index(), false)
                }, this)),

                $(".quizNext").on("click", $.proxy(function () {
                    var a = this.currQuestionIndex + 1;
                    a < this.questionCount ? this.loadQuestion(a) : this.loadResults()
                }, this)),

                $(".quizGoBackToVideo").on("click", $.proxy(function () {
                    $(".quizOuter").parent().hide();
                    $(".quizOuter").remove();
                    vidPlayer.controls(true);
                    vidPlayer.play();
                    //$(vidPlayer.controlBar.playToggle.el_).focus();
                }, this)),

                $(".quizSubwayStop").on("click", $.proxy(function (a) {
                    var b = $(a.target).closest(".quizSubwayStop").index();
                    this.loadQuestion(b)
                }, this)),

                $(".quizStart").on("click", $.proxy(function (a) {
                    this.loadQuestion(0);
                }, this));

                var a = 100 / (this.quiz.QuestionsPresented.length - 1);
                $(".quizSubwayStop").css("width", a + "%");

                if (this.quiz.LocationIndex < 0) {
                    // intro, do nothing
                } else if (this.quiz.LocationIndex >= this.questionCount) {
                    this.loadResults();
                } else {
                    this.loadQuestion(this.quiz.LocationIndex);
                }
            },
            loadQuestion: function (b) {
                this.currQuestionIndex = b;
                this.quiz.setLocation(b);

                // get current question
                var c = this.quiz.QuestionsPresented[b];
                // make sure footer is visible
                if (!$(".quizFooter").hasClass("show")) $(".quizFooter").addClass("show");
                $(".quizFooter").delay(600).fadeTo(200, 1);

                $(".quizQuestions").animate({ top: -100 * (b + 1) + "%" });

                $(".quizQuestion").attr("aria-hidden", true);
                // make only the current question anchors focusable
                $(".quizQuestion a").removeAttr("href");
                $(".quizQuestion").removeClass("quizQuestionCurrent");
                $(".quizQuestionLayout-full").eq(this.currQuestionIndex).addClass("quizQuestionCurrent");
                $(".quizQuestionCurrent a").attr("href", "#");
                $(".quizQuestionCurrent").attr("aria-hidden", false);

                $(".quizSubwayStop").removeClass("quizSubwayCurrent").eq(this.currQuestionIndex).addClass("quizSubwayCurrent");
                c.isAnswered() && this.selectResponse(null, (Number(c.Answer) - 1), true);
            },
            loadResults: function () {
                $(".quizQuestion").attr("aria-hidden", true);
                $(".quizQuestion a").removeAttr("href");
                // make sure footer is visible
                if (!$(".quizFooter").hasClass("show")) $(".quizFooter").addClass("show");
                $(".quizFooter").delay(600).fadeTo(200, 1);

                var d = $(".quizScore");
                d.attr("aria-hidden", false);
                $("a", d).attr("href", "#");
                d.css({ display: "block" }),

                d.addClass("quizScorePreIntro"),
                $(".quizScoreFinalCorrect").text(this.quiz.countCorrectQuestions()),
                $(".quizScoreFinalTotal").text(this.questionCount),
                $(".quizQuestions").css({
                    top: -100 * (this.questionCount + 1) + "%"
                }),
                setTimeout(function () {
                    d.addClass("quizScoreIntro").removeClass("quizScorePreIntro");
                    d.find('.quizGoBackToVideo').focus();
                }, 500);

                // remember the location
                this.quiz.setLocation(this.questionCount + 1);
            },
            selectResponse: function (a, b, justDisplayResponse) {
                var c = $(".quizPanel").eq(this.currQuestionIndex);
                a || (a = c.find(".quizResponse").eq(b));
                var d, e,
                    f = this.quiz.QuestionsPresented[this.currQuestionIndex],
                    h = c.find(".quizAnswer"),
                    i = c.find(".quizResponses"),
                    j = c.find(".quizResponse").eq(f.correctResponseIndex),
                    k = (c.find(".quizQuestionDetail"), c.parent());
                // make sure that we score the question only when a choice is clicked, not when the question is displayed
                if (!justDisplayResponse) {
                    f.Answer = (Number(b) + 1) + "";
                    f.score();
                }
                var g = f.isCorrect(), feedback = f.getFeedback().Text;
                $(".quizSubwayStop").eq(this.currQuestionIndex).addClass(g ? "quizSubwayCorrect" : "quizSubwayIncorrect"),
                $(".quizFooterScoreCorrect").text(this.quiz.countCorrectQuestions()),
                c.find(".quizButton").delay(1e3).fadeIn(),
                this.currQuestionIndex === this.questionCount - 1 && c.find(".quizNext").text(textString.getYourScore).addClass("quizResults"),
                h.empty(),
                d = g ? $("<div />").text(feedback ? feedback : f.ChoicesOrder[b].Text).addClass("quizResponse").addClass("quizConfirm").prependTo(h) : a.clone().appendTo(h),
                e = j.clone().appendTo(h),
                d.addClass("quizTopItem"),
                e.addClass("quizBottomItem");
                if (!g && feedback) {
                    $("<div class='quizResponseText' />").text(feedback).appendTo(d);
                }

                var l = g ? e : d;
                l.css({ opacity: 1 });
                var m = a.position().top,
                    n = l.position().top + parseInt(h.css("top"), 10),
                    o = m - n;
                l.css({ top: o + "px" }),
                c.addClass("quizAnswered").addClass(g ? "quizCorrect" : "quizIncorrect"),
                i.hide(), d.css("opacity", 1), e.css("opacity", 1);

                setTimeout(function () { l.css({ top: 0 }); }, 50),
                setTimeout(function () {
                    h.css({
                        position: "relative"
                    }), k.delay(1e3).animate({
                        scrollTop: k.height() + parseInt(k.css("top"), 10)
                    }, {
                        duration: 700,
                        easing: "easeInOutQuart",
                        complete: function () {
                            if (!justDisplayResponse) {
                                c.find(".quizNext").focus();
                            }
                        }
                    })
                }, 500)
            }
        };
    });
}).call(this);