/**************************************************************************
** NOTE TO COURSE DEVELOPERS:
** -- Any custom JavaScript should be placed in this file.
** -- Changes to course.js or other code provided as part of
**    this SDK is strictly prohibited.
** -- JavaScript in content .htm files should be limited to event handlers
**   (e.g. onClick, onMouseEnter, etc.) which call functions in this file.
** -- No custom JavaScript script blocks should be in content .htm files.
**************************************************************************/
StudentName = "Joe Student";
//function getName() {
//    StudentName = document.learnerName.yourname.value;
//    //alert(StudentName);
//    document.getElementById("displayName").innerHTML = StudentName;
//    $('#displayTest').css('display', 'inline-block');
//}

//if you are self-hosting the video with the course SCORM package vs. using it from RedTiger hosting location
//this variable is true
_isSelfHost = true;
function getHeader(){
    var $header = $('<div />');
    $header.addClass('header col-12 p-3 mb-2');
    $header.append('<img src="../images/mslogo.png" alt="" class="responsive-item" />')
    return $header
}
function getFooter(){
    var $footer = $('<div />');
    $footer.addClass('footer col-12');

    //create links
    var $links = $('<ul />');
    $links.addClass('nav footer-links');

    var $li = $('<li class="nav-item" />')
    $li.append('<a href="#" target="_blank" class="" />');

    var footerlinks = []
    footerlinks.push({ 'href': 'https://trainingsupport.microsoft.com/en-us/tcliteracy/forum', 'target': '_blank', 'label': 'Contact us', 'text': 'Contact us'});
    footerlinks.push({'href': 'https://privacy.microsoft.com/en-gb/privacystatement', 'target': '_blank', 'label': 'Privacy', 'text': 'Privacy'});
    footerlinks.push({ 'href': 'http://www.microsoft.com/en-us/legal/intellectualproperty/copyright/default.aspx', 'target': '_blank', 'label': 'Legal notice', 'text': 'Legal notice'});
    //footerlinks.push({'href': 'http://www.apple.com', 'target': '_blank', 'label': 'Visit Apple', 'text': 'Apple'});
    
    $(footerlinks).each(function (i, item) {
        var $li = $('<li class="nav-item" />')
        var $a = $('<a />')
        $a.attr('href',item.href).attr('target', item.target).attr('aria-label', item.label).text(item.text).addClass('nav-link');
        $li.append($a)
        $links.append($li);
    })
  
    $footer.append($links)

    return $footer
}

function getPrintCertificateHeader(elem) {
    //get the current page, then setup the Previous, Next buttons appropriately.
    //page nav is a row, so we are adding div's as columns.

    //element is where we want to add stuff on the page.


    var page = course.getCurrentPage();

    //var $col1 = $('<div class="col-2 p-1" />');
    //var $col2 = $('<div class="col-8 p-1 text-center" />');
    //var $col3 = $('<div class="col-2 p-1" />');

    var $navPrevious = elem;
    //var $navNext = $('<button id="nextButton" style="right:0px; display:none;" />').addClass('btn btn-link position-absolute').html('<span>Next</span><span aria-hidden="true">&nbsp;&gt</span>').prop('disabled',true).attr('aria-disabled',true);
    //var $navXofY = $('<button style="display:none;" class="text-center">').addClass('btn').prop('disabled', false).attr('aria-disabled', false);

    //wire up the next/prev buttons, or disable if needed.
    //if (page.navNext instanceof Object) {
    //    $navNext.on('click', function () { courseController.navigateToPageById(page.navNext.id) })
    //}
    //else {
    //    $navNext.prop('disabled', true).attr('aria-disabled', 'true')
    //}

    if (page.navPrevious instanceof Object) {
        $navPrevious.on('click', function () { courseController.navigateToPageById(page.navPrevious.id) })
    }
    else {
        $navPrevious.prop('disabled', true).attr('aria-disabled', 'true')
    }

    //figure out the page X of y by going to current page's parent, and finding this item in the array
    //var pageCount = page.parent.pages.length
    //var pageIndex
    //$(page.parent.pages).each(function (i, item) { if (item.id == page.id) pageIndex = i + 1 })

    //$navXofY.text('Print Certificate');
    //$navXofY.addClass('btn-primary')
    //$navXofY.on('click', function () { window.print();})
    //$col1.append($navPrevious);
    //$col2.append($navXofY);
    //$col3.append($navNext);

    //$(elem).append($col1, $col2, $col3);

}
function getPageNavigation(elem) {
    //get the current page, then setup the Previous, Next buttons appropriately.
    //page nav is a row, so we are adding div's as columns.

    //element is where we want to add stuff on the page.

    
    var page = course.getCurrentPage();

    var $col1= $('<div class="col-2 p-1" />');
    var $col2 = $('<div class="col-8 p-1 text-center" />');
    var $col3 = $('<div class="col-2 p-1" />');

    var $navPrevious = $('<button id="previousButton" style="left:0px;" />').addClass('btn btn-link position-absolute').html('<span aria-hidden="true">&lt;&nbsp;</span><span>Previous</span>');
    var $navNext = $('<button id="nextButton" style="right:0px;" />').addClass('btn btn-link position-absolute').html('<span>Next</span><span aria-hidden="true">&nbsp;&gt</span>');
    var $navXofY = $('<button class="text-center">').addClass('btn btn-link').prop('disabled',true).attr('aria-disabled',true);

    //wire up the next/prev buttons, or disable if needed.
    if (page.navNext instanceof Object) {
        $navNext.on('click', function (){courseController.navigateToPageById(page.navNext.id)})
    }
    else {
        $navNext.prop('disabled', true).attr('aria-disabled','true')
    }
    
    if (page.navPrevious instanceof Object) {
         $navPrevious.on('click', function () {courseController.navigateToPageById(page.navPrevious.id)})
    }
    else {
        $navPrevious.prop('disabled', true).attr('aria-disabled','true')
    }

    //figure out the page X of y by going to current page's parent, and finding this item in the array
    var pageCount = page.parent.pages.length
    var pageIndex  
    $(page.parent.pages).each(function (i, item) {if (item.id == page.id) pageIndex = i + 1})
    
    $navXofY.text('Page ' + pageIndex + ' of ' + pageCount);
    $col1.append($navPrevious);
    $col2.append($navXofY);
    $col3.append($navNext);

    $(elem).append($col1, $col2, $col3);

}
function getPageContinueButton(elem) {
    //if we are on last page of module, the continue button goes to the first page of course.
    //if not, we can go to the next page.

    //figure out the page X of y by going to current page's parent, and finding this item in the array
    var page = course.getCurrentPage();
    var pageCount = page.parent.pages.length
    var pageIndex  
    var $continue = $('<button />').addClass('btn btn-primary');

    $(page.parent.pages).each(function (i, item) {if (item.id == page.id) pageIndex = i + 1})

    if (pageCount == pageIndex) {
        //go back to module
        $(elem).on('click', function (){courseController.navigateToPageById(course.pageNavigation[0].id)})
        $continue.text('Back to module list').attr('aria-label', 'Back to module list to check progress')
        $('p',elem).empty();
    }
    else {
        //go to next page
        $continue.on('click', function (){courseController.navigateNext();})
        $continue.text('Continue').attr('aria-label','Continue to next page')
        $('.next-page-name', elem).text(page.navNext.name)
    }

    $(elem).append($continue)
}

