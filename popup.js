var tagManager = null;
var enabled_switch = null;
var cwOnly_switch = null;


function setSwitchery(switchElement, checkedBool) {
    if((checkedBool && !switchElement.isChecked()) || (!checkedBool && switchElement.isChecked())) {
        switchElement.setPosition(true);
        switchElement.handleOnchange(true);
    }
}

function showPopup(url) {
	chrome.tabs.create({
	    'url': url,
	    'selected': true
	  });
}

(function() {

	enabled_switch = new Switchery(document.getElementById("enabled"));
	cwOnly_switch = new Switchery(document.getElementById("cwOnly"));
	
   	$("#enabled").change(function() {
		let checked = this.checked;
		console.log("Saving " + checked);
		async_put("enabled", checked).then(() => tellContentScriptToRefresh());;
	});

	$("#cwOnly").change(function() {
		let checked = this.checked;
		console.log("Saving cwOnly: " + checked);
		async_put("cwOnly", checked).then(() => tellContentScriptToRefresh());
	});

	$("#issues").click(function() {
		let link = $("#issues").attr("href");
		console.log(link);
		showPopup(link);
	});

	$("#review").click(function() {
		let link = $("#review").attr("href");
		showPopup(link);
	});

   	refresh();
})();

function refresh() {
	async_get("enabled", false).then(function(val) {
		setSwitchery(enabled_switch, val);
	});

	async_get("cwOnly", true).then(function(val) {
		setSwitchery(cwOnly_switch, val);
	});

	async_get("cws", []).then(function(cws) {
		$("#cws").empty(); // clear 
		tagManager = new Taggle('cws', {
					    tags: cws,
					    onTagAdd: function(event, tag) {
					        async_get("cws", []).then(function(cws) {
				         		cws.push(tag);
				         		console.log("Mutated cws:");
				         		console.log(cws);
				         		async_put("cws", cws).then(function() {
				         			tellContentScriptToRefresh();
				         		});
				         	});
					    },
					    onTagRemove: function(event, tag) {
					        async_get("cws", []).then(function(cws) {
					        	let index = cws.indexOf(tag);
					        	if (index > -1) {
								    cws.splice(index, 1);
					         		console.log("Mutated cws:");
					         		console.log(cws);
								    async_put("cws", cws).then(function() {
					         			tellContentScriptToRefresh();
					         		});
								}
				         	});
					    }
					});
	});	
}

function tellContentScriptToRefresh() {
	chrome.tabs.query({currentWindow: true}, function(tabs) {
		for (var i = 0; i < tabs.length; i++) {
		  chrome.tabs.sendMessage(tabs[i].id, {refresh: true}, null);
		}
	});
}


