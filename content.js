/* Initialize bg css. */
(function() {
	let blurCSS = ".blurred { -webkit-filter: blur(5px); -moz-filter: blur(5px); height: 100px; -o-filter: blur(5px); -ms-filter: blur(5px); filter: blur(5px); overflow: hidden; background-color: #ccc; } \n";
	let warningCSS = ".warning { text-align: center;}\n";
	// 1: Inject blur CSS.
	let cssNode = document.createElement("style"); cssNode.innerHTML = blurCSS + warningCSS;
	$("body").append(cssNode);
})();

/* Reload CWs. */
var cws = [];
var regexs = [];
var cache = {};
var enabled = false;
var cwOnly = true;

function refetch() {
	return new Promise(function(resolve, reject) {
		async_get_all(["cws", "enabled", "cwOnly"]).then(function(objs) {
			cws = objs["cws"];
			enabled = objs["enabled"];
			cwOnly = objs["cwOnly"];
			/* 
			console.log("Refetch: enabled? - " + enabled);
			console.log("Cws: ");
			console.log(cws); 
			*/
			regexs = $.map($.makeArray(cws), function(val, i) {
				return new RegExp(val, "i"); // case insensitive regex search.
			});
			cache = {};
			resolve();
		});
	});
}
refetch();

function containsFlag(text) {
	for (var i = 0; i < regexs.length; i++) {
		if (regexs[i].exec(text)) {
			return true;
		}
	}

	return false;
}

/* match to cw/tw on posts */
let cwTwExp = /((^|\s+)(cw)|(^|\s+)(tw)|(^|\s+)(cn))(:|\s+)/i;

function blur(obj) {
	let message = document.createElement("p");
			        	message.innerHTML = "This post was hidden automatically.";
			        	message.className = "warning";

	let caption = document.createElement("p");
	caption.innerHTML = "click to show";
	caption.className = "warning fcg";

	obj.parent().closest('div').prepend(caption).prepend(message);
	obj.addClass("blurred");
	obj['message'] = message;
	obj['caption'] = caption;
	obj.click(function() { 
		obj.removeClass("blurred"); 
		$(message).remove();
		$(caption).remove();
	});
}

function unblur(obj) {
	obj.removeClass("blurred");
	$(obj['message']).remove();
	$(obj['caption']).remove();
	obj['message'] = null;
	obj['caption'] = null;
}

function runPlugin() {
	console.log("Running plugin.");
	/* check for fuzzy matching on fb page. */
	if (!!cws) {
		// 2: Apply it selectively.
		$('.userContent')
		        .filter(function() {
		        	// filter for only cw / tw'd posts.
		        	if (cwOnly) {
			        	let self = $(this);
			        	let text = self.text();
			        	if (cache[text] === true || cache[text] === false) {
			        		return cache[text];
			        	} else {
			        		let result = !!cwTwExp.exec(text);
			        		cache[text] = result;
			        		return result;
			        	}
		        	} else {
		        		return true;
		        	}
		        })
		        .each(function(idx){
		        	let self = $(this).parent().closest(".fbUserContent");

		        	let did_match = containsFlag($(this).text());

		        	let shouldBlur = enabled && !self.hasClass("blurred") && did_match;
		        	let shouldUnblur = self.hasClass("blurred") && (!did_match || !enabled);
		        	
		        	if (shouldUnblur) {
		        		// unblur
		        		self.removeClass("blurred");
		        		$(".warning", self.parent().closest('div')).remove();
		        		return;
		        	}

		        	if (!shouldBlur) {
		        		// nop
		        		return;
		        	}

		        	let message = document.createElement("p");
		        	message.innerHTML = "This post was hidden automatically.";
		        	message.className = "warning";

					let caption = document.createElement("p");
					caption.innerHTML = "click to show";
					caption.className = "warning fcg";

					self.parent().closest('div').prepend(caption).prepend(message);
					self.addClass("blurred");
					self.click(function() { 
						self.removeClass("blurred"); 
						$(message).remove();
						$(caption).remove();
					});
		        });
	}
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log("anything?");
    if (request.refresh == true) {
    	console.log("Received request from popup to refresh.");
		refetch().then(runPlugin);
    }
  });

/* hack to re-run code whenever nodes are added. */
// see: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
var num_posts = 0;
(function() {
	var whatToObserve = {childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style']};
	var mutationObserver = new MutationObserver(function(mutationRecords) {
	  $.each(mutationRecords, function(index, mutationRecord) {
	    if (mutationRecord.type === 'childList') {
	      if (mutationRecord.addedNodes.length > 0) {
	      	var num_posts_now = $(".userContent").length;
	      	if (num_posts_now != num_posts) {
	      		num_posts = num_posts_now;
	      		runPlugin();
	      	}
	      }
	      else if (mutationRecord.removedNodes.length > 0) {
	        //DOM node removed, do something
	        // runPlugin();
	      }
	    }
	    else if (mutationRecord.type === 'attributes') {
	      if (mutationRecord.attributeName === 'class') {
	        //class changed, do something
	      }
	    }
	  });
	});
	mutationObserver.observe(document.body, whatToObserve);
})();