function getQuestions(elem) {
        //get an objective and write out the questions.
        var o = course.getCurrentPage().objectives;
	   // var o = parent.courseController.course.objectives[0] //this uses learning objective 0 for questions.
        
       //find the item in array by the id property we just got
       var o = $.grep(course.objectives, function (lo, i) {return lo.Id == o});
        o=o[0]

		$(o.Questions).each(function (i,question) {
		
	
		//write the question prompt
			$q = $('<legend />');
			$q.attr('id', 'q' + i);
			$q.text((i+1) + '. ' + question.Prompt.Text);


			$form = $('<form />')
			$form.attr('aria-label','Question ' + (i+1) + " " + question.Prompt.Text)
			$f = $('<fieldset class="m-2" />');
			$f.append($q)
		
		//go through each choice and write that out
		$(question.Choices).each(function (c,choice){
			//put a check answer button
			//c is choice, l is label
			$c = $('<input type="radio" />');
			$l = $('<label />');
			$feedback = $('<p aria-live="polite" role="alert" aria-relevant="all" />');
			
			//setup label
			$l.attr('for','q' + i + 'c' + c);
			$l.text(choice.Text);
			$l.attr('class','pl-3')
			//setup choice
			$c.prop('name', 'q'+i);
			$c.prop('value',c)
			$c.attr('id','q' + i + 'c' + c);
			
			
			$feedback.text(question.Feedbacks[c].Text)
			//figure out if correct or not and act accordingly
			if (choice.Correct) {
				$feedback.text("Correct! " + question.Feedbacks[c].Text);
				$feedback.addClass('ml-4 correct rounded-pill p-2 font-weight-bold')
			}
			else {
				$feedback.text("Incorrect. " + question.Feedbacks[c].Text)
				$feedback.addClass('ml-4 incorrect rounded-pill p-2 font-weight-bold')
			}
			//append choice to label so nested
			$item = $('<div class="m-2" />');
			$item.append($c,$l,$feedback);
			$f.append($item)
			
		
		})
			//append the fieldset to questions
			$form.append($f);

			//add the subtle label
			$('p',$form).hide();
			$(elem).append($form); 
		
		});


		//update the answers
		$('input', elem).on('change', function (e){
			$userChoice = $(e.currentTarget);

			$userChoice.nextAll('p').show()
            $userChoice.nextAll('p').text($userChoice.nextAll('p').text())
        })

	
}

function getModuleProgress(elem) {
    
   //create a module card for each module (except 1st module) and append to elem

        //first, make sure we are up-to-date
		course.checkCompletion(course.getCurrentPage());
		course.updateLockedModules();
        //check module status - order of module badges will be order of modules (skip welcome module which is module 0)
        
        /*
                            <div class="row">
									<div class="col-1"><img src="../images/interact-with-a-computer.svg" class="float-left img-fluid " alt="..."></div>
									<div class="col-10">
										<div class="">
											<p class="mb-0 text-muted">Digital Literacy</p>
											<h1 class="card-title mb-0">Work with Computers</h1>
											<p class="text-muted">1 hour and 9 minutes with 4 modules</p>
											<p class="card-text">This learning path will introduce you to the different parts and types of the computer and their functions. You will be also familiar with operating systems and applications, the difference between them and their functions. Peripherals and portable storage devices will be discussed as well.</p>
										</div>
									</div>
							</div>
        */

        
        $(course.modules).each(function (i, item) {
            //skip first module in course.
            if (i>0) {
                //create a new module card stub
                //get unit count
                var unitCount = item.pages.length
                //get units length
                var moduleLength = 0
                $(item.pages).each(function (p, page){moduleLength = moduleLength + page.time})
                //get module description
                var moduleDescription = item.pages[0].navRestrictionMsg
                //get status
                //get button to first page
                

                var $card = $('<div class="apscard p-3 mb-2" />');
                //fill it out with current module info
                

                //$card.append('<div class="container"><div class="row"><div class="col-2"><img src="../images/' + item.name.toString() + '.png"' + ' alt="" class="img-fluid" /></div><div class="col-10"><p class="badge ' + getBadgeColor(item) + ' float-right p-2 module-status">Status: ' + getStatusDescription(item) + '</p><h2>' + item.name + '</h2><p class="text-muted"><span>' + moduleLength + ' minutes</span>' + '<span aria-hidden="true"> | </span>' + '<span>' + unitCount + ' units</span></p><p>' + moduleDescription + '</p></div></div></div>');


                var $modContent, $img, $cardContent

                $cardContent = $('<div class="container cardContainer"><div class="row"></div></div>');
                $img = $('<div class="col-2"><img src="../images/' + item.name.toString() + '.png"' + ' alt="" class="img-fluid" /></div>');
                $modContent = $('<div class="col-10"><p class="badge ' + getBadgeColor(item) + ' float-right p-2 module-status">Status: ' + getStatusDescription(item) + '</p><h2>' + item.name + '</h2><p class="text-muted"><span>' + moduleLength + ' minutes</span>' + '<span aria-hidden="true"> | </span>' + '<span>' + unitCount + ' units</span></p><p>' + moduleDescription + '</p></div>');
                $modContent.append(getModuleStartButton(item));

                $('.row',$cardContent).append($img, $modContent);

                $card.append($cardContent);


              //  $card.append('<p>' + unitCount + ' units</p>')
                
             //   $card.append('<button class="btn btn-primary btn-sm">' + 'Start Module' + '</button>')
               // $('button', $card).on('click', function () {course.navigateToPageById(item.pages[0].id)})

                //$card.append(getModuleStartButton(item))
                               

                //append to elem
                $(elem).append($card)
            }
        })

	
}

function getStatusDescription(page){
   var desc = "Not Started"
    switch (page.pageState.status) {
        case "N":
            desc = "Not Started"
            break;
        case "I":
            desc = "In Progress"
            break;
        case "P":
            desc = 'Complete';
            break;
    }
    return desc
}

function getModuleStartButton (module) {

//first, make sure we are up-to-date
course.checkCompletion(course.getCurrentPage());
course.updateLockedModules();

    var $button = $('<button class="btn btn-primary btn-sm" />');
    var nextPage

    switch (module.pageState.status) {
        case "N":
            //not started, go to beginning
            $button.text('Begin Module');
            $button.attr('aria-label', 'Begin module ' + module.name)

            //next page is first in module
            $button.on('click', function () {course.navigateToPageById(module.pages[0].id)});
            break;

        case "P":
            //finished, go to beginning
            $button.text('Review Module');
            $button.attr('aria-label', 'Review module ' + module.name)
            $button.on('click', function () { course.navigateToPageById(module.pages[0].id) });
            break;
    
        case "I":
            //in progress
            $button.text('Resume Module');
            $button.attr('aria-label', 'Resume module ' + module.name)

            //find the first incomplete page in the module.

            $(module.pages).each(function (i, item) {if (item.pageState.status !="P" && !nextPage) {nextPage = item;return;}})
            $button.on('click', function () {course.navigateToPageById(nextPage.id)})

            
            break;
    
    
    }

    return $button;
}

function getCourseStatus () {

        //to put in the badge for module page
        if (course.scormState.isComplete == true) {
            return "Course Status: Complete"
        }
        else {
            return "Course Status: In Progress"
        }
}



function getBadgeColor(page) {
    var badgeColor 
    switch (page.pageState.status) {
        case "N":
            badgeColor = "badge-secondary"
            break;
        case "I":
            badgeColor = "badge-warning"
            break;
        case "P":
            badgeColor = "badge-success";
            break;
    }
    return badgeColor
}